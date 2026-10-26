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
});
