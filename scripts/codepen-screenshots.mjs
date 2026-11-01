// Poster images for the `codepen` shortcode's click-to-load facade: a screenshot of each pen's result,
// saved next to the article as codepen-<id>.png. Run by hand when a pen is added or changed, never in
// the build - it would make every build depend on codepen.io and its speed. Check the new images
// before committing (an animation or a hover state may need a different moment).
//
//   npm run codepen:screenshots              only pens that have no poster yet
//   npm run codepen:screenshots -- --force   all pens again
//   npm run codepen:screenshots -- ExVPBzM   just these pens (by id), even if they have a poster
//
// codepen.io itself answers headless browsers with a Cloudflare challenge; the result-only view on
// cdpn.io does not, and renders without CodePen's chrome when it gets a CodePen referer.

import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { globSync } from 'glob';
import { chromium } from 'playwright';
import { configurePlaywrightBrowserPath } from '../config/env-utils.js';
import { codepenCalls, posterFilename, POSTER_WIDTH } from '../config/shortcodes/codepen.js';

const args = process.argv.slice(2);
const force = args.includes('--force');
const only = new Set(args.filter((arg) => !arg.startsWith('--')));

const pens = globSync('src/posts/**/index.md', { posix: true }).flatMap((file) =>
  codepenCalls(readFileSync(file, 'utf-8')).map(({ id, height }) => ({
    id,
    height,
    poster: join(dirname(file), posterFilename(id)),
  })),
);

const todo = pens.filter(({ id, poster }) => (only.size ? only.has(id) : force || !existsSync(poster)));
if (only.size) {
  const unknown = [...only].filter((id) => !pens.some((pen) => pen.id === id));
  if (unknown.length) {
    console.error(`No {% codepen %} call uses: ${unknown.join(', ')}`);
    process.exit(1);
  }
}
if (!todo.length) {
  console.log(`All ${pens.length} pens have a poster (--force to retake them).`);
  process.exit(0);
}

configurePlaywrightBrowserPath();
const browser = await chromium.launch();
const failed = [];
try {
  for (const [i, { id, height, poster }] of todo.entries()) {
    console.log(`${i + 1}/${todo.length} ${id} -> ${poster}`);
    // The size the embed has in the article column on desktop, at 2x for sharp high-density screens;
    // the image pipeline makes the smaller variants
    const page = await browser.newPage({
      viewport: { width: POSTER_WIDTH, height },
      deviceScaleFactor: 2,
      extraHTTPHeaders: { Referer: 'https://codepen.io/' },
    });
    try {
      await page.goto(`https://cdpn.io/vojtechruz/fullpage/${id}`, { waitUntil: 'load', timeout: 60000 });
      await page.evaluate(() => document.fonts.ready);
      // Transitions and web fonts settle
      await page.waitForTimeout(1500);
      await page.screenshot({ path: poster });
    } catch (error) {
      failed.push(id);
      console.error(`  failed: ${error.message.split('\n')[0]}`);
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
}

if (failed.length) {
  console.error(`\nNo poster for: ${failed.join(', ')}`);
  process.exit(1);
}
