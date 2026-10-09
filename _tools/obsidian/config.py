#!/usr/bin/env python3
"""
Central configuration for the Obsidian blog toolchain.

Everything is a plain local filesystem path into the vault — no API tokens.
All locations default to the current vault layout but can be overridden with
environment variables (handy if you reorganise the vault later, or run the
scripts against a copy for testing).
"""

import json
import os
from pathlib import Path

VAULT_NAME = "Obsidian"


def _dropbox_candidates():
    """Possible Dropbox roots, most specific first.

    Same order as the vault's `1sec` skill: DROPBOX_ROOT, the Dropbox client's info.json
    (%APPDATA%/%LOCALAPPDATA% on Windows, ~/.dropbox on Linux), then the usual locations.
    Dropbox lives elsewhere on each computer (D:\\Dropbox on Windows, ~/Dropbox on Omarchy/Ubuntu).
    """
    if os.environ.get("DROPBOX_ROOT"):
        yield Path(os.environ["DROPBOX_ROOT"]).expanduser()
    info_files = [Path(os.environ[v]) / "Dropbox" / "info.json" for v in ("APPDATA", "LOCALAPPDATA") if os.environ.get(v)]
    info_files.append(Path.home() / ".dropbox" / "info.json")
    for info in info_files:
        try:
            data = json.loads(info.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        for account in ("personal", "business"):
            path = (data.get(account) or {}).get("path")
            if path:
                yield Path(path)
    yield from (Path.home() / "Dropbox", Path("D:/Dropbox"), Path("C:/Dropbox"))


def find_vault() -> Path:
    """The vault root: OBSIDIAN_VAULT if set, otherwise <Dropbox>/Obsidian on this computer."""
    if os.environ.get("OBSIDIAN_VAULT"):
        return Path(os.environ["OBSIDIAN_VAULT"]).expanduser()
    for root in _dropbox_candidates():
        if (root / VAULT_NAME / ".obsidian").is_dir():
            return root / VAULT_NAME
    raise SystemExit("Obsidian vault not found (tried DROPBOX_ROOT, Dropbox info.json, ~/Dropbox, D:/Dropbox, "
                     "C:/Dropbox). Set OBSIDIAN_VAULT to the vault path.")


# The vault root. Override with OBSIDIAN_VAULT.
VAULT_ROOT = find_vault()

BLOG_DIR = VAULT_ROOT / "Oblasti" / "Blog"


def _dir(env_var: str, default: Path) -> Path:
    value = os.environ.get(env_var)
    return Path(value) if value else default


# Blog databases (one markdown note per row, grouped by a `base:` link).
IDEAS_DIR = _dir("OBSIDIAN_IDEAS_DIR", BLOG_DIR / "Blog Ideas")
ARTICLES_DIR = _dir("OBSIDIAN_ARTICLES_DIR", BLOG_DIR / "Blog Articles")

# The learning list ("Learning Tracker"). Optional — skipped if the folder is
# missing. Currently under the raw Notion import; move + repoint if reorganised.
LEARNING_DIR = _dir(
    "OBSIDIAN_LEARNING_DIR",
    VAULT_ROOT / "__INBOX" / "Notion" / "KB" / "Learning Tracker",
)

# Frontmatter `base:` links that tie a note into its Obsidian Base (database).
IDEAS_BASE_LINK = "[[Blog Ideas.base]]"
ARTICLES_BASE_LINK = "[[Blog Articles.base]]"

# Callout titles used for the AI blocks inside notes.
IDEA_CALLOUT_TITLE = "AI Feedback"
ARTICLE_CALLOUT_TITLE = "AI Review"
TRAFFIC_CALLOUT_TITLE = "Traffic"

# Article frontmatter written by sync_traffic.py / write_post_reviews.py.
VIEWS_MONTHS = 6
VIEWS_PROP = f"Views {VIEWS_MONTHS}mo"
UPDATE_PRIORITY_PROP = "AI Update Priority"

# Learning list filter (mirrors the old Notion filter).
LEARNING_CATEGORY = "Development"
LEARNING_DONE_STATUS = "Done"


if __name__ == "__main__":
    # `python _tools/obsidian/config.py` prints the vault path (used by /plausible)
    print(VAULT_ROOT)
