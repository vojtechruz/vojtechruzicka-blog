# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start local dev server (http://localhost:8080)
npm run build        # Production build (minification, image optimization)
npm test             # Run Vitest unit tests
npm run validate     # Full validation: HTML, CSS, JS lint + MD + XML + links
npm run format       # Prettier formatting
npm run lighthouse   # Lighthouse CI audit (requires a running server)
```

Run a single test file:

```bash
npx vitest run tests/footer.test.js
```

Lint individually:

```bash
npx eslint .
npx stylelint "src/styles/**/*.scss"
npx markdownlint-cli2 "src/**/*.md"
```

## Architecture

**Eleventy 3 static site generator** — input `src/` → output `_site/`. Uses Nunjucks templating.

### Config system (`config/`)

`eleventy.config.mjs` is a thin orchestrator that imports ~38 modular config files organized by concern:

- `config/collections/` — `posts` (sorted by date then series position), `topic-list`, `topic-stats`
- `config/filters/` — Nunjucks filters for dates, URLs, text, sorting, pagination, related posts, topics
- `config/plugins/` — esbuild (JS bundling), sass (SCSS → CSS via LightningCSS), image (eleventy-img + Shiki), markdown
- `config/shortcodes/` — `{% youtube %}`, `{% codepen %}`, `{% video %}`, `{% warning/info/error/success %}` (short
  inline notes with variant icon), `{% callout "variant", "Title", "date?" %}` (titled multiline panels; variants:
  success/info/warning/error/update, optional date), `{% linkedPost %}`, `{% linkedSeries %}`, `{% badge %}`
- `config/html-transform/` — post-processing transforms: LQIP SVG injection, `<picture>` wrapping, aria-hidden/tabindex
  fixes, Mermaid → inline SVG (` ```mermaid ` fences render at build time via mermaid-isomorphic/Playwright; Chromium
  installs automatically via the npm `prebuild` hook — see docs/MERMAID.md)
- `config/utils/` — shared markdown parser and formatting helpers

### Content (`src/`)

- `src/posts/` — blog posts, one subdirectory per topic (e.g., `java/`, `javascript/`, `angular/`). Each post is
  `index.md`.
- `src/_data/` — global Eleventy data: `site.js` (metadata, social links, Giscus config, Plausible analytics),
  `seriesMetadata.js`, `topicCategories.js`, `eleventyComputed.js`
- `src/_includes/layouts/` — base → page/post-list → post layout chain
- `src/_includes/components/` — reusable Nunjucks components
- `src/scripts/` — client-side JS bundled by esbuild
- `src/styles/` — SCSS files compiled by Sass plugin

### Tests (`tests/`)

Vitest unit tests covering HTML output of built pages: `tests/helpers.js` loads `_site/` output with Cheerio for DOM
assertions. Tests require a prior `npm run build` to have `_site/` present.

### Draft handling

Drafts live in `src/posts/_drafts/` and carry `draftStatus: draft | review | ready` in frontmatter. What a given build
includes is decided by `config/draft-utils.js`, in priority order:

1. `INCLUDE_DRAFTS` env var, if set — `all`/`none` or a stage name (a stage includes itself and everything riper)
2. local dev (`npm run dev`) → all drafts
3. preview deploy (any branch other than `master`/`main`) → only `ready` drafts
4. otherwise (production) → no drafts

`npm run build` deliberately does **not** pin `INCLUDE_DRAFTS`, so rules 2–4 govern Cloudflare deploys. CI instead pins
`DEPLOY_ENV=production` (which `config/env-utils.js` honours over the branch heuristic), because `GITHUB_REF_NAME` would
otherwise make every feature branch build look like a preview deploy.

Because rule 3 puts unpublished posts on a crawlable `*.pages.dev` URL, `base.njk` marks every page of a preview deploy
`noindex, nofollow`. `robots.txt` still allows crawling everywhere on purpose — a `Disallow`ed page can be indexed
URL-only, and a blocked crawler would never fetch the page to read the tag.

### Deployment and environments

Cloudflare Pages builds from the repo with `npm run build`; CI never deploys. `config/env-utils.js` decides local vs
preview vs production, which drives analytics, favicon, Giscus theme, drafts and indexability. Cloudflare project
settings and the full per-environment matrix are in docs/DEPLOYMENT.md.

### Key data flow

1. Markdown posts → markdown-it parser (with custom plugins for callouts, TOC) → HTML
2. HTML transforms run post-render: LQIP placeholders, `<picture>` wrapping for responsive images
3. esbuild bundles `src/scripts/` → `_site/scripts/`
4. Pagefind indexes `_site/` after build for client-side search. Only `<main data-pagefind-body>` (set by the three
   layouts) is indexed; `src/pages/search.njk` (`/search/?q=`, the homepage `SearchAction` target) omits the attribute
   so it stays out of the index and renders results inline (`data-search-inline` in `src/scripts/search.js`).
