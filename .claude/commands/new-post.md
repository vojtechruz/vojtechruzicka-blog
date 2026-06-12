Scaffold a new blog post with the correct directory structure and frontmatter.

## Arguments: $ARGUMENTS

$ARGUMENTS may contain a post title (e.g. `/new-post Spring Boot Testing Best Practices`) or be empty.

## Step 1 — Collect required information

Gather the following. Derive what you can from $ARGUMENTS; ask the user for anything missing:

- **Title** — the post title (e.g. `Spring Boot Testing Best Practices`)
- **Topics** — one or more from this list (pick the best match for the post subject):
  `Java`, `Spring`, `JavaFX`, `Hibernate`, `PostgreSQL`, `Maven`,
  `Javascript`, `JAMStack`, `Angular`, `CSS`, `Chrome`,
  `Security`, `HTTP`, `REST`,
  `OOP`, `Design-Patterns`, `Testing`,
  `IntelliJ IDEA`, `Git`,
  `Career`, `Books`, `Blogging`
- **URL slug** — hyphen-separated, lowercase (e.g. `spring-boot-testing`). Derive from title if not given.
- **Excerpt** — one or two sentences describing the post. Ask the user if not provided.
- **Draft?** — default yes (safer). Ask only if unclear.

## Step 2 — Determine directory

Map the primary topic to the correct parent directory under `src/posts/`:

| Topic | Directory |
|---|---|
| Java, JavaFX, Hibernate, PostgreSQL, Maven | `java/` |
| Spring | `spring/` |
| Javascript | `javascript/` |
| Angular | `angular/` |
| JAMStack, Chrome | `jamstack/` |
| CSS | `css/` |
| Security, HTTP, REST | `security/` |
| IntelliJ IDEA | `idea/` |
| Git, Maven (tools focus) | `tools/` |
| Career, Books, Blogging | `career/` |
| OOP, Design-Patterns, Testing | `java/` (if Java-focused) or `tools/` |

If the post is a draft, use `src/posts/_drafts/` instead.

Full post directory: `src/posts/<topic-dir>/<slug>/`

## Step 3 — Create files

Create `src/posts/<topic-dir>/<slug>/index.md` with this frontmatter, using today's date (2026-05-12):

```
---
title: '<title>'
date: '<YYYY-MM-DD>'
topics: [<topic1>, <topic2>]
path: '/<slug>/'
excerpt: '<excerpt>'
featuredImage: './featured.png'
needsReview: true
draftStatus: 'draft'
---
```

Omit `draftStatus` if the post is not a draft.

Leave the body empty — just a blank line after the frontmatter closing `---`.

## Step 4 — Confirm

Tell the user:
- The full path of the created file
- A reminder to add a `featured.png` image to the same directory
- That they can run `/review-posts <path>` once the post has content worth reviewing
