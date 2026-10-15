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

describe('Search input names', () => {
  it('keep their names and the shortcut hint once the real Pagefind UI has taken over and searched', async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    try {
      await page.goto(server.baseUrl + '/search/?q=java', { waitUntil: 'load' });
      await page.locator('#search-page .pagefind-ui__result-link').first().waitFor();

      // Open the header search by its shortcut and search, so Pagefind re-renders around the input
      // (shortcuts are ignored inside a field, and /search/ may have put focus in its own input)
      await page.evaluate(() => document.activeElement?.blur());
      await page.keyboard.press('Control+k');
      await page.waitForFunction(() => document.activeElement?.closest('#search'));
      await page.keyboard.type('spring');
      await page.locator('#search .pagefind-ui__result-link').first().waitFor();

      const attrs = (selector) =>
        page.locator(selector).evaluate((el) => ({
          name: el.getAttribute('aria-label'),
          title: el.getAttribute('title'),
          keys: el.getAttribute('aria-keyshortcuts'),
        }));
      // Two search inputs on the page, both rendered by Pagefind (no pre-rendered placeholder left)
      expect(await page.locator('.pagefind-ui__search-input').count()).toBe(2);
      expect(await attrs('#search .pagefind-ui__search-input')).toEqual({
        name: 'Search the site',
        title: 'Shortcut: / or Ctrl+K',
        keys: '/ Control+K',
      });
      expect(await attrs('#search-page .pagefind-ui__search-input')).toEqual({
        name: 'Search posts',
        title: null,
        keys: null,
      });
    } finally {
      await context.close();
    }
  });
});

describe('Search shortcut on a narrow screen', () => {
  it('opens the collapsed menu to reach the search, and Escape closes both and returns focus', async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    try {
      await page.goto(server.baseUrl + '/about/', { waitUntil: 'load' });
      const input = page.locator('#search .pagefind-ui__search-input');
      await expect.poll(() => input.isVisible()).toBe(false); // the menu starts collapsed

      // Shortcut from a link in the page, the origin focus should return to
      const origin = page.locator('main a[href]').first();
      await origin.focus();
      await page.keyboard.press('Control+k');

      await page.waitForFunction(() => document.activeElement?.matches('#search .pagefind-ui__search-input'));
      expect(await input.isVisible()).toBe(true);
      expect(await page.locator('.nav-toggle').getAttribute('aria-expanded')).toBe('true');

      // With results open, Escape clears them, closes the menu and goes back to the link
      await page.keyboard.type('java');
      await page.locator('#search .pagefind-ui__result-link').first().waitFor();
      await page.keyboard.press('Escape');

      await expect.poll(() => input.isVisible()).toBe(false);
      expect(await page.locator('.nav-toggle').getAttribute('aria-expanded')).toBe('false');
      expect(await origin.evaluate((el) => el === document.activeElement)).toBe(true);
    } finally {
      await context.close();
    }
  });
});
