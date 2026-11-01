# CodePen embeds

Interactive demos embedded with the `{% codepen %}` shortcode (`config/shortcodes/codepen.js`). They load on click: the
page shows a screenshot of the pen's result under a title bar, like a code block's, with the caption and two controls:
**Enlarge** (the screenshot in the lightbox) and **Run demo**, with which `src/scripts/codepen.js` swaps in the real
CodePen iframe. The controls sit in the bar, not over the screenshot: most readers only look at the picture, and no
corner of every demo is empty.

## Why a facade

A CodePen iframe loads the whole CodePen editor with its JavaScript and sets third-party cookies. `/css-flexbox/` has 17
of them: even with `loading="lazy"` they all load as the reader scrolls, and the cookies alone held its Lighthouse Best
Practices score at 79. With the facade nothing is requested from `codepen.io` until the reader runs a demo, and only
that one demo loads.

The poster also gives print and feeds something to show: a printed page shows what the demo looks like under its URL,
and a feed links to the pen.

## Adding a pen

1. Embed it by its id (the last part of the pen URL; the user is always `vojtechruz`):

   ```njk
   {% codepen "ExVPBzM", "Display Flex" %}
   {% codepen "ExVPBzM", "Display Flex", 500, "result+css" %}
   ```

   Arguments: id, title (the visible caption, and the iframe's accessible name), height in px (default 400), the CodePen
   tab to open (default `result`), and `false` as the fifth to hide the caption.

2. Take its poster:

   ```bash
   npm run codepen:screenshots              # pens that have no poster yet
   npm run codepen:screenshots -- ExVPBzM   # these pens again, e.g. after changing them
   npm run codepen:screenshots -- --force   # every pen again
   ```

   The script (`scripts/codepen-screenshots.mjs`) saves `codepen-<id>.png` next to the post's `index.md`, at 615 px wide
   (the embed's width in the desktop article column) by the pen's height, at 2x. Look at the image before committing: it
   is the state right after load, so a demo that needs a hover, a scroll or a resize shows only its start.

3. Back it up:

   ```bash
   npm run codepen:backup              # pens that have no backup yet
   npm run codepen:backup -- ExVPBzM   # these pens again, after changing them on CodePen
   npm run codepen:backup -- --force   # every pen again
   ```

   The script (`scripts/codepen-backup.mjs`) saves the pen's result as `codepen/<id>/index.html` with `style.css` and
   `script.js` beside it, next to the post's `index.md` (see [Backups](#backups-and-the-examples-download)).

`tests/codepen.test.js` fails for a pen in a post without its poster, `tests/codepen-archive.test.js` without its
backup. The shortcode itself copes without one (the facade is then an empty white box with the button), so a draft can
be written before the screenshot is taken.

### Why not codepen.io

`codepen.io` answers headless browsers with a Cloudflare challenge. The result-only view
`https://cdpn.io/vojtechruz/fullpage/<id>` is not behind it, and renders without CodePen's chrome when the request
carries a CodePen `Referer` (without it, a warning banner covers the top of the result). If that ever stops working, a
screenshot from a normal browser saved under the same name does the same job.

Posters and backups are never fetched during the build: the build would depend on codepen.io being up and fast, and pens
rarely change.

## How it renders

```html
<figure class="codepen-embed-figure" data-print-label="CodePen" data-print-url="https://codepen.io/vojtechruz/pen/<id>">
  <figcaption id="cp-caption-…" class="codepen-caption">Title</figcaption>
  <div class="codepen-actions">
    <button type="button" class="codepen-enlarge" aria-label="Enlarge screenshot: Title" hidden>…icon…</button>
    <button type="button" class="codepen-run" hidden>Run demo<span class="visually-hidden">: Title</span></button>
    <a class="codepen-open" href="https://codepen.io/vojtechruz/pen/<id>">Open on CodePen<span …>: Title</span></a>
  </div>
  <div class="codepen-facade" style="height: 400px" data-codepen-src="…/embed/<id>?default-tab=result&height=400" …>
    <img class="codepen-poster" src="./codepen-<id>.png" alt="" />
  </div>
</figure>
```

- **The frame** is a grid styled like a code block with a title: the caption and the controls share the bar, the
  screenshot (later the iframe) spans the row under it. A long caption wraps beside the controls.
- **The poster** goes through the normal image pipeline (AVIF/WebP, widths, LQIP). Its `alt` is empty: the caption and
  the buttons already name the demo. The poster itself is not clickable. On a phone the desktop screenshot shrinks to
  fit the box, top-aligned on white.
- **Enlarge** is shown by `src/scripts/lightbox.js` under the rule for in-post images: only where the dialog would show
  the screenshot at least 1.25x larger, so on desktop but usually not on a phone. Focus returns to the button.
- **Run demo**: `src/scripts/codepen.js` (loaded only on posts with a facade) removes the link, shows the button, and on
  click replaces the screenshot with the iframe, carrying over the title and `aria-labelledby` the caption, then moves
  focus into it.
- **Nothing moves** when a demo runs: the box has the iframe's height, the iframe is `display: block`, and the bar's
  controls are then hidden with `visibility` rather than removed, so a caption wrapped beside them keeps its lines.
- **Without JS** both buttons stay hidden and the link opens the pen on CodePen.

## Print and feeds

- **Print** (`src/styles/base/_print.scss`) hides the controls, keeps the caption and the poster and prints
  `CodePen: <pen URL>` above them, like the other embeds ([PRINT.md](PRINT.md)). A demo already run prints only the URL
  and the caption.
- **Feeds**: `feedContent` (`config/filters/urls.js`) reduces the figure to `Interactive demo: <title>` and a link to
  the pen ([FEEDS.md](FEEDS.md)).

## Backups and the examples download

Each pen's code is committed next to its article (`codepen/<id>/`), so the demos do not live only on codepen.io:

- **What is saved:** the pen's result page from cdpn.io split into `index.html` (the pen's HTML), `style.css` and
  `script.js` (only when the pen has CSS / JS), plus the CDN stylesheets and scripts the pen pulls in. CodePen's own
  assets and its infinite-loop guard are left out. Preprocessors arrive compiled: an SCSS pen is saved as CSS. The page
  opens straight from the folder, offline; when the backups were taken (2026-11-01) every one rendered pixel-identical
  to its poster.
- **Not a page:** `.eleventyignore` keeps `src/posts/**/codepen/` out of the build, so the `index.html` files are never
  rendered as pages.
- **If CodePen goes away**, the shortcode can run the demos from these files (an iframe of a self-hosted page) instead
  of codepen.io; nothing does that yet.

The build packs an article's backups into one zip, `/<article>/<article>-examples.zip` (`config/codepen-archive.js`, an
`eleventy.after` hook): a folder per demo in article order (`01-display-flex/`, …) and a README with the article URL and
each demo's CodePen link. Entry dates are fixed, so unchanged backups give the same bytes. The post layout shows
`components/codepen-download.njk` below an article with demos: a card ("All examples from this article", the number of
demos, the zip's size) with a **Download ZIP** link. It stays out of the search index and out of print, and an article
without backups gets no card.

## CSP

The iframe comes from `https://codepen.io`, which stays in `frame-src` although no built page contains it any more
(`tests/security-headers.test.js` keeps it there). The poster is served from the site itself.

## Tests

- `tests/codepen.test.js`: markup (no iframe, the URL for the script, buttons and fallback link, the bar above the demo,
  poster and Enlarge only when the file exists, no blank lines that would break the markdown HTML block), parsing of the
  calls, a poster for every pen.
- `tests/codepen-browser.test.js`: nothing requested from CodePen while scrolling past all 17 demos on `/css-flexbox/`;
  Enter on Run demo gives the focused iframe at the same height, also under a caption wrapped to two lines; the controls
  lie above the screenshot; Enlarge opens the lightbox on desktop and is absent on a phone; without JS the link remains.
- `tests/codepen-archive.test.js`: splitting a result page (CodePen's assets and loop guard dropped), the standalone
  page, a backup for every pen, the zip's folders, README and stable bytes, the card with the zip's real size on
  `/css-flexbox/` and none on an article without demos.
- `tests/print.test.js`, `tests/feeds.test.js`: the poster in print, the feed link.
