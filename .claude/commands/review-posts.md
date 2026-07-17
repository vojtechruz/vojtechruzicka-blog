Review blog posts and write an `# AI Review` callout into each post's Obsidian "Blog Articles" note.

## Arguments: $ARGUMENTS

Parse `$ARGUMENTS` to determine mode:
- **No args** (default): review every post whose article note has no `# AI Review` callout yet — the
  standard workflow for newly added posts
- **`--all`**: re-review every post, overwriting existing `# AI Review` callouts
- **`--drafts`**: like default but also include posts under `src/posts/_drafts/`
- **A path** (e.g. `src/posts/java/java-records`): review just that one post directory

## Step 0 — Check dependencies

- The scripts operate on local vault files — no tokens or `.env` are required.
- Ensure the venv at `_tools/obsidian/.venv/Scripts/python` exists (check with `Test-Path`). If missing,
  create it: `python -m venv _tools/obsidian/.venv`, then
  `_tools/obsidian/.venv/Scripts/pip install -r _tools/obsidian/requirements.txt`.
- Subagents only *produce* review text; the notes are written at the end by a Python script, so no vault
  write permissions are needed.

## Step 1 — Collect posts to review

Run:
```
_tools/obsidian/.venv/Scripts/python _tools/obsidian/posts_status.py src/posts
```

This returns JSON, one entry per post: `{path, slug, title, has_article_note, has_review}`. Filter by mode:
- **default**: keep posts where `has_review` is `false`
- **`--all`**: keep every post
- **path**: keep only the post whose `path` is under the given directory
- **`--drafts`**: also include posts under `src/posts/_drafts/` (by default `posts_status.py` covers the
  whole `src/posts` tree; if drafts are excluded elsewhere, run it against `src/posts/_drafts` too and
  merge)

For any selected post where `has_article_note` is `false`, **do not review it** — warn the user that its
article note is missing and tell them to run `/sync-obsidian` first, then skip it.

## Step 2 — Spawn parallel subagents

Divide the remaining posts into batches of **8**. Spawn one subagent per batch in parallel using the
Agent tool. Each subagent receives an explicit list of `{path, slug, title}` for its posts and must
handle each one independently, returning its results as structured text (see Output).

## Step 3 — Per-post review (what each subagent does)

For each post directory:

1. Read `index.md` — extract frontmatter (`title`, `date`, `dateModified`, `topics`, `excerpt`) and the full body content
2. If running with `--all`, the note may already have a review; treat the current review as prior context if provided — note which findings are still valid, which are now resolved, and what is newly discovered
3. Note the publication date and the current date to gauge how much time has passed
4. Evaluate the post on these criteria and produce the review markdown

### Review criteria

**Factual & Obsolete Information** (always check)
- Are API names, method signatures, or syntax still valid?
- Has a preview/experimental feature become standard? Or been removed?
- Do version numbers mentioned still represent current/recommended versions?
- Have significant new language features, framework releases, or spec updates changed the picture?

**Missing Modern Context** (include only when relevant)
- Are there important new patterns, tools, or best practices not covered?
- Have better alternatives emerged for libraries/tools mentioned?
- Are there ecosystem shifts (e.g. deprecations, security advisories) that affect the advice given?

**Formatting & Typos** (include only when notable — don't nitpick)
- Obvious factual typos, broken phrasing, or misleading wording

**SEO / Metadata** (include only when clearly weak)
- Missing or very thin `excerpt` in frontmatter
- Title that is too vague for the topic

## Output format

Each subagent returns, for every post it handled, the post `slug` followed by the review markdown. Use
exactly this markdown structure for the review body:

```
#### 1. Factual & Obsolete Information

- **Term or Topic:** Finding, using **bold** for key terms and `code` for API/type names.
  - Sub-detail if needed (2-space indent)

#### 2. Missing Modern Context

- **Topic:** Finding.

#### Conclusion

One paragraph: overall verdict and the single most important update needed.
```

**Format rules:**
- Section headings use exactly `#### ` (4 hashes + space)
- Omit any section that has no findings — do not include empty headings
- `**bold**` for technical terms, key concepts, product names
- `` `backtick` `` for method names, API names, type names, CLI flags
- Sub-bullets: `  - ` (2 spaces before dash)
- No frontmatter; the review text becomes the body of the note's `# AI Review` callout

## Step 4 — Write reviews into the notes

Collect every subagent's results into `post_reviews.json` in the scratchpad:
```json
[
  { "slug": "java-records", "title": "Java Records", "feedback": "#### 1. Factual …" }
]
```

Then run:
```
_tools/obsidian/.venv/Scripts/python _tools/obsidian/write_post_reviews.py <path-to-post_reviews.json>
```

This finds each article note by `slug` and replaces (or appends) its `# AI Review` callout. (Preview
first with `--dry-run` if you like.)

## Step 5 — Report

Print a summary: how many article notes were written, how many posts were skipped for a missing article
note (needing `/sync-obsidian`), and any failures.
