import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium } from 'playwright';
import { serveSite } from './static-server.js';
import { configurePlaywrightBrowserPath } from '../config/env-utils.js';

/**
 * Opening a link to a section (`/post/#heading`, shared or from search results): the browser jumps
 * to the heading on its own, and the sidebar TOC (src/scripts/toc-scrollspy.js) must mark that
 * section, not the first one. jsdom has no layout or fragment scrolling, so this needs a browser.
 */

const PAGE = '/css-flexbox/'; // long, with nested (h2 + h3) TOC entries

let server;
let browser;

beforeAll(async () => {
  server = await serveSite();
  configurePlaywrightBrowserPath();
  browser = await chromium.launch();
}, 60000);

afterAll(async () => {
  await browser?.close();
  await server?.close();
});

/** Fragments of the sidebar TOC links, with whether each is nested (an h3 under an h2). */
async function tocEntries() {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto(server.baseUrl + PAGE, { waitUntil: 'load' });
  const entries = await page.$$eval('nav.toc a[href^="#"]', (links) =>
    links.map((a) => ({ hash: a.hash, nested: Boolean(a.closest('li')?.parentElement?.closest('li')) })),
  );
  await context.close();
  return entries;
}

async function openAt(hash) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto(server.baseUrl + PAGE + hash, { waitUntil: 'load' });
  return { context, page };
}

const currentHashes = (page) => page.$$eval('nav.toc a[aria-current]', (links) => links.map((a) => a.hash));

describe('Sidebar TOC when the page is opened at a section', () => {
  let entries;

  beforeAll(async () => {
    entries = await tocEntries();
    expect(entries.length).toBeGreaterThan(6);
  }, 60000);

  // Not near the end: at the bottom of the page the last heading is marked on purpose.
  it.each([
    ['a top-level section', (e) => e.filter((x) => !x.nested)],
    ['a nested section', (e) => e.filter((x) => x.nested)],
  ])('marks %s from the URL fragment, not the first one', async (_, pick) => {
    const candidates = pick(entries).slice(0, -2);
    expect(candidates.length).toBeGreaterThan(1);
    const { hash } = candidates[Math.floor(candidates.length / 2)];
    expect(hash).not.toBe(entries[0].hash);

    const { context, page } = await openAt(hash);
    try {
      await expect.poll(() => currentHashes(page), { timeout: 5000 }).toEqual([hash]);

      // ...and keeps it in view inside the sidebar TOC
      const inView = await page.$eval('nav.toc a[aria-current]', (a) => {
        const box = a.getBoundingClientRect();
        return box.top >= 0 && box.bottom <= window.innerHeight;
      });
      expect(inView).toBe(true);
    } finally {
      await context.close();
    }
  });
});
