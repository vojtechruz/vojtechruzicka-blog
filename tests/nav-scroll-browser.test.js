import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium } from 'playwright';
import { serveSite } from './static-server.js';
import { configurePlaywrightBrowserPath } from '../config/env-utils.js';

/**
 * The compact header (src/scripts/nav.js, $query-compact-nav): on a narrow or short screen one row,
 * hidden while scrolling down, back on scrolling up; without JS not sticky at all. Desktop keeps the
 * plain sticky header.
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

const PORTRAIT = { width: 390, height: 844 };
const LANDSCAPE = { width: 844, height: 390 };
// Upright tablet (iPad 810-834 px): the full header would wrap to two rows here
const TABLET = { width: 820, height: 1180 };
const DESKTOP = { width: 1280, height: 800 };
const ARTICLE = '/css-flexbox/';

async function openPage(viewport, options = {}) {
  const context = await browser.newContext({ viewport, ...options });
  const page = await context.newPage();
  await page.goto(server.baseUrl + ARTICLE);
  return { page, close: () => context.close() };
}

// Scroll, then let the rAF update and the 0.2 s transition run
async function scrollTo(page, y) {
  await page.evaluate((top) => window.scrollTo(0, top), y);
  await page.waitForTimeout(350);
}

const header = (page) =>
  page.$eval('.main-navigation', (nav) => {
    const { top, bottom, height } = nav.getBoundingClientRect();
    const { position, transform, transitionDuration } = getComputedStyle(nav);
    return {
      top,
      bottom,
      height,
      hidden: nav.classList.contains('nav-hidden'),
      position,
      transform,
      transitionDuration,
    };
  });

describe.each([
  ['portrait', PORTRAIT],
  ['landscape', LANDSCAPE],
  ['tablet portrait', TABLET],
])('compact header, %s', (_, viewport) => {
  it('is one row: the logo and the hamburger', async () => {
    const { page, close } = await openPage(viewport);
    try {
      expect(await page.isVisible('.nav-toggle')).toBe(true);
      expect(await page.isVisible('.menu-items')).toBe(false);
      // One row: the 2.75rem toggle plus the bar's padding, well under two rows (~140 px)
      expect((await header(page)).height).toBeLessThan(80);
    } finally {
      await close();
    }
  });

  it('hides on scrolling down and comes back on scrolling up', async () => {
    const { page, close } = await openPage(viewport);
    try {
      await scrollTo(page, 1200);
      const down = await header(page);
      expect(down.hidden).toBe(true);
      expect(down.bottom).toBeLessThanOrEqual(0);

      await scrollTo(page, 900);
      const up = await header(page);
      expect(up.hidden).toBe(false);
      expect(up.top).toBe(0);
      // Shown means no transform at all: a transformed header would become the containing block of
      // the search drawer (position: fixed) inside it
      expect(up.transform).toBe('none');
    } finally {
      await close();
    }
  });

  it('ignores a scroll of a few pixels', async () => {
    const { page, close } = await openPage(viewport);
    try {
      await scrollTo(page, 1200);
      await scrollTo(page, 1196);
      expect((await header(page)).hidden).toBe(true);
    } finally {
      await close();
    }
  });

  it('stays while the menu is open', async () => {
    const { page, close } = await openPage(viewport);
    try {
      await scrollTo(page, 600);
      await scrollTo(page, 400);
      await page.click('.nav-toggle');
      await scrollTo(page, 1200);
      expect((await header(page)).hidden).toBe(false);
    } finally {
      await close();
    }
  });

  it('shows while the search is open, whatever the scroll said', async () => {
    const { page, close } = await openPage(viewport);
    try {
      await scrollTo(page, 1200);
      await page.evaluate(() => document.body.classList.add('search-open'));
      await page.waitForTimeout(350);
      const nav = await header(page);
      expect(nav.transform).toBe('none');
      expect(nav.top).toBe(0);
    } finally {
      await close();
    }
  });

  it('comes back when keyboard focus moves into it', async () => {
    const { page, close } = await openPage(viewport);
    try {
      await scrollTo(page, 1200);
      expect((await header(page)).hidden).toBe(true);
      // Without scrolling: the focus itself has to bring the header back
      await page.evaluate(() => document.querySelector('.nav-toggle').focus({ preventScroll: true }));
      await page.waitForTimeout(350);
      expect((await header(page)).top).toBe(0);
    } finally {
      await close();
    }
  });

  it('without JS is not sticky: the expanded menu scrolls away with the page', async () => {
    const { page, close } = await openPage(viewport, { javaScriptEnabled: false });
    try {
      expect(await page.isVisible('.menu-items')).toBe(true);
      expect((await header(page)).position).toBe('static');
      await scrollTo(page, 1200);
      expect((await header(page)).bottom).toBeLessThanOrEqual(0);
    } finally {
      await close();
    }
  });
});

describe('desktop header', () => {
  // Logo, title, links and search need ~880 px with Segoe UI, ~1040 px with DejaVu Sans (CI)
  it('is one row', async () => {
    const { page, close } = await openPage(DESKTOP);
    try {
      expect(await page.isVisible('.nav-toggle')).toBe(false);
      expect((await header(page)).height).toBeLessThan(80);
    } finally {
      await close();
    }
  });

  it('stays sticky and visible while scrolling down', async () => {
    const { page, close } = await openPage(DESKTOP);
    try {
      await scrollTo(page, 1200);
      const nav = await header(page);
      expect(nav.hidden).toBe(false);
      expect(nav.top).toBe(0);
      expect(nav.position).toBe('sticky');
    } finally {
      await close();
    }
  });

  it('stays sticky without JS', async () => {
    const { page, close } = await openPage(DESKTOP, { javaScriptEnabled: false });
    try {
      expect((await header(page)).position).toBe('sticky');
    } finally {
      await close();
    }
  });
});

it('moves without animation for reduced motion', async () => {
  const { page, close } = await openPage(PORTRAIT, { reducedMotion: 'reduce' });
  try {
    // The global reduced-motion rule (base styles) brings every transition down to a microsecond
    expect(parseFloat((await header(page)).transitionDuration)).toBeLessThan(0.01);
  } finally {
    await close();
  }
});
