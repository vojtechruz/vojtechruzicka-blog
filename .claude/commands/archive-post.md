Archive an existing blog post: copy the original content and all assets to `src/posts/archives/` and reset the original file for a rewrite — preserving git history on both files. Supports archiving the same post multiple times over its lifetime.

## Arguments: $ARGUMENTS

$ARGUMENTS should contain a post slug or URL path (e.g. `/java-records/` or `java-records`). If empty, ask the user which post to archive.

## Step 1 — Locate the post

Normalise the argument to a bare slug (strip leading/trailing slashes).

Search `src/posts/**/index.md` for a file whose `path` frontmatter matches `/<slug>/`. Read that file — note its full path (e.g. `src/posts/java/java-records/index.md`) and its directory (e.g. `src/posts/java/java-records/`). Parse its frontmatter.

If no match is found, tell the user and stop.

## Step 2 — Determine the archive slug

The archive slug always includes the current year and month (`YYYY-MM`) to make it unambiguous across multiple rewrites. Build it as follows:

1. Start with `<slug>-<year>-<month>` (e.g. `java-records-2026-05`).
2. Check whether `src/posts/archives/<slug>-<year>-<month>/index.md` already exists.
3. If it does, append a counter: `<slug>-<year>-<month>-2`, `<slug>-<year>-<month>-3`, etc., until a free slot is found.

The archive file path will be `src/posts/archives/<archive-slug>/index.md` and the URL will be `/archive/<archive-slug>/`.

## Step 3 — Confirm intent

Show the user:
- The post title and current path
- The archive destination: `src/posts/archives/<archive-slug>/index.md` → `/archive/<archive-slug>/`
- That all asset files (images, etc.) alongside the original will be copied into the archive directory
- That the original file will be reset for a rewrite at the same URL

Ask for confirmation before proceeding.

## Step 4 — Copy all assets

Use PowerShell to copy every file in the original post's directory **except** `index.md` and `review.md` into the new archive directory:

```powershell
New-Item -ItemType Directory -Force "src\posts\archives\<archive-slug>" | Out-Null
Copy-Item "src\posts\<topic>\<slug>\*" "src\posts\archives\<archive-slug>\" -Exclude "index.md","review.md"
```

This ensures images referenced in the post body (e.g. `./chrome-audit.png`) resolve correctly from the archive URL.

## Step 5 — Create the archive index.md

Create `src/posts/archives/<archive-slug>/index.md` by taking the **full original content** (frontmatter + body) and making these frontmatter changes:

- Set `path` to `/archive/<archive-slug>/`
- Add `featuredImage: './featured.jpg'` if not already present (ensures `og-image.jpg` is generated at the archive URL)
- Add `archivedStatus: 'archived'`
- Add `supersededBy: '/<slug>/'`
- Add `archivedDate: <today's date as YYYY-MM-DD>`
- Remove `draftStatus` if present (archives are always built regardless of draft status)
- Remove `needsReview` if present

Leave the body **unchanged** — the full original content must be preserved.

Use the **Write tool** (not git mv or cp) so git sees this as a new file. Git will detect content similarity to the original automatically.

## Step 6 — Reset the original file

Overwrite the original file **in place** (same path, same filename) using the **Write tool** — never delete and recreate it, as that breaks `git log --follow` on the file.

Reset it to a blank post ready for rewriting:

```
---
title: '<original title>'
date: '<today as YYYY-MM-DD>'
topics: [<original topics>]
path: '/<slug>/'
excerpt: '<original excerpt>'
featuredImage: './featured.jpg'
needsReview: true
draftStatus: 'draft'
---

```

Rules:
- Keep `title`, `topics`, `path`, `excerpt` from the original
- Set `date` to today (the rewrite date)
- Set `featuredImage` to `'./featured.jpg'` (reset; author will replace)
- Add `draftStatus: 'draft'` and `needsReview: true`
- Drop all other frontmatter fields (`dateModified`, `series`, `relatedPosts`, `archivedStatus`, etc.)
- Body is a single blank line — nothing else

## Step 7 — Report

Tell the user:
- Archive created at `src/posts/archives/<archive-slug>/index.md` → `/archive/<archive-slug>/`
- Original reset at `<original path>`
- The year-month in the archive slug (`<slug>-YYYY-MM`) keeps each archived version distinct; if the same post is archived again later the new archive will get its own date-based slug
- Links to all archived versions (with their `archivedDate`) will automatically appear at the bottom of the rewritten post (computed from `supersededBy` in each archive copy — no frontmatter needed on the live post)

⚠️ **Do not push these changes until the rewrite is ready to publish.** The original post is now a draft — pushing before the rewrite is done will remove the live page from production and leave the archive banner pointing to a broken URL. The correct flow: write the new content locally, remove `draftStatus` from the original, then commit and push both files together in one go.
