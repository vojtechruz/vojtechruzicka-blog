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
  getOgType,
  getArticlePublishedTime,
  getArticleModifiedTime,
  getArticleAuthor,
  getArticleTags,
  getArticleProperties,
} from './queries/seo.js';
import siteConfig from '../src/_data/site.js';
import { getPostTopicNames } from './queries/post.js';

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

  describe('article properties (og:type=article)', () => {
    const RFC3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
    const ARTICLES = [POST_URL, '/angular/01-getting-started/', '/exam-notes-pivotal-certified-spring-professional/'];

    function blogPosting($) {
      return $('script[type="application/ld+json"]')
        .map((_, el) => JSON.parse($(el).text()))
        .get()
        .find((block) => block['@type'] === 'BlogPosting');
    }

    it.each(ARTICLES)('%s is typed as an article with RFC 3339 publish/modify times', (url) => {
      const $ = loadPage(url);

      expect(getOgType($)).toBe('article');
      expect(getArticlePublishedTime($)).toMatch(RFC3339);
      expect(getArticleModifiedTime($)).toMatch(RFC3339);
      expect(Date.parse(getArticleModifiedTime($))).toBeGreaterThanOrEqual(Date.parse(getArticlePublishedTime($)));
    });

    it.each(ARTICLES)('%s uses the same dates as the BlogPosting JSON-LD', (url) => {
      const $ = loadPage(url);
      const posting = blogPosting($);

      expect(getArticlePublishedTime($)).toBe(posting.datePublished);
      expect(getArticleModifiedTime($)).toBe(posting.dateModified);
    });

    it('reflects the frontmatter dates of an updated post', () => {
      const $ = loadPage('/exam-notes-pivotal-certified-spring-professional/');
      expect(getArticlePublishedTime($).startsWith('2016-10-24')).toBe(true);
      expect(getArticleModifiedTime($).startsWith('2018-07-12')).toBe(true);
    });

    it.each(ARTICLES)('%s names the author by profile URL, as the OG spec expects', (url) => {
      expect(getArticleAuthor(loadPage(url))).toBe(siteConfig.person.url);
      expect(siteConfig.person.url).toMatch(/^https:\/\//);
    });

    it.each(ARTICLES)('%s mirrors the post topics as article:tag', (url) => {
      const $ = loadPage(url);
      expect(getArticleTags($)).toEqual(getPostTopicNames($));
      expect(getArticleTags($).length).toBeGreaterThan(0);
    });

    it.each(['/', '/about/', '/topics/security/', '/search/', '/pages/2/'])(
      '%s is a website and carries no article:* properties',
      (url) => {
        const $ = loadPage(url);
        expect(getOgType($)).toBe('website');
        expect(getArticleProperties($)).toEqual([]);
      },
    );
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

    it.each([POST_URL, '/', '/about/', '/topics/security/'])(
      '%s keeps the twitter description in sync with og',
      (url) => {
        const $ = loadPage(url);

        expect(getTwitterDescription($)).toBeTruthy();
        expect(getTwitterDescription($)).toBe(getOgDescription($));
      },
    );
  });
});
