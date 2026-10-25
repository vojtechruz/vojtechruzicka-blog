// Run the axe-core audit of tests/a11y.test.js over every page of the build, not just its sample of
// one page per kind. Articles differ by their markdown content (alt texts, heading levels, link
// texts, inline HTML), which the sample cannot cover. Too slow for `npm test`, so it runs on demand:
//
//   npm run build && npm run a11y:all            summary by rule, exit code 1 on any violation
//   npm run a11y:all -- --json report.json       also write every violating node to a file

import { writeFileSync } from 'fs';
import { globSync } from 'glob';
import { audit } from '../tests/axe-audit.js';
import { SITE_DIR } from '../tests/helpers.js';

// Search engine verification stub, not a page
const IGNORE = [`${SITE_DIR}/google*.html`, `${SITE_DIR}/pagefind/**`];

const urls = globSync(`${SITE_DIR}/**/*.html`, { posix: true, ignore: IGNORE })
  .map((file) => file.slice(SITE_DIR.length).replace(/index\.html$/, ''))
  .sort();

if (urls.length === 0) {
  console.error(`No pages found in ${SITE_DIR}. Run "npm run build" first.`);
  process.exit(1);
}

const byRule = new Map();
const errored = [];
const report = [];

for (const [i, url] of urls.entries()) {
  process.stdout.write(`\r${i + 1}/${urls.length} ${url}`.padEnd(100).slice(0, 100));
  const result = await audit(url);
  errored.push(...result.errored.map((e) => `${url} ${e}`));
  for (const v of result.violations) {
    const rule = byRule.get(v.id) ?? { impact: v.impact, help: v.help, pages: new Map() };
    rule.pages.set(url, v.nodes.length);
    byRule.set(v.id, rule);
    report.push({ url, rule: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map((n) => n.html) });
  }
}
process.stdout.write('\r'.padEnd(101) + '\r');

console.log(`axe: ${urls.length} pages audited\n`);
for (const [id, { impact, help, pages }] of [...byRule].sort((a, b) => b[1].pages.size - a[1].pages.size)) {
  const nodes = [...pages.values()].reduce((sum, n) => sum + n, 0);
  console.log(`${id} [${impact}] ${help}: ${nodes} nodes on ${pages.size} pages`);
  for (const [url, n] of pages) {
    console.log(`  ${url} (${n})`);
  }
}
if (errored.length) {
  console.log(`\nRules that threw instead of running:\n  ${errored.join('\n  ')}`);
}

const jsonIndex = process.argv.indexOf('--json');
if (jsonIndex !== -1) {
  writeFileSync(process.argv[jsonIndex + 1], JSON.stringify(report, null, 2));
}

if (byRule.size === 0 && errored.length === 0) {
  console.log('No violations.');
} else {
  process.exitCode = 1;
}
