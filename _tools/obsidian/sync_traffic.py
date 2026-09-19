#!/usr/bin/env python3
"""
Write Plausible traffic into the Obsidian "Blog Articles" notes.

For every published article note (matched by its `Path` frontmatter):
  * `Views 6mo` frontmatter — pageviews over the last 6 full months, sortable
    in Blog Articles.base;
  * a collapsed `> [!info]- # Traffic` callout at the top of the note body with
    monthly pageviews for the last M full months (default 12) and a text bar
    chart, so the trend is visible at a glance.

The current (incomplete) month is left out so months compare fairly. Months
before the article was published, or before Plausible has any data for the
site, are skipped. Two Stats API queries in total, whatever the number of posts.

The API key is shared with the vault's `plausible-blog` skill:
  ~/.plausible/config.json  {"api_key": "...", "site_id": "vojtechruzicka.com"}
or env PLAUSIBLE_API_KEY / PLAUSIBLE_SITE_ID (take precedence).

Usage:
    python sync_traffic.py [--months 12] [--dry-run]
"""

import argparse
import datetime
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

from config import ARTICLES_DIR, TRAFFIC_CALLOUT_TITLE, VIEWS_MONTHS, VIEWS_PROP
import vault_reviews as vr

API_URL = "https://plausible.io/api/v2/query"
CONFIG_PATH = Path.home() / ".plausible" / "config.json"
DEFAULT_SITE_ID = "vojtechruzicka.com"

BAR_WIDTH = 20


# --- Plausible --------------------------------------------------------------

def load_plausible_config() -> tuple[str, str]:
    cfg = {}
    if CONFIG_PATH.exists():
        cfg = json.loads(CONFIG_PATH.read_text(encoding="utf-8-sig"))
    api_key = os.environ.get("PLAUSIBLE_API_KEY") or cfg.get("api_key")
    site_id = os.environ.get("PLAUSIBLE_SITE_ID") or cfg.get("site_id") or DEFAULT_SITE_ID
    if not api_key:
        raise SystemExit(f"Missing Plausible API key: create a Stats API key in Plausible and "
                         f"save it to {CONFIG_PATH} as {{\"api_key\": \"...\", \"site_id\": \"{DEFAULT_SITE_ID}\"}}")
    return api_key, site_id


def query(body: dict) -> list:
    api_key, site_id = load_plausible_config()
    req = urllib.request.Request(
        API_URL,
        data=json.dumps({"site_id": site_id, **body}).encode("utf-8"),
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read().decode("utf-8")).get("results", [])
    except urllib.error.HTTPError as e:
        raise SystemExit(f"Plausible HTTP {e.code}: {e.read().decode('utf-8', 'replace')}")


# --- months -----------------------------------------------------------------

