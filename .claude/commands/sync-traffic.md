Refresh Plausible traffic in the Obsidian "Blog Articles" notes.

## Arguments: $ARGUMENTS

- **No args**: write traffic into every published article note
- **`--dry-run`**: print the top posts by `Views 6mo` without writing any notes
- **`--months N`**: show N full months in each note's table (default 12)

## Steps

1. **Check dependencies**
   - Same venv as `/sync-obsidian`: `_tools/obsidian/.venv/Scripts/python` (create it per that command if
     missing).
   - Needs a Plausible **Stats API** key in `~/.plausible/config.json`
     (`{"api_key": "...", "site_id": "vojtechruzicka.com"}`), shared with the vault's `plausible-blog`
     skill. If the script exits with "Missing Plausible API key", tell the user to create it and stop.
     Never ask for the key in chat.

2. **Run**
   ```
   _tools/obsidian/.venv/Scripts/python _tools/obsidian/sync_traffic.py $ARGUMENTS
   ```
   For each published article note (matched by `Path`) it writes:
   - `Views 6mo` frontmatter: pageviews over the last 6 full months, sortable in `Blog Articles.base`;
   - a collapsed `> [!info]- # Traffic` callout at the **top** of the note: 6-month total, trend
     (last 3 vs previous 3 months) and a monthly table with a text bar chart.
   The current month is excluded (incomplete). Months before publication or before Plausible has data
   are skipped. Only 2 API calls in total. Other frontmatter and the `# AI Review` callout stay as they are.

3. **Report**: show the script's top-10 list and how many notes had no views in the window. Articles
   that are old and have zero traffic are candidates for `/archive-post`, so mention them when
   there are many.
