Recommend which blog post idea to work on next, using the AI reviews stored in the Obsidian idea notes, with multiple alternatives and explicit reasoning.

## Arguments: $ARGUMENTS

- **No args**: show top 5 recommendations across all topics and effort levels
- **`--top N`**: show N recommendations instead of the default 5
- **`--quick`**: only consider Low-effort ideas (quick wins)
- **`--topic <tag>`**: filter to a specific topic tag (e.g. `spring`, `java`, `ai`, `security`, `git`)

## Steps

### 1. Check dependencies

- The scripts operate on local vault files — no tokens or `.env` are required.
- Verify the venv at `_tools/obsidian/.venv/Scripts/python` exists. If missing, create it:
  `python -m venv _tools/obsidian/.venv`, then
  `_tools/obsidian/.venv/Scripts/pip install -r _tools/obsidian/requirements.txt`.

### 2. Summarize the idea reviews

Run:
```
_tools/obsidian/.venv/Scripts/python _tools/obsidian/summarize_reviews.py
```

Parse the JSON array. Each item (one per *reviewed* idea note) has:
- `title`, `filename`, `filepath`, `priority`, `tag`, `is_starred`
- `effort` (Low / Medium / High)
- `time_sensitivity` (Evergreen / Fades slowly / Time-sensitive / Expires soon)
- `series_fit` (text — starts with "none" if no fit; `has_series_fit` bool)
- `suggested_angle` (concrete working title)
- `learning_aligned` (bool), `learning_text` (raw text of the learning alignment section)
- `concerns` (list of strings), `has_concerns` (bool)
- `reviewed_at` (string `YYYY-MM-DD HH:MM UTC` or `null`)

Apply filters from arguments:
- `--topic <tag>`: keep only items where `tag == <tag>` (case-insensitive)
- `--quick`: keep only items where `effort == "Low"`

Report: how many reviewed ideas loaded, how many remain after filtering. If zero remain, tell the user and stop.

**Freshness note** — compute the oldest `reviewed_at` across all loaded items (ignore nulls). If the
oldest is > 30 days ago (or some items lack a timestamp), print a one-line staleness warning suggesting a
fresh `/review-ideas` run. (`priority`, `is_starred`, effort and all other signals already come straight
from the notes — there is no separate fetch step.)

### 3. Check active drafts

List the contents of `src/posts/_drafts/`. For each review item, check if the idea title roughly corresponds to a draft folder name (fuzzy: lowercase, compare key words). If a match is found, set `has_draft = true` on that item and record the draft path.

### 4. Score and rank all items

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
| Starred | +3 |
| Has active draft | +5 |

Exclude On Ice items from all recommendation categories unless their total score is ≥ 10 (which would only happen if they are starred and/or have an active draft — a deliberate override to surface nearly-done work). Always exclude any item whose `priority` is `Suggested Deletion` entirely regardless of score.

Sort descending by score.

### 5. Build recommendation lists

Prepare these categories (skip any category where no qualifying item exists):

**Top picks** — the N highest-scoring items (N = `--top` value, default 5), drawn from any priority level except On Ice (unless override threshold met). Avoid showing the same topic cluster more than twice.

**Quick win** — the single highest-scoring item with `effort == "Low"` that is NOT already in Top picks. Skip this section if `--quick` was set (they're already all Low effort).

**Series continuation** — the single highest-scoring item where `has_series_fit == true` that is NOT already in Top picks.

**Learning synergy** — the single highest-scoring item where `learning_aligned == true` that is NOT already in Top picks.

### 6. Present recommendations

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

### 7. Done

Print total reviewed ideas considered and how many were excluded (On Ice not meeting threshold, filters applied). No files are modified; this command is read-only.
