#!/usr/bin/env python3
"""
Report review status for blog posts, for the review-posts command.

For each post under the given directory, emit JSON:
    {"path", "slug", "title", "has_article_note", "has_review"}

  * has_article_note — an article note with this Slug exists in ARTICLES_DIR
  * has_review       — that article note already has an `# AI Review` callout

Usage:
    python posts_status.py /path/to/blog/src/posts
"""

import argparse
import json
import sys
from pathlib import Path

import frontmatter

from config import ARTICLES_DIR, ARTICLE_CALLOUT_TITLE
import vault_reviews as vr

IGNORED_FILES = {"review.md"}


def slug_from_path(path_value) -> str:
    if not path_value:
        return ""
    return str(path_value).strip("/").strip()


def index_articles(articles_dir: Path) -> dict:
    """Map Slug -> (note Path, has_review)."""
    by_slug: dict[str, tuple] = {}
    if not articles_dir.is_dir():
        return by_slug
    for note in sorted(articles_dir.glob("*.md")):
        try:
            post = vr.load_note(note)
        except Exception:
            continue
        slug = str(post.get("Slug", "")).strip()
        if slug:
            by_slug[slug] = (note, vr.has_callout(post.content, ARTICLE_CALLOUT_TITLE))
    return by_slug


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    ap = argparse.ArgumentParser()
    ap.add_argument("posts_dir", type=Path)
    args = ap.parse_args()

    if not args.posts_dir.is_dir():
        print(f"Not a directory: {args.posts_dir}", file=sys.stderr)
        return 2

    by_slug = index_articles(ARTICLES_DIR)
    out = []
    for f in sorted(args.posts_dir.rglob("*.md")):
        if f.name in IGNORED_FILES:
            continue
        try:
            fm = frontmatter.loads(f.read_text(encoding="utf-8")).metadata
        except Exception:
            continue
        slug = slug_from_path(fm.get("path")) or f.stem
        note, has_review = by_slug.get(slug, (None, False))
        out.append({
            "path": str(f).replace("\\", "/"),
            "slug": slug,
            "title": str(fm.get("title", "")) or slug,
            "has_article_note": note is not None,
            "has_review": has_review,
        })

    print(json.dumps(out, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
