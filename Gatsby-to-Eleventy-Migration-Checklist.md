# Gatsby → Eleventy Migration Checklist

> Status audit: 2026-07-31. Legend: `[x]` done · `[ ]` open (⚠️ partial / ❌ not implemented) · ~~struck~~ = not
> applicable.

- [x] ~~Newsletter/signup forms~~ — N/A, no newsletter exists; subscription is RSS-only.
- [ ] Core Web Vitals verified in production — ⚠️ not verifiable from the repo; check Search Console/CrUX post-launch.
- [ ] Validate external links — ⚠️ `validate:links:external` script exists but is not in CI; run manually now and then
      or add a scheduled workflow. (No target=_blank injection, so rel=noopener is moot.)
- [ ] Verify RSS feed validity — ⚠️ XML well-formedness checked in CI (`validate:xml`); a one-time W3C Feed Validator
      pass would close this out.
- [ ] Submit updated sitemap in Search Console — ⚠️ manual; not verifiable from repo.

