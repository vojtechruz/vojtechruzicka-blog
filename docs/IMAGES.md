# Responsive Images — Pipeline & Build Cache

How build-time image processing works and how the persistent cache keeps builds fast. Implementation:
`config/plugins/image.js` (eleventy-img transform) + `scripts/image-cache.mjs` (cache).

## The pipeline

Every image referenced from a post goes through the eleventy-img transform plugin, which generates responsive variants:
**formats** `avif`, `webp` and the original format ("auto") × **widths** 400, 800, 1200 and the original size ("auto").
With ~380 source images that is roughly **4 800 encoded files** per clean build — and AVIF encoding alone dominates the
build time (it is 5–10× slower than webp).

Generated filenames follow `config/plugins/image.js` → `filenameFormat`:

```text
<sanitized-name>-<content-hash>-<width>.<format>     e.g. featured-48QChAtSZE-800.webp
```

The `<content-hash>` (`id`) is computed from the **source image contents plus the processing options**. Verified
empirically: writing two different images to the same path produces two different hashes. This property is what makes
caching safe (see below).

## The build cache

eleventy-img **skips encoding when the expected output file already exists**. The cache exploits that:

1. **restore** (`node scripts/image-cache.mjs restore`) — after `clean`, before eleventy: copies all cached images into
   `_site/` at their original relative paths. Unchanged images are then free.
2. eleventy runs — only missing variants (new or changed source images) are encoded.
3. **save** (`node scripts/image-cache.mjs save`) — mirrors generated images from `_site/` back into the cache
   directory. Files are recognized by the `-<hash>-<width>.<ext>` filename pattern, so passthrough assets and HTML never
   leak into the cache.

Both steps are wired into the `build` and `build:with-drafts` npm scripts, so the cache works locally too.

Measured effect (local, full production formats): cold build **328 s** → warm build **21.6 s**.

### Why a stale cache can never serve wrong content

- Changed source image → different content hash → different filename → cache miss, re-encode.
- Changed processing options (widths/formats/quality) → different hash → full re-encode.
- The only garbage a cache can accumulate is _unused_ old variants (deleted posts, replaced images). They are harmless —
  nothing references them. If the accumulation ever bothers you, delete `.image-cache/` (locally), bump the cache key
  (CI), or retry a deploy without cache (Cloudflare).

### Where the cache lives

| Environment      | Location                           | Persisted by                                                                                                                                                        |
| ---------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Local            | `.image-cache/` (gitignored)       | just stays on disk                                                                                                                                                  |
| GitHub Actions   | `.image-cache/`                    | `actions/cache` restore/save steps in `ci.yml`                                                                                                                      |
| Cloudflare Pages | `node_modules/.cache/image-mirror` | CF build cache (only preserves `node_modules` — same trick as `PLAYWRIGHT_BROWSERS_PATH=0`, see MERMAID.md); **build cache must be enabled** in CF project settings |

The location switches automatically — `scripts/image-cache.mjs` detects `CF_PAGES=1`.

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

CI only validates markup and runs tests — readers never see its output. The build step in `ci.yml` therefore sets:

```yaml
ELEVENTY_IMAGE_FORMATS: webp,auto
ELEVENTY_IMAGE_WIDTHS: 800,auto
```

`config/plugins/image.js` reads these env overrides (comma-separated; numbers are parsed, `auto` kept). This skips AVIF
entirely and cuts variants ~4× — so even a cold CI build is several times faster. **Production (Cloudflare) builds keep
the full defaults** — no env vars are set there.

Note: the lean options produce different content hashes than the full options, so CI and production caches never share
entries — which is fine, they are separate storages anyway (GitHub cache vs CF build cache; they cannot share).

## Related build-time dependencies

Chromium for Mermaid rendering installs automatically via the npm `prebuild`/`prebuild:with-drafts` hook
(`config/install-chromium.js`) — a fast no-op when present. On Cloudflare it is stored inside `node_modules` via
`PLAYWRIGHT_BROWSERS_PATH=0` (set automatically when `CF_PAGES=1`). Details in MERMAID.md. Playwright's browser download
is cached in CI (`~/.cache/ms-playwright`).
