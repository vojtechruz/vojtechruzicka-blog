import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium } from 'playwright';
import { serveSite } from './static-server.js';
import { configurePlaywrightBrowserPath } from '../config/env-utils.js';

/**
 * Forced colors (Windows contrast themes): the browser replaces every background with the theme's
 * Canvas colour. Icons drawn as a currentColor background (shaped by a mask or by their box) then
 * paint in the page colour and vanish, so each one must opt out and use a system text colour.
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

const ICONS = [
  { name: 'hamburger menu bars', path: '/css-flexbox/', selector: '.nav-toggle-bar' },
  { name: 'heading permalink icon', path: '/css-flexbox/', selector: 'h2 .header-anchor', pseudo: '::before' },
  { name: 'search field magnifier', path: '/search/', selector: '#search-page .pagefind-ui__form', pseudo: '::before' },
  // Parts ahead are rings (Canvas fill, LinkText border), so only the filled dots and the segment are compared
  ...['is-done', 'is-current'].map((state) => ({
    name: `series stepper ${state} dot`,
    path: '/angular/04-data-binding/',
    selector: `.series-nav-progress .${state} a`,
    pseudo: '::before',
  })),
  {
    name: 'series stepper segment',
    path: '/angular/04-data-binding/',
    selector: '.series-nav-progress li + li',
    pseudo: '::before',
  },
];

// A light and a dark contrast theme, so an icon cannot pass by happening to match only one of them
describe.each(['light', 'dark'])('forced colors, %s theme', (colorScheme) => {
  it.each(ICONS)(
    '$name stands out from the page background',
    async ({ path, selector, pseudo }) => {
      const page = await browser.newPage({
        viewport: { width: 390, height: 800 },
        forcedColors: 'active',
        colorScheme,
      });
      try {
        await page.goto(server.baseUrl + path);
        const { icon, page: pageBackground } = await page
          .locator(selector)
          .first()
          .evaluate(
            (el, pseudoElement) => ({
              icon: getComputedStyle(el, pseudoElement).backgroundColor,
              page: getComputedStyle(document.body).backgroundColor,
            }),
            pseudo ?? null,
          );
        expect(icon).not.toBe(pageBackground);
      } finally {
        await page.close();
      }
    },
    30000,
  );

  // The theme forces the text dark (MarkText on <mark>) but kept a transparent or dropped background behind it
  it.each([
    {
      name: 'search result highlights',
      path: '/search/?q=java',
      selector: '#search-page .pagefind-ui__result-excerpt mark',
    },
    {
      name: 'highlighted code lines',
      path: '/angular/02-building-blocks/',
      selector: 'pre.shiki .line.highlighted span',
    },
  ])(
    '$name are readable against what is behind them',
    async ({ path, selector }) => {
      const page = await browser.newPage({
        viewport: { width: 390, height: 800 },
        forcedColors: 'active',
        colorScheme,
      });
      try {
        await page.goto(server.baseUrl + path);
        const { text, background } = await page
          .locator(selector)
          .first()
          .evaluate((el) => {
            // The nearest ancestor with a painted background is what the text sits on
            let node = el;
            let own = getComputedStyle(node).backgroundColor;
            while (node.parentElement && (own === 'transparent' || /^rgba\(.*, 0\)$/.test(own))) {
              node = node.parentElement;
              own = getComputedStyle(node).backgroundColor;
            }
            return { text: getComputedStyle(el).color, background: own };
          });
        expect(text).not.toBe(background);
      } finally {
        await page.close();
      }
    },
    30000,
  );

  // The theme dropped the line's tint, leaving only a thin stripe to tell a highlighted line apart
  it('highlighted code lines keep a solid background of their own', async () => {
    const page = await browser.newPage({ viewport: { width: 390, height: 800 }, forcedColors: 'active', colorScheme });
    try {
      await page.goto(server.baseUrl + '/angular/02-building-blocks/');
      const { line, page: pageBackground } = await page
        .locator('pre.shiki .line.highlighted')
        .first()
        .evaluate((el) => ({
          line: getComputedStyle(el).backgroundColor,
          page: getComputedStyle(document.body).backgroundColor,
        }));
      expect(line).toMatch(/^rgb\(/);
      expect(line).not.toBe(pageBackground);
    } finally {
      await page.close();
    }
  }, 30000);
});
