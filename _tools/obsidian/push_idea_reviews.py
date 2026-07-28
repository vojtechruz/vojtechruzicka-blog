#!/usr/bin/env python3
"""
Write AI feedback back into Obsidian idea notes.

Reads a JSON array:
    [{"path": "...", "title": "...", "feedback": "markdown",
      "ai_suggested_priority": "High", "ai_expected_effort": "Low"}, ...]

For each entry: replaces (or appends) the `# AI Feedback` callout in the note
and sets the `AI Suggested Priority` / `AI Expected Effort` frontmatter. All
other content is left untouched. (`page_id`/`id` are accepted as aliases for
`path` for backwards compatibility.)

Usage:
    python push_idea_reviews.py reviews.json [--dry-run]
"""

import argparse
import json
import sys
from pathlib import Path

from config import IDEA_CALLOUT_TITLE
import vault_reviews as vr


def push_one(entry: dict, dry_run: bool) -> tuple[str, str]:
    path = entry.get("path") or entry.get("id") or entry.get("page_id") or ""
    title = entry.get("title") or (Path(path).stem if path else "?")
    feedback = (entry.get("feedback") or "").strip()
    priority = entry.get("ai_suggested_priority", "")
    effort = entry.get("ai_expected_effort", "")

    if not path or not feedback:
        return title, "! missing path or feedback"
    note = Path(path)
    if not note.exists():
        return title, f"! note not found: {note}"

    if dry_run:
        action = "replace" if vr.has_callout(vr.load_note(note).content,
                                              IDEA_CALLOUT_TITLE) else "append"
        extra = []
        if priority:
            extra.append(f"priority={priority}")
        if effort:
            extra.append(f"effort={effort}")
        suffix = f", set {', '.join(extra)}" if extra else ""
        return title, f"would {action} AI Feedback{suffix}"

    post = vr.load_note(note)
    existed = vr.apply_callout(post, IDEA_CALLOUT_TITLE, feedback)
    vr.set_props(post, {
        "AI Suggested Priority": priority,
        "AI Expected Effort": effort,
    })
    vr.dump_note(post, note)
    return title, "replaced" if existed else "appended"


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

    ok = failed = 0
    for entry in reviews:
        try:
            title, result = push_one(entry, args.dry_run)
        except Exception as e:  # noqa: BLE001
            print(f"  ! {entry.get('title', '?')}: {e}", file=sys.stderr)
            failed += 1
            continue
        if result.startswith("!"):
            print(f"  {result} ({title})", file=sys.stderr)
            failed += 1
        else:
            mark = "~" if "replace" in result else "+"
            print(f"  {mark} {title}: {result}")
            ok += 1

    print(f"\nDone. ok={ok} failed={failed}")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
