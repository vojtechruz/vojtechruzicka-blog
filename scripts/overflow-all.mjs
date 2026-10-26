// Run the horizontal overflow check of tests/responsive-browser.test.js over every page of the build
// at phone widths. Overflow mostly comes from an article's own content (a long URL, a wide table,
// an image with a fixed width), which the test's sample of one page per kind cannot cover. Too slow
// for `npm test`, so it runs on demand:
//
//   npm run build && npm run overflow:all             exit code 1 if any page scrolls sideways
//   npm run overflow:all -- --widths 320,390,768      other widths (default 320,390)

import { globSync } from 'glob';
import { chromium } from 'playwright';
import { configurePlaywrightBrowserPath } from '../config/env-utils.js';
import { SITE_DIR } from '../tests/helpers.js';
import { measureOverflow } from '../tests/overflow.js';
import { serveSite } from '../tests/static-server.js';

// Search engine verification stub, not a page
const IGNORE = [`${SITE_DIR}/google*.html`, `${SITE_DIR}/pagefind/**`];

const widthsIndex = process.argv.indexOf('--widths');
const widths = widthsIndex === -1 ? [320, 390] : process.argv[widthsIndex + 1].split(',').map(Number);

const urls = globSync(`${SITE_DIR}/**/*.html`, { posix: true, ignore: IGNORE })
  .map((file) => file.slice(SITE_DIR.length).replace(/index\.html$/, ''))
  .sort();

if (urls.length === 0) {
  console.error(`No pages found in ${SITE_DIR}. Run "npm run build" first.`);
  process.exit(1);
}

const server = await serveSite();
configurePlaywrightBrowserPath();
const browser = await chromium.launch();
const failures = [];

try {
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 800 } });
    for (const [i, url] of urls.entries()) {
      process.stdout.write(`\r${width}px ${i + 1}/${urls.length} ${url}`.padEnd(100).slice(0, 100));
      const page = await context.newPage();
      try {
        await page.goto(server.baseUrl + url);
        const { overflow, culprits } = await measureOverflow(page);
        if (overflow > 0) {
          failures.push(`${width}px ${url} +${overflow}px: ${culprits.join(', ')}`);
        }
      } finally {
        await page.close();
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
  await server.close();
}
process.stdout.write('\r'.padEnd(101) + '\r');

console.log(`overflow: ${urls.length} pages at ${widths.join(', ')} px\n`);
if (failures.length) {
  console.log(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('No page scrolls sideways.');
}
