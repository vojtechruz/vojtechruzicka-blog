Recommend which blog post idea to work on next, using existing reviews from idea-reviews/, with multiple alternatives and explicit reasoning.

## Arguments: $ARGUMENTS

- **No args**: show top 5 recommendations across all topics and effort levels
- **`--top N`**: show N recommendations instead of the default 5
- **`--quick`**: only consider Low-effort ideas (quick wins)
- **`--topic <tag>`**: filter to a specific topic tag (e.g. `spring`, `java`, `ai`, `security`, `git`)
- **`--no-fetch`**: skip the Notion API call — use only local review files (faster, works offline)

## Steps

### 1. Check dependencies

- Verify `_tools/notion/.env` exists. If it doesn't, stop and tell the user to copy `_tools/notion/.env.example` and fill in the values.
- Verify the venv at `_tools/notion/.venv/Scripts/python` exists. If missing, create it: `python -m venv _tools/notion/.venv`, then install: `_tools/notion/.venv/Scripts/pip install -r _tools/notion/requirements.txt`
- If `--no-fetch` is NOT set, also verify `NOTION_IDEAS_DB_ID` is present in `.env`.

### 2. Summarize review files

Run:
```
_tools/notion/.venv/Scripts/python _tools/notion/summarize_reviews.py
```

Parse the JSON array. Each item has:
- `title`, `filename`, `filepath`, `priority`, `priority_folder`, `tag`
- `effort` (Low / Medium / High / N/A)
- `time_sensitivity` (Evergreen / Fades slowly / Time-sensitive / Expires soon)
- `series_fit` (text — starts with "none" if no fit; `has_series_fit` bool)
- `suggested_angle` (concrete working title)
- `learning_aligned` (bool), `learning_text` (raw text of the learning alignment section)
- `concerns` (list of strings), `has_concerns` (bool)
- `reviewed_at` (string `YYYY-MM-DD HH:MM UTC` or `null` if the file predates timestamps)

Apply filters from arguments:
- `--topic <tag>`: keep only items where `tag == <tag>` (case-insensitive)
- `--quick`: keep only items where `effort == "Low"`

Report: how many review files loaded, how many remain after filtering.

If zero remain after filtering, tell the user and stop.

**Freshness check** — compute the oldest `reviewed_at` across all loaded items (ignore nulls):
- If ALL items have a `reviewed_at` AND the oldest is ≤ 30 days ago: print
  `Reviews are fresh (oldest: YYYY-MM-DD) — skipping Notion fetch.`
  and set `auto_skip_fetch = true`.
- If some items lack `reviewed_at` OR the oldest is > 30 days ago: set `auto_skip_fetch = false`
  and print a one-line staleness warning with the oldest date (or "unknown" if no timestamps).

### 3. Fetch Notion data (skip if --no-fetch or auto_skip_fetch)

If `--no-fetch` is set or `auto_skip_fetch` is true, skip this step entirely.

Otherwise run:
```
_tools/notion/.venv/Scripts/python _tools/notion/fetch_ideas.py --posts-dir src/posts
```

Extract:
- `ideas` → build a lookup map `{title: {is_starred, priority}}` for each idea
- `learning_items` → list of `{title, tags, priority, status}` for cross-referencing
- `existing_posts` → list of existing posts (for series context)

Enrich each review item with `is_starred` from the map (default false if not found).

### 4. Check active drafts

List the contents of `src/posts/_drafts/`. For each review item, check if the idea title roughly corresponds to a draft folder name (fuzzy: lowercase, compare key words). If a match is found, set `has_draft = true` on that item and record the draft path.

The OWASP Top Ten 2025 draft at `src/posts/_drafts/owasp-top-ten-2025/` is a known active draft — mark it explicitly.

### 5. Score and rank all items

Apply this weighted scoring formula to every item (higher = more recommended):

| Factor | Points |
|---|---|
| Priority: Very High | 10 |
| Priority: High | 7 |
| Priority: Medium | 4 |
| Priority: Low | 2 |
| Priority: Very Low | 1 |
| Priority: On Ice | 0 |
| Effort: Low | +3 |
| Effort: Medium | +1 |
| Effort: High | 0 |
| Learning aligned | +3 |
| Time-sensitive | +2 |
| Expires soon | +4 |
| Fades slowly | +1 |
| Starred in Notion | +3 |
| Has active draft | +5 |

Exclude On Ice items from all recommendation categories unless their total score is ≥ 10 (which would only happen if they are starred and/or have an active draft — a deliberate override to surface nearly-done work). Always exclude Suggested Deletion items entirely regardless of score.

Sort descending by score.

### 6. Build recommendation lists

Prepare these categories (skip any category where no qualifying item exists):

**Top picks** — the N highest-scoring items (N = `--top` value, default 5), drawn from any priority level except On Ice (unless override threshold met). Avoid showing the same topic cluster more than twice.

**Quick win** — the single highest-scoring item with `effort == "Low"` that is NOT already in Top picks. Skip this section if `--quick` was set (they're already all Low effort).

**Series continuation** — the single highest-scoring item where `has_series_fit == true` that is NOT already in Top picks.

**Learning synergy** — the single highest-scoring item where `learning_aligned == true` that is NOT already in Top picks.

### 7. Present recommendations

Print each item in this format:

```
────────────────────────────────────────────────
## [Rank]. [Title]

Priority: [priority] | Effort: [effort] | Time: [time_sensitivity] | Score: [score]
Tag: [tag]
[If has_draft]: ✅ DRAFT EXISTS — src/posts/_drafts/[folder]/

Why now:
  [2–3 sentences reasoning — combine: time sensitivity, learning alignment details, series fit,
   starred status, active draft. Be specific: mention the learning items by name if aligned,
   name the series if there's a fit, note the draft status if applicable.]

Angle: [suggested_angle]

[If has_concerns]: ⚠  [first concern only]

→ Full review: [filepath]
```

After all sections, print a synthesis paragraph:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SYNTHESIS

[2–3 sentences on what themes emerge across the top picks — topic clusters, learning
 alignment patterns, effort distribution. Then a single direct sentence: "Start with
 [Title] because [one-liner reason]."]
```

### 8. Done

Print total review files considered and how many were excluded (On Ice not meeting threshold, filters applied). No files are modified; this command is read-only.
