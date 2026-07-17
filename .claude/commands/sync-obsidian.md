Sync current blog post metadata into the Obsidian "Blog Articles" notes in the vault.

## Arguments: $ARGUMENTS

- **No args**: dry-run first, show output, then ask for confirmation before syncing for real
- **`--dry-run`**: show what would sync without writing any notes
- **`--force`**: skip dry-run and confirmation, sync immediately

## Steps

1. **Check dependencies**
   - The scripts operate on local vault files — no tokens or `.env` are required. (Paths default to
     the vault at `D:\Dropbox\Obsidian`; override with `OBSIDIAN_VAULT` if needed — see
     `_tools/obsidian/.env.example`.)
   - The script uses a local venv at `_tools/obsidian/.venv`. On Windows use
     `_tools/obsidian/.venv/Scripts/python`, on Mac/Linux use `_tools/obsidian/.venv/bin/python`. Use
     PowerShell `Test-Path` to check which exists.
   - If neither exists, create the venv: `python -m venv _tools/obsidian/.venv`, then install:
     `_tools/obsidian/.venv/Scripts/pip install -r _tools/obsidian/requirements.txt`
   - If the venv exists but `python-frontmatter` is not installed (check with
     `_tools/obsidian/.venv/Scripts/pip show python-frontmatter`), run the install step.

2. **Dry run** (skip if `--force`)
   - Run: `_tools/obsidian/.venv/Scripts/python _tools/obsidian/sync_to_obsidian.py src/posts --dry-run`
   - Show the output to the user (which article notes would be created vs updated).
   - Ask for confirmation before proceeding. If the user declines, stop.

3. **Full sync**
   - Run: `_tools/obsidian/.venv/Scripts/python _tools/obsidian/sync_to_obsidian.py src/posts`
   - Show the output including the final `created=N updated=N skipped=N` summary.
   - Article notes are matched to posts by their `Slug` frontmatter. Existing notes are updated in
     place — human-owned tracking fields (`Status`, `Priority`, `Last reviewed`) and the `# AI Review`
     callout are preserved. New posts get a fresh note in `Oblasti/Blog/Blog Articles/`.

4. **Report** — confirm completion or surface any errors from the script output.
