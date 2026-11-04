# Deployment and build environments

The site is hosted on **Cloudflare Pages** (project `vojtechruzicka-blog`), which builds straight from the GitHub
repository. There is no `wrangler.toml` — the project settings live only in the Cloudflare dashboard, so they cannot be
discovered from the code and are recorded here instead.

| Setting                | Value                 |
| ---------------------- | --------------------- |
| Build command          | `npm run build`       |
| Build output directory | `_site`               |
| Root directory         | `/` (repository root) |
| Build caching          | enabled               |

Read off the dashboard on 2026-08-04. The **framework preset is `None`, and that is fine** — Cloudflare detects the
framework and package manager from `package.json`, not from that dropdown, so `@11ty/eleventy` in `dependencies` is what
earns the Eleventy cache directory. Only **build caching being enabled** matters.

That directory is `.cache`, where the image mirror and the Chromium download live, so the caching is worth real time: a
warm build finishes in about 75 seconds, a cold one takes 10–18 minutes. A build log confirms both halves were restored:

```text
Success: Dependencies restored from build cache.   ← the npm store (.npm)
Success: Build output restored from build cache.   ← the framework directory (.cache)
```

Branches created fresh (Dependabot, for instance) have no cache to inherit and always pay the cold price. See
[IMAGES.md](IMAGES.md) and [MERMAID.md](MERMAID.md).

## URLs

| Environment | URL                                                    | Branch           |
| ----------- | ------------------------------------------------------ | ---------------- |
| Production  | `https://www.vojtechruzicka.com`                       | `master`         |
| Preview     | `https://<branch-name>.vojtechruzicka-blog.pages.dev/` | any other branch |

Preview deploys are public and require no authentication.

## How the environment is detected

`config/env-utils.js` is the single source of truth:

- `isLocalDevelopment()` — `ELEVENTY_RUN_MODE=serve`, i.e. `npm run dev`
- `isPreview()` — the build branch is neither empty nor `master`/`main`, read from `CF_PAGES_BRANCH` (Cloudflare) or
  `GITHUB_REF_NAME` (GitHub Actions). Setting `DEPLOY_ENV` to `production` or `preview` overrides that heuristic
  outright.

Anything that is neither is treated as production.

## What differs per environment

| Concern             | Local dev           | Preview               | Production        |
| ------------------- | ------------------- | --------------------- | ----------------- |
| Plausible analytics | not loaded at all   | not loaded at all     | production script |
| Favicon             | `favicon-local.svg` | `favicon-preview.svg` | full favicon set  |
| Giscus theme URL    | production URL      | `CF_PAGES_URL`        | production URL    |
| Drafts              | all                 | only `ready`          | none              |
| Search engines      | n/a                 | `noindex, nofollow`   | indexable         |

Plausible loads only in production (script ID in `src/_data/site.js`), so neither local nor preview traffic lands in the
stats; preview deploys had a separate Plausible site until it was deleted on 2026-10-25. The favicon split exists so the
environment is obvious from the browser tab. Local dev uses the production Giscus theme because giscus loads the theme
from inside its iframe on giscus.app, which cannot reach localhost; theme changes are tried out on a preview deploy.

Besides Plausible, **Cloudflare Web Analytics (RUM)** is enabled in the Cloudflare dashboard (not in the repo): the edge
injects its beacon script into served pages. It is kept for real-user Core Web Vitals, which Plausible does not collect
and CrUX does not publish for a site this small. The CSP in `src/static/_headers` must keep its origins allowlisted —
see docs/SECURITY-HEADERS.md.

### Search engine exclusion on previews

Preview deploys serve unpublished `ready` drafts from a public, crawlable domain, so `base.njk` marks **every** page of
a preview deploy `noindex, nofollow`.

`robots.txt` deliberately stays permissive on all environments. Blocking crawlers there instead would be
counterproductive: a `Disallow`ed URL can still be indexed URL-only, and a blocked crawler would never fetch the page to
read the `noindex` tag.

### Cloudflare managed `robots.txt` in production

On the production domain, Cloudflare's **managed `robots.txt`** (dashboard: AI Crawl Control) is enabled, and that is
deliberate. The edge serves a "Cloudflare Managed Content" block in front of `src/static/robots.txt`. The block holds
Content Signals (`Content-Signal: search=yes,ai-train=no,use=reference`) and a `Disallow: /` for each known AI-training
crawler (GPTBot, ClaudeBot, CCBot, Google-Extended, …). Our own file follows it unchanged, `Sitemap` line included, so
search engines still crawl and index everything. The preview `*.pages.dev` domains do not get the block.

The cost is known and accepted: Lighthouse does not recognise the `Content-Signal` directive, so its `robots-txt` audit
fails ("Unknown directive") and the **production SEO score is 92 instead of 100**. That is a lint-level finding, not an
indexing problem. CI does not see it, because Lighthouse there runs over `_site` with the repo's own `robots.txt`.
Decided on 2026-11-02 to keep blocking the AI-training crawlers rather than chase the 100. Do not "fix" the score by
turning the managed file off, and do not copy the block into the repo.

## Draft inclusion and the `INCLUDE_DRAFTS` trap

`config/draft-utils.js` decides which drafts a build contains, and the `INCLUDE_DRAFTS` env var **overrides every other
rule**. That makes the npm scripts load-bearing:

- `npm run build` must **not** pin `INCLUDE_DRAFTS`. Cloudflare runs exactly this command, so pinning it short-circuits
  the environment tiering and preview deploys silently stop showing `ready` drafts — which is precisely what happened
  until 2026-08-04.
- `npm run build:with-drafts` pins `all` on purpose. It is a local convenience script, not a deploy command.

## CI is not a deploy

`.github/workflows/ci.yml` only validates — it builds, runs tests, and checks HTML/XML/links/Lighthouse. It never
deploys; Cloudflare builds independently from the repository.

CI therefore pins `DEPLOY_ENV=production`. GitHub Actions always sets `GITHUB_REF_NAME`, so without the pin every
feature-branch build would look like a preview deploy: it would pull `ready` drafts into `_site` and mark every page
`noindex`, breaking every test that asserts against the production artifact. One variable covers drafts, robots, favicon
and analytics together, which is why it is preferred over pinning `INCLUDE_DRAFTS` alone.

CI also builds a lean image variant via `ELEVENTY_IMAGE_FORMATS` / `ELEVENTY_IMAGE_WIDTHS` — production keeps the full
defaults.
