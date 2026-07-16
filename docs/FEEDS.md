# RSS & Atom Feeds — How Generation Works

How the blog's syndication feeds are built and why the content needs special processing. Implementation:
`src/feed.xml.njk` (RSS 2.0) + `src/atom.xml.njk` (Atom) + `config/filters/urls.js` (the `feedContent` and
`htmlToAbsoluteUrls` filters) + `src/_data/feeds.js` (config).

## The two feeds

The site publishes two equivalent feeds from the same data:

| File       | Format   | Permalink   |
| ---------- | -------- | ----------- |
| `feed.xml` | RSS 2.0  | `/feed.xml` |
| `atom.xml` | Atom 1.0 | `/atom.xml` |

Both are Nunjucks templates with `eleventyExcludeFromCollections: true` so they never appear as pages/posts themselves.
Legacy paths (`/rss`, `/rss.xml`, `/feed`, …) 301-redirect to `/feed.xml` (`src/static/_redirects`), and all three XML
files get a short `max-age=300` cache header (`src/static/_headers`).

Discovery: `src/_includes/layouts/base.njk` emits `<link rel="alternate">` tags in every page `<head>` pointing at the
**absolute** production feed URLs (the canonical reference readers auto-discover). The visible RSS icon in the footer
and About page uses a **relative** `/feed.xml` instead, so clicking it from a preview deploy stays on the preview feed.

## What goes in a feed item

For each post in `collections.posts` newer than `feeds.minDate`, the template emits:

- `title`, `link` / `guid` (RSS) or `id` (Atom) — absolute post URL
- `pubDate` / `updated` — post date
- `description` / `summary` — the post's `excerpt` frontmatter (short teaser)
- `content:encoded` / `content` — the **full** article body (see below)

We ship **full content**, not a truncated teaser: the blog has no ads or tracking to protect with a partial feed, and
its technical audience strongly prefers full-text feeds. `feeds.minDate` (currently `2026-01-01`) bounds the feed so it
never grows without limit.

### The minDate cutoff

`src/_data/feeds.js` exports `minDate`. Only posts dated on or after it appear in the feeds. As of this writing every
published post predates it, so the **production feed is intentionally empty** until a post publishes past the cutoff —
`tests/feeds.test.js` documents and guards this state rather than passing vacuously.

## Why feed content needs post-processing

The body comes from `post.templateContent`, which is the post's HTML **before Eleventy transforms run**. Transforms
(Mermaid → SVG, `<picture>` wrapping, eleventy-img URL rewriting) only run on `.html` outputs — the feed XML never sees
them. So the raw `templateContent` contains site-internal artifacts that are broken or meaningless in a feed reader. The
`feedContent` filter (`config/filters/urls.js`) fixes four of them, then `htmlToAbsoluteUrls` absolutizes the remaining
root-relative links.

The pipeline in both templates (footer appended afterwards — see below):

```njk
{% set body = (post.data.description or post.templateContent)
   | feedContent | htmlToAbsoluteUrls(site.url) %}
… {{ (body + (post.url | feedFooter)) | safe }}
```

### 1. Mermaid diagrams → prose summary

Raw ` ```mermaid ` fences are still `<pre class="mermaid">` source placeholders in `templateContent`. `feedContent`
replaces each with an italic paragraph built from the diagram's `accTitle` + `accDescr` (the accessible summary the
diagrams carry anyway — see MERMAID.md). Falls back to a generic "Diagram available in the original article." when those
are absent. SVG is deliberately **not** embedded: many readers strip or mangle inline SVG.

### 2. Images → alt text

`<img>` tags still point at source paths (`/../src/posts/…`) that don't exist on the deployed site, because the
eleventy-img rewrite runs only for `.html`. Each image is replaced by an italic "Image: {alt}" paragraph, or **dropped
entirely** if it has no alt text (decorative). This trades feed images for never showing a broken image. (Wiring feeds
to the hashed generated variants is possible but harder — their filenames aren't known at template-render time.)

### 3. linkedPost cards → plain link

`{% linkedPost %}` "related article" cards are site chrome that depends on the site CSS — even the "Related article"
eyebrow is a CSS `::before`, invisible in a reader. Left alone, a card collapses into a bare heading, date, topic list
and excerpt. `feedContent` reduces each `.linked-post` to a single `<em>Related article: </em><a>…</a>` paragraph (the
label now real text, not CSS), or removes it if the title/href can't be found.

### 4. Decorative icons → removed

The callout/msg SVG icons are `aria-hidden="true"` decoration that only sits inline via the component's flexbox CSS;
without it they misalign above the title text. They carry no information, so `feedContent` drops every
`svg[aria-hidden="true"]`, keeping the title and body. (The icons still get intrinsic `width`/`height` in
`config/utils/icons.js` as defensive good practice.)

### 5. Absolutize URLs

`htmlToAbsoluteUrls` rewrites any remaining root-relative `href`/`src` (e.g. `/some-post/`) to absolute `https://…`
URLs, since feed items are read off-site. It runs **after** `feedContent`, so links introduced by the fallbacks (the
related-article link) get absolutized too.

> Note: this filter is a deliberately small regex, not a full HTML parse — it only touches attributes starting with `/`.
> A past bug dropped the closing quote (`href="…/p` instead of `href="…/p"`); there's now a regression test asserting
> quotes stay balanced.

## Item footer (comments + series context)

Full-text feeds lose the engagement chrome that lives _below_ the article on the site. `feedFooter`
(`config/filters/urls.js`) appends a small footer to each item's content — a horizontal rule, then:

- **Series line** (series posts only): "Part N of M in the {series} series" linking to the series page. Series
  membership is looked up in `seriesMetadata`. This is the only place series context reaches the feed — on the site it
  lives in the sidebar.
- **Discuss + read-on-site line**: a link to `{post}#comments` (readers never load Giscus) and a link back to the
  canonical post URL (attribution if the feed is scraped/republished).

Links are built absolute directly (the footer is appended _after_ `htmlToAbsoluteUrls`). Templates:
`{{ (body + (post.url | feedFooter)) | safe }}`.

What is deliberately **not** added to the feed: related-articles (readers already get every post, so "you might also
like" is noise), social-follow links (spammy — the feed itself is the subscription), and the table of contents
(redundant with the in-content headings).

## Membership tests are URL-based, not substring

`tests/feeds.test.js` checks whether a post is in a feed by parsing item URLs (`<guid>` in RSS, entry `<id>` in Atom),
**not** by substring-matching the raw XML. Necessary because a post's full body can legitimately link to other posts
(old or draft) — a naive `feed.includes('/other-post/')` would false-positive on those in-body links. The suite also
asserts the built feeds contain no leaked `<pre class="mermaid">`, `<img>`, `<svg>`, `/src/posts/` paths, or
`.linked-post` markup.

## Adding content that renders differently on the site

Any new shortcode or transform that produces site-CSS-dependent markup, points at build-only asset paths, or relies on a
transform that runs post-render will look broken in the feed. When adding one, extend `feedContent` with a matching
fallback and add a case to `tests/feeds.test.js` (both a unit test for the filter and a "built feed contains no …"
assertion).
