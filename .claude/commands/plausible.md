Answer a question about blog traffic from Plausible (visitors, top posts, referrers, goals and custom events such as
`CSP Violation`, `404`, `Share Post Click`).

## Arguments: $ARGUMENTS

The question or a command for the script, e.g. `overview --period 30d`, `breakdown referrer --period all`,
`goals --period 7d`, "how is the flexbox article doing". Empty: show `overview --period 30d`.

## Steps

1. **Find the skill.** It lives in the Obsidian vault, not in this repo, so there is a single copy:
   `<vault>/.claude/skills/plausible-blog/` (`skill.md` + `plausible_stats.py`). Get the vault path with

   ```bash
   python _tools/obsidian/config.py
   ```

   (`python3` on Linux; stdlib only, no venv needed). It finds Dropbox on Windows and Linux alike (`DROPBOX_ROOT`,
   the Dropbox client's `info.json`, `~/Dropbox`, `D:\Dropbox`); `OBSIDIAN_VAULT` overrides it. If it fails, ask the
   user for the vault path.

2. **Read `<vault>/.claude/skills/plausible-blog/skill.md`** and follow it. It documents the commands, the periods,
   how pages map to article notes, and how to interpret the numbers. Do not copy or edit the skill from this repo.

3. **Run the script** with the right subcommand, e.g.

   ```bash
   python "<vault>/.claude/skills/plausible-blog/plausible_stats.py" breakdown referrer --period all
   ```

   It resolves the vault from its own location, so it works from the blog's working directory. The API key is in
   `~/.plausible/config.json` (shared with `/sync-traffic`). If the script reports a missing key, tell the user to
   create the file and stop. Never ask for the key in chat.

4. **Answer** with the numbers that matter for the question, not the raw dump. When the data points to a change in the
   repo (a missing redirect for a frequent 404, a CSP directive that blocks something real, an event without a goal),
   say so and name the file to change.
