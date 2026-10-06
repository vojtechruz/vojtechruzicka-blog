# Print Styles

All print rules live in `src/styles/base/_print.scss`, guarded by `tests/print.test.js` (Playwright with emulated print
media against the built `_site/`).

## Rules of thumb

- **`_print.scss` is imported last in `main.scss`.** A component rule with the same specificity would otherwise win over
  the print rule (that is how permalinks and the featured image used to end up on paper). Hiding uses
  `display: none !important` on top of that, because the LQIP transform puts an inline `display:block` on images.
- **The site is dark-only, print is light.** Browsers drop backgrounds by default but keep text colors, so print
  redefines the color tokens on `:root`. A new component that uses the tokens prints correctly for free; one with
  hard-coded colors (like `.badge`) needs its own print override.
- **Code uses the light Shiki theme.** The markdown parser emits both `--shiki-light` (`github-light`) and
  `--shiki-dark` per token; the screen reads the dark one, print the light one. Long lines wrap instead of clipping.
- **Mermaid** colors are baked into the SVG for the dark theme; print forces dark labels and edges.

## What is hidden

Navigation, breadcrumbs, pagination, reading progress, social share, related posts, comments, sidebar (TOC, series),
footer, heading permalinks, copy-code buttons, the featured image, post-card thumbnails, form inputs and buttons. A new
piece of interactive chrome should be added to the list (and to `HIDDEN_IN_PRINT` in the test).

## What is added

- **Identification line** (`.print-header` in `base.njk`): site title and canonical URL, since the navigation and footer
  are hidden. Hidden on screen, `aria-hidden` so it stays out of landmark checks.
- **Link targets** after links in `main`, with the site origin in front of internal ones (`$site-url`, must equal
  `site.url` - tested). Skipped for permalinks, image links, topic links, in-page and `mailto:` links.
- **Embed URLs:** the `codepen`, `youtube` and `video` shortcodes put `data-print-label` / `data-print-url` on their
  `<figure>`; print hides the iframe / player and shows `Label: URL` via `::before`. A new embed shortcode should follow
  the same pattern.

## Checking manually

Chrome DevTools → Rendering → _Emulate CSS media type: print_, or print to PDF with _Background graphics_ off (the
browser default).
