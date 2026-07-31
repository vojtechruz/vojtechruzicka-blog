import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { loadPage, SITE_DIR } from './helpers.js';
import {
  getOgTitle,
  getOgImage,
  getOgImageWidth,
  getOgImageHeight,
  getOgImageAlt,
  getTwitterCard,
  getTwitterTitle,
  getTwitterImage,
  getTwitterImageAlt,
  getTwitterDescription,
  getTwitterSite,
  getTwitterCreator,
  getOgDescription,
  getFediverseCreator,
} from './queries/seo.js';
import siteConfig from '../src/_data/site.js';

// A published post with a featured image, used as the representative article page.
const POST_URL = '/owasp-top-10-2025/';

// Social cards are cropped to roughly this ratio by X, Mastodon and Bluesky.
const OG_IMAGE_WIDTH = '1200';
const OG_IMAGE_HEIGHT = '630';

describe('Social meta tags', () => {
  describe('post page', () => {
    const $ = loadPage(POST_URL);

    it('uses the generated og-image.jpg at a stable URL', () => {
      expect(getOgImage($)).toBe(`${siteConfig.url}${POST_URL}og-image.jpg`);
      expect(getTwitterImage($)).toBe(getOgImage($));
    });

    it('declares the og image dimensions', () => {
      expect(getOgImageWidth($)).toBe(OG_IMAGE_WIDTH);
      expect(getOgImageHeight($)).toBe(OG_IMAGE_HEIGHT);
    });

    it('generates the og image at the declared dimensions', async () => {
      const imagePath = `${SITE_DIR}${POST_URL}og-image.jpg`;
      expect(existsSync(imagePath), `Missing ${imagePath}`).toBe(true);

      const sharp = (await import('sharp')).default;
      const metadata = await sharp(readFileSync(imagePath)).metadata();

      expect(metadata.width).toBe(Number(OG_IMAGE_WIDTH));
      expect(metadata.height).toBe(Number(OG_IMAGE_HEIGHT));
    });

    it('labels the card image with the post title', () => {
      expect(getOgImageAlt($)).toBe('OWASP Top 10 2025');
      expect(getTwitterImageAlt($)).toBe(getOgImageAlt($));
    });
  });

  describe('home page', () => {
    const $ = loadPage('/');

    it('uses the site name as the card headline rather than the page title', () => {
      expect(getOgTitle($)).toBe(siteConfig.title);
      expect(getTwitterTitle($)).toBe(siteConfig.title);
    });

    it('falls back to the default share image with known dimensions and alt text', () => {
      expect(getOgImage($)).toBe(`${siteConfig.url}${siteConfig.defaultShareImage}`);
      expect(getOgImageWidth($)).toBe(String(siteConfig.defaultShareImageWidth));
      expect(getOgImageHeight($)).toBe(String(siteConfig.defaultShareImageHeight));
      expect(getOgImageAlt($)).toBe(siteConfig.defaultShareImageAlt);
    });

    it('ships the default share image at the declared dimensions', async () => {
      const sharp = (await import('sharp')).default;
      const metadata = await sharp(readFileSync(`${SITE_DIR}${siteConfig.defaultShareImage}`)).metadata();

      expect(metadata.width).toBe(siteConfig.defaultShareImageWidth);
      expect(metadata.height).toBe(siteConfig.defaultShareImageHeight);
    });
  });

  describe('every page', () => {
    // Mastodon shows an author byline on preview cards for allowlisted domains
    it.each([POST_URL, '/', '/about/', '/topics/security/'])('%s declares the fediverse creator', (url) => {
      expect(getFediverseCreator(loadPage(url))).toBe(siteConfig.fediverseCreator);
    });

    it.each([POST_URL, '/', '/about/', '/topics/security/'])('%s uses a large summary card', (url) => {
      expect(getTwitterCard(loadPage(url))).toBe('summary_large_image');
    });

    // Both tags render only when site.twitter is set — this catches the handle
    // silently disappearing from src/_data/site.js.
    it.each([POST_URL, '/', '/about/', '/topics/security/'])('%s attributes the card to the site handle', (url) => {
      const $ = loadPage(url);

      expect(siteConfig.twitter).toMatch(/^@./);
      expect(getTwitterSite($)).toBe(siteConfig.twitter);
      expect(getTwitterCreator($)).toBe(siteConfig.twitter);
    });

    it.each([POST_URL, '/', '/about/', '/topics/security/'])('%s keeps the twitter description in sync with og', (url) => {
      const $ = loadPage(url);

      expect(getTwitterDescription($)).toBeTruthy();
      expect(getTwitterDescription($)).toBe(getOgDescription($));
    });
  });
});
