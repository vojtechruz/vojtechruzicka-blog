import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium } from 'playwright';
import { serveSite } from './static-server.js';
import { configurePlaywrightBrowserPath } from '../config/env-utils.js';

/**
 * LQIP placeholder lifecycle in a real browser (src/styles/components/_image-wrapper.scss).
 * The mosaic is an inline background-image on the <img>; once the image has loaded it must go,
 * or the transparent parts of a PNG (here a macOS window screenshot with its drop shadow) keep
 * showing the coloured blocks. jsdom cannot load images or compute the cascade, hence Playwright.
 */

// ignore-files.png: ~28 % transparent / semi-transparent pixels (window shadow)
const PAGE = '/intellij-idea-tips-tricks-improving-performance/';
const IMAGE = 'img.lqip[alt="ignore-files"]';

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
  it('shows the blurred mosaic until the image loads, then removes it', async () => {
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
    expect(before.image).toMatch(/^url\("data:image\/svg\+xml/);
    expect(before.filter).toMatch(/^blur\(/);

    releaseImage();
    await page.waitForSelector(`${IMAGE}[data-loaded]`);

    const after = await placeholderStyle();
    expect(after.image.slice(0, 40), 'mosaic still set after load').toBe('none');
    expect(after.color).toBe('rgba(0, 0, 0, 0)');
    // the blur fades out over --lqip-transition-duration
    await page.waitForFunction(
      (selector) => getComputedStyle(document.querySelector(selector)).filter === 'blur(0px)',
      IMAGE,
    );
  }, 30000);

  it('shows the image unblurred when JavaScript is disabled', async () => {
    // The onload handler that sets data-loaded never runs; the <noscript> style in base.njk takes over
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
    try {
      const noJsPage = await context.newPage();
      await noJsPage.goto(server.baseUrl + PAGE);
      const style = await noJsPage.$eval(IMAGE, (img) => {
        const computed = getComputedStyle(img);
        return { loaded: img.hasAttribute('data-loaded'), image: computed.backgroundImage, filter: computed.filter };
      });
      expect(style.loaded).toBe(false);
      expect(style.image.slice(0, 40), 'mosaic set without JS').toBe('none');
      expect(style.filter).toBe('none');
    } finally {
      await context.close();
    }
  }, 30000);
});
