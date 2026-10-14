import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium } from 'playwright';
import { serveSite } from './static-server.js';
import { configurePlaywrightBrowserPath } from '../config/env-utils.js';

/**
 * Clips that stand in for GIFs (docs/VIDEO.md) in a real browser: the built page, its bundled
 * video-autoplay.js and real media playback, which jsdom has none of. Playwright's Chromium plays
 * the WebM source.
 */

const PAGE = '/idea-analyzing-dependencies/'; // four clips, far apart
const CLIPS = 'video.video-embed[data-autoplay]';

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

async function openPost(contextOptions = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...contextOptions });
  const page = await context.newPage();
  await page.goto(server.baseUrl + PAGE, { waitUntil: 'load' });
  return { context, page };
}

const pausedStates = (page) => page.$$eval(CLIPS, (videos) => videos.map((video) => video.paused));

describe('GIF-like video clips', () => {
  it('play only while in view, muted and looped', async () => {
    const { context, page } = await openPost();
    try {
      const clips = page.locator(CLIPS);
      expect(await clips.count()).toBeGreaterThan(1);

      await clips.nth(1).scrollIntoViewIfNeeded();
      await page.waitForFunction((sel) => !document.querySelectorAll(sel)[1].paused, CLIPS);

      const second = await clips.nth(1).evaluate((video) => ({ muted: video.muted, loop: video.loop }));
      expect(second).toEqual({ muted: true, loop: true });
      expect((await pausedStates(page))[0], 'the clip scrolled past stays paused').toBe(true);

      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForFunction((sel) => document.querySelectorAll(sel)[1].paused, CLIPS);
    } finally {
      await context.close();
    }
  });

  it('stays paused after the reader pauses it, even when scrolled back into view', async () => {
    const { context, page } = await openPost();
    try {
      const clip = page.locator(CLIPS).nth(1);
      await clip.scrollIntoViewIfNeeded();
      await page.waitForFunction((sel) => !document.querySelectorAll(sel)[1].paused, CLIPS);

      await clip.evaluate((video) => video.pause()); // as the controls would
      await page.evaluate(() => window.scrollTo(0, 0));
      await clip.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      expect((await pausedStates(page))[1]).toBe(true);
    } finally {
      await context.close();
    }
  });

  it('does not autoplay when the reader prefers reduced motion', async () => {
    const { context, page } = await openPost({ reducedMotion: 'reduce' });
    try {
      await page.locator(CLIPS).nth(1).scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      expect(await pausedStates(page)).not.toContain(false);
    } finally {
      await context.close();
    }
  });
});
