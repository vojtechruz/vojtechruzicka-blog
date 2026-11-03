// Turns the JSON of `npm run validate:links:external -- --format json` into the Markdown body of the
// "Broken external links" issue that .github/workflows/external-links.yml opens or updates.
//
//   node scripts/broken-links-report.mjs linkinator.json > report.md
//
// Exit code: 0 with a report when there are broken links, 2 when there are none (the workflow then closes
// the issue), 1 when the JSON cannot be read. docs/LINKS.md
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const SITE_URL = 'https://www.vojtechruzicka.com';
// GitHub refuses issue bodies over 65 536 characters
const MAX_BODY = 60000;

/** linkinator's parent is a path relative to _site ("css-flexbox/index.html", "css-flexbox\\" on Windows) */
export function pageUrl(parent, siteUrl = SITE_URL) {
  const path = String(parent ?? '')
    .replaceAll('\\', '/')
    .replace(/^\.?\/+/, '')
    .replace(/(^|\/)index\.html$/, '$1');
  return `${siteUrl}/${path}`;
}

function describeStatus(status) {
  // 0: no HTTP response at all - DNS failure, refused connection, timeout, TLS error
  return status ? String(status) : 'no response';
}

/** Broken links grouped by the page that links them, pages and links sorted for a stable diff between runs */
export function groupByPage(result, siteUrl = SITE_URL) {
  const pages = new Map();
  for (const link of result.links ?? []) {
    if (link.state !== 'BROKEN') {
      continue;
    }
    const page = pageUrl(link.parent, siteUrl);
    if (!pages.has(page)) {
      pages.set(page, new Map());
    }
    // The same link in a page counts once
    pages.get(page).set(link.url, describeStatus(link.status));
  }
  return [...pages.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([page, links]) => ({
      page,
      links: [...links.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([url, status]) => ({ url, status })),
    }));
}

/** The issue body, or null when nothing is broken */
export function formatReport(result, { siteUrl = SITE_URL, runUrl } = {}) {
  const pages = groupByPage(result, siteUrl);
  const total = pages.reduce((sum, { links }) => sum + links.length, 0);
  if (total === 0) {
    return null;
  }
  const header = [
    `The scheduled external link check found **${total} broken link${total === 1 ? '' : 's'}** on ` +
      `${pages.length} page${pages.length === 1 ? '' : 's'}.`,
    '',
    'Replace a link with its new address; when the whole site is gone, link a Wayback Machine snapshot from the ' +
      'time the article was written; drop a link only when it adds nothing. Sites that block bots belong in ' +
      '`skip` in `linkinator.config.external.json` (docs/LINKS.md).',
    '',
    ...(runUrl ? [`Run: ${runUrl}`, ''] : []),
  ];
  const footer = '\nThis issue is updated by every run and closed by the first run that finds nothing.\n';
  let body = header.join('\n');
  for (const { page, links } of pages) {
    const section = [`### ${page}`, '', ...links.map(({ url, status }) => `- \`${status}\` <${url}>`), ''].join('\n');
    if (body.length + section.length + footer.length > MAX_BODY) {
      body += `\n_…and more; the full list is in the run log._\n`;
      break;
    }
    body += `\n${section}`;
  }
  return body + footer;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  let result;
  try {
    result = JSON.parse(readFileSync(process.argv[2], 'utf-8'));
  } catch (error) {
    console.error(`Cannot read linkinator JSON from ${process.argv[2]}: ${error.message}`);
    process.exit(1);
  }
  const report = formatReport(result, { runUrl: process.env.RUN_URL });
  if (report === null) {
    process.exit(2);
  }
  process.stdout.write(report);
}
