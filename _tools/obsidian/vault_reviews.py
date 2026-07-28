#!/usr/bin/env python3
"""
Shared helpers for reading and writing Obsidian vault notes.

The AI review/feedback lives inside a note as an Obsidian callout:

    > [!note]+ # AI Feedback
    > **Reviewed:** 2026-07-17 10:00 UTC
    >
    > ...review body, every line prefixed with "> "...

Obsidian callouts are just blockquotes, so writing one is a line-prefix
operation — this replaces the old markdown -> Notion-blocks converters.

All frontmatter reads/writes go through here so that:
  * files are always read and written as UTF-8 with LF newlines, and
  * frontmatter key order is preserved (yaml sort_keys=False).
"""

from __future__ import annotations

import re
from datetime import datetime, timezone
from pathlib import Path

import frontmatter


def now_utc() -> str:
    """Current timestamp in the `YYYY-MM-DD HH:MM UTC` format used in callouts."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")


# --- note I/O ---------------------------------------------------------------

def load_note(path) -> frontmatter.Post:
    text = Path(path).read_text(encoding="utf-8")
    return frontmatter.loads(text)


def dump_note(post: frontmatter.Post, path) -> None:
    # sort_keys=False keeps the frontmatter in its original order.
    text = frontmatter.dumps(post, sort_keys=False)
    if not text.endswith("\n"):
        text += "\n"
    with open(path, "w", encoding="utf-8", newline="\n") as fd:
        fd.write(text)


def set_props(post: frontmatter.Post, props: dict) -> None:
    """Set frontmatter properties, skipping empty values (never clears a field)."""
    for key, value in props.items():
        if value is None or value == "":
            continue
        post[key] = value


# --- callout splicing -------------------------------------------------------

_CALLOUT_HEADER = re.compile(r"^\s*>\s*\[!(?P<kind>[^\]]+)\][+-]?\s*(?P<rest>.*)$")


def _header_title(line: str) -> str | None:
    """Return the title of a callout header line, else None.

    Matches e.g. `> [!note]+ # AI Feedback` -> "AI Feedback" (the leading `#`
    that Obsidian uses to render the title as a heading is stripped)."""
    m = _CALLOUT_HEADER.match(line)
    if not m:
        return None
    return m.group("rest").strip().lstrip("#").strip()


def has_callout(body: str, title: str) -> bool:
    return any(_header_title(line) == title for line in body.splitlines())


def strip_callout(body: str, title: str) -> str:
    """Remove the callout with the given title (header + all its `>` lines)."""
    lines = body.splitlines()
    out: list[str] = []
    i, n = 0, len(lines)
    while i < n:
        if _header_title(lines[i]) == title:
            i += 1
            while i < n and lines[i].lstrip().startswith(">"):
                i += 1
            continue
        out.append(lines[i])
        i += 1
    return "\n".join(out)


def build_callout(title: str, feedback_md: str, timestamp: str | None = None) -> str:
    """Render review markdown as a `> [!note]+ # {title}` callout block."""
    feedback = feedback_md.strip()
    if not feedback.startswith("**Reviewed:**"):
        feedback = f"**Reviewed:** {timestamp or now_utc()}\n\n{feedback}"
    lines = [f"> [!note]+ # {title}"]
    for line in feedback.split("\n"):
        lines.append(f"> {line}" if line.strip() else ">")
    return "\n".join(lines)


def apply_callout(post: frontmatter.Post, title: str, feedback_md: str,
                  timestamp: str | None = None) -> bool:
    """Replace (or append) the callout in `post.content`. Returns True if one
    already existed and was replaced."""
    existed = has_callout(post.content, title)
    body = strip_callout(post.content, title).rstrip()
    callout = build_callout(title, feedback_md, timestamp)
    post.content = f"{body}\n\n{callout}" if body else callout
    return existed


def splice_callout(path, title: str, feedback_md: str,
                   timestamp: str | None = None, dry_run: bool = False) -> str:
    """Convenience: load a note, splice the callout, write it back."""
    post = load_note(path)
    if dry_run:
        return "replace" if has_callout(post.content, title) else "append"
    existed = apply_callout(post, title, feedback_md, timestamp)
    dump_note(post, path)
    return "replaced" if existed else "appended"


def read_callout(body: str, title: str) -> str:
    """Return the inner text of a callout (the `>` prefixes removed), or ''."""
    lines = body.splitlines()
    i, n = 0, len(lines)
    while i < n:
        if _header_title(lines[i]) == title:
            i += 1
            inner: list[str] = []
            while i < n and lines[i].lstrip().startswith(">"):
                stripped = re.sub(r"^\s*>\s?", "", lines[i])
                inner.append(stripped)
                i += 1
            return "\n".join(inner).strip()
        i += 1
    return ""
