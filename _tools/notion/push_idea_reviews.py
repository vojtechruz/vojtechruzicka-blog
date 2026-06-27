#!/usr/bin/env python3
"""
Write AI feedback back to Notion idea pages.

Reads a JSON file of the form:
    [{"page_id": "...", "feedback": "markdown text"}, ...]

For each entry: finds the existing "AI Feedback" toggleable heading on the page
and replaces it (deletes it, appends a fresh one). If no such block exists,
appends a new one. All other page content is left untouched.

Usage:
    python push_idea_reviews.py reviews.json [--dry-run]
"""

import argparse
import json
import os
import re
import sys
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

NOTION_VERSION = "2022-06-28"
API = "https://api.notion.com/v1"
AI_FEEDBACK_HEADING = "AI Feedback"


class Notion:
    def __init__(self, token: str):
        self.s = requests.Session()
        self.s.headers.update({
            "Authorization": f"Bearer {token}",
            "Notion-Version": NOTION_VERSION,
            "Content-Type": "application/json",
        })

    def _req(self, method: str, path: str, **kw) -> dict:
        for attempt in range(5):
            r = self.s.request(method, f"{API}{path}", **kw)
            if r.status_code == 429 or r.status_code >= 500:
                wait = float(r.headers.get("Retry-After", 2 ** attempt))
                print(f"  Notion {r.status_code}, retrying in {wait:.0f}s…", file=sys.stderr)
                time.sleep(wait)
                continue
            if not r.ok:
                print(f"Notion API error {r.status_code} {method} {path}: {r.text}",
                      file=sys.stderr)
                r.raise_for_status()
            return r.json()
        r.raise_for_status()

    def get_block_children(self, block_id: str) -> list[dict]:
        results, cursor = [], None
        while True:
            params: dict = {"page_size": 100}
            if cursor:
                params["start_cursor"] = cursor
            data = self._req("GET", f"/blocks/{block_id}/children", params=params)
            results.extend(data.get("results", []))
            if not data.get("has_more"):
                return results
            cursor = data["next_cursor"]

    def delete_block(self, block_id: str) -> None:
        self._req("DELETE", f"/blocks/{block_id}")

    def append_children(self, block_id: str, children: list[dict]) -> dict:
        return self._req("PATCH", f"/blocks/{block_id}/children",
                         json={"children": children})

    def update_page_properties(self, page_id: str, priority: str, effort: str) -> None:
        props = {}
        if priority:
            props["AI Suggested Priority"] = {"select": {"name": priority}}
        if effort:
            props["AI Expected Effort"] = {"select": {"name": effort}}
        if props:
            self._req("PATCH", f"/pages/{page_id}", json={"properties": props})


_INLINE_RE = re.compile(r'\*\*(.+?)\*\*|`(.+?)`')


def _parse_inline(text: str) -> list[dict]:
    parts = []
    last = 0
    for m in _INLINE_RE.finditer(text):
        if m.start() > last:
            parts.append({"type": "text", "text": {"content": text[last:m.start()]}})
        if m.group(1) is not None:
            parts.append({"type": "text", "text": {"content": m.group(1)},
                          "annotations": {"bold": True}})
        else:
            parts.append({"type": "text", "text": {"content": m.group(2)},
                          "annotations": {"code": True}})
        last = m.end()
    if last < len(text):
        parts.append({"type": "text", "text": {"content": text[last:]}})
    return parts or [{"type": "text", "text": {"content": ""}}]


def _bullet_block(text: str, children: list[dict] | None = None) -> dict:
    item: dict = {"object": "block", "type": "bulleted_list_item",
                  "bulleted_list_item": {"rich_text": _parse_inline(text)}}
    if children:
        item["bulleted_list_item"]["children"] = children
    return item


