# Redirects

Legacy-URL redirects live in `src/static/_redirects` (Cloudflare Pages format), copied verbatim into `_site/` by the
static passthrough. They preserve inbound links from the Gatsby-era site, which used different URLs for tags, listing
pages, feeds and post assets. Validated by `tests/redirects.test.js`.

## Cloudflare Pages matching rules (the important gotchas)

- **Matching is exact.** No trailing-slash normalization and no case folding is applied to redirect sources:
  - `/tags/spring` does **not** match a `/tags/spring/` rule — every page rule needs both slash variants. (Cloudflare
    only auto-redirects `/foo` → `/foo/` when `/foo/index.html` actually exists as a built file, which is never the case
    for legacy URLs.)
  - `/tags/Java/` does **not** match `/tags/java/`, and static serving is case-sensitive too (`/topics/Java/` is a 404).
    A `:placeholder` copies the matched segment as-is and cannot lowercase it, so every capitalized Gatsby tag needs its
    own explicit rule mapping it to the lowercase topic.
- **First matching rule wins.** Specific rules (`/tags/idea/`, `/tags/Java/`) must stay above the generic
  `/tags/:topic/` rules.
- A `:placeholder` requires a non-empty segment, so the generic `/tags/:topic` rules do not swallow the bare `/tags`
  listing-page rule further down.

## What is in the file

| Group                                                     | Why                                                                                                                                                     |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Legacy pages (`/author/...`)                              | Gatsby-era pages with no equivalent                                                                                                                     |
| `idea` → `intellij-idea`                                  | Topic was renamed                                                                                                                                       |
| Capitalized Gatsby tags (`/tags/Java/` → `/topics/java/`) | Gatsby tags were capitalized; case-sensitive matching (see above). Also renamed slugs `jam-stack`/`JAMStack` → `jamstack`, `postgre-sql` → `postgresql` |
| Generic `/tags/:topic` → `/topics/:topic/`                | Tag pages moved under `/topics/`                                                                                                                        |
| Typo and truncated slugs                                  | Misspelled or cut-off inbound links seen in Search Console (e.g. `/javafx-fxml-`)                                                                       |
| Gatsby hashed asset paths (`/<md5>/file.pdf`)             | Gatsby served post attachments from hashed directories; they now live next to their post (`/<post-slug>/file.pdf`)                                      |
| Legacy listing pages (`/tags`, `/archives`)               | Replaced by `/topics/`                                                                                                                                  |
| Feeds and sitemap                                         | Gatsby used `/rss.xml`, `/feed/`, `/sitemap-index.xml`; Eleventy serves `/feed.xml`, `/atom.xml`, `/sitemap.xml`                                        |

The Gatsby-era 404s were identified from Google Search Console coverage exports (last reviewed 2026-08-30). URLs that
intentionally stay 404: bot/scraper probe patterns (`/player?id=...`, `*.mp4?t={seek_to_start_number}`,
`/search/?q={query}`), relative paths from code samples crawled as links (`/angular/03-components/*.component.html`,
`/my-servlet`), and `/cdn-cgi/l/email-protection` (a Cloudflare email-obfuscation artifact).

## Adding a rule

1. Add both slash variants for page URLs; file targets (`.xml`, `.pdf`) need only the exact path.
2. Place it above the generic `/tags/:topic` rules if it is more specific than them.
3. Target must be the final canonical URL (lowercase, trailing slash for pages) — avoid redirect chains.
4. Run `npx vitest run tests/redirects.test.js` after `npm run build` — it checks that every non-wildcard target
   resolves to a built page, that no source shadows a real page, and that there are no duplicate sources.
