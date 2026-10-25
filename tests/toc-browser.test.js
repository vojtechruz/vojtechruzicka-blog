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

describe('Sidebar TOC from the keyboard', () => {
  it('Enter on an entry scrolls to the section, records its #hash and moves focus there', async () => {
    // A post without embeds: the Tab after the heading must land on a link, not in a third-party iframe
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    try {
      await page.goto(server.baseUrl + '/spring-boot-actuator/', { waitUntil: 'load' });
      const hashes = await page.$$eval('nav.toc a[href^="#"]', (links) => links.map((a) => a.hash));
      const hash = hashes[Math.floor(hashes.length / 2)];
      const link = page.locator(`nav.toc a[href="${hash}"]`);
      await link.focus();
      await page.keyboard.press('Enter');

      await page.waitForFunction((h) => location.hash === h, hash);
      // Focus reaches the heading because the script makes it focusable (tabindex="-1"): Chromium then
      // focuses a focusable fragment target by itself, so the script's own focus() is a backstop here
      expect(await page.evaluate(() => document.activeElement.id)).toBe(decodeURIComponent(hash.slice(1)));
      expect(await link.getAttribute('aria-current')).not.toBeNull();
      // The heading ends up near the top of the viewport, below the header
      await expect
        .poll(() => page.evaluate(() => document.activeElement.getBoundingClientRect().top), { timeout: 5000 })
        .toBeLessThan(200);

      // The next Tab continues in the content after the heading, not back in the sidebar
      await page.keyboard.press('Tab');
      const next = await page.evaluate(() => {
        const heading = document.querySelector(':target');
        const el = document.activeElement;
        return {
          inToc: Boolean(el.closest('nav.toc')),
          inArticle: Boolean(el.closest('main')),
          afterHeading: Boolean(heading.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING),
        };
      });
      expect(next).toEqual({ inToc: false, inArticle: true, afterHeading: true });
    } finally {
      await context.close();
    }
  });
});
