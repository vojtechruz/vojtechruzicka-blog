# Post Card Shortcodes

Three shortcodes render a card that links to other content. All live in `config/shortcodes/` and are registered in
`config/shortcodes.js`.

| Shortcode                          | Renders                                        | Used in                                             |
| ---------------------------------- | ---------------------------------------------- | --------------------------------------------------- |
| `{% linkedPost "/url/" %}`         | full card: title, date, topics, image, excerpt | listings (home, topics, series, archive), post body |
| `{% linkedPostCompact "/url/" %}`  | small card: thumbnail, title, excerpt          | the Related posts list under a post                 |
| `{% linkedSeries "series-slug" %}` | series card: name, article count, topics       | the `/series/` listing                              |

## Looking up the target

`linkedPost` and `linkedPostCompact` find the post by URL with `findPostByUrl` (`config/utils/find-post.js`): published
posts first, then archived copies (`collections.archivedPosts`, not part of `collections.posts`), then
`collections.all`. `linkedSeries` looks the slug up in `seriesMetadata`.

**A missing target fails the build** (the shortcode throws). Keep in mind that drafts exist only in local and preview
builds: a published post that links to a draft passes the preview deploy but breaks the production build.

## Inside a post body vs. in a listing

The shortcode knows it is inside a post when the Eleventy context has `postDir`. A card in a post body differs from the
same card in a listing:

- **Title is a `<p>`, not an `<h2>`**, so the card does not add a section to the article's heading outline.
- **Eyebrow label** `<span class="linked-post-eyebrow">Related article</span>` signals the card's purpose. The feed
  fallback in `feedContent` (`config/filters/urls.js`) reuses its text for the plain link it puts in place of the card.
- **`data-pagefind-ignore`** keeps the linked post's excerpt out of the host post's search index entry.
- **Card styling** (border, accent stripe, background) comes from the `article .linked-post` selector in
  `src/styles/components/_linked-post.scss`; listings stay plain.

The markup must not contain blank lines: in a markdown post a blank line ends the HTML block and markdown-it emits stray
`<p></p>`s. `linkedPost` therefore strips whitespace-only lines left by its optional parts (series badge, archive link,
image). Guarded by built-output tests in `tests/shortcodes.test.js`.

## Archived and draft targets

- **Archived post:** the date reads `Archived June 21, 2018` (from `archivedDate`) and, with `supersededBy`, the card
  links to the current version ("Read the current version").
- **Draft:** the card gets a `badge` with the draft status (`draft` / `review` / `ready`, labels from
  `config/shortcodes/badge.js`) and `linked-post-draft linked-post-<status>` classes. Only visible in builds that
  include drafts.

## Print and feeds

- **Print** (`_print.scss`): thumbnails are hidden, the title link prints its URL, listing cards get compact spacing.
  See [PRINT.md](PRINT.md).
- **Feeds:** cards are reduced to `<p><em>Related article: </em><a href="…">Title</a></p>`. See [FEEDS.md](FEEDS.md).
