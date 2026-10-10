Answer a question about Google search performance from Search Console (clicks, impressions, CTR, position, queries,
update opportunities, index status, sitemaps) or process a Links report export into the backlinks note.

## Arguments: $ARGUMENTS

The question or a command for the script, e.g. `overview --period 28d`, `opportunities`, `queries --page css-flexbox`,
`inspect /css-flexbox/`, `links ~/Downloads/<export>.zip`. Empty: show `overview --period 28d`.

## Steps

1. **Find the skill.** It lives in the Obsidian vault, not in this repo, so there is a single copy:
   `<vault>/.claude/skills/search-console/` (`skill.md` + `gsc_stats.py`). Get the vault path with

   ```bash
   python _tools/obsidian/config.py
   ```

   (`python3` on Linux; stdlib only, no venv needed). If it fails, ask the user for the vault path.

2. **Read `<vault>/.claude/skills/search-console/skill.md`** and follow it. It documents the one-time service account
   setup, the commands, the periods and how to read the numbers. Do not copy or edit the skill from this repo.

3. **Run the script** with the right subcommand, e.g.

   ```bash
   python "<vault>/.claude/skills/search-console/gsc_stats.py" opportunities --period 3mo
   ```

   The key is in `<Dropbox>/.secrets/gsc-service-account.json` (synced to every computer, outside any git repo). If
   the script reports a missing key or HTTP 403, walk the user through the setup section of `skill.md` and stop. Never
   ask for the key in chat.

4. **Answer** with the numbers that matter for the question. When the data points to a change in the repo (a post
   worth updating for a query it almost ranks for, a weak title or description, a page Google does not index), say so
   and name the post.
