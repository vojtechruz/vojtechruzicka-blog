#!/usr/bin/env python3
"""
Read blog post ideas from the Obsidian "Blog Ideas" notes, plus (optionally)
existing post metadata and the learning list.

Outputs JSON with keys: ideas, learning_items, existing_posts (if --posts-dir).
Each idea's `id` is the absolute path to its note (used by push_idea_reviews.py
to write feedback back).

Usage:
    python fetch_ideas.py [--posts-dir PATH]
"""

import argparse
import json
import sys
from pathlib import Path

import frontmatter

from config import (IDEAS_DIR, LEARNING_DIR, IDEA_CALLOUT_TITLE,
                    LEARNING_CATEGORY, LEARNING_DONE_STATUS)
import vault_reviews as vr


def _as_list(value) -> list[str]:
    if not value:
        return []
    if isinstance(value, list):
        return [str(v) for v in value]
    return [str(value)]


def _body_text(post: frontmatter.Post) -> str:
    """The note body with the AI Feedback callout removed (source links/notes)."""
    stripped = vr.strip_callout(post.content, IDEA_CALLOUT_TITLE)
    lines = [ln.strip() for ln in stripped.splitlines() if ln.strip()]
    return "\n".join(lines)


def collect_ideas(ideas_dir: Path) -> list[dict]:
    ideas = []
    if not ideas_dir.is_dir():
        print(f"WARNING: ideas dir not found: {ideas_dir}", file=sys.stderr)
        return ideas
    for note in sorted(ideas_dir.glob("*.md")):
        try:
            post = vr.load_note(note)
        except Exception as e:
            print(f"  ! skipping {note.name}: {e}", file=sys.stderr)
            continue
        fm = post.metadata
        ideas.append({
            "id": str(note),
            "title": note.stem,
            "tags": _as_list(fm.get("Tags")),
            "priority": str(fm.get("Priority", "") or ""),
            "is_starred": bool(fm.get("Star", False)),
            "body_text": _body_text(post),
        })
    return ideas


def collect_learning(learning_dir: Path) -> list[dict]:
    """Development-category, non-Done items from the learning list."""
    items = []
    if not learning_dir.is_dir():
        print(f"NOTE: learning dir not found, skipping learning list: {learning_dir}",
              file=sys.stderr)
        return items
    for note in sorted(learning_dir.glob("*.md")):
        try:
            post = vr.load_note(note)
        except Exception:
            continue
        fm = post.metadata
        if str(fm.get("Category", "")) != LEARNING_CATEGORY:
            continue
        if str(fm.get("Status", "")) == LEARNING_DONE_STATUS:
            continue
        items.append({
            "title": note.stem,
            "tags": _as_list(fm.get("Tags")),
            "priority": str(fm.get("Priority", "") or ""),
            "status": str(fm.get("Status", "") or ""),
        })
    return items


def collect_existing_posts(posts_dir: Path) -> list[dict]:
    posts = []
    for md in sorted(posts_dir.rglob("*.md")):
        if md.name == "review.md":
            continue
        try:
            post = frontmatter.loads(md.read_text(encoding="utf-8"))
        except Exception:
            continue
        fm = post.metadata
        if not fm.get("title"):
            continue
        posts.append({
            "title": str(fm.get("title", "")),
            "topics": _as_list(fm.get("topics")),
            "date": str(fm.get("date", "")),
            "series": str(fm.get("series", "")),
            "excerpt": str(fm.get("excerpt", "")),
            "draft": bool(fm.get("draftStatus") == "draft" or fm.get("draft", False)),
        })
    return posts


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    ap = argparse.ArgumentParser()
    ap.add_argument("--posts-dir", type=Path,
                    help="Blog posts directory (to include existing post metadata)")
    args = ap.parse_args()

    print(f"Reading ideas from {IDEAS_DIR}…", file=sys.stderr)
    ideas = collect_ideas(IDEAS_DIR)
    learning_items = collect_learning(LEARNING_DIR)

    output: dict = {"ideas": ideas, "learning_items": learning_items}

    if args.posts_dir:
        if not args.posts_dir.is_dir():
            print(f"Not a directory: {args.posts_dir}", file=sys.stderr)
            return 2
        output["existing_posts"] = collect_existing_posts(args.posts_dir)

    print(json.dumps(output, ensure_ascii=False, indent=2, default=str))
    return 0


if __name__ == "__main__":
    sys.exit(main())
