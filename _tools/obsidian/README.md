# Obsidian blog toolchain

Local scripts that keep the blog's **Obsidian** vault in sync with the repo and
run the AI idea/post review workflow. Everything operates on plain markdown
files in the vault — there is **no API and no auth token**.

These scripts back the `/sync-obsidian`, `/review-ideas`, `/review-posts` and
`/suggest-next` slash commands, but can also be run by hand.

## Vault layout

| Data | Vault location | Base |
| --- | --- | --- |
| Blog ideas | `Oblasti/Blog/Blog Ideas/*.md` | `Blog Ideas.base` |
| Blog articles | `Oblasti/Blog/Blog Articles/*.md` | `Blog Articles.base` |
| Learning list | `__INBOX/Notion/KB/Learning Tracker/*.md` | `Learning Tracker.base` |

One markdown note per row; a note joins its Base via a `base: "[[X.base]]"`
frontmatter link. The AI output lives inside each note as a callout —
`> [!note]+ # AI Feedback` on ideas, `> [!note]+ # AI Review` on articles.

Paths default to the current vault (`D:\Dropbox\Obsidian`) and can be overridden
via environment variables — see `.env.example` and `config.py`. You normally
don't need a `.env` at all.

## Setup

```bash
python -m venv _tools/obsidian/.venv
_tools/obsidian/.venv/Scripts/pip install -r _tools/obsidian/requirements.txt   # Windows
```

## Scripts

| Script | What it does |
| --- | --- |
| `sync_to_obsidian.py <posts-dir> [--dry-run]` | Upsert article notes from post frontmatter (matched by `Slug`); preserves tracking fields and the AI Review callout. |
| `fetch_ideas.py [--posts-dir PATH]` | Emit JSON of ideas + learning list (+ existing posts) for the review step. Each idea's `id` is its note path. |
| `push_idea_reviews.py <reviews.json> [--dry-run]` | Write the `# AI Feedback` callout + `AI Suggested Priority` / `AI Expected Effort` frontmatter into each idea note. |
| `write_post_reviews.py <reviews.json> [--dry-run]` | Write the `# AI Review` callout into the article note matching each `slug`. |
| `summarize_reviews.py` | Parse the AI Feedback callouts across all idea notes into compact JSON for `suggest-next`. |

Shared helpers live in `config.py` (paths) and `vault_reviews.py` (frontmatter
I/O + callout splicing).

## Notes

- The vault is local + Dropbox + git, so syncing is a manual `/sync-obsidian`
  run — there is no CI job (unlike the old Notion setup).
- All file I/O is UTF-8 with LF newlines and preserves frontmatter key order.
