# Responsive Images — Pipeline & Build Cache

How build-time image processing works and how the persistent cache keeps builds fast. Implementation:
`config/plugins/image.js` (eleventy-img transform) + `scripts/image-cache.mjs` (cache).

## The pipeline

Every image referenced from a post goes through the eleventy-img transform plugin, which generates responsive variants:
**formats** `avif`, `webp` and the original format ("auto") × **widths** 400, 800, 1200, 1600 and the original size
("auto"); eleventy-img skips widths larger than the original. 1600 exists for DPR 2 screens (desktop, iPad), which would
otherwise jump from 1200 to the full original (up to 4824 px). With ~380 source images that is roughly **5 100 encoded
files** per clean build — and AVIF encoding alone dominates the build time (it is 5–10× slower than webp).

Generated filenames follow `config/plugins/image.js` → `filenameFormat`:

```text
<sanitized-name>-<content-hash>-<width>.<format>     e.g. featured-48QChAtSZE-800.webp
```

The `<img>` fallback `src` points at the **largest** variant, not the smallest eleventy-img writes there:
`config/html-transform/largest-img-src-transform.js` rewrites it to the widest `srcset` candidate. Browsers pick from
`srcset` and never fetch `src`, but Google Images indexes `src`, so the smallest variant offered crawlers 400px
thumbnails of 2600px screenshots. Image search impressions fell ~85% within a week of the Eleventy launch (end of April
2026); this was one suspected cause, alongside every image URL changing and the Gatsby `/static/…` URLs answering 404.

The `<content-hash>` (`id`) is computed from the **source image contents plus the processing options**. Verified
empirically: writing two different images to the same path produces two different hashes. This property is what makes
caching safe (see below).

### `sizes` and the lightbox

Featured and in-post images fill the text column, `70ch` wide, so its pixel width follows the reader's system font (615
px with Segoe UI, 738 px with DejaVu Sans). `ARTICLE_IMAGE_SIZES` in `config/plugins/image.js` declares
`(min-width: 768px) 760px, 100vw` to cover both. In-post images are lazy and lead with `auto`
(`auto, (min-width: 768px) 760px, 100vw`), so Chromium uses their real width; `auto` is only valid on lazy images, so
the eager featured image gets the plain value through the `articleImageSizes` global in `post.njk`. Guarded by
`tests/images.test.js` and the Playwright checks in `tests/responsive-browser.test.js`.

The full-width variants (`'auto'` width) exist mainly for the **lightbox** (`src/scripts/lightbox.js`, loaded on posts
with images): an in-post image the dialog would show at least 1.25× larger than the column gets wrapped in a button
(re-evaluated on resize, so phones usually get none: there the image already spans the screen and pinch-zoom applies).
The click opens a native modal `<dialog>` with a copy of the `<picture>` whose `sizes` is the exact width it will show
at, so the large candidate downloads only on demand; the in-page rendition stands in as a scaled-up background until it
arrives. Escape, the focus trap and focus return come from the dialog; a click anywhere closes it. Print styles keep the
button visible (they otherwise hide every `<button>`). Tests: `tests/lightbox-script.test.js` (jsdom),
`tests/lightbox-browser.test.js` and `tests/print.test.js` (Playwright).

### Placeholders (LQIP) and the image wrapper

Two HTML transforms finish every `<picture>` after eleventy-img:

1. `config/html-transform/lqip-transform.js` reads the smallest candidate of each picture and puts a placeholder behind
   the `<img>` as an inline style, plus `class="lqip"`:
   - **Featured and in-post images** get a tiny lossy WebP of the same crop, about 160 pixels in the image's aspect
     ratio (`computeGrid`), as a `data:` URI `background-image` (~100–250 bytes). The browser scales it up and the 60 px
     CSS blur turns it into a soft preview.
   - **Thumbnails** (every length in `sizes` is in px and at most 200: post cards, compact related posts, series
     navigation) get only their average colour as `background-color`; at 56–160 px a blurred image looks the same.

   Placeholders are cached per image for the build (most thumbnails repeat on many pages). They used to be SVG mosaics,
   one `<rect>` per cell, ~13 KB each: two thirds of all HTML (21 MB), 533 of 611 KB on `/topics/java/`. Now the whole
   site's placeholders take ~90 KB and the HTML is ~7 MB; `tests/images.test.js` fails any page where they exceed 10 %.

