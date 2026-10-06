import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { SITE_DIR } from './helpers.js';
import { configurePlaywrightBrowserPath } from '../config/env-utils.js';
import site from '../src/_data/site.js';

/**
 * Print styles (src/styles/base/_print.scss) checked in a real browser with emulated print
 * media: the computed styles decide what lands on paper, so a static HTML/CSS assertion
 * could not catch a component rule overriding a print rule (the cascade-order bug these
 * tests guard against). The pages are served from the build output.
 */

const PAGES = {
  post: '/css-position/', // CodePen embeds, code, external + internal links
  youtube: '/reactiveconf-2018/',
  video: '/documenting-angular-apps-with-typedoc-compodoc-and-angulardoc/',
  table: '/bit-manipulation-java-bitwise-bit-shift-operations/',
  listing: '/pages/2/',
  search: '/search/',
};

/** Elements that must not be printed on any page that contains them. */
const HIDDEN_IN_PRINT = [
  '.main-navigation',
  '.breadcrumbs',
  '.pagination',
  '.reading-progress',
  '.social-share',
  '.related-posts',
  '#comments',
  '.sidebar',
  '.footer',
  '.header-anchor',
  '.copy-code-button',
  '.post-header-featured-image',
  '.front-post-image', // card thumbnails (in-body linkedPost cards, listings)
  '.codepen-embed',
  '.yt-embed',
  '.video-embed',
  'input',
];

const SITE_ROOT = path.resolve(SITE_DIR);

const CONTENT_TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };

let server;
let browser;
let page;
let baseUrl;

beforeAll(async () => {
  server = http.createServer(async (req, res) => {
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    if (urlPath.endsWith('/')) {
      urlPath += 'index.html';
    }
    try {
      // Only serve files inside the build output (no ../ traversal)
      const filePath = path.resolve(SITE_ROOT, `.${urlPath}`);
      if (!filePath.startsWith(SITE_ROOT + path.sep)) {
        throw new Error('Outside of the site root');
      }
      const body = await readFile(filePath);
      res.writeHead(200, { 'content-type': CONTENT_TYPES[path.extname(urlPath)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  configurePlaywrightBrowserPath();
  browser = await chromium.launch();
  page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
  await page.emulateMedia({ media: 'print' });
}, 60000);

afterAll(async () => {
  await browser?.close();
  await new Promise((resolve) => (server ? server.close(resolve) : resolve()));
});

async function open(urlPath) {
  await page.goto(baseUrl + urlPath, { waitUntil: 'load' });
}

/** Selectors from HIDDEN_IN_PRINT that are present on the page but still rendered. */
function visibleChrome() {
  return page.evaluate(
    (selectors) =>
      selectors.filter((selector) =>
        [...document.querySelectorAll(selector)].some((el) => {
          const style = getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden' && el.getClientRects().length > 0;
        }),
      ),
    HIDDEN_IN_PRINT,
  );
}

function pseudoContent(selector, pseudo) {
  return page.$eval(selector, (el, p) => getComputedStyle(el, p).content, pseudo);
}

describe('Print styles', () => {
  it('prefix internal URLs with the configured site origin', () => {
    const scss = readFileSync('src/styles/base/_print.scss', 'utf-8');
    expect(scss).toContain(`$site-url: '${site.url}';`);
  });

  it.each(Object.entries(PAGES))('hide screen-only chrome on the %s page', async (_name, urlPath) => {
    await open(urlPath);
    expect(await visibleChrome()).toEqual([]);
  });

  it('print a site identification line with the canonical URL', async () => {
    await open(PAGES.post);
    const header = page.locator('.print-header');
    expect(await header.isVisible()).toBe(true);
    expect(await header.textContent()).toContain(`${site.url}${PAGES.post}`);
  });

  it('keep the identification line hidden on screen', async () => {
    await page.emulateMedia({ media: 'screen' });
    try {
      await open(PAGES.post);
      expect(await page.locator('.print-header').isVisible()).toBe(false);
    } finally {
      await page.emulateMedia({ media: 'print' });
    }
  });

  it('use a light palette (dark text on the white page)', async () => {
    await open(PAGES.post);
    const color = await page.$eval('article p', (el) => getComputedStyle(el).color);
    const [r, g, b] = color.match(/\d+/g).map(Number);
    expect(r + g + b, `body text ${color} is too light for paper`).toBeLessThan(200);
  });

  it('print link targets, with the site origin for internal links', async () => {
    await open(PAGES.post);
    expect(await pseudoContent('article p a[href^="http"]', '::after')).toMatch(/^" \(https?:\/\/.+\)"$/);

    await open(PAGES.listing);
    const internal = await pseudoContent('.front-post-title a[href^="/"]', '::after');
    expect(internal).toContain(`${site.url}/`);
  });

  it('do not print URLs for permalinks and topic links', async () => {
    await open(PAGES.post);
    expect(await pseudoContent('.post-topics a', '::after')).toBe('none');
  });

  it('replace embeds with their URL', async () => {
    await open(PAGES.post);
    expect(await pseudoContent('.codepen-embed-figure', '::before')).toContain('https://codepen.io/vojtechruz/pen/');

    await open(PAGES.youtube);
    expect(await pseudoContent('.yt-embed-figure', '::before')).toContain('https://www.youtube.com/watch?v=');

    await open(PAGES.video);
    const videoUrl = await pseudoContent('.video-embed-figure', '::before');
    expect(videoUrl).toContain(`${site.url}/videos/`);
    expect(videoUrl).toContain('.mp4');
  });

  it('keep short tables on one page', async () => {
    await open(PAGES.table);
    expect(await page.$eval('.table-wrapper', (el) => getComputedStyle(el).breakInside)).toBe('avoid-page');
  });

  it('render code with the light Shiki theme and wrap long lines', async () => {
    await open(PAGES.post);
    const token = await page.$eval('pre.shiki .line span[style*="--shiki-light"]', (el) => ({
      color: getComputedStyle(el).color,
      light: getComputedStyle(el).getPropertyValue('--shiki-light').trim(),
    }));
    const toRgb = (hex) =>
      `rgb(${hex
        .replace('#', '')
        .match(/../g)
        .slice(0, 3)
        .map((h) => Number.parseInt(h, 16))
        .join(', ')})`;
    expect(token.color).toBe(toRgb(token.light));

    expect(await page.$eval('pre.shiki .line', (el) => getComputedStyle(el).whiteSpace)).toBe('pre-wrap');
  });
});
