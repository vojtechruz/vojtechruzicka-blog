# Gatsby → Eleventy Migration Checklist

> Status audit: 2026-07-31. Legend: `[x]` done · `[ ]` open (⚠️ partial / ❌ not implemented) · ~~struck~~ = not
> applicable.

## 9) Redirects and legacy URLs

- [ ] Verify 301 status codes and canonicalization — ⚠️ partial: `src/static/_redirects` (17 rules, all 301) validated
      by `tests/redirects.test.js`; HSTS + upgrade-insecure-requests in `_headers`. But www/non-www and trailing-slash
      normalization live at the Cloudflare level (not in repo) — needs a one-time live check (e.g.
      `http://vojtechruzicka.com/slug` → 301 → `https://www.vojtechruzicka.com/slug/`).

## 10) Analytics, comments, search, forms

- [x] ~~Newsletter/signup forms~~ — N/A, no newsletter exists; subscription is RSS-only.

## 15) Accessibility and performance

- [ ] Core Web Vitals verified in production — ⚠️ not verifiable from the repo; check Search Console/CrUX post-launch.

## 16) Quality assurance and content checks

- [ ] Validate external links — ⚠️ `validate:links:external` script exists but is not in CI; run manually now and then
      or add a scheduled workflow. (No target=_blank injection, so rel=noopener is moot.)
- [ ] Verify RSS feed validity — ⚠️ XML well-formedness checked in CI (`validate:xml`); a one-time W3C Feed Validator
      pass would close this out.

## 20) Final verification and launch checklist

- [ ] Spot-check high-traffic posts for visual parity — ⚠️ manual; not evidenced in repo.
- [ ] Validate canonical tags and 301s with a sample of old URLs — ⚠️ tests cover the redirects file and canonicals; a
      live spot-check of a few old URLs remains.
- [ ] Submit updated sitemap in Search Console — ⚠️ manual; not verifiable from repo.
- [ ] Monitor logs/analytics for 404s — ⚠️ ongoing; check Plausible/Cloudflare for 404 hits.
