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
cd _tools/notion

# create and activate a virtual environment (one-time)
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux

pip install -r requirements.txt

# one-time setup: copy the example and fill in your values
cp .env.example .env

# dry-run first so you can see what the script found in the files
python sync_to_notion.py ../../src/posts --dry-run

# live run — creates the database on first run
python sync_to_notion.py ../../src/posts
```

The `.env` file is gitignored. The script loads it automatically — no need to
export variables in each terminal session.

The database ID is saved to `.notion_sync_state.json` next to the script, so
it won't be recreated on subsequent runs. Commit the file to the repo (it
contains nothing sensitive), or cache it in CI (see the workflow below).

### 3. GitHub Actions

The workflow is at `.github/workflows/notion-sync.yml`. It runs on every push to
`master` when files under `src/posts/**` change.

Add two secrets in GitHub repo → Settings → Secrets and variables → Actions:

- `NOTION_TOKEN`
- `NOTION_PARENT_PAGE_ID`

If you recreate the Notion database locally, commit the updated
`.notion_sync_state.json` so the workflow picks up the new database ID.

## Deleted / renamed posts

The script leaves them alone. If you delete a file (or rename it, giving it a
different slug), the row in Notion will remain. You can manually flip the Status
to indicate the post no longer exists.
