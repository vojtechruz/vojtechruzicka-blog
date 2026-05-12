Review blog posts and write a `review.md` file in each post's directory for Notion sync.

## Arguments: $ARGUMENTS

Parse `$ARGUMENTS` to determine mode:
- **No args** (default): find all `index.md` files in `src/posts/` that have no sibling `review.md` — the standard weekly workflow for newly added posts
- **`--all`**: process every post, overwriting existing `review.md` files
- **`--drafts`**: like default but also include posts under `src/posts/_drafts/`
- **A path** (e.g. `src/posts/java/java-records`): review just that one post directory

## Step 1 — Collect posts to review

Use PowerShell or glob to find `index.md` files matching the selected mode. Exclude `src/posts/_drafts/` unless `--drafts` is passed. Collect the full list of post directories to process.

## Step 2 — Spawn parallel subagents

Divide the post list into batches of **8 posts**. Spawn one subagent per batch in parallel using the Agent tool. Each subagent receives an explicit list of post directory paths and must handle each one independently.

## Step 3 — Per-post review (what each subagent does)

For each post directory:

1. Read `index.md` — extract frontmatter (`title`, `date`, `dateModified`, `topics`, `excerpt`) and the full body content
2. If running with `--all` and a `review.md` already exists, read it too — treat its findings as prior context so the new review builds on them rather than repeating the same points. Note which findings are still valid, which are now resolved, and what is newly discovered
3. Note the publication date and current date (2026-05-12) to gauge how much time has passed
4. Evaluate the post on these criteria and write findings to `review.md`

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

Write `review.md` in the same directory as `index.md`. Use exactly this markdown structure — it is parsed by the Notion sync script:

```
#### 1. Factual & Obsolete Information

- **Term or Topic:** Finding, using **bold** for key terms and `code` for API/type names.
  - Sub-detail if needed (2-space indent)

#### 2. Missing Modern Context

- **Topic:** Finding.

#### Conclusion

One paragraph: overall verdict and the single most important update needed.
```

**Format rules (strictly followed by the Notion parser):**
- Section headings use exactly `#### ` (4 hashes + space)
- Omit any section that has no findings — do not include empty headings
- `**bold**` for technical terms, key concepts, product names
- `` `backtick` `` for method names, API names, type names, CLI flags
- Sub-bullets: `  - ` (2 spaces before dash)
- No HTML, no frontmatter, no trailing blank lines beyond one

## Step 4 — Report

After all batches complete, print a summary: how many `review.md` files were written, and list any posts that were skipped or failed.
