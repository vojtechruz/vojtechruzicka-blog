#!/usr/bin/env python3
"""
Write AI post reviews into Obsidian "Blog Articles" notes.

Reads a JSON array:
    [{"slug": "...", "title": "...", "feedback": "markdown"}, ...]

For each entry: finds the article note whose `Slug` frontmatter matches and
replaces (or appends) its `# AI Review` callout. Posts with no matching article
note are reported and skipped — run sync_to_obsidian.py first to create them.

Usage:
    python write_post_reviews.py reviews.json [--dry-run]
"""

import argparse
import json
import sys
from pathlib import Path

from config import ARTICLES_DIR, ARTICLE_CALLOUT_TITLE
import vault_reviews as vr


def index_articles(articles_dir: Path) -> dict:
    by_slug: dict[str, Path] = {}
    if not articles_dir.is_dir():
        return by_slug
    for note in sorted(articles_dir.glob("*.md")):
        try:
            post = vr.load_note(note)
        except Exception:
            continue
        slug = str(post.get("Slug", "")).strip()
        if slug:
            by_slug[slug] = note
    return by_slug


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    ap = argparse.ArgumentParser()
    ap.add_argument("reviews_file", type=Path, help="JSON array of review entries")
    ap.add_argument("--dry-run", action="store_true",
                    help="Show what would happen without writing notes")
    args = ap.parse_args()

    if not args.reviews_file.exists():
        print(f"File not found: {args.reviews_file}", file=sys.stderr)
        return 2

    reviews = json.loads(args.reviews_file.read_text(encoding="utf-8"))
    if not isinstance(reviews, list):
        print("Expected a JSON array.", file=sys.stderr)
        return 2

    by_slug = index_articles(ARTICLES_DIR)
    print(f"{len(by_slug)} article note(s) in {ARTICLES_DIR}", file=sys.stderr)

    ok = missing = failed = 0
    for entry in reviews:
        slug = (entry.get("slug") or "").strip()
        title = entry.get("title") or slug or "?"
        feedback = (entry.get("feedback") or "").strip()

        if not slug or not feedback:
            print(f"  ! {title}: missing slug or feedback", file=sys.stderr)
            failed += 1
            continue
        note = by_slug.get(slug)
        if not note:
            print(f"  - {title}: no article note for slug '{slug}' "
                  f"(run sync_to_obsidian.py first)", file=sys.stderr)
            missing += 1
            continue
        try:
            result = vr.splice_callout(note, ARTICLE_CALLOUT_TITLE, feedback,
                                       dry_run=args.dry_run)
        except Exception as e:  # noqa: BLE001
            print(f"  ! {title}: {e}", file=sys.stderr)
            failed += 1
            continue
        mark = "~" if "replace" in result else "+"
        print(f"  {mark} {title}: {result}")
        ok += 1

    print(f"\nDone. ok={ok} missing={missing} failed={failed}")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
