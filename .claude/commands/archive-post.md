Archive an existing blog post: copy the original content to `src/posts/archives/` and reset the original file for a rewrite — preserving git history on both files. Supports archiving the same post multiple times over its lifetime.

## Arguments: $ARGUMENTS

$ARGUMENTS should contain a post slug or URL path (e.g. `/java-records/` or `java-records`). If empty, ask the user which post to archive.

## Step 1 — Locate the post

Normalise the argument to a bare slug (strip leading/trailing slashes).

Search `src/posts/**/index.md` for a file whose `path` frontmatter matches `/<slug>/`. Read that file — note its full path (e.g. `src/posts/java/java-records/index.md`) and parse its frontmatter.

If no match is found, tell the user and stop.

## Step 2 — Determine the archive slug

Today's year is the disambiguation key. Build the archive slug as follows:

1. Check whether `src/posts/archives/<slug>/index.md` already exists.
2. If it does **not** exist → archive slug is `<slug>` (e.g. `java-records`)
3. If it **does** exist → archive slug is `<slug>-<year>` (e.g. `java-records-2026`). Check whether that path exists too; if so, keep appending a counter: `<slug>-<year>-2`, `<slug>-<year>-3`, etc., until a free slot is found.

The archive file path will be `src/posts/archives/<archive-slug>/index.md` and the URL will be `/archive/<archive-slug>/`.

## Step 3 — Confirm intent

Show the user:
- The post title and current path
- The archive destination: `src/posts/archives/<archive-slug>/index.md` → `/archive/<archive-slug>/`
- That the original file will be reset for a rewrite at the same URL

Ask for confirmation before proceeding.

## Step 4 — Create the archive copy

Create `src/posts/archives/<archive-slug>/index.md` by taking the **full original content** (frontmatter + body) and making these frontmatter changes:

- Set `path` to `/archive/<archive-slug>/`
- Add `archivedStatus: 'archived'`
- Add `supersededBy: '/<slug>/'`
- Add `archivedDate: <today's date as YYYY-MM-DD>`
- Remove `draftStatus` if present (archives are always built regardless of draft status)
- Remove `needsReview` if present

Leave the body **unchanged** — the full original content must be preserved.

Use the **Write tool** (not git mv or cp) so git sees this as a new file. Git will detect content similarity to the original automatically.

## Step 5 — Reset the original file

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

## Step 6 — Report

Tell the user:
- Archive created at `src/posts/archives/<archive-slug>/index.md` → `/archive/<archive-slug>/`
- Original reset at `<original path>`
- Links to all archived versions will automatically appear at the bottom of the rewritten post (computed from `supersededBy` in each archive copy — no frontmatter needed on the live post)

⚠️ **Do not push these changes until the rewrite is ready to publish.** The original post is now a draft — pushing before the rewrite is done will remove the live page from production and leave the archive banner pointing to a broken URL. The correct flow: write the new content locally, remove `draftStatus` from the original, then commit and push both files together in one go.