def add_months(d: datetime.date, n: int) -> datetime.date:
    m = d.month - 1 + n
    return datetime.date(d.year + m // 12, m % 12 + 1, 1)


def full_months(count: int, today: datetime.date) -> list[str]:
    """The last `count` complete months as 'YYYY-MM', oldest first."""
    this_month = today.replace(day=1)
    return [add_months(this_month, -i).strftime("%Y-%m") for i in range(count, 0, -1)]


def normalize_path(p: str) -> str:
    p = str(p).strip().strip("/")
    return f"/{p}/" if p else "/"


# --- rendering --------------------------------------------------------------

def fmt(n: int) -> str:
    return f"{n:,}"


def trend(views: dict, months: list[str], span: int = 3) -> str:
    """Last `span` months vs the `span` before them."""
    recent = [m for m in months[-span:] if m in views]
    before = [m for m in months[-2 * span:-span] if m in views]
    if len(recent) < span or len(before) < span:
        return ""
    cur, prev = sum(views[m] for m in recent), sum(views[m] for m in before)
    if not prev:
        return "new" if cur else ""
    pct = (cur - prev) / prev * 100
    arrow = "▲" if pct > 0.5 else "▼" if pct < -0.5 else "="
    return f"{arrow} {pct:+.0f} %"


def build_traffic_callout(views: dict, months: list[str], sum_months: int,
                          total: int, today: datetime.date) -> str:
    """views: {'YYYY-MM': pageviews} for the months that are shown."""
    shown = [m for m in months if m in views]
    peak = max((views[m] for m in shown), default=0)
    summary = f"**Last {sum_months} months:** {fmt(total)} views"
    t = trend(views, months)
    if t:
        summary += f" · **last 3 vs previous 3:** {t}"
    lines = [f"> [!info]- # {TRAFFIC_CALLOUT_TITLE}",
             f"> **Updated:** {today.isoformat()} · Plausible pageviews, full months",
             ">",
             f"> {summary}"]
    if shown:
        lines += [">", "> | Month | Views | |", "> | --- | --: | --- |"]
        for m in shown:
            bar = "█" * round(views[m] / peak * BAR_WIDTH) if peak else ""
            lines.append(f"> | {m} | {fmt(views[m])} | {bar} |")
    return "\n".join(lines)


def put_callout_on_top(post, callout: str) -> None:
    body = vr.strip_callout(post.content, TRAFFIC_CALLOUT_TITLE).strip("\n")
    post.content = f"{callout}\n\n{body}" if body else callout


# --- main -------------------------------------------------------------------

def load_articles() -> list:
    """(note path, post, normalized path, publish month) for published articles."""
    out = []
    for note in sorted(ARTICLES_DIR.glob("*.md")):
        try:
            post = vr.load_note(note)
        except Exception:
            continue
        if not post.get("Path") or str(post.get("Draft Status", "")) == "Draft":
            continue
        published = str(post.get("Date", ""))[:7]
        out.append((note, post, normalize_path(post["Path"]), published))
    return out


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    ap = argparse.ArgumentParser()
    ap.add_argument("--months", type=int, default=12, help="full months shown in the callout")
    ap.add_argument("--dry-run", action="store_true", help="print, don't write notes")
    args = ap.parse_args()

    today = datetime.date.today()
    months = full_months(max(args.months, VIEWS_MONTHS), today)
    date_range = [f"{months[0]}-01",
                  (today.replace(day=1) - datetime.timedelta(days=1)).isoformat()]

    articles = load_articles()
    if not articles:
        print(f"No published article notes in {ARTICLES_DIR}", file=sys.stderr)
        return 2

    # Months with any data for the whole site = months Plausible was running.
    site = query({"metrics": ["pageviews"], "date_range": date_range,
                  "dimensions": ["time:month"]})
    tracked = {r["dimensions"][0][:7] for r in site if r["metrics"][0]}
    if not tracked:
        print("Plausible has no data for this period — nothing to write.")
        return 0

    # Pages are stored as requested; cover both slash variants and merge them.
    variants = sorted({v for _, _, p, _ in articles for v in (p, p.rstrip("/"))})
    rows = query({"metrics": ["pageviews"], "date_range": date_range,
                  "dimensions": ["event:page", "time:month"],
                  "filters": [["is", "event:page", variants]],
                  "pagination": {"limit": 10000}})
    by_page: dict[str, dict] = {}
    for r in rows:
        page, month = normalize_path(r["dimensions"][0]), r["dimensions"][1][:7]
        by_page.setdefault(page, {})
        by_page[page][month] = by_page[page].get(month, 0) + r["metrics"][0]

    shown_months = months[-args.months:]
    sum_window = months[-VIEWS_MONTHS:]
    if not set(sum_window) <= tracked:
        first = min(tracked)
        print(f"Note: Plausible data starts {first}; `{VIEWS_PROP}` covers fewer than "
              f"{VIEWS_MONTHS} months until then.", file=sys.stderr)

    written = 0
    ranking = []
    for note, post, path, published in articles:
        page = by_page.get(path, {})
        live = [m for m in months if m in tracked and (not published or m >= published)]
        views = {m: page.get(m, 0) for m in live}
        total = sum(views.get(m, 0) for m in sum_window)
        ranking.append((total, note.stem))
        if args.dry_run:
            continue
        post[VIEWS_PROP] = total
        put_callout_on_top(post, build_traffic_callout(
            {m: v for m, v in views.items() if m in shown_months},
            shown_months, VIEWS_MONTHS, total, today))
        vr.dump_note(post, note)
        written += 1

    ranking.sort(reverse=True)
    print(f"{VIEWS_PROP}, {sum_window[0]} .. {sum_window[-1]} — top 10:")
    for total, title in ranking[:10]:
        print(f"  {fmt(total):>8}  {title}")
    zero = sum(1 for total, _ in ranking if not total)
    print(f"\n{'Would write' if args.dry_run else 'Wrote'} {len(articles) if args.dry_run else written} "
          f"article note(s); {zero} with no views in the window.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
