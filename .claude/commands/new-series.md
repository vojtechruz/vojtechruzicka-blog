Scaffold a new blog series: add it to seriesMetadata.js and create the first post.

## Arguments: $ARGUMENTS

$ARGUMENTS may contain a series name (e.g. `/new-series Spring Boot Tutorial`) or be empty.

## Step 1 — Collect required information

Gather the following. Derive what you can from $ARGUMENTS; ask the user for anything missing in a single question:

- **Series name** — human-readable title (e.g. `Spring Boot Tutorial`)
- **Series slug** — hyphen-separated, lowercase (e.g. `spring-boot-tutorial`). Derive from name if not given.
- **Series description** — one or two sentences describing the series as a whole.
- **Topics** — one or more from this list (pick the best match):
  `Java`, `Spring`, `JavaFX`, `Hibernate`, `PostgreSQL`, `Maven`,
  `Javascript`, `JAMStack`, `Angular`, `CSS`, `Chrome`,
  `Security`, `HTTP`, `REST`,
  `OOP`, `Design-Patterns`, `Testing`,
  `IntelliJ IDEA`, `Git`,
  `Career`, `Books`, `Blogging`
- **First post title** — title of the first article (default: `<Series Name>: Getting Started`)
- **First post slug** — hyphen-separated, lowercase (e.g. `getting-started`). Derive from first post title if not given.
- **First post excerpt** — one or two sentences. Ask if not provided.
- **Draft?** — default yes.

## Step 2 — Determine paths

- **Series directory:** `src/posts/<series-slug>-series/`
- **First post directory:** `src/posts/<series-slug>-series/01-<first-post-slug>/`
- **First post URL path:** `/<series-slug>/01-<first-post-slug>/`

## Step 3 — Update seriesMetadata.js

Read `src/_data/seriesMetadata.js`. Append a new entry to the exported array before the closing `];`:

```js
  {
    slug: '<series-slug>',
    name: '<Series Name>',
    description:
      '<series description>',
    topics: [<topics>],
    posts: [
      '/<series-slug>/01-<first-post-slug>/',
    ],
  },
```

## Step 4 — Create the first post

Create `src/posts/<series-slug>-series/01-<first-post-slug>/index.md` with this frontmatter (use today's date 2026-06-14):

```
---
title: '<First Post Title>'
date: '<YYYY-MM-DD>'
topics: [<topics>]
path: '/<series-slug>/01-<first-post-slug>/'
excerpt: '<first post excerpt>'
featuredImage: './featured.png'
series: '<series-slug>'
needsReview: true
draftStatus: 'draft'
---
```

Omit `draftStatus` if the post is not a draft.

Leave the body empty — just a blank line after the frontmatter closing `---`.

## Step 5 — Confirm

Tell the user:
- The series slug and the line added to `seriesMetadata.js`
- The full path of the first post file
- A reminder to add a `featured.png` image to the first post directory
- That subsequent posts go in `src/posts/<series-slug>-series/02-<slug>/` with the same `series:` frontmatter field and URL paths like `/<series-slug>/02-<slug>/`, and each new post URL must be appended to the `posts` array in `seriesMetadata.js`
