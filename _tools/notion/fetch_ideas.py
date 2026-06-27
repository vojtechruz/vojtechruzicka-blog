#!/usr/bin/env python3
"""
Fetch blog post ideas from a Notion database and optionally existing post metadata.

Also ensures the database has the AI Suggested Priority and AI Expected Effort
select properties so the push script can write them back.

Usage:
    python fetch_ideas.py [--posts-dir PATH]

Outputs JSON with keys: ideas, existing_posts (if --posts-dir given).
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path

import frontmatter
import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

NOTION_VERSION = "2022-06-28"
API = "https://api.notion.com/v1"
AI_FEEDBACK_HEADING = "AI Feedback"


def _plain(rich_text: list) -> str:
    return "".join(i.get("plain_text", "") for i in rich_text).strip()


def _title_prop(prop: dict) -> str:
    return _plain(prop.get("title", []))


def _select(prop: dict) -> str:
    s = prop.get("select")
    return s["name"] if s else ""


def _multi_select(prop: dict) -> list[str]:
    return [o["name"] for o in prop.get("multi_select", [])]


def _checkbox(prop: dict) -> bool:
    return bool(prop.get("checkbox", False))


def _block_plain_text(block: dict) -> str:
    btype = block.get("type", "")
    rich_text = block.get(btype, {}).get("rich_text", [])
    return "".join(t.get("plain_text", "") for t in rich_text)


def _is_ai_feedback_block(block: dict) -> bool:
    btype = block.get("type", "")
    is_toggleable = block.get(btype, {}).get("is_toggleable", False)
    return _block_plain_text(block).strip() == AI_FEEDBACK_HEADING and is_toggleable


def _extract_body_text(blocks: list[dict]) -> str:
    lines = []
    for block in blocks:
        if _is_ai_feedback_block(block):
            continue
        text = _block_plain_text(block).strip()
        if text:
            lines.append(text)
    return "\n".join(lines)


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

    def query_all(self, database_id: str) -> list[dict]:
        results, cursor = [], None
        while True:
            body: dict = {"page_size": 100}
            if cursor:
                body["start_cursor"] = cursor
            data = self._req("POST", f"/databases/{database_id}/query", json=body)
            results.extend(data["results"])
            if not data.get("has_more"):
                return results
            cursor = data["next_cursor"]

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

    def ensure_db_schema(self, db_id: str) -> None:
        """Add AI Suggested Priority and AI Expected Effort select properties if missing."""
        self._req("PATCH", f"/databases/{db_id}", json={
            "properties": {
                "AI Suggested Priority": {
                    "select": {
                        "options": [
                            {"name": "Very High", "color": "red"},
                            {"name": "High", "color": "orange"},
                            {"name": "Medium", "color": "blue"},
                            {"name": "Low", "color": "purple"},
                            {"name": "Very Low", "color": "brown"},
                            {"name": "On Ice", "color": "gray"},
                        ]
                    }
                },
                "AI Expected Effort": {
                    "select": {
                        "options": [
                            {"name": "Low", "color": "green"},
                            {"name": "Medium", "color": "yellow"},
                            {"name": "High", "color": "red"},
                        ]
                    }
                },
            }
        })

    def query_filtered(self, database_id: str, filter_body: dict) -> list[dict]:
        results, cursor = [], None
        while True:
            body: dict = {"page_size": 100, "filter": filter_body}
            if cursor:
                body["start_cursor"] = cursor
            data = self._req("POST", f"/databases/{database_id}/query", json=body)
            results.extend(data["results"])
            if not data.get("has_more"):
                return results
            cursor = data["next_cursor"]


def _extract_idea(page: dict, body_text: str = "") -> dict:
    props = page["properties"]
    title_prop = next((v for v in props.values() if v["type"] == "title"), {})
    return {
        "id": page["id"],
        "title": _title_prop(title_prop),
        "tags": _multi_select(props.get("Tags", {})),
        "priority": _select(props.get("Priority", {})),
        "is_starred": _checkbox(props.get("Star", {})),
        "body_text": body_text,
    }


def fetch_learning_items(notion: Notion, db_id: str) -> list[dict]:
    """Fetch Development-category, non-Done items from the learning list."""
    filter_body = {
        "and": [
            {"property": "Category", "select": {"equals": "Development"}},
            {"property": "Status", "status": {"does_not_equal": "Done"}},
        ]
    }
    pages = notion.query_filtered(db_id, filter_body)
    items = []
    for page in pages:
        props = page["properties"]
        title_prop = next((v for v in props.values() if v["type"] == "title"), {})
        items.append({
            "title": _title_prop(title_prop),
            "tags": _multi_select(props.get("Tags", {})),
            "priority": _select(props.get("Priority", {})),
            "status": props.get("Status", {}).get("status", {}).get("name", ""),
        })
    return items


def collect_posts(posts_dir: Path) -> list[dict]:
    posts = []
    for md in sorted(posts_dir.rglob("*.md")):
        if md.name == "review.md":
            continue
        try:
            post = frontmatter.load(md)
        except Exception:
            continue
        fm = post.metadata
        if not fm.get("title"):
            continue
        posts.append({
            "title": str(fm.get("title", "")),
            "topics": fm.get("topics", []) if isinstance(fm.get("topics"), list) else [fm.get("topics")] if fm.get("topics") else [],
            "date": str(fm.get("date", "")),
            "series": str(fm.get("series", "")),
            "excerpt": str(fm.get("excerpt", "")),
            "draft": bool(fm.get("draftStatus") == "draft" or fm.get("draft", False)),
        })
    return posts


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--posts-dir", type=Path,
                    help="Path to blog posts directory to include existing post metadata")
    args = ap.parse_args()

    token = os.environ.get("NOTION_TOKEN", "")
    db_id = os.environ.get("NOTION_IDEAS_DB_ID", "")
    if not token or not db_id:
        print("Set NOTION_TOKEN and NOTION_IDEAS_DB_ID env vars.", file=sys.stderr)
        return 2

    notion = Notion(token)

    print("Ensuring database schema…", file=sys.stderr)
    notion.ensure_db_schema(db_id)

    pages = notion.query_all(db_id)

    ideas = []
    for page in pages:
        blocks = notion.get_block_children(page["id"])
        body_text = _extract_body_text(blocks)
        ideas.append(_extract_idea(page, body_text))

    learning_db_id = os.environ.get("NOTION_LEARNING_DB_ID", "")
    if learning_db_id:
        print("Fetching learning list…", file=sys.stderr)
        output_learning = fetch_learning_items(notion, learning_db_id)
    else:
        output_learning = []

    output: dict = {"ideas": ideas, "learning_items": output_learning}

    if args.posts_dir:
        if not args.posts_dir.is_dir():
            print(f"Not a directory: {args.posts_dir}", file=sys.stderr)
            return 2
        output["existing_posts"] = collect_posts(args.posts_dir)

    print(json.dumps(output, indent=2, default=str))
    return 0


if __name__ == "__main__":
    sys.exit(main())
