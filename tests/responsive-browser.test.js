import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium } from 'playwright';
import { serveSite } from './static-server.js';
import { configurePlaywrightBrowserPath } from '../config/env-utils.js';

/**
 * Layout checks that need a real browser (jsdom has no layout): narrow-phone overflow,
 * the search overlay width and the floating copy button over long code lines.
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

async function openPage(path, width) {
  const page = await browser.newPage({ viewport: { width, height: 800 } });
  await page.goto(server.baseUrl + path);
  return page;
}

describe('narrow phone (320 px)', () => {
  it('long inline code does not widen the page', async () => {
    // /css-flexbox/ has `justify-content: space-between;` inline, which overflowed by 10 px with nowrap
    const page = await openPage('/css-flexbox/', 320);
    try {
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(320);
    } finally {
      await page.close();
    }
  }, 30000);
});

describe('search overlay', () => {
  // Pagefind UI renders the drawer lazily, so measure the stylesheet on a stand-in element
  const drawerBox = (page) =>
    page.evaluate(() => {
      const drawer = document.createElement('div');
      drawer.className = 'pagefind-ui__drawer';
      document.body.append(drawer);
      const { left, right } = drawer.getBoundingClientRect();
      return { left, right };
    });

  it.each([320, 390])(
    'fits a %i px phone with a gutter',
    async (width) => {
      const page = await openPage('/', width);
      try {
        const { left, right } = await drawerBox(page);
        expect(left).toBeGreaterThanOrEqual(15);
        expect(right).toBeLessThanOrEqual(width - 15);
      } finally {
        await page.close();
      }
    },
    30000,
  );

  it('keeps the desktop width', async () => {
    const page = await openPage('/', 1440);
    try {
      const { left, right } = await drawerBox(page);
      expect(right - left).toBe(820);
    } finally {
      await page.close();
    }
  }, 30000);
});

describe('floating copy button', () => {
  it('has an opaque background so code does not show through', async () => {
    const page = await openPage('/css-flexbox/', 1280);
    try {
      const background = await page.$eval(
        '.code-block-container > .copy-code-button',
        (button) => getComputedStyle(button).backgroundColor,
      );
      expect(background).not.toBe('rgba(0, 0, 0, 0)');
      expect(background).not.toMatch(/rgba\(.*, 0(\.\d+)?\)$/);
    } finally {
      await page.close();
    }
  }, 30000);
});
