import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium } from 'playwright';
import { serveSite } from './static-server.js';
import { configurePlaywrightBrowserPath } from '../config/env-utils.js';

/**
 * Every element Tab reaches shows the site's focus ring, not the browser's default white one: the ring
 * comes from a selector list in _accessibility.scss, and an element missing from it (the collapsible
 * TOC's <summary>, a <video>) silently fell back to the default.
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

// A phone width: the TOC is a collapsible <details> there, the hamburger replaces the menu
const PAGES = [
  '/angular/02-building-blocks/', // TOC summary, code, tables
  '/documenting-angular-apps-with-typedoc-compodoc-and-angulardoc/', // videos, lightbox images
  '/',
  '/404.html', // search field in the page
];

describe('focus ring', () => {
  it.each(PAGES)(
    'every focusable element on %s uses the site focus ring',
    async (path) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 800 } });
      try {
        await page.goto(server.baseUrl + path);
        const ringColor = await page.evaluate(() => {
          const probe = document.createElement('div');
          probe.style.color = 'var(--color-focus-ring)';
          document.body.append(probe);
          const color = getComputedStyle(probe).color;
          probe.remove();
          return color;
        });
        const wrong = new Set();
        let reached = 0;
        for (let i = 0; i < 300; i++) {
          await page.keyboard.press('Tab');
          const focused = await page.evaluate(() => {
            const el = document.activeElement;
            if (!el || el === document.body || el.tagName === 'IFRAME') {
              return null;
            }
            const cs = getComputedStyle(el);
            return {
              name: el.tagName.toLowerCase() + [...el.classList].map((c) => `.${c}`).join(''),
              // A video's own controls draw their ring inside it; the <video> itself is not :focus-visible then
              visible: el.matches(':focus-visible'),
              skipLink: el.classList.contains('skip-link'),
              outline: `${cs.outlineStyle} ${cs.outlineColor}`,
            };
          });
          // The end of the page (or Giscus' iframe): Tab has been everywhere
          if (!focused) {
            break;
          }
          reached++;
          // The skip link is white on its black background on purpose
          if (focused.visible && !focused.skipLink && focused.outline !== `solid ${ringColor}`) {
            wrong.add(`${focused.name} (${focused.outline})`);
          }
        }
        expect(reached).toBeGreaterThan(5);
        expect([...wrong]).toEqual([]);
      } finally {
        await page.close();
      }
    },
    60000,
  );
});
