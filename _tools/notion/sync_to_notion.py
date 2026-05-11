#!/usr/bin/env python3
"""
Sync blog markdown files to a Notion database.
/
On first run, creates the database under the configured parent page.
On subsequent runs, upserts pages (matched by Slug) and overwrites
frontmatter-derived fields. Tracking fields (Status, Priority,
Last reviewed) are never touched after the page is created.

Usage:
    export NOTION_TOKEN=ntn_...
    export NOTION_PARENT_PAGE_ID=<page-id>
    python sync_to_notion.py /path/to/blog/posts
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Any

import frontmatter
import requests

NOTION_VERSION = "2022-06-28"
API = "https://api.notion.com/v1"

# Where the database ID is cached after first run, so we don't recreate it.
STATE_FILE = Path(__file__).parent / ".notion_sync_state.json"

# Frontmatter -> Notion property mapping. Tracking fields are added
# at DB-creation time but never written by this script after that.
DB_SCHEMA = {
    "Title": {"title": {}},
    "Slug": {"rich_text": {}},  # used as unique key for matching
    "Date": {"date": {}},
    "Date Modified": {"date": {}},
    "Topics": {"multi_select": {}},
    "Path": {"rich_text": {}},
    "Excerpt": {"rich_text": {}},
    "Days Since Modified": {
        "formula": {
            "expression": 'if(empty(prop("Date Modified")), toNumber(""), '
                          'dateBetween(now(), prop("Date Modified"), "days"))'
        }
    },
    "Series": {"select": {}},
    "Draft Status": {
        "select": {
            "options": [
                {"name": "Published", "color": "green"},
                {"name": "Draft", "color": "gray"},
            ]
        }
    },
    "Status": {
        "select": {
            "options": [
                {"name": "OK", "color": "green"},
                {"name": "Needs update", "color": "yellow"},
                {"name": "Outdated", "color": "red"},
                {"name": "Expand", "color": "blue"},
            ]
        }
    },
    "Priority": {
        "select": {
            "options": [
                {"name": "High", "color": "red"},
                {"name": "Med", "color": "yellow"},
                {"name": "Low", "color": "default"},
            ]
        }
    },
    "Last reviewed": {"date": {}},
}

# These are the only properties the sync script writes on update.
# Everything else (tracking fields) is left alone.
FRONTMATTER_PROPS = {"Title", "Slug", "Date", "Date Modified",
                     "Topics", "Path", "Excerpt", "Series", "Draft Status"}


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
                print(f"Notion API error {r.status_code} {method} {path}: {r.text}", file=sys.stderr)
                r.raise_for_status()
            return r.json()
        r.raise_for_status()  # exhausted retries

    def create_database(self, parent_page_id: str, title: str) -> dict:
        body = {
            "parent": {"type": "page_id", "page_id": parent_page_id},
            "title": [{"type": "text", "text": {"content": title}}],
            "properties": DB_SCHEMA,
        }
        return self._req("POST", "/databases", data=json.dumps(body))

    def query_all(self, database_id: str) -> list[dict]:
        results, cursor = [], None
        while True:
            body = {"page_size": 100}
            if cursor:
                body["start_cursor"] = cursor
            data = self._req("POST", f"/databases/{database_id}/query",
                             data=json.dumps(body))
            results.extend(data["results"])
            if not data.get("has_more"):
                return results
            cursor = data["next_cursor"]

    def create_page(self, database_id: str, properties: dict) -> dict:
        body = {"parent": {"database_id": database_id}, "properties": properties}
        return self._req("POST", "/pages", data=json.dumps(body))

    def update_page(self, page_id: str, properties: dict) -> dict:
        body = {"properties": properties}
        return self._req("PATCH", f"/pages/{page_id}", data=json.dumps(body))


def load_state() -> dict:
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {}


def save_state(state: dict) -> None:
    STATE_FILE.write_text(json.dumps(state, indent=2))


def slug_from_path(p: Any) -> str:
    """Normalize a frontmatter `path` like '/gatsby-build-netlify-plugins/'
    into a stable slug 'gatsby-build-netlify-plugins'."""
    if not p:
        return ""
    return str(p).strip("/").strip()


def fm_to_properties(fm: dict, fallback_slug: str) -> dict:
    """Convert frontmatter dict into Notion property payload.
    Only writes FRONTMATTER_PROPS — tracking fields are left untouched."""
    title = str(fm.get("title", "")).strip() or fallback_slug
    slug = slug_from_path(fm.get("path")) or fallback_slug

    props: dict[str, Any] = {
        "Title": {"title": [{"text": {"content": title}}]},
        "Slug": {"rich_text": [{"text": {"content": slug}}]},
    }

    if fm.get("date"):
        props["Date"] = {"date": {"start": str(fm["date"])}}
    if fm.get("dateModified"):
        props["Date Modified"] = {"date": {"start": str(fm["dateModified"])}}
    if fm.get("topics"):
        topics = fm["topics"] if isinstance(fm["topics"], list) else [fm["topics"]]
        props["Topics"] = {"multi_select": [{"name": str(t)} for t in topics]}
    if fm.get("path"):
        props["Path"] = {"rich_text": [{"text": {"content": str(fm["path"])}}]}
    if fm.get("excerpt"):
        props["Excerpt"] = {"rich_text": [{"text": {"content": str(fm["excerpt"])}}]}

    series_slug = fm.get("series", "")
    if series_slug:
        props["Series"] = {"select": {"name": series_slug.replace("-", " ").title()}}

    draft_label = "Draft" if str(fm.get("draftStatus", "")).lower() == "draft" else "Published"
    props["Draft Status"] = {"select": {"name": draft_label}}

    return props


def get_slug_from_page(page: dict) -> str:
    rt = page["properties"].get("Slug", {}).get("rich_text", [])
    return rt[0]["plain_text"] if rt else ""


def collect_markdown(root: Path) -> list[Path]:
    return sorted([p for p in root.rglob("*.md")] +
                  [p for p in root.rglob("*.mdx")])


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("posts_dir", type=Path,
                    help="Directory containing blog markdown files")
    ap.add_argument("--db-title", default="Blog Articles",
                    help="Database title (used only on first run)")
    ap.add_argument("--dry-run", action="store_true",
                    help="Don't call Notion API, just show what would happen")
    args = ap.parse_args()

    token = os.environ.get("NOTION_TOKEN", "")
    parent_page_id = os.environ.get("NOTION_PARENT_PAGE_ID", "")
    if not token or not parent_page_id:
        print("Set NOTION_TOKEN and NOTION_PARENT_PAGE_ID env vars.",
              file=sys.stderr)
        return 2

    if not args.posts_dir.is_dir():
        print(f"Not a directory: {args.posts_dir}", file=sys.stderr)
        return 2

    files = collect_markdown(args.posts_dir)
    print(f"Found {len(files)} markdown file(s) under {args.posts_dir}")

    if args.dry_run:
        for f in files:
            post = frontmatter.load(f)
            slug = slug_from_path(post.metadata.get("path")) or f.stem
            print(f"  - {f.name}  -> slug={slug!r}  "
                  f"title={post.metadata.get('title')!r}")
        return 0

    notion = Notion(token)
    state = load_state()
    db_id = state.get("database_id")

    if not db_id:
        print(f"Creating database '{args.db_title}' under page {parent_page_id}…")
        db = notion.create_database(parent_page_id, args.db_title)
        db_id = db["id"]
        state["database_id"] = db_id
        save_state(state)
        print(f"  created: {db_id}")
    else:
        print(f"Using existing database: {db_id}")

    # Build slug -> page_id index from existing rows.
    existing = notion.query_all(db_id)
    by_slug = {s: p["id"] for p in existing if (s := get_slug_from_page(p))}
    print(f"Database has {len(existing)} existing page(s).")

    created = updated = skipped = 0
    for f in files:
        post = frontmatter.load(f)
        fm = post.metadata
        fallback_slug = f.stem
        slug = slug_from_path(fm.get("path")) or fallback_slug
        if not slug:
            print(f"  ! skipping {f} (no slug or path)")
            skipped += 1
            continue

        props = fm_to_properties(fm, fallback_slug)

        if slug in by_slug:
            notion.update_page(by_slug[slug], props)
            print(f"  ~ updated: {slug}")
            updated += 1
        else:
            notion.create_page(db_id, props)
            print(f"  + created: {slug}")
            created += 1

    print(f"\nDone. created={created} updated={updated} skipped={skipped}")
    print("(Articles in Notion without a matching file were left alone.)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
