#!/usr/bin/env python3
"""
Write AI post reviews into Obsidian "Blog Articles" notes.

Reads a JSON array:
    [{"slug": "...", "title": "...", "feedback": "markdown",
      "ai_update_priority": "High"}, ...]

For each entry: finds the article note whose `Slug` frontmatter matches,
replaces (or appends) its `# AI Review` callout and sets the
`AI Update Priority` frontmatter (when given). Posts with no matching article
note are reported and skipped — run sync_to_obsidian.py first to create them.

Usage:
    python write_post_reviews.py reviews.json [--dry-run]
"""

import argparse
import json
import sys
from pathlib import Path

from config import ARTICLES_DIR, ARTICLE_CALLOUT_TITLE, UPDATE_PRIORITY_PROP
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
        priority = (entry.get("ai_update_priority") or "").strip()

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
            post = vr.load_note(note)
            if args.dry_run:
                existed = vr.has_callout(post.content, ARTICLE_CALLOUT_TITLE)
                result = "replace" if existed else "append"
            else:
                existed = vr.apply_callout(post, ARTICLE_CALLOUT_TITLE, feedback)
                vr.set_props(post, {UPDATE_PRIORITY_PROP: priority})
                vr.dump_note(post, note)
                result = "replaced" if existed else "appended"
        except Exception as e:  # noqa: BLE001
            print(f"  ! {title}: {e}", file=sys.stderr)
            failed += 1
            continue
        mark = "~" if existed else "+"
        suffix = f" (update priority={priority})" if priority else ""
        print(f"  {mark} {title}: {result}{suffix}")
        ok += 1

    print(f"\nDone. ok={ok} missing={missing} failed={failed}")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
