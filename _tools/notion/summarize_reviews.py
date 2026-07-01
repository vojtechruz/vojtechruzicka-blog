"""
Read all idea review files from _tools/notion/idea-reviews/ and emit a compact JSON
summary array to stdout. Used by the suggest-next skill.
"""

import json
import os
import re
import sys

PRIORITY_MAP = {
    '1-very-high': 'Very High',
    '2-high': 'High',
    '3-medium': 'Medium',
    '4-low': 'Low',
    '5-very-low': 'Very Low',
    '6-on-ice': 'On Ice',
    '7-suggested-deletion': 'Suggested Deletion',
}

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REVIEWS_BASE = os.path.join(SCRIPT_DIR, 'idea-reviews')


def parse_review(content, filepath, priority_folder):
    result = {}

    title_match = re.search(r'^# (.+)$', content, re.MULTILINE)
    result['title'] = title_match.group(1).strip() if title_match else ''

    reviewed_match = re.search(r'^\*\*Reviewed:\*\*\s*(.+)$', content, re.MULTILINE)
    result['reviewed_at'] = reviewed_match.group(1).strip() if reviewed_match else None

    result['filename'] = os.path.basename(filepath)
    result['filepath'] = filepath.replace('\\', '/')
    result['priority'] = PRIORITY_MAP.get(priority_folder, priority_folder)

    # Tag from filename prefix (e.g. "spring" from "spring-spring-async.md")
    basename = os.path.basename(filepath)
    result['tag'] = basename.split('-')[0] if '-' in basename else 'untagged'

    effort_match = re.search(r'\*\*AI Expected Effort:\*\*\s*(Low|Medium|High|N/A)', content)
    result['effort'] = effort_match.group(1) if effort_match else 'Medium'

    time_match = re.search(
        r'\*\*Time sensitivity:\*\*\s*(Evergreen|Fades slowly|Time-sensitive|Expires soon|Expired)',
        content
    )
    ts = time_match.group(1) if time_match else 'Evergreen'
    if ts == 'Expired':
        ts = 'Expires soon'
    result['time_sensitivity'] = ts

    series_match = re.search(r'\*\*Series fit:\*\*\s*(.+)$', content, re.MULTILINE)
    series_val = series_match.group(1).strip() if series_match else 'none'
    result['series_fit'] = series_val
    result['has_series_fit'] = not series_val.lower().startswith('none')

    angle_match = re.search(r'\*\*Suggested angle:\*\*\s*(.+)$', content, re.MULTILINE)
    result['suggested_angle'] = angle_match.group(1).strip() if angle_match else ''

    # Learning alignment section — bounded by next bold section header
    learning_match = re.search(
        r'\*\*Learning alignment\*\*\s*\n(.*?)\n\n\*\*',
        content,
        re.DOTALL
    )
    if learning_match:
        learning_text = learning_match.group(1).strip()
        result['learning_aligned'] = not bool(re.match(r'^[Nn]one', learning_text))
        result['learning_text'] = learning_text
    else:
        result['learning_aligned'] = False
        result['learning_text'] = ''

    # Concerns — bullet list at end of file
    concerns_match = re.search(r'\*\*Concerns:\*\*\s*\n(.*?)$', content, re.DOTALL)
    if concerns_match:
        concerns_text = concerns_match.group(1).strip()
        if re.match(r'^-?\s*none\s*$', concerns_text, re.IGNORECASE):
            result['concerns'] = []
        else:
            bullets = re.findall(r'^-\s+(.+)$', concerns_text, re.MULTILINE)
            result['concerns'] = bullets
    else:
        result['concerns'] = []

    result['has_concerns'] = len(result['concerns']) > 0

    return result


def main():
    # Ensure UTF-8 output regardless of Windows console encoding
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')

    if not os.path.isdir(REVIEWS_BASE):
        print(f'ERROR: reviews directory not found: {REVIEWS_BASE}', file=sys.stderr)
        sys.exit(1)

    results = []
    for folder_name in sorted(os.listdir(REVIEWS_BASE)):
        folder_path = os.path.join(REVIEWS_BASE, folder_name)
        if not os.path.isdir(folder_path) or folder_name not in PRIORITY_MAP:
            continue
        for filename in sorted(os.listdir(folder_path)):
            if not filename.endswith('.md'):
                continue
            filepath = os.path.join(folder_path, filename)
            with open(filepath, encoding='utf-8') as f:
                content = f.read()
            item = parse_review(content, filepath, folder_name)
            item['priority_folder'] = folder_name
            results.append(item)

    print(json.dumps(results, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