def md_to_notion_blocks(md: str) -> list[dict]:
    blocks: list[dict] = []
    lines = md.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.startswith("#### "):
            blocks.append({"object": "block", "type": "heading_3",
                            "heading_3": {"rich_text": _parse_inline(line[5:].strip())}})
        elif line.startswith("### "):
            blocks.append({"object": "block", "type": "heading_2",
                            "heading_2": {"rich_text": _parse_inline(line[4:].strip())}})
        elif line.startswith("## "):
            blocks.append({"object": "block", "type": "heading_2",
                            "heading_2": {"rich_text": _parse_inline(line[3:].strip())}})
        elif line.startswith("- "):
            children = []
            j = i + 1
            while j < len(lines) and lines[j].startswith("  - "):
                children.append(_bullet_block(lines[j][4:].strip()))
                j += 1
            blocks.append(_bullet_block(line[2:].strip(), children or None))
            i = j - 1
        elif line.strip():
            blocks.append({"object": "block", "type": "paragraph",
                            "paragraph": {"rich_text": _parse_inline(line.strip())}})
        i += 1
    return blocks


def _is_ai_feedback_block(block: dict) -> bool:
    btype = block.get("type", "")
    content = block.get(btype, {})
    rich_text = content.get("rich_text", [])
    text = "".join(t.get("plain_text", "") for t in rich_text).strip()
    return text == AI_FEEDBACK_HEADING and content.get("is_toggleable", False)


def build_ai_feedback_block(feedback_md: str) -> dict:
    inner = md_to_notion_blocks(feedback_md)
    return {
        "object": "block",
        "type": "heading_1",
        "heading_1": {
            "rich_text": [{"type": "text", "text": {"content": AI_FEEDBACK_HEADING}}],
            "is_toggleable": True,
            "children": inner,
        },
    }


def push_review(notion: Notion, page_id: str, feedback_md: str,
                priority: str, effort: str, dry_run: bool) -> str:
    blocks = notion.get_block_children(page_id)
    existing = next((b for b in blocks if _is_ai_feedback_block(b)), None)

    if dry_run:
        action = "replace" if existing else "append"
        props = []
        if priority:
            props.append(f"priority={priority}")
        if effort:
            props.append(f"effort={effort}")
        suffix = f", would set {', '.join(props)}" if props else ""
        return f"would {action} AI Feedback block{suffix}"

    if existing:
        notion.delete_block(existing["id"])

    notion.append_children(page_id, [build_ai_feedback_block(feedback_md)])
    notion.update_page_properties(page_id, priority, effort)
    return "replaced" if existing else "appended"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("reviews_file", type=Path,
                    help="JSON file: [{page_id, feedback}, ...]")
    ap.add_argument("--dry-run", action="store_true",
                    help="Show what would happen without calling the API")
    args = ap.parse_args()

    token = os.environ.get("NOTION_TOKEN", "")
    if not token:
        print("Set NOTION_TOKEN env var.", file=sys.stderr)
        return 2

    if not args.reviews_file.exists():
        print(f"File not found: {args.reviews_file}", file=sys.stderr)
        return 2

    reviews = json.loads(args.reviews_file.read_text(encoding="utf-8"))
    if not isinstance(reviews, list):
        print("Expected a JSON array.", file=sys.stderr)
        return 2

    notion = Notion(token)
    ok = failed = 0

    for entry in reviews:
        page_id = entry.get("page_id", "")
        feedback = entry.get("feedback", "").strip()
        title = entry.get("title", page_id)
        priority = entry.get("ai_suggested_priority", "")
        effort = entry.get("ai_expected_effort", "")

        if not page_id or not feedback:
            print(f"  ! skipping entry with missing page_id or feedback")
            failed += 1
            continue

        try:
            result = push_review(notion, page_id, feedback, priority, effort, args.dry_run)
            print(f"  {'~' if 'replace' in result else '+'} {title}: {result}")
            ok += 1
        except Exception as e:
            print(f"  ! {title}: {e}", file=sys.stderr)
            failed += 1

    print(f"\nDone. ok={ok} failed={failed}")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
