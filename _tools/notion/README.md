# Blog → Notion sync

Syncs markdown files with frontmatter to a Notion database. On first run it
creates the database; on subsequent runs it upserts (matching by `Slug`).

## What gets synced (overwritten on every run)

From frontmatter: `Title`, `Slug`, `Date`, `Date Modified`, `Topics`, `Path`, `Excerpt`.

`Slug` is derived from `path` (e.g. `/gatsby-build-netlify-plugins/` → `gatsby-build-netlify-plugins`).
If a post has no `path`, the filename without extension is used instead.

## Tracking fields (the script never touches these)

- **Status** — OK / Needs update / Outdated / Expand
- **Priority** — High / Med / Low
- **Last reviewed** — date
- **Days Since Modified** — Notion formula, computed automatically from `Date Modified`

Status stays empty / whatever you set; the script will never overwrite it.

## Setup

### 1. Notion integration

1. https://www.notion.so/profile/integrations → **+ New integration**
2. Copy the **Internal Integration Token**
3. Open the parent page in Notion → `•••` → **Connections** → connect the integration

Without step 3 you will get a 404 even if the token is valid.

### 2. Running locally

```bash
pip install -r requirements.txt

# one-time setup: copy the example and fill in your values
cp _tools/notion/.env.example _tools/notion/.env

# dry-run first so you can see what the script found in the files
python sync_to_notion.py /path/to/posts --dry-run

# live run — creates the database on first run
python sync_to_notion.py /path/to/posts
```

The `.env` file is gitignored. The script loads it automatically — no need to
export variables in each terminal session.

The database ID is saved to `.notion_sync_state.json` next to the script, so
it won't be recreated on subsequent runs. Commit the file to the repo (it
contains nothing sensitive), or cache it in CI (see the workflow below).

### 3. GitHub Action

Copy `notion-sync.yml` into `.github/workflows/`, the script into `scripts/sync_to_notion.py`,
and `requirements.txt` into `scripts/requirements.txt`. In repo settings → Secrets add:

- `NOTION_TOKEN`
- `NOTION_PARENT_PAGE_ID`

The workflow runs on push to `main` when files under `posts/**` change. If your
posts live elsewhere, update `paths:` and the last line
`python scripts/sync_to_notion.py posts` accordingly.

## Deleted / renamed posts

The script leaves them alone. If you delete a file (or rename it, giving it a
different slug), the row in Notion will remain. You can manually flip the Status
to indicate the post no longer exists.
