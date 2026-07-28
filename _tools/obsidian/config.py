#!/usr/bin/env python3
"""
Central configuration for the Obsidian blog toolchain.

Everything is a plain local filesystem path into the vault — no API tokens.
All locations default to the current vault layout but can be overridden with
environment variables (handy if you reorganise the vault later, or run the
scripts against a copy for testing).
"""

import os
from pathlib import Path

# The vault root. Override with OBSIDIAN_VAULT.
DEFAULT_VAULT = r"D:\Dropbox\Obsidian"
VAULT_ROOT = Path(os.environ.get("OBSIDIAN_VAULT", DEFAULT_VAULT))

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

# Learning list filter (mirrors the old Notion filter).
LEARNING_CATEGORY = "Development"
LEARNING_DONE_STATUS = "Done"
