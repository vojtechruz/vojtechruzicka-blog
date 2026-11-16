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

## Search in the compact menu

On a compact screen the search input sits in the open menu, under the links. The results overlay (`.pagefind-ui__drawer`
in `src/styles/components/_search.scss`) normally floats `12dvh` from the top, which clears the full header but covered
this input, so the query vanished as soon as the results appeared. Two changes keep it in view:

- While the results are open (`body.search-open`), the menu links are hidden, so the input moves up under the top bar.
  The links are behind the overlay and out of the focus trap's reach anyway; they come back when the search closes.
- `src/scripts/search.js` measures the input when the overlay opens (and on resize) into `--search-input-bottom`. The
  overlay starts at `max(12dvh, input bottom + 0.5rem)` and its height shrinks to end 1rem above the viewport bottom, so
  a phone held sideways still has room for results. On the full header the input ends above `12dvh` and nothing moves.

The input in the page is a pre-rendered placeholder that Pagefind replaces once `pagefind-ui.js` has loaded. A desktop
starts loading on hover; a touch screen has no hover, so the first tap used to load it and the input was swapped under
the finger: the first letters typed were lost, and iOS closed the keyboard (a `focus()` call after the async load is
outside the tap's handler and does not bring it back). Now:

- Opening the compact menu starts loading, without moving focus into the search, so Pagefind's input is in place before
  the tap. The tap focuses it natively and the keyboard stays.
- If the script is still loading (slow connection), whatever was typed into the placeholder carries over to Pagefind's
  input and runs as a search.

Closing the menu with results open (its toggle is an X by then and looks like the overlay's close button) closes the
search too: the results went with the menu, but the backdrop stayed over the page. The toggle's hover colour applies
only under `(hover: hover)`; a touch screen kept it orange after the tap.

Guarded by `tests/search-browser.test.js` ("Search overlay position": phone portrait and landscape, closing with the
menu, desktop; "Search loading before the first keystroke": loading on menu open, early keystrokes on a delayed script).

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
