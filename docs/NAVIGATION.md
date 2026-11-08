# Site header and navigation

The header (`components/header.njk` in `layouts/base.njk`, styles in `src/styles/components/_navigation.scss`, script
`src/scripts/nav.js`) has two layouts.

| Layout  | When                                                                              | Header                                                                             |
| ------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Full    | wider than 1024 px and taller than 500 px                                         | logo, title, links and search; sticky, always visible                              |
| Compact | `(max-width: 1024px), (max-height: 500px)`: phones either way up, tablets upright | one row, logo and hamburger; sticky, hides on scrolling down, back on scrolling up |

The width limit is the one below which the sidebar goes too (`$breakpoint-large`), so the compact header comes with the
one-column layout. It is set by the full header, not by the phones: logo, title, links and search need about 880 px in
one row with Segoe UI and about 1 040 px with the wider DejaVu Sans, so a lower limit (it was 768 px) left a band where
the full header wrapped to two rows. The height condition is there for a phone in landscape. Its viewport is short, and
the full header, sticky, would take a third of the 400-odd pixels of height.

## Hiding on scroll

`nav.js` adds `.nav-hidden` on scrolling down and removes it on scrolling up. It ignores moves under 8 px, so a jittery
finger does not make the header flicker. The header stays, whatever the scroll direction:

- near the top of the page, where it is in its place anyway;
- while the menu is open, or the search (`body.search-open`);
- while keyboard focus is in it. Focus moving into it, such as Tab back to the logo, also brings it back.

The shown header has **no `transform` at all**, not even `translateY(0)`. A transformed ancestor becomes the containing
block of `position: fixed` descendants, and the search drawer inside the header is one. The CSS also never applies
`.nav-hidden` under `body.search-open`. The 0.2 s slide is instant under `prefers-reduced-motion`, through the global
rule in `base/_accessibility.scss`.

`--offset-nav` (the `scroll-padding-top` that keeps link targets clear of the header) stays as it is. A jump down hides
the header and leaves a small gap above the target; a jump up shows it, and the padding is needed.

## Without JavaScript

The compact layout collapses the menu in CSS, so that enhancing it causes no layout shift. The `<noscript>` block in
`base.njk` expands it again and hides the toggle. On a compact screen it also makes the header `position: static`: it
cannot hide without the script, and expanded it is the whole menu, so it scrolls away with the page. The desktop header
stays sticky without JS.

## One query, three places

The compact query is written three times and must match: `$query-compact-nav` in `src/styles/_variables.scss`,
`COMPACT_NAV_QUERY` in `nav.js`, and the `<noscript>` block in `base.njk`. `tests/nav.test.js` compares them.

## Tests

- `tests/nav.test.js` (jsdom): the markup contract, the toggle (open, Escape, outside click, reset on leaving the
  compact layout) and the shared query.
- `tests/nav-scroll-browser.test.js` (Playwright, phone portrait 390×844, phone landscape 844×390, tablet portrait
  820×1180): one row, hiding and showing, the 8 px threshold, staying while the menu or the search is open, focus
  bringing it back, no transform when shown, no-JS static header, one-row sticky desktop header, reduced motion.
  Mutation-checked.
