Review blog post ideas from Notion, score and prioritize them in context of existing posts, then write AI feedback back to each Notion page.

## Arguments: $ARGUMENTS

- **No args**: dry-run the push step, show feedback in terminal, ask before writing to Notion
- **`--dry-run`**: fetch and review ideas, show feedback, but do NOT write to Notion
- **`--force`**: skip confirmation and write feedback to Notion immediately

## Steps

### 1. Check dependencies

- Verify `_tools/notion/.env` exists. If it doesn't, stop and tell the user to copy `_tools/notion/.env.example` and fill in the values.
- Verify `NOTION_IDEAS_DB_ID` is set in the `.env` file (open and check). If missing, stop and tell the user to add it.
- The script uses a local venv at `_tools/notion/.venv`. On Windows use `_tools/notion/.venv/Scripts/python`. Check with PowerShell `Test-Path`.
- If the venv is missing, create it: `python -m venv _tools/notion/.venv`, then install: `_tools/notion/.venv/Scripts/pip install -r _tools/notion/requirements.txt`

### 2. Fetch ideas and existing posts

Run:
```
_tools/notion/.venv/Scripts/python _tools/notion/fetch_ideas.py --posts-dir src/posts
```

Parse the JSON output. It contains:
- `ideas`: list of `{id, title, tags, priority, is_starred, body_text}`
- `existing_posts`: list of `{title, topics, date, series, excerpt, draft}`
- `learning_items`: list of `{title, tags, priority, status}` — Development-category items not yet Done from the learning list

Show the user a brief summary: how many ideas fetched, how many existing posts loaded.

### 3. Review each idea

Analyse all ideas together, using the existing posts as context. For each idea produce a structured review. Focus on:

**Overlap check** — does the idea duplicate or closely overlap an existing post? Name the existing post if so.

**Gap value** — does the idea fill a genuine gap in the blog's topic coverage? Is the topic underrepresented?

**Series fit** — does the idea naturally extend an existing series? Call it out if so.

