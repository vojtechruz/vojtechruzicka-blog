# Gatsby → Eleventy Migration Checklist

> Status audit: 2026-07-31. Legend: `[x]` done · `[ ]` open (⚠️ partial / ❌ not implemented) · ~~struck~~ = not applicable.

## 5) Markdown/MDX processing
- [ ] Configure markdown-it options:
  - [ ] Smart quotes, typographer — ❌ not enabled (`markdownIt({ html: true })` in `config/utils/markdown-parser.js`).
    Decide: enable (one-liner) or drop.
  - [ ] External link attributes (target, rel) — ❌ not implemented; links open in the same tab. If that's the intended
    behavior, drop this item (rel=noopener is then moot).
    a11y fix-up transform, `tests/toc.test.js`.
  - [x] ~~Footnotes and task lists (if used)~~ — N/A, verified no post uses either.
  - [ ] Line numbers — ❌ not implemented. Drop if the Gatsby site didn't show them.

## 6) Images and static assets
- [ ] Optimize SVGs; keep accessibility — ⚠️ no svgo step, but SVGs are only hand-written icons (aria-hidden tagged),
  favicons, and build-generated LQIP/Mermaid output. Low priority; consider dropping.

## 9) Redirects and legacy URLs
- [ ] Verify 301 status codes and canonicalization — ⚠️ partial: `src/static/_redirects` (17 rules, all 301) validated by
  `tests/redirects.test.js`; HSTS + upgrade-insecure-requests in `_headers`. But www/non-www and trailing-slash
  normalization live at the Cloudflare level (not in repo) — needs a one-time live check
  (e.g. `http://vojtechruzicka.com/slug` → 301 → `https://www.vojtechruzicka.com/slug/`).

## 10) Analytics, comments, search, forms
- [x] ~~Newsletter/signup forms~~ — N/A, no newsletter exists; subscription is RSS-only.

## 11) CSS, JS, and bundling
- [ ] Purge/treeshake CSS — ❌ not implemented; likely unnecessary for hand-written SCSS. Drop or nice-to-have.
  2. Filename fingerprinting deliberately NOT added — instead `_headers` was restructured so only content-hashed files
     (eleventy-img output, Pagefind index chunks) are `immutable`; fixed-name CSS/JS `must-revalidate` (cheap ETag
     304s), fixed-name statics get `max-age=86400`. Bonus fixes: the default HTML `Cache-Control` was mis-indented
     into the `giscus-theme.css` block (HTML was saved only by the platform default), and dead rules
     (`/js/*`, `/fonts/*`, `/assets/*`, `/images/*`, `/static/*`, `/archives`) were removed.

## 15) Accessibility and performance
- [ ] Lazy-loading; preconnect/preload — ⚠️ images/iframes lazy ✅ (hero eager + fetchpriority=high ✅), but no
  `preconnect` hints for plausible.io and giscus.app — cheap win, add to `base.njk` head.
- [ ] Core Web Vitals verified in production — ⚠️ not verifiable from the repo; check Search Console/CrUX post-launch.

## 16) Quality assurance and content checks
- [ ] Validate external links — ⚠️ `validate:links:external` script exists but is not in CI; run manually now and then
  or add a scheduled workflow. (No target=_blank injection, so rel=noopener is moot.)
- [ ] Verify RSS feed validity — ⚠️ XML well-formedness checked in CI (`validate:xml`); a one-time W3C Feed Validator
  pass would close this out.

## 19) Security and privacy
- [x] CSP and security headers — full CSP allowlist + HSTS(preload)/XCTO/XFO/Referrer-Policy/COOP/CORP/
  Permissions-Policy in `src/static/_headers`.

## 20) Final verification and launch checklist
- [ ] Crawl and compare against Gatsby page count — ⚠️ one-time manual step; not evidenced in repo (migration merged
  2026-07-17, PR #109).
- [ ] Spot-check high-traffic posts for visual parity — ⚠️ manual; not evidenced in repo.
- [ ] Validate canonical tags and 301s with a sample of old URLs — ⚠️ tests cover the redirects file and canonicals;
  a live spot-check of a few old URLs remains.
- [ ] Submit updated sitemap in Search Console — ⚠️ manual; not verifiable from repo.
- [ ] Monitor logs/analytics for 404s — ⚠️ ongoing; check Plausible/Cloudflare for 404 hits.
