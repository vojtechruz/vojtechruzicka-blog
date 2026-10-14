import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium } from 'playwright';
import { serveSite } from './static-server.js';
import { configurePlaywrightBrowserPath } from '../config/env-utils.js';

/**
 * Keyboard access to wide code blocks and tables in a real browser (jsdom has no layout): the
 * built page with its bundled scroll-regions.js. Exactly the boxes that overflow get a tab stop,
 * and the set follows the viewport. Tab and arrow keys on such a box are not tested here:
 * Playwright's Chromium (130+) focuses scrollable boxes on its own, so it would pass without the
 * script; the browsers that need it (Firefox, Safari) are not installed.
 */

const PAGE = '/angular/02-building-blocks/'; // a markdown table and code blocks with long lines
const BOXES = 'pre.shiki, .table-wrapper, .mermaid-diagram';

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

async function openPage(width) {
  const page = await browser.newPage({ viewport: { width, height: 800 } });
  await page.goto(server.baseUrl + PAGE, { waitUntil: 'load' });
  return page;
}

/** Per box: whether it overflows, and whether it is a focusable named region. */
const boxStates = (page) =>
  page.$$eval(BOXES, (els) =>
    els.map((el) => ({
      overflows: el.scrollWidth > el.clientWidth,
      region:
        el.getAttribute('tabindex') === '0' && el.getAttribute('role') === 'region' && el.hasAttribute('aria-label'),
    })),
  );

const expectRegionsMatchOverflow = async (page) => {
  await page.waitForFunction((sel) => {
    const els = Array.from(document.querySelectorAll(sel));
    return els.every((el) => el.scrollWidth > el.clientWidth === el.hasAttribute('data-scroll-region'));
  }, BOXES);
  const states = await boxStates(page);
  for (const { overflows, region } of states) {
    expect(region).toBe(overflows);
  }
  return states;
};

describe('scrollable code blocks and tables', () => {
  it('get a tab stop exactly when they overflow, following the viewport width', async () => {
    const page = await openPage(390);
    try {
      const phone = await expectRegionsMatchOverflow(page);
      expect(phone.filter((s) => s.overflows).length, 'some boxes overflow on a phone').toBeGreaterThan(1);
      expect(await page.locator('.table-wrapper[data-scroll-region]').count(), 'the table').toBe(1);

      await page.setViewportSize({ width: 1280, height: 800 });
      const desktop = await expectRegionsMatchOverflow(page);
      expect(desktop.filter((s) => s.overflows).length, 'fewer overflow on a desktop').toBeLessThan(
        phone.filter((s) => s.overflows).length,
      );
      expect(
        desktop.some((s) => !s.region),
        'boxes that fit stay out of the tab order',
      ).toBe(true);
    } finally {
      await page.close();
    }
  }, 30000);

  it('Tab goes to a scrollable code block first, then its copy button, each with its own ring', async () => {
    const page = await openPage(390);
    try {
      await page.waitForFunction(() => document.querySelector('pre.shiki[data-scroll-region]'));
      // Start just before the first scrollable block's container, then Tab through it
      await page.evaluate(() => {
        const container = document.querySelector('pre.shiki[data-scroll-region]').parentElement;
        container.id = 'scrollable-code';
        const marker = document.createElement('button');
        container.before(marker);
        marker.focus();
      });
      const ring = (selector) => page.$eval(selector, (el) => getComputedStyle(el).outlineStyle);
      const active = () =>
        page.evaluate(() => {
          const el = document.activeElement;
          return el.tagName === 'PRE' ? 'code' : el.className;
        });

      await page.keyboard.press('Tab');
      expect(await active()).toBe('code');
      expect(await ring('#scrollable-code'), 'the block is ringed').toBe('solid');

      await page.keyboard.press('Tab');
      expect(await active()).toContain('copy-code-button');
      expect(await ring('#scrollable-code'), 'only the button is ringed').toBe('none');
      expect(await ring('#scrollable-code > .copy-code-button')).toBe('solid');
    } finally {
      await page.close();
    }
  }, 30000);
});
