#!/usr/bin/env python3
"""
Report review status for blog posts, for the review-posts command.

For each post under the given directory, emit JSON:
    {"path", "slug", "title", "has_article_note", "has_review",
     "views_6mo", "views_rank", "traffic_trend"}

  * has_article_note — an article note with this Slug exists in ARTICLES_DIR
  * has_review       — that article note already has an `# AI Review` callout
  * views_6mo        — `Views 6mo` from the note (written by sync_traffic.py), or null
  * views_rank       — "N/M": rank by views_6mo among posts that have traffic data
  * traffic_trend    — last 3 vs previous 3 months from the `# Traffic` callout

Usage:
    python posts_status.py /path/to/blog/src/posts
"""

import argparse
import json
import re
import sys
from pathlib import Path

import frontmatter

from config import ARTICLES_DIR, ARTICLE_CALLOUT_TITLE, VIEWS_PROP
import vault_reviews as vr

IGNORED_FILES = {"review.md"}
_TREND = re.compile(r"\*\*last 3 vs previous 3:\*\*\s*(.+?)\s*$", re.M)


def slug_from_path(path_value) -> str:
    if not path_value:
        return ""
    return str(path_value).strip("/").strip()


def index_articles(articles_dir: Path) -> dict:
    """Map Slug -> (note Path, has_review, views, trend)."""
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
            views = post.get(VIEWS_PROP)
            trend = _TREND.search(post.content)
            by_slug[slug] = (note, vr.has_callout(post.content, ARTICLE_CALLOUT_TITLE),
                             views if isinstance(views, int) else None,
                             trend.group(1) if trend else None)
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
    ranked = sorted((v[2] for v in by_slug.values() if v[2] is not None), reverse=True)
    out = []
    for f in sorted(args.posts_dir.rglob("*.md")):
        if f.name in IGNORED_FILES:
            continue
        try:
            fm = frontmatter.loads(f.read_text(encoding="utf-8")).metadata
        except Exception:
            continue
        slug = slug_from_path(fm.get("path")) or f.stem
        note, has_review, views, trend = by_slug.get(slug, (None, False, None, None))
        out.append({
            "path": str(f).replace("\\", "/"),
            "slug": slug,
            "title": str(fm.get("title", "")) or slug,
            "has_article_note": note is not None,
            "has_review": has_review,
            "views_6mo": views,
            "views_rank": f"{ranked.index(views) + 1}/{len(ranked)}" if views is not None else None,
            "traffic_trend": trend,
        })

    print(json.dumps(out, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
