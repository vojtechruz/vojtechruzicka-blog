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
- `config/shortcodes/` — `{% youtube %}`, `{% codepen %}`, `{% video %}`, `{% warning/info/error %}`, `{% linkedPost %}`, `{% linkedSeries %}`
- `config/html-transform/` — post-processing transforms: LQIP SVG injection, `<picture>` wrapping, aria-hidden/tabindex fixes
- `config/utils/` — shared markdown parser and formatting helpers

### Content (`src/`)

- `src/posts/` — blog posts, one subdirectory per topic (e.g., `java/`, `javascript/`, `angular/`). Each post is `index.md`.
- `src/_data/` — global Eleventy data: `site.js` (metadata, social links, Giscus config, Plausible analytics), `seriesMetadata.js`, `topicCategories.js`, `eleventyComputed.js`
- `src/_includes/layouts/` — base → page/post-list → post layout chain
- `src/_includes/components/` — reusable Nunjucks components
- `src/scripts/` — client-side JS bundled by esbuild
- `src/styles/` — SCSS files compiled by Sass plugin

### Tests (`tests/`)

Vitest unit tests covering HTML output of built pages: `tests/helpers.js` loads `_site/` output with Cheerio for DOM assertions. Tests require a prior `npm run build` to have `_site/` present.

### Draft handling

Posts are excluded from production builds by default. Control via frontmatter `draft: true` and the `INCLUDE_DRAFTS` environment variable (`all` or `none`). Draft posts live in `src/posts/_drafts/`.

### Key data flow

1. Markdown posts → markdown-it parser (with custom plugins for callouts, TOC) → HTML
2. HTML transforms run post-render: LQIP placeholders, `<picture>` wrapping for responsive images
3. esbuild bundles `src/scripts/` → `_site/scripts/`
4. Pagefind indexes `_site/` after build for client-side search
5. Giscus (GitHub Discussions) provides comments; no server-side component

## Code style

- ESLint flat config (`eslint.config.js`): `const` over `let`, no `var`, strict equality, curly braces always required
- Prettier: 120-char line width, 2-space indent, single quotes, trailing commas
- SCSS: stylelint-config-standard-scss; custom rules enforce consistent colors, grid, fonts