**Angle / title suggestion** — suggest a sharper or more specific angle if the idea title is vague. Suggest a concrete working title. Use `body_text` (the author's source links and notes) as a signal for the intended angle.

**Learning alignment** — does this idea overlap with anything on the learning list? Writing a post is the author's primary way of learning, so alignment here is a strong signal. Name the matching learning item(s), their priority and status. If there is no match, say so explicitly.

**Blog fit** — 2–4 sentences on how this idea sits within the existing post history. Does it synergise with existing articles (e.g. a reader of post X would naturally want this next)? Does it open up new territory for the blog? Does it complement a cluster of related posts or stand alone? Reference specific existing posts by title where relevant.

**Audience impact** — 2–4 sentences assessing likely reach and usefulness. Is the topic evergreen (useful for years), trendy (high short-term interest), or time-sensitive? Is it broadly useful to many developers or niche to a specific subset? Would it likely rank well in search or spread via sharing? Any signals from the tags or body_text about the intended audience?

**Time sensitivity** — classify as one of: `Evergreen` / `Fades slowly` / `Time-sensitive` / `Expires soon`. Evergreen = fundamental concepts that are just as valuable in 5 years (e.g. Java basics, design patterns). Fades slowly = new language/framework features that are most valuable when fresh but remain useful for years. Time-sensitive = tied to a recent release or trend — clear value window of months. Expires soon = conference writeups, news reactions, version-specific reviews — loses most value within weeks.

For each idea, run a web search to verify current relevance — do not rely solely on training data. Search for the idea title or core topic to check: when the feature/version was released, whether it is still considered new, whether there is recent community discussion, and whether the window has already passed. Write one sentence explaining the classification and, for anything other than Evergreen, note roughly how long the window is and whether the window is still open.

**AI Suggested Priority** — one of: `Very High` / `High` / `Medium` / `Low` / `Very Low` / `On Ice`. Use `On Ice` for ideas that are interesting but clearly not ready or relevant yet. Write 2–4 sentences of explicit reasoning that call out the specific factors: is it starred, what is the current priority, is there a gap, is there overlap with existing posts, does it align with the learning list (and at what priority), what do the body_text notes signal about intent, and how does time sensitivity affect urgency (Time-sensitive or Expires soon ideas should be bumped up)?

**AI Expected Effort** — one of: `Low` / `Medium` / `High`. Write 2–4 sentences of explicit reasoning: how broad is the topic, are code examples or demos likely needed, does it extend an existing series (lower effort), how many sources are in body_text and how deep do they go?

**Concerns** — any red flags: too broad, too niche, already covered, outdated topic, etc.

Format each review as markdown that will be rendered in Notion:

```
### [idea title]

**Reviewed:** YYYY-MM-DD HH:MM UTC

**Overlap:** [none / partial — existing post: "Title"]
**Gap value:** [High / Medium / Low] — [one sentence why]
**Series fit:** [none / fits "Series Name"]
**Suggested angle:** [working title or "keep as-is"]

**Learning alignment**
[matching learning item(s) with priority + status, or "none"]

**Blog fit**
[2–4 sentences]

**Audience impact**
[2–4 sentences]

**Time sensitivity:** [Evergreen / Fades slowly / Time-sensitive / Expires soon]
[one sentence — classification reason + value window if not Evergreen]

**AI Suggested Priority:** [Very High / High / Medium / Low / Very Low / On Ice]
[2–4 sentences of reasoning]

**AI Expected Effort:** [Low / Medium / High]
[2–4 sentences of reasoning]

**Concerns:** [bullet list or "none"]
```

### 4. Write per-idea markdown files

For each idea write a file to `_tools/notion/idea-reviews/{priority-folder}/{tag-prefix}-{title-slug}.md`.

**Priority folder** — use a numbered prefix so folders sort by priority in file explorers:
- `Very High` → `1-very-high`
- `High` → `2-high`
- `Medium` → `3-medium`
- `Low` → `4-low`
- `Very Low` → `5-very-low`
- `On Ice` → `6-on-ice`

**Filename** — `{first-tag-slug}-{title-slug}.md`. Slugify by lowercasing and replacing spaces/special chars with hyphens. If the idea has no tags use `untagged` as prefix. Example: `java-virtual-threads-deep-dive.md`.

File content is the full per-idea review markdown (everything from the review format template above, without the `### [title]` heading — that becomes the `# Title` H1 of the file). The `**Reviewed:** YYYY-MM-DD HH:MM UTC` line must be the first content line in every file (right after the H1), using the actual current UTC date and time at the moment of writing.

Overwrite files from previous runs. Create directories as needed.

### 5. Show terminal summary

After writing all files, print a compact summary table in the terminal — one line per idea:

```
[AI Priority] [AI Effort] — Title (file: path/to/file.md)
```

Then print the **Prioritized shortlist**: top 5 ideas worth writing next, with a one-line reason each.

### 6. Save JSON for Notion push

Write `idea_reviews.json` to the scratchpad:
```json
[
  {
    "page_id": "...",
    "title": "...",
    "feedback": "markdown text of the review for this idea",
    "ai_suggested_priority": "High",
    "ai_expected_effort": "Low"
  }
]
```

`ai_suggested_priority` must be exactly one of: `Very High`, `High`, `Medium`, `Low`, `Very Low`, `On Ice`. `ai_expected_effort` must be exactly `Low`, `Medium`, or `High`.

### 7. Push to Notion (unless --dry-run)

If `--dry-run`: stop here and tell the user files were written but Notion was NOT updated.

Otherwise (no args or --force):
- If no args: ask for confirmation before writing to Notion.
- Run: `_tools/notion/.venv/Scripts/python _tools/notion/push_idea_reviews.py <path-to-idea_reviews.json>`
- Show the output summary.

### 8. Report

Confirm how many pages were updated in Notion, or surface any errors.
