# HTTP Caching & Asset Cache Busting

How browser/CDN caching is configured and why asset URLs carry a `?v=` query parameter. Implementation:
`src/static/_headers` (Cloudflare Pages headers) + `config/utils/asset-version.js` (content-hash versioning) +
`config/filters/asset-version.js` (the `assetUrl` Nunjucks filter).

## The problem this solves

The site is served by Cloudflare Pages. `src/static/_headers` controls `Cache-Control` per path. An asset may only be
cached as `max-age=31536000, immutable` when its **URL changes whenever its content changes** — `immutable` tells
browsers to never revalidate, not even on reload, and Cloudflare's edge keeps the cached copy across deploys.

This once went wrong: `main.css`, script bundles and favicons live under **stable URLs** but were marked immutable.
After a deploy that changed the navigation, visitors (and the CDN edge) kept a weeks-old `main.css` — new HTML, old CSS,
visibly broken layout and a stale icon. A changed URL is the only thing that fixes clients that already hold an
`immutable` copy; purging the CDN alone does not help returning visitors.

## Cache busting: the `assetUrl` filter

Every reference to a stable-URL asset goes through the `assetUrl` filter, which appends a 10-char md5 content hash:

```njk
<link rel="stylesheet" href="{{ '/styles/main.css' | assetUrl }}">
{# → /styles/main.css?v=2a9984a60b #}
```

The hash is computed from **source files**, not build output, because templates render before/parallel to the Sass and
esbuild plugins (`config/utils/asset-version.js` → `sourcesFor`):

| Asset URL     | Hashed sources                                          |
| ------------- | ------------------------------------------------------- |
| `/styles/*`   | all files under `src/styles/` (any partial can matter)  |
| `/scripts/*`  | all files under `src/scripts/` (bundles share modules)  |
| anything else | the matching file in `src/static/` (passthrough copies) |

Hashes are cached in-process per URL. If a source file cannot be read, the filter logs a warning and returns the URL
unversioned (fails safe — the asset then just revalidates).

Versioned references live in: `base.njk` (stylesheet, favicons, manifest, global scripts), `post.njk` (per-post
scripts), `social-share.njk`, `header.njk` (logo `<img>`), and `src/_data/site.js` (the absolute giscus theme CSS URL
passed to giscus.app).

**When adding a new script/stylesheet/static-asset reference, always pipe it through `assetUrl`.** The
`tests/asset-version.test.js` suite fails if a `/scripts/*` reference in built HTML is unversioned.

## Caching policy (`src/static/_headers`)

Cloudflare `_headers` notes: `*` matches across `/`, and when multiple rules match, the **later** rule wins for a
same-named header. The default rule (`/*`) is `max-age=0, must-revalidate` — safe for HTML.

| Path                                                                            | Cache-Control                | Why                                                                                                                                        |
| ------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `/*` (default, incl. HTML)                                                      | `max-age=0, must-revalidate` | Always fresh after deploys; revalidation is a cheap 304                                                                                    |
| `/*/*.avif`, `.webp`, `.jpeg`, `.jpg`, `.png`, `.svg`                           | 1 year, `immutable`          | eleventy-img output — content hash is in the **filename** (see IMAGES.md)                                                                  |
| `/styles/*`, `/scripts/*`                                                       | 1 year, `immutable`          | Stable filenames, but every reference carries `?v=<hash>` — new version = new URL                                                          |
| Root statics (favicons, `site.webmanifest`, `default-share.jpg`, `vojtech.jpg`) | `max-age=3600`               | Fetched under bare URLs by browsers (automatic favicon lookup, manifest icons) and og:image scrapers — must pick up changes within an hour |
| Feeds, `sitemap.xml`, `robots.txt`                                              | 5 min / 1 h / 1 day          | See FEEDS.md                                                                                                                               |

Two exceptions to note:

- `/*/og-image.jpg` (per-post social share image) has a **stable URL but changing content** — a dedicated rule after
  the `/*/*.jpg` block overrides `immutable` down to `max-age=3600`.
- Public images (post images, og-images, favicons, share images) carry
  `Cross-Origin-Resource-Policy: cross-origin`, overriding the site-wide `same-origin` security default. Without it,
  browsers refuse to embed the images on other origins — which breaks browser-rendered social preview tools
  (metatags.io) and feed readers. Server-side scrapers (Facebook, X, LinkedIn) ignore CORP either way.

Never add an extension-based catch-all like `/*.css` or `/*.svg` with `immutable` — it matches root-level files with
stable URLs and reintroduces the original bug. `tests/asset-version.test.js` guards this: it parses the built `_headers`
and fails when an immutable rule targets anything other than the hashed/versioned paths above.

## After a deploy with asset changes

Nothing to do in the normal case — HTML is never cached, so it always references the current `?v=` URLs, which are new
cache keys at the edge and in browsers. Only the bare-URL root statics (e.g. `/favicon.ico` fetched automatically) can
lag up to an hour; a Cloudflare **Purge Everything** (dashboard → Caching → Configuration) fixes them immediately if
needed.
