Run the Notion sync script to update the blog's Notion database with current post metadata and review content.

## Arguments: $ARGUMENTS

- **No args**: dry-run first, show output, then ask for confirmation before syncing for real
- **`--dry-run`**: show what would sync without making API calls
- **`--force`**: skip dry-run and confirmation, sync immediately

## Steps

1. **Check dependencies**
   - Verify `_tools/notion/.env` exists. If it doesn't, stop and tell the user to copy `_tools/notion/.env.example` and fill in `NOTION_TOKEN` and `NOTION_PARENT_PAGE_ID`
   - The script uses a local venv at `_tools/notion/.venv`. On Windows use `_tools/notion/.venv/Scripts/python`, on Mac/Linux use `_tools/notion/.venv/bin/python`. Use PowerShell `Test-Path` to check which exists.
   - If neither exists, create the venv: `python -m venv _tools/notion/.venv`, then install: `_tools/notion/.venv/Scripts/pip install -r _tools/notion/requirements.txt`
   - If the venv exists but `python-frontmatter` is not installed (check with `_tools/notion/.venv/Scripts/pip show python-frontmatter`), run the install step

2. **Dry run** (skip if `--force`)
   - Run: `_tools/notion/.venv/Scripts/python _tools/notion/sync_to_notion.py src/posts --dry-run`
   - Show the output to the user
   - Ask for confirmation before proceeding. If the user declines, stop.

3. **Full sync**
   - Run: `_tools/notion/.venv/Scripts/python _tools/notion/sync_to_notion.py src/posts`
   - Show the output including the final `created=N updated=N skipped=N` summary

4. **Report** — confirm completion or surface any errors from the script output
