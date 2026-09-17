# Heading anchors

Every heading in a post gets a stable `id` and an icon link that copies a deep link to that section.

## How it is built

- `config/utils/markdown-parser.js` registers `markdown-it-anchor` with two customisations:
  - `slugify` is [github-slugger](https://github.com/Flet/github-slugger), so `## What's next?` becomes
    `id="whats-next"`. These are the ids the Gatsby-era site produced (gatsby-remark-autolink-headers uses the same
    library), so deep links shared before the Eleventy migration keep resolving, and copied permalinks contain no
    percent-encoding. Repeated headings get a `-1`, `-2` suffix. Do not change the slugger: every id is a public URL.
  - `permalink` is a custom renderer that appends an empty `<a class="header-anchor">` after the heading text with
    `href="#<id>"`, `aria-label` and `title` both set to `Copy link to this section: <heading text>`, and
    `tabindex="-1"`. Headings themselves carry no `tabindex` (`tabIndex: false`).
- The anchors are rendered at parse time, not fixed up by an HTML transform, so `post.templateContent` (used by the
  feeds) and the final page carry the same markup. `feedContent` (`config/filters/urls.js`) removes them from feed
  items, where an empty link is useless.
- `src/styles/components/_header-anchor.scss` draws the link icon with a CSS mask. On wide screens it sits in the left
  gutter and appears on hover, `:focus-within` or `:target`; on touch devices it is always faintly visible; below the
  `medium` breakpoint (no gutter) it sits inline after the heading text. Print hides it.
- `src/scripts/header-anchor.js` (loaded by `layouts/post.njk` with `defer`) delegates `click` on `a.header-anchor`. It
  does not prevent the default: the browser follows the `#fragment` (URL bar, scroll, `:target`), and on top of that the
  absolute URL is written to the clipboard via the shared `copyWithFeedback` helper (`clipboard.js`), which shows the
  `Link copied` tooltip and swaps the `aria-label` for two seconds. Without the Clipboard API nothing extra happens; the
  fragment navigation has already put the link in the address bar.

## Deliberate trade-offs

- **Not in the tab order.** An article can have dozens of headings; making each anchor a tab stop would make keyboard
  navigation miserable. Screen-reader users still reach the links in browse mode (they are in the accessibility tree
  with a per-heading name). Sighted keyboard-only users currently have no way to copy a section link (the sidebar TOC
  links do not update the URL either, see toc-scrollspy.js); that is the accepted cost.
- **Icon hidden on wide screens until hover.** Keeps the article uncluttered; touch and narrow screens, which have no
  hover, show it permanently at reduced opacity.

## Tests

- `tests/header-anchor.test.js`: markdown renderer output (slugs, attributes, de-duplication), built post markup (every
  heading has exactly one well-formed anchor, ids are clean slugs, script loaded with `defer`, bundle shipped) and jsdom
  click behaviour (copy, feedback, reset, default navigation kept, clipboard failure).
- `tests/feeds.test.js`: anchors are stripped from feed content.
- `tests/toc.test.js` and `tests/a11y.test.js` rely on the heading ids and anchor names indirectly.
