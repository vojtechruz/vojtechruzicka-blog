"""
One-time script: insert **Reviewed:** YYYY-MM-DD HH:MM UTC into existing review
files that pre-date the timestamp feature. Safe to re-run — skips files that
already have the line.
"""

import os
import re
import sys
from datetime import datetime, timezone

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REVIEWS_BASE = os.path.join(SCRIPT_DIR, 'idea-reviews')

PRIORITY_FOLDERS = ['1-very-high', '2-high', '3-medium', '4-low', '5-very-low', '6-on-ice']


def main():
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    if len(sys.argv) > 1:
        timestamp = sys.argv[1]

    updated = skipped = 0
    for folder in PRIORITY_FOLDERS:
        folder_path = os.path.join(REVIEWS_BASE, folder)
        if not os.path.isdir(folder_path):
            continue
        for filename in sorted(os.listdir(folder_path)):
            if not filename.endswith('.md'):
                continue
            filepath = os.path.join(folder_path, filename)
            with open(filepath, encoding='utf-8') as f:
                content = f.read()

            if '**Reviewed:**' in content:
                skipped += 1
                continue

            # Insert after the H1 line
            new_content = re.sub(
                r'^(# .+\n)',
                rf'\1\n**Reviewed:** {timestamp}\n',
                content,
                count=1,
                flags=re.MULTILINE,
            )
            if new_content == content:
                print(f"  ! no H1 found in {filename}", file=sys.stderr)
                skipped += 1
                continue

            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            updated += 1

    print(f"Done. updated={updated} skipped={skipped}")


if __name__ == '__main__':
    main()