2. `config/html-transform/wrap-pictures-transform.js` wraps each picture in `div.image-wrapper` (and a captioned one in
   a figure, below). A `div` cannot sit inside `<p>`, so the pictures of a paragraph move out together, in source order:
   a paragraph of images only is replaced, one with text keeps its text and gets the wrappers right after it.

`src/styles/components/_image-wrapper.scss` blurs the `.lqip` image over a dark `--lqip-bg-color`. `src/scripts/lqip.js`
(every page, deferred) ends that state: it listens for `load` and `error` in the capture phase, and on start marks the
images that finished before it ran (`complete`; `naturalWidth` 0 means failed). On `[data-loaded]` the blur fades out
and the whole background goes (`!important`, it is inline), so the transparent parts of a PNG show the page and not the
placeholder. On `[data-failed]` (a 404 or a network error) blur and background go at once and a dashed outline marks the
reserved space, so the browser's broken-image box with the alt text is readable and does not pass for an image still
loading. A script rather than an inline `onload` keeps `'unsafe-hashes'` out of the CSP (docs/SECURITY-HEADERS.md); the
cost is that an image loaded before the script stays blurred until it runs. Without JavaScript the `<noscript>` style in
`base.njk` drops blur and background at once, and print styles do the same. Tests: `tests/lqip-transform.test.js` (unit,
synthetic images), `tests/images.test.js` (built pages), `tests/lqip-browser.test.js` (Playwright: placeholder until
load, nothing after, a failed image, an image loaded before the script, no blur without JS),
`tests/wrap-pictures.test.js`.

### Captions

A markdown image title becomes a visible caption: `![alt](./x.png "Caption")` renders as

```html
<figure class="image-figure">
  <div class="image-wrapper">
    <picture>…<img alt="alt" /></picture>
  </div>
  <figcaption class="image-caption">Caption</figcaption>
</figure>
```

eleventy-img keeps the `title` on the `<img>`; `config/html-transform/wrap-pictures-transform.js` then builds the figure
and drops the attribute, so the caption is not a hover tooltip too. Alt and caption have different jobs and must not
repeat each other (a screen reader reads both): alt describes the image for someone who cannot see it, the caption adds
information for every reader. Captions are optional and belong only where they add something (where to look, which side
is which, a source or credit); `/review-draft` checks which images deserve one. The lightbox finds captioned images too,
the feed keeps the caption after the "Image: alt" line (`feedContent` in `config/filters/urls.js`), and print styles
keep a figure on one page. Tests: `tests/wrap-pictures.test.js`, `tests/images.test.js` (the captioned spread in
`/java-by-comparison-book-review/`), `tests/feeds.test.js`, `tests/lightbox-script.test.js`.

## The build cache

eleventy-img **skips encoding when the expected output file already exists**. The cache exploits that:

1. **restore** (`node scripts/image-cache.mjs restore`) — after `clean`, before eleventy: copies all cached images into
   `_site/` at their original relative paths. Unchanged images are then free.
2. eleventy runs — only missing variants (new or changed source images) are encoded.
3. **save** (`node scripts/image-cache.mjs save`) — mirrors generated images from `_site/` back into the cache
   directory. Files are recognized by the `-<hash>-<width>.<ext>` filename pattern, so passthrough assets and HTML never
   leak into the cache.

Both steps are wired into the `build` and `build:with-drafts` npm scripts, so the cache works locally too.

The social card images (`<post>/og-image.jpg`, generated in `src/_data/eleventyComputed.js`) are deliberately **not**
cached, and must stay that way. Their filename is stable rather than content-hashed (crawlers need a predictable URL),
so a restored copy would satisfy eleventy-img's "output already exists" check and a post whose featured image changed
would keep sharing the old card forever. They are re-encoded on every build instead, which costs a few seconds.

