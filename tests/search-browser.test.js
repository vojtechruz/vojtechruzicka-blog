import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium } from 'playwright';
import { serveSite } from './static-server.js';
import { configurePlaywrightBrowserPath } from '../config/env-utils.js';

/**
 * Arrow-key navigation of search results against the real Pagefind UI and index (the jsdom tests in
 * search-script.test.js use a stub that only mimics its markup).
 */

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

const focused = (page) =>
  page.evaluate(() => {
    const el = document.activeElement;
    return { className: el.className, href: el.getAttribute('href') };
  });

describe('Search results keyboard navigation', () => {
  it('moves from the input through the results, "Load more" and back with the arrow keys', async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    try {
      await page.goto(server.baseUrl + '/search/?q=java', { waitUntil: 'load' });
      const links = page.locator('#search-page .pagefind-ui__result-link');
      await links.nth(1).waitFor();
      const [first, second] = [await links.nth(0).getAttribute('href'), await links.nth(1).getAttribute('href')];

      await page.locator('#search-page .pagefind-ui__search-input').focus();
      await page.keyboard.press('ArrowDown');
      expect(await focused(page)).toMatchObject({ href: first });
      await page.keyboard.press('ArrowDown');
      expect(await focused(page)).toMatchObject({ href: second });
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('ArrowUp');
      expect((await focused(page)).className).toContain('pagefind-ui__search-input');

      // "Load more" comes after the results; using it moves focus to the first newly loaded one
      const shown = await links.count();
      for (let i = 0; i <= shown; i++) {
        await page.keyboard.press('ArrowDown');
      }
      expect((await focused(page)).className).toContain('pagefind-ui__button');
      await page.keyboard.press('Enter');
      await page.waitForFunction(
        (n) => document.activeElement === document.querySelectorAll('#search-page .pagefind-ui__result-link')[n],
        shown,
      );
      await page.keyboard.press('ArrowUp');
      expect(await focused(page)).toMatchObject({ href: await links.nth(shown - 1).getAttribute('href') });
      for (let i = 0; i < shown; i++) {
        await page.keyboard.press('ArrowUp');
      }
      expect((await focused(page)).className).toContain('pagefind-ui__search-input');

      // Enter on a focused result follows it
      await page.keyboard.press('ArrowDown');
      await Promise.all([page.waitForURL((url) => url.pathname === first), page.keyboard.press('Enter')]);
    } finally {
      await context.close();
    }
  });
});
