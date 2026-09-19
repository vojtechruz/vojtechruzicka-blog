# Sitemap

`src/sitemap.xml.njk` renders `/sitemap.xml` from `collections.all`. `robots.txt` advertises it by absolute production
URL and the Gatsby-era `/sitemap-index.xml` is 301-redirected to it (`src/static/_redirects`). It is cached for one hour
(`src/static/_headers`, see CACHING.md).

## What gets listed

A page is listed **if and only if** it is built as HTML and its computed `isIndexable` flag
(`src/_data/eleventyComputed.js`) is true. The same flag drives the robots meta in
`src/_includes/components/robots-meta.njk`, so a page can never be `noindex` yet appear in the sitemap. Today that
excludes:

| Excluded                        | Why                                                                                |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| Archived posts and `/archive/`  | `noindex, follow`; their canonical points at the superseding article               |
| Drafts                          | `config/drafts.js` drops them before they reach any collection (production builds) |
| `/404.html`, feeds, the sitemap | `eleventyExcludeFromCollections: true` in their frontmatter                        |

Everything else is in: posts, the home page **and its pagination** (`/pages/N/`, enabled by `addAllPagesToCollections`
in `src/pages/index.njk`), topic pages, series pages, `/topics/`, `/series/`, `/about/` and `/search/`.

The preview-deploy `noindex, nofollow` is an environment override applied in the robots component only. A preview build
therefore still emits a full sitemap with production URLs; that is harmless because preview `robots.txt` also points at
the production sitemap and every preview page is `noindex`.

## `lastmod`

Eleventy's fallback `date` for a template without a frontmatter date is the file's creation time. Cloudflare Pages
clones the repository fresh for every deploy, so a naive `page.date` would stamp every listing page with the deploy time
— and Google stops trusting `lastmod` once it sees it move without the page changing. The `sitemapLastmod` filter
(`config/filters/sitemap.js` → `config/utils/sitemap.js`) derives it from content instead, keyed on the computed
`pageKind`:

| Page kind                                 | `lastmod`                                                  |
| ----------------------------------------- | ---------------------------------------------------------- |
| post                                      | `dateModified` from frontmatter, falling back to `date`    |
| home, `/pages/N/`, `/topics/`, `/series/` | newest post `lastmod` site-wide                            |
| topic page                                | newest `lastmod` among the posts carrying that topic       |
| series page                               | newest `lastmod` among the posts in `seriesMetadata.posts` |
| anything else (`/about/`, `/search/`)     | omitted — the element is optional and nothing tracks them  |

`changefreq` and `priority` are deliberately absent; Google ignores both.

The filter lives in the sitemap template rather than in `eleventyComputed` on purpose: computed data that touches
`collections` makes every page collection-dependent and forces full rebuilds in `--serve` mode (see
`src/_data/historicalVersionsMap.js`), whereas the sitemap already depends on `collections.all`.

## Whitespace

Nunjucks runs with `trimBlocks` and `lstripBlocks` (`config/basic-config.js`), so block tags on their own lines leave
nothing behind and the template needs no `{%-` trimming. Keep the `<?xml …?>` declaration as the first line after the
frontmatter: a Nunjucks comment above it would emit a blank line and make the document malformed.

## Tests

`tests/sitemap.test.js` parses the built file as XML and checks, among other things, that the set of listed URLs equals
the set of built `index.html` pages without a `noindex` robots meta, that every `lastmod` follows the table above, and
that `/about/` and `/search/` carry none. `getSitemapLastmod` has unit tests in the same file.
`tests/preview-noindex.test.js` covers `isIndexable` and the robots component; `tests/robots.test.js`,
`tests/redirects.test.js` and `tests/caching-headers.test.js` cover the surrounding wiring.

The assertions target a production-shaped build (`npm run build`). `npm run dev` output includes drafts, so the
draft-exclusion test fails against it by design.
