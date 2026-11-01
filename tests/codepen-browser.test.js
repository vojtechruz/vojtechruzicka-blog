import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium } from 'playwright';
import { serveSite } from './static-server.js';
import { configurePlaywrightBrowserPath } from '../config/env-utils.js';

/**
 * The click-to-load CodePen facade (codepen shortcode, src/scripts/codepen.js) in a real browser:
 * nothing loads from CodePen until the reader runs a demo, the iframe then takes the poster's place
 * at the same height with keyboard focus, and without JS a link to the pen remains.
 */

const PAGE = '/css-flexbox/';
const fromCodepen = (url) => /(^|\.)(codepen\.io|cdpn\.io)$/.test(new URL(url).hostname);

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

async function openPage(options = {}) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, ...options });
  const requested = [];
  // Never hit the real CodePen from tests: record and answer with an empty page
  await page.route(fromCodepen, (route) => {
    requested.push(route.request().url());
    return route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>pen</title>' });
  });
  await page.goto(server.baseUrl + PAGE, { waitUntil: 'load' });
  return { page, requested };
}

describe('CodePen facade', () => {
  it('loads nothing from CodePen while the reader scrolls past every demo', async () => {
    const { page, requested } = await openPage();
    try {
      const facades = page.locator('.codepen-facade');
      expect(await facades.count()).toBeGreaterThan(10);
      for (const facade of await facades.all()) {
        await facade.scrollIntoViewIfNeeded();
      }
      await page.waitForLoadState('networkidle');
      expect(requested).toEqual([]);
      expect(await page.locator('iframe.codepen-embed').count()).toBe(0);
    } finally {
      await page.close();
    }
  });

  it('runs a demo from the keyboard in place of its poster, at the same height', async () => {
    const { page, requested } = await openPage();
    try {
      const figure = page.locator('.codepen-embed-figure').first();
      const button = figure.locator('button.codepen-run');
      expect(await button.isVisible()).toBe(true);
      expect(await figure.locator('a.codepen-open').count()).toBe(0);
      expect(await button.evaluate((el) => el.textContent)).toBe('Run demo: Display Flex');

      const before = await figure.boundingBox();
      await button.focus();
      await page.keyboard.press('Enter');

      const iframe = figure.locator('iframe.codepen-embed');
      await expect.poll(() => iframe.count()).toBe(1);
      expect(await iframe.getAttribute('src')).toBe(
        'https://codepen.io/vojtechruz/embed/ExVPBzM?default-tab=result&height=400',
      );
      expect(await iframe.getAttribute('title')).toBe('Display Flex');
      const captionId = await figure.locator('figcaption').getAttribute('id');
      expect(await iframe.getAttribute('aria-labelledby')).toBe(captionId);
      expect(await iframe.evaluate((el) => el === document.activeElement)).toBe(true);
      expect((await figure.boundingBox()).height).toBe(before.height);
      await expect.poll(() => requested.length).toBe(1);
      // Nothing left to run or enlarge; the caption stays in the bar
      expect(await figure.locator('button:visible').count()).toBe(0);
      // ...while the bar itself stays whole: the controls' half keeps its background
      const barBackground = (selector) =>
        figure
          .locator(selector)
          .evaluate((el) => [getComputedStyle(el).visibility, getComputedStyle(el).backgroundColor]);
      expect(await barBackground('.codepen-actions')).toEqual(await barBackground('figcaption'));
      expect(await figure.locator('figcaption').isVisible()).toBe(true);
    } finally {
      await page.close();
    }
  });

  it('does not move a demo whose long caption wraps beside the controls', async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.route(fromCodepen, (route) => route.fulfill({ contentType: 'text/html', body: '<title>pen</title>' }));
    try {
      await page.goto(`${server.baseUrl}/css-position/`, { waitUntil: 'load' });
      const figure = page.locator('.codepen-embed-figure', { hasText: 'Parent is not relative' });
      const caption = figure.locator('figcaption');
      const lineHeight = await caption.evaluate((el) => parseFloat(getComputedStyle(el).lineHeight));
      expect((await caption.boundingBox()).height).toBeGreaterThan(lineHeight * 1.5);

      const before = await figure.boundingBox();
      await figure.locator('button.codepen-run').click();
      await expect.poll(() => figure.locator('iframe.codepen-embed').count()).toBe(1);
      expect((await figure.boundingBox()).height).toBe(before.height);
    } finally {
      await page.close();
    }
  });

  it('keeps the controls off the demo, in the bar above it', async () => {
    const { page } = await openPage();
    try {
      const figure = page.locator('.codepen-embed-figure').first();
      const facade = await figure.locator('.codepen-facade').boundingBox();
      for (const control of await figure.locator('button:visible').all()) {
        const box = await control.boundingBox();
        expect(box.y + box.height).toBeLessThanOrEqual(facade.y);
      }
    } finally {
      await page.close();
    }
  });

  it('enlarges the poster in the lightbox on desktop, and returns focus', async () => {
    const { page, requested } = await openPage();
    try {
      const figure = page.locator('.codepen-embed-figure').first();
      const enlarge = figure.locator('button.codepen-enlarge');
      await expect.poll(() => enlarge.isVisible()).toBe(true);
      // The poster itself is not a lightbox trigger: it is there to look at
      expect(await figure.locator('.lightbox-trigger').count()).toBe(0);

      await enlarge.focus();
      await page.keyboard.press('Enter');
      const dialog = page.locator('dialog.lightbox');
      await expect.poll(() => dialog.isVisible()).toBe(true);
      expect(await dialog.getAttribute('aria-label')).toBe('Screenshot: Display Flex');
      expect(await dialog.locator('img').getAttribute('src')).toContain('codepen-exvpbzm');

      await page.keyboard.press('Escape');
      await expect.poll(() => dialog.isVisible()).toBe(false);
      expect(await enlarge.evaluate((el) => el === document.activeElement)).toBe(true);
      expect(requested).toEqual([]);
    } finally {
      await page.close();
    }
  });

  it('offers no enlarging on a phone, where the dialog would show the poster no larger', async () => {
    const { page } = await openPage({ viewport: { width: 390, height: 844 } });
    try {
      const figure = page.locator('.codepen-embed-figure').first();
      await figure.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      expect(await figure.locator('button.codepen-enlarge').isVisible()).toBe(false);
      expect(await figure.locator('button.codepen-run').isVisible()).toBe(true);
    } finally {
      await page.close();
    }
  });

  it('links to the pen without JavaScript', async () => {
    const { page } = await openPage({ javaScriptEnabled: false });
    try {
      const figure = page.locator('.codepen-embed-figure').first();
      expect(await figure.locator('button.codepen-run').isVisible()).toBe(false);
      expect(await figure.locator('button.codepen-enlarge').isVisible()).toBe(false);
      const link = figure.locator('a.codepen-open');
      expect(await link.isVisible()).toBe(true);
      expect(await link.getAttribute('href')).toBe('https://codepen.io/vojtechruz/pen/ExVPBzM');
    } finally {
      await page.close();
    }
  });
});