Measured effect (local, full production formats): cold build **328 s** → warm build **21.6 s**.

### Why a stale cache can never serve wrong content

- Changed source image → different content hash → different filename → cache miss, re-encode.
- Changed processing options (widths/formats/quality) → different hash → full re-encode.
- The only garbage a cache can accumulate is _unused_ old variants (deleted posts, replaced images). They are harmless —
  nothing references them. If the accumulation ever bothers you, delete `.cache/image-mirror/` (locally), bump the cache
  key (CI), or retry a deploy without cache (Cloudflare).

### Where the cache lives

The cache lives in **`.cache/image-mirror`** (covered by the gitignored `.cache/`) in every environment:

| Environment      | Persisted by                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Local            | just stays on disk                                                                                                                                                                                                                                                                                                                                                                                                          |
| GitHub Actions   | `actions/cache` restore/save steps in `ci.yml`                                                                                                                                                                                                                                                                                                                                                                              |
| Cloudflare Pages | CF build cache preserves `.cache` because it detects Eleventy from `package.json` (it does NOT preserve `node_modules` — only package manager stores like `.npm`). Requires only **build cache enabled** in CF project settings; the dashboard **framework preset is irrelevant** — verified 2026-08-04 with the preset set to `None`, where the build log still reports `Success: Build output restored from build cache.` |

Cloudflare build cache limits: **10 GB per project**, least-recently-read eviction, entries purged 7 days after last
read. Current cache size is ~212 MB (plus ~500 MB for Chromium) — comfortably within the limit.

### Failure behavior

- A failed build never destroys an existing cache — reads still work next time.
- **GitHub Actions:** the save step uses `actions/cache/save` with `if: always()` right after the build step, so encode
  work is persisted even when the build or a later validation step fails. (The combined `actions/cache` action would
  only save on success — that is why restore/save are split.)
- **Cloudflare:** cache is only written after a successful build; no control over that. Green CI before merging to
  master is the practical protection.
- GitHub cache eviction: 10 GB per repo (LRU), entries unused for 7 days are deleted — after a quiet week the first
  build is cold again. Branch scope: branches read their own cache + master's, so caches warmed on master serve new
  feature branches.

## Lean CI variant

CI only validates markup and runs tests — readers never see its output. The `build-and-test` job in `ci.yml` therefore
sets, at job level:

```yaml
ELEVENTY_IMAGE_FORMATS: webp,auto
ELEVENTY_IMAGE_WIDTHS: 800,auto
```

`config/plugins/image.js` reads these env overrides (comma-separated; numbers are parsed, `auto` kept). This skips AVIF
entirely and cuts variants ~4× — so even a cold CI build is several times faster. **Production (Cloudflare) builds keep
the full defaults** — no env vars are set there.

`tests/images.test.js` derives its expected `<source>` formats and `srcset` widths from the same resolved configuration
(`resolveImageFormats()` / `resolveImageWidths()` exported by the plugin), not from whatever the build emitted. With no
override that means AVIF + WebP and all configured widths are **required**, so a change to the defaults fails the tests
locally and on Cloudflare; in CI the variables must stay at job level so the test step sees the same lean variant as the
build step. Run the tests against a `_site/` built with the same env as the test process.

Note: the lean options produce different content hashes than the full options, so CI and production caches never share
entries — which is fine, they are separate storages anyway (GitHub cache vs CF build cache; they cannot share).

## Related build-time dependencies

Chromium for Mermaid rendering installs automatically via the npm `prebuild`/`prebuild:with-drafts` hook
(`config/install-chromium.js`) — a fast no-op when present. On Cloudflare it is stored in `.cache/ms-playwright`
(`PLAYWRIGHT_BROWSERS_PATH` is set automatically when `CF_PAGES=1`), so the CF build cache preserves it too. Details in
MERMAID.md. Playwright's browser download is cached in CI (`~/.cache/ms-playwright`).