5. Giscus (GitHub Discussions) provides comments; no server-side component
6. RSS/Atom feeds (`src/feed.xml.njk`, `src/atom.xml.njk`) ship full post content; the `feedContent` filter
   (`config/filters/urls.js`) rewrites site-CSS-dependent markup (Mermaid, images, linkedPost cards) into reader-safe
   fallbacks. Details in docs/FEEDS.md.
7. HTTP caching is set by `src/static/_headers`; stable-URL assets (CSS, script bundles, favicons) must be referenced
   through the `assetUrl` filter (`config/utils/asset-version.js`), which appends a `?v=<content hash>` so long-cached
   (`immutable`) assets invalidate on change. Details in docs/CACHING.md.
8. Security headers (HSTS, CSP, etc.) also live in `src/static/_headers`. The CSP must stay on a **single line**
   (Cloudflare drops multiline header values) and allowlists two inline-code hashes — the Plausible init snippet and the
   LQIP `onload` attribute — which must be regenerated when that code changes. Guarded by
   `tests/security-headers.test.js` and `tests/analytics.test.js`; details in docs/SECURITY-HEADERS.md.
9. Legacy Gatsby-era URLs are 301-redirected by `src/static/_redirects` (Cloudflare Pages format). Matching is exact —
   case-sensitive, no trailing-slash normalization — so page rules need both slash variants and old capitalized tags
   need explicit lowercase mappings. Guarded by `tests/redirects.test.js`; details in docs/REDIRECTS.md.
10. `src/sitemap.xml.njk` lists exactly the built pages whose computed `isIndexable` flag is true (the same flag
    `components/robots-meta.njk` uses, so noindex pages such as archived posts and `/archive/` can never be listed).
    `<lastmod>` comes from the `sitemapLastmod` filter (`config/utils/sitemap.js`): `dateModified` for posts, the newest
    listed post for listing pages, omitted elsewhere — never Eleventy's file-date fallback, which on Cloudflare equals
    the deploy time. Guarded by `tests/sitemap.test.js`; details in docs/SITEMAP.md.

### Service worker

The site has no service worker of its own. `src/static/sw.js` is a temporary self-destroying worker that unregisters the
old Gatsby-era one from visitors' browsers — do not treat it as an entry point for offline support. Details and removal
date in docs/SERVICE-WORKER.md.

### Image pipeline & build cache

Responsive images are generated by eleventy-img (`config/plugins/image.js`; avif/webp/original × 4 widths). Generated
images are cached between builds by `scripts/image-cache.mjs` (restore/save around eleventy in the `build` scripts) —
output filenames contain a content hash, so a stale cache is always safe. Cache lives in `.cache/image-mirror`
(gitignored) everywhere: persisted via actions/cache in CI and by the Cloudflare Pages build cache (which preserves
`.cache` because it detects Eleventy from `package.json` — the dashboard framework preset plays no part). CI builds a
lean variant via `ELEVENTY_IMAGE_FORMATS`/`ELEVENTY_IMAGE_WIDTHS` env vars. Details in docs/IMAGES.md.

## Logging changes to the Obsidian daily note

Every change made to the blog in a session must be recorded in the Obsidian daily note for that day:
`D:\Dropbox\Obsidian\Carpe Diem\<YYYY>\<YYYY-MM>\<YYYY-MM-DD>.md` (the vault's daily-notes setting is
`Carpe Diem/YYYY/YYYY-MM/YYYY-MM-DD`). Create the note if it does not exist yet (first line is the navigation header
`← [[<prev day>]]  ·  [[<next day>]] →   ·   ↑ [[<YYYY>-W<week>]] · [[<YYYY-MM>]]`, then a blank line, then bullets).

Format, matching the existing entries: one top-level bullet `- Blog` with one tab-indented sub-bullet per change,
written in Czech without diacritics, short and outcome-oriented (`- Fixed webvitals`, `- added responsive navigation`).
Link related vault notes with `[[...]]` where one exists.

When a `Blog` entry for the day already exists, add to it rather than creating a second one, and feel free to edit or
consolidate the existing sub-bullets so the day reads as one coherent summary (merge duplicates, fold a follow-up fix
into the bullet it belongs to, drop items that were reverted). Do not touch non-blog bullets. Write the file as UTF-8.

## Code style

- ESLint flat config (`eslint.config.js`): `const` over `let`, no `var`, strict equality, curly braces always required
- Prettier: 120-char line width, 2-space indent, single quotes, trailing commas
- SCSS: stylelint-config-standard-scss; custom rules enforce consistent colors, grid, fonts
