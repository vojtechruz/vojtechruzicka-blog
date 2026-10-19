import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { serveSite } from './static-server.js';
import { configurePlaywrightBrowserPath } from '../config/env-utils.js';

/**
 * The image lightbox (src/scripts/lightbox.js) in a real browser: which images it offers, the modal
 * dialog's focus handling and Escape, and that the enlarged image downloads a candidate big enough
 * for the size it shows at. jsdom has neither layout nor a modal <dialog>; the unit tests are in
 * tests/lightbox-script.test.js.
 */

const IN_POST = 'main.post > article > .image-wrapper';

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

async function openPage(path, viewport) {
  const page = await browser.newPage({ viewport });
  await page.goto(server.baseUrl + path, { waitUntil: 'load' });
  // The script decides in its first ResizeObserver callback, which runs with the next rendered frames
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  return page;
}

const zoomable = (page) =>
  page.$$eval(`${IN_POST} img`, (imgs) => imgs.map((img) => Boolean(img.closest('.lightbox-trigger'))));

describe('Image lightbox', () => {
  it('opens from the keyboard, traps focus, closes on Escape and returns focus', async () => {
    const page = await openPage('/idea-compare-files-and-folders/', { width: 1280, height: 800 });
    try {
      const trigger = page.locator(`${IN_POST} > .lightbox-trigger`).first();
      await trigger.focus();
      await page.keyboard.press('Enter');

      const dialog = page.locator('dialog.lightbox');
      await expect.poll(() => dialog.evaluate((el) => el.open)).toBe(true);
      expect(await page.evaluate(() => document.activeElement.className)).toBe('lightbox-close');
      // Modal: the page behind is inert, so Tab never reaches it (from the dialog's only control focus
      // goes to the browser UI, where the document reports <body>, and then back)
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press('Tab');
        const inPage = await page.evaluate(
          () => document.activeElement !== document.body && !document.activeElement.closest('dialog.lightbox'),
        );
        expect(inPage).toBe(false);
      }
      expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe('hidden');

      await page.keyboard.press('Escape');
      await expect.poll(() => dialog.evaluate((el) => el.open)).toBe(false);
      await expect.poll(() => page.evaluate(() => document.body.classList.contains('lightbox-open'))).toBe(false);
      expect(await trigger.evaluate((el) => el === document.activeElement)).toBe(true);
    } finally {
      await page.close();
    }
  });

  it('shows a visible focus ring around a focused image, not clipped by its wrapper', async () => {
    const page = await openPage('/idea-compare-files-and-folders/', { width: 1280, height: 800 });
    try {
      const trigger = page.locator(`${IN_POST} > .lightbox-trigger`).first();
      await trigger.scrollIntoViewIfNeeded();
      const box = await trigger.boundingBox();
      // The ring (2 px, 2 px outside the button) lands in a strip just above the image
      const strip = {
        x: Math.ceil(box.x),
        y: Math.round(box.y) - 4,
        width: Math.floor(box.width),
        height: 2,
      };
      const ringPixels = async () => {
        const { data, info } = await sharp(await page.screenshot({ clip: strip }))
          .raw()
          .toBuffer({ resolveWithObject: true });
        let count = 0;
        for (let i = 0; i < data.length; i += info.channels) {
          // --color-focus-ring: #93c5fd
          if (Math.abs(data[i] - 0x93) + Math.abs(data[i + 1] - 0xc5) + Math.abs(data[i + 2] - 0xfd) < 30) {
            count++;
          }
        }
        return count / (info.width * info.height);
      };

      expect(await ringPixels()).toBe(0);
      await trigger.focus();
      expect(await trigger.evaluate((el) => el.matches(':focus-visible'))).toBe(true);
      // The ring fades in (global transition), so poll
      await expect.poll(ringPixels).toBeGreaterThan(0.9);
    } finally {
      await page.close();
    }
  });

  it('shows the image larger, downloading a candidate for that size only on demand', async () => {
    const page = await openPage('/idea-compare-files-and-folders/', { width: 1280, height: 800 });
    try {
      const requested = [];
      page.on('request', (request) => requested.push(request.url().split('/').pop()));
      const trigger = page.locator(`${IN_POST} > .lightbox-trigger`).first();
      const inPage = await trigger.locator('img').evaluate((img) => img.getBoundingClientRect().width);
      await trigger.click();

      const large = page.locator('dialog.lightbox img');
      await expect.poll(() => large.evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
      const shown = await large.evaluate((img) => ({
        width: img.getBoundingClientRect().width,
        candidate: Number(img.currentSrc.match(/-(\d+)\.\w+$/)[1]),
        file: img.currentSrc.split('/').pop(),
      }));
      expect(shown.width).toBeGreaterThan(inPage * 1.5);
      expect(shown.width).toBeLessThanOrEqual(1280);
      // Sharp at this size, and fetched after the click
      expect(shown.candidate).toBeGreaterThanOrEqual(shown.width);
      expect(requested).toContain(shown.file);

      // A click on the image closes it
      await large.click();
      await expect.poll(() => page.locator('dialog.lightbox').evaluate((el) => el.open)).toBe(false);
    } finally {
      await page.close();
    }
  });

  it('offers zoom only for images it would show noticeably larger', async () => {
    // /jshell-repl/ has one large screenshot and one 509 px image the column shows at full size
    const desktop = await openPage('/jshell-repl/', { width: 1280, height: 800 });
    try {
      const widths = await desktop.$$eval(`${IN_POST} img`, (imgs) =>
        imgs.map((img) => Number(img.getAttribute('width'))),
      );
      const offered = await zoomable(desktop);
      expect(offered).toEqual(widths.map((width) => width > 1000));
      expect(offered).toContain(true);
      expect(offered).toContain(false);
    } finally {
      await desktop.close();
    }

    // On a phone the column already spans the screen: pinch-zoom, not a dialog showing the same size
    const phone = await openPage('/idea-compare-files-and-folders/', { width: 390, height: 844 });
    try {
      expect(await zoomable(phone)).not.toContain(true);
      expect(await phone.locator('dialog.lightbox').count()).toBe(0);
    } finally {
      await phone.close();
    }
  });
});
