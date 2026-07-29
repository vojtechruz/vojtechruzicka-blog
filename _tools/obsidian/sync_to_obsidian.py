#!/usr/bin/env python3
"""
Sync blog markdown posts into the Obsidian "Blog Articles" notes.

For each post under the given directory, upsert an article note in
ARTICLES_DIR, matched by the `Slug` frontmatter property:
  * existing note (slug matches) -> update the metadata frontmatter in place,
    preserving human-owned tracking fields (Status, Priority, Last reviewed),
    the computed Days Since / URL fields, and the `# AI Review` callout body.
  * no match -> create a new note named after the post title, linked into the
    Blog Articles Base.

Usage:
    python sync_to_obsidian.py /path/to/blog/src/posts [--dry-run]
"""

import argparse
import datetime
import re
import sys
from pathlib import Path

import frontmatter

from config import ARTICLES_DIR, ARTICLES_BASE_LINK
import vault_reviews as vr

# The only frontmatter this script owns. Everything else on an existing note
# (tracking fields, Days Since *, URL, the AI Review callout) is left untouched.
OWNED_PROPS = ["Slug", "Path", "Date", "Date Modified", "Topics", "Excerpt",
               "Series", "Draft Status"]

IGNORED_FILES = {"review.md"}
_INVALID_FN = re.compile(r'[<>:"/\\|?*]')


def slug_from_path(path_value) -> str:
    """'/gatsby-build-netlify-plugins/' -> 'gatsby-build-netlify-plugins'."""
    if not path_value:
        return ""
    return str(path_value).strip("/").strip()


def as_date(value):
    """Coerce a frontmatter date-ish value to a datetime.date (YAML renders it
    unquoted, matching the imported notes), or None."""
    if value in (None, ""):
        return None
    if isinstance(value, datetime.datetime):
        return value.date()
    if isinstance(value, datetime.date):
        return value
    m = re.match(r"(\d{4}-\d{2}-\d{2})", str(value).strip())
    return datetime.date.fromisoformat(m.group(1)) if m else str(value).strip()


def build_props(fm: dict, slug: str) -> dict:
    """Build the owned frontmatter props from a post's frontmatter."""
    props: dict = {"Slug": slug}
    if fm.get("path"):
        props["Path"] = str(fm["path"])
    d = as_date(fm.get("date"))
    if d:
        props["Date"] = d
    dm = as_date(fm.get("dateModified"))
    if dm:
        props["Date Modified"] = dm
    topics = fm.get("topics")
    if topics:
        props["Topics"] = topics if isinstance(topics, list) else [topics]
    if fm.get("excerpt"):
        props["Excerpt"] = str(fm["excerpt"])
    series = fm.get("series")
    if series:
        props["Series"] = str(series).replace("-", " ").title()
    props["Draft Status"] = (
        "Draft" if str(fm.get("draftStatus", "")).lower() == "draft" else "Published"
    )
    return props


def sanitize_filename(name: str) -> str:
    cleaned = _INVALID_FN.sub("", name).strip().rstrip(".")
    return cleaned or "Untitled"


def collect_posts(root: Path) -> list[Path]:
    return sorted(
        p for p in root.rglob("*.md") if p.name not in IGNORED_FILES
    )


def index_articles(articles_dir: Path) -> dict:
    """Map Slug -> note Path for existing article notes."""
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


def update_note(note_path: Path, props: dict) -> None:
    post = vr.load_note(note_path)
    post["base"] = ARTICLES_BASE_LINK
    vr.set_props(post, props)
    vr.dump_note(post, note_path)


def create_note(articles_dir: Path, title: str, slug: str, props: dict) -> Path:
    articles_dir.mkdir(parents=True, exist_ok=True)
    target = articles_dir / f"{sanitize_filename(title)}.md"
    if target.exists():
        target = articles_dir / f"{sanitize_filename(title)}-{slug}.md"
    post = frontmatter.Post("")
    post["base"] = ARTICLES_BASE_LINK
    vr.set_props(post, props)
    vr.dump_note(post, target)
    return target


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("posts_dir", type=Path,
                    help="Directory containing blog markdown posts")
    ap.add_argument("--dry-run", action="store_true",
                    help="Show what would happen without writing any notes")
    args = ap.parse_args()

    if not args.posts_dir.is_dir():
        print(f"Not a directory: {args.posts_dir}", file=sys.stderr)
        return 2

    files = collect_posts(args.posts_dir)
    by_slug = index_articles(ARTICLES_DIR)
    print(f"Found {len(files)} post file(s); "
          f"{len(by_slug)} existing article note(s) in {ARTICLES_DIR}")

    created = updated = skipped = 0
    for f in files:
        post = frontmatter.loads(f.read_text(encoding="utf-8"))
        fm = post.metadata
        slug = slug_from_path(fm.get("path")) or f.stem
        if not slug:
            print(f"  ! skipping {f} (no slug or path)")
            skipped += 1
            continue

        title = str(fm.get("title", "")).strip() or slug
        props = build_props(fm, slug)

        if slug in by_slug:
            if not args.dry_run:
                update_note(by_slug[slug], props)
            print(f"  ~ updated: {slug}")
            updated += 1
        else:
            if not args.dry_run:
                created_path = create_note(ARTICLES_DIR, title, slug, props)
                print(f"  + created: {slug}  ({created_path.name})")
            else:
                print(f"  + would create: {slug}  ({sanitize_filename(title)}.md)")
            created += 1

    verb = "would sync" if args.dry_run else "Done."
    print(f"\n{verb} created={created} updated={updated} skipped={skipped}")
    print("(Article notes without a matching post were left alone.)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
