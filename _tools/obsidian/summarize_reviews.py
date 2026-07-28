#!/usr/bin/env python3
"""
Summarize the AI reviews stored inside the Obsidian "Blog Ideas" notes into a
compact JSON array on stdout. Used by the suggest-next command.

Reads each idea note, parses the `# AI Feedback` callout (and frontmatter), and
emits one object per *reviewed* idea. Ideas without an AI Feedback callout are
skipped (nothing to rank yet).
"""

import json
import re
import sys
from pathlib import Path

from config import IDEAS_DIR, IDEA_CALLOUT_TITLE
import vault_reviews as vr

VALID_PRIORITIES = {"Very High", "High", "Medium", "Low", "Very Low",
                    "On Ice", "Suggested Deletion"}


def _first_tag(tags) -> str:
    if isinstance(tags, list) and tags:
        return str(tags[0]).lower()
    if tags:
        return str(tags).lower()
    return "untagged"


def parse_review(note: Path, post, review: str) -> dict:
    fm = post.metadata
    result: dict = {
        "title": note.stem,
        "filename": note.name,
        "filepath": str(note).replace("\\", "/"),
        "is_starred": bool(fm.get("Star", False)),
        "tag": _first_tag(fm.get("Tags")),
    }

    priority = str(fm.get("AI Suggested Priority", "") or "").strip()
    if priority not in VALID_PRIORITIES:
        priority = str(fm.get("Priority", "") or "").strip() or "Medium"
    result["priority"] = priority

    reviewed = re.search(r"^\*\*Reviewed:\*\*\s*(.+)$", review, re.MULTILINE)
    result["reviewed_at"] = reviewed.group(1).strip() if reviewed else None

    effort = str(fm.get("AI Expected Effort", "") or "").strip()
    if effort not in {"Low", "Medium", "High"}:
        m = re.search(r"\*\*AI Expected Effort:\*\*\s*(Low|Medium|High|N/A)", review)
        effort = m.group(1) if m else "Medium"
    result["effort"] = effort

    m = re.search(
        r"\*\*Time sensitivity:\*\*\s*(Evergreen|Fades slowly|Time-sensitive|Expires soon|Expired)",
        review)
    ts = m.group(1) if m else "Evergreen"
    result["time_sensitivity"] = "Expires soon" if ts == "Expired" else ts

    m = re.search(r"\*\*Series fit:\*\*\s*(.+)$", review, re.MULTILINE)
    series_val = m.group(1).strip() if m else "none"
    result["series_fit"] = series_val
    result["has_series_fit"] = not series_val.lower().startswith("none")

    m = re.search(r"\*\*Suggested angle:\*\*\s*(.+)$", review, re.MULTILINE)
    result["suggested_angle"] = m.group(1).strip() if m else ""

    m = re.search(r"\*\*Learning alignment\*\*\s*\n(.*?)\n\n\*\*", review, re.DOTALL)
    if m:
        learning_text = m.group(1).strip()
        result["learning_aligned"] = not bool(re.match(r"^[Nn]one", learning_text))
        result["learning_text"] = learning_text
    else:
        result["learning_aligned"] = False
        result["learning_text"] = ""

    m = re.search(r"\*\*Concerns:\*\*\s*\n(.*?)$", review, re.DOTALL)
    if m:
        concerns_text = m.group(1).strip()
        if re.match(r"^-?\s*none\s*$", concerns_text, re.IGNORECASE):
            result["concerns"] = []
        else:
            result["concerns"] = re.findall(r"^-\s+(.+)$", concerns_text, re.MULTILINE)
    else:
        result["concerns"] = []
    result["has_concerns"] = len(result["concerns"]) > 0

    return result


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    if not IDEAS_DIR.is_dir():
        print(f"ERROR: ideas directory not found: {IDEAS_DIR}", file=sys.stderr)
        return 1

    results = []
    for note in sorted(IDEAS_DIR.glob("*.md")):
        try:
            post = vr.load_note(note)
        except Exception:
            continue
        review = vr.read_callout(post.content, IDEA_CALLOUT_TITLE)
        if not review:
            continue  # not reviewed yet
        results.append(parse_review(note, post, review))

    print(json.dumps(results, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
