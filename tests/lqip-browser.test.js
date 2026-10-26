import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium } from 'playwright';
import { serveSite } from './static-server.js';
import { configurePlaywrightBrowserPath } from '../config/env-utils.js';

/**
 * LQIP placeholder lifecycle in a real browser (src/styles/components/_image-wrapper.scss).
 * The placeholder is an inline background-image on the <img> (a tiny WebP); once the image has loaded it must go,
 * or the transparent parts of a PNG (here a macOS window screenshot with its drop shadow) keep
 * showing the blurred placeholder. jsdom cannot load images or compute the cascade, hence Playwright.
 */

// ignore-files.png: ~28 % transparent / semi-transparent pixels (window shadow)
const PAGE = '/intellij-idea-tips-tricks-improving-performance/';
const IMAGE = 'img.lqip[src*="/ignore-files-"]';

let server;
let browser;
let page;

beforeAll(async () => {
  server = await serveSite();
  configurePlaywrightBrowserPath();
  browser = await chromium.launch();
  page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
}, 60000);

afterAll(async () => {
  await browser?.close();
  await server?.close();
});

/** Background and filter of the image as the browser computes them */
const placeholderStyle = () =>
  page.$eval(IMAGE, (img) => {
    const style = getComputedStyle(img);
    return { image: style.backgroundImage, color: style.backgroundColor, filter: style.filter };
  });

describe('LQIP placeholder', () => {
  it('shows the blurred placeholder until the image loads, then removes it', async () => {
    // Hold the image back so the placeholder state can be observed
    let releaseImage;
    const imageHeld = new Promise((resolve) => (releaseImage = resolve));
    await page.route('**/ignore-files-*', async (route) => {
      await imageHeld;
      await route.continue();
    });

    await page.goto(server.baseUrl + PAGE);
    await page.$eval(IMAGE, (img) => img.scrollIntoView());

    const before = await placeholderStyle();
    expect(before.image).toMatch(/^url\("data:image\/webp;base64,/);
    expect(before.filter).toMatch(/^blur\(/);

    releaseImage();
    await page.waitForSelector(`${IMAGE}[data-loaded]`);

    const after = await placeholderStyle();
    expect(after.image.slice(0, 40), 'placeholder still set after load').toBe('none');
    expect(after.color).toBe('rgba(0, 0, 0, 0)');
    // the blur fades out over --lqip-transition-duration
    await page.waitForFunction(
      (selector) => getComputedStyle(document.querySelector(selector)).filter === 'blur(0px)',
      IMAGE,
    );
  }, 30000);

  it('drops the placeholder at once when the image fails, so the alt text is readable', async () => {
    const failing = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    try {
      await failing.route('**/ignore-files-*', (route) => route.fulfill({ status: 404 }));
      await failing.goto(server.baseUrl + PAGE);
      await failing.$eval(IMAGE, (img) => img.scrollIntoView());
      await failing.waitForSelector(`${IMAGE}[data-failed]`);

      const style = await failing.$eval(IMAGE, (img) => {
        const computed = getComputedStyle(img);
        return {
          loaded: img.hasAttribute('data-loaded'),
          image: computed.backgroundImage,
          color: computed.backgroundColor,
          filter: computed.filter,
        };
      });
      expect(style).toEqual({ loaded: false, image: 'none', color: 'rgba(0, 0, 0, 0)', filter: 'none' });
    } finally {
      await failing.close();
    }
  }, 30000);

  it('ends the placeholder of an image that loaded before lqip.js ran', async () => {
    // A cached image can finish before the deferred script registers its listeners
    const early = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    try {
      let releaseScript;
      const scriptHeld = new Promise((resolve) => (releaseScript = resolve));
      await early.route('**/scripts/lqip.js*', async (route) => {
        await scriptHeld;
        await route.continue();
      });
      await early.goto(server.baseUrl + PAGE, { waitUntil: 'commit' });
      await early.waitForSelector(IMAGE);
      await early.$eval(IMAGE, (img) => img.scrollIntoView());
      await early.waitForFunction((selector) => {
        const img = document.querySelector(selector);
        return img.complete && img.naturalWidth > 0;
      }, IMAGE);
      expect(await early.$eval(IMAGE, (img) => img.hasAttribute('data-loaded'))).toBe(false);

      releaseScript();
      await early.waitForSelector(`${IMAGE}[data-loaded]`);
    } finally {
      await early.close();
    }
  }, 30000);

  it('shows the image unblurred when JavaScript is disabled', async () => {
    // lqip.js never sets data-loaded; the <noscript> style in base.njk takes over
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
    try {
      const noJsPage = await context.newPage();
      await noJsPage.goto(server.baseUrl + PAGE);
      const style = await noJsPage.$eval(IMAGE, (img) => {
        const computed = getComputedStyle(img);
        return { loaded: img.hasAttribute('data-loaded'), image: computed.backgroundImage, filter: computed.filter };
      });
      expect(style.loaded).toBe(false);
      expect(style.image.slice(0, 40), 'placeholder set without JS').toBe('none');
      expect(style.filter).toBe('none');
    } finally {
      await context.close();
    }
  }, 30000);
});
