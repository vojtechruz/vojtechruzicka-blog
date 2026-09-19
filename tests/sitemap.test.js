import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { globSync } from 'glob';
import * as cheerio from 'cheerio';
import { getAllPosts, SITE_DIR } from './helpers.js';
import siteConfig from '../src/_data/site.js';
import seriesMetadata from '../src/_data/seriesMetadata.js';
import { slugify } from '../config/utils/formatting.js';
import { getSitemapLastmod, getPostLastmod, newestPostLastmod, toDate } from '../config/utils/sitemap.js';

/**
 * Tests for the generated sitemap (src/sitemap.xml.njk, docs/SITEMAP.md).
 *
 * They assert against a production-shaped build (`npm run build`). A dev-server build includes
 * drafts, which are indexable pages like any other, so the draft-specific assertions below are the
 * ones that fail against `_site` left behind by `npm run dev`.
 */

const SITEMAP_PATH = `${SITE_DIR}/sitemap.xml`;
const SITE_URL = siteConfig.url.replace(/\/$/, '');
const SITEMAP_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9';
const RFC3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})$/;
const POSTS_PER_PAGE = 10; // pagination.size in src/pages/index.njk

const allSourcePosts = getAllPosts();
const draftPosts = allSourcePosts.filter((p) => p.frontmatter.draftStatus);
const archivedPosts = allSourcePosts.filter((p) => p.frontmatter.archivedStatus);
const publishedPosts = allSourcePosts.filter(
  (p) => p.frontmatter.path && !p.frontmatter.draftStatus && !p.frontmatter.archivedStatus,
);

/** 'YYYY-MM-DD' from a frontmatter value, whether gray-matter parsed it as a Date or kept the string. */
function dayOf(value) {
  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
}

/** The day a source post last changed — what its sitemap entry (and every listing of it) must report. */
function lastChangedDay({ frontmatter }) {
  return dayOf(frontmatter.dateModified || frontmatter.date);
}

function newestDay(posts) {
  return posts.map(lastChangedDay).sort().at(-1);
}

function absolute(urlPath) {
  return `${SITE_URL}${urlPath}`;
}

/** Parse the built sitemap: `entries` maps absolute loc → lastmod string (or undefined). */
function readSitemap() {
  const xml = readFileSync(SITEMAP_PATH, 'utf-8');
  const $ = cheerio.load(xml, { xml: true });
  const entries = new Map();
  $('urlset > url').each((_, el) => {
    entries.set($(el).find('loc').text().trim(), $(el).find('lastmod').text().trim() || undefined);
  });
  return { xml, $, entries };
}

/**
 * Every built HTML page keyed by URL path, with whether its <head> allows indexing. Only a robots
 * meta inside <head> counts — crawlers ignore one anywhere else.
 */
function builtPages() {
  const pages = new Map();
  for (const file of globSync(`${SITE_DIR}/**/index.html`, { posix: true })) {
    const urlPath = file.slice(SITE_DIR.length).replace(/index\.html$/, '');
    const $ = cheerio.load(readFileSync(file, 'utf-8'));
    const robots = $('head meta[name="robots"]')
      .map((_, el) => $(el).attr('content') || '')
      .get();
    pages.set(urlPath, { indexable: !robots.some((content) => /noindex/i.test(content)) });
  }
  return pages;
}

describe('Sitemap (sitemap.xml)', () => {
  let sitemap;

  beforeAll(() => {
    expect(existsSync(SITEMAP_PATH), 'sitemap.xml does not exist. Run "npm run build" first.').toBe(true);
    sitemap = readSitemap();
  });

  describe('Structure', () => {
    it('starts with the XML declaration and uses the sitemap namespace', () => {
      // The declaration is only legal as the very first bytes — a stray newline from the template
      // in front of it makes the whole file malformed.
      expect(sitemap.xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
      expect(sitemap.$('urlset').attr('xmlns')).toBe(SITEMAP_NS);
    });

    it('has at least one entry and stays within the 50,000-URL protocol limit', () => {
      expect(sitemap.entries.size).toBeGreaterThan(0);
      expect(sitemap.entries.size).toBeLessThanOrEqual(50000);
    });

    it('lists every URL exactly once', () => {
      expect(sitemap.$('urlset > url').length).toBe(sitemap.entries.size);
    });

    it('lists only absolute, canonical-looking URLs under the site origin', () => {
      for (const loc of sitemap.entries.keys()) {
        expect(loc.startsWith(`${SITE_URL}/`), `"${loc}" is not under ${SITE_URL}`).toBe(true);
        // Every page is a directory URL (canonical form); no .html, query strings or fragments.
        expect(loc, `"${loc}" is not a canonical directory URL`).toMatch(/\/$/);
        expect(loc, `"${loc}" carries a query string or fragment`).not.toMatch(/[?#]/);
      }
    });
  });

  describe('Membership mirrors indexability of the build output', () => {
    // The one invariant that matters: the sitemap lists a page if and only if that page is built
    // and search engines are allowed to index it. Listing a noindex page sends crawlers a
    // conflicting signal; leaving out an indexable one hides it from discovery.
    it('lists exactly the built pages that are not noindex', () => {
      const pages = builtPages();
      const indexable = [...pages].filter(([, page]) => page.indexable).map(([urlPath]) => absolute(urlPath));
      const listed = [...sitemap.entries.keys()];

      const missing = indexable.filter((loc) => !sitemap.entries.has(loc)).sort();
      const extra = listed.filter((loc) => !pages.get(loc.slice(SITE_URL.length))?.indexable).sort();

      expect(missing, 'indexable pages missing from the sitemap').toEqual([]);
      expect(extra, 'sitemap entries that are noindex or not built').toEqual([]);
    });
  });

  describe('Posts', () => {
    it('contains every published post', () => {
      for (const { frontmatter, filePath } of publishedPosts) {
        expect(sitemap.entries.has(absolute(frontmatter.path)), `missing published post ${filePath}`).toBe(true);
      }
    });

    it.skipIf(draftPosts.length === 0)('excludes drafts (a dev-server build fails this by design)', () => {
      for (const { frontmatter, filePath } of draftPosts) {
        expect(sitemap.entries.has(absolute(frontmatter.path)), `draft listed: ${filePath}`).toBe(false);
      }
    });

    it.skipIf(archivedPosts.length === 0)('excludes archived posts, which are noindex', () => {
      for (const { frontmatter, filePath } of archivedPosts) {
        expect(sitemap.entries.has(absolute(frontmatter.path)), `archived post listed: ${filePath}`).toBe(false);
      }
    });
  });

  describe('Pages', () => {
    it('contains the core pages', () => {
      for (const urlPath of ['/', '/about/', '/topics/', '/series/', '/search/']) {
        expect(sitemap.entries.has(absolute(urlPath)), `missing ${urlPath}`).toBe(true);
      }
    });

    it('contains a topic page for every topic of a published post', () => {
      const topics = new Set(publishedPosts.flatMap((p) => p.frontmatter.topics || []).map(slugify));
      expect(topics.size).toBeGreaterThan(0);
      for (const topic of topics) {
        expect(sitemap.entries.has(absolute(`/topics/${topic}/`)), `missing topic page ${topic}`).toBe(true);
      }
    });

    it('contains a page for every series', () => {
      expect(seriesMetadata.length).toBeGreaterThan(0);
      for (const { slug } of seriesMetadata) {
        expect(sitemap.entries.has(absolute(`/series/${slug}/`)), `missing series page ${slug}`).toBe(true);
      }
    });

    it('contains the paginated home pages, which are indexable', () => {
      const pageCount = Math.ceil(publishedPosts.length / POSTS_PER_PAGE);
      expect(pageCount, 'test needs more than one home page to be meaningful').toBeGreaterThan(1);
      for (let n = 2; n <= pageCount; n++) {
        expect(sitemap.entries.has(absolute(`/pages/${n}/`)), `missing /pages/${n}/`).toBe(true);
      }
    });

    it('excludes the archive listing, the 404 page and the non-HTML outputs', () => {
      for (const urlPath of ['/archive/', '/404.html', '/404/', '/feed.xml', '/atom.xml', '/sitemap.xml']) {
        expect(sitemap.entries.has(absolute(urlPath)), `${urlPath} should not be listed`).toBe(false);
      }
    });
  });

  describe('lastmod', () => {
    it('is a W3C datetime and never in the future wherever present', () => {
      const now = Date.now();
      for (const [loc, lastmod] of sitemap.entries) {
        if (lastmod === undefined) {
          continue;
        }
        expect(lastmod, `${loc}`).toMatch(RFC3339);
        expect(new Date(lastmod).getTime(), `${loc} lastmod is in the future`).toBeLessThanOrEqual(now);
      }
    });

    it('reports dateModified for posts, falling back to the publish date', () => {
      const withModified = publishedPosts.filter((p) => p.frontmatter.dateModified);
      expect(withModified.length, 'expected some posts to declare dateModified').toBeGreaterThan(0);

      for (const post of publishedPosts) {
        const lastmod = sitemap.entries.get(absolute(post.frontmatter.path));
        expect(lastmod, `${post.filePath} has no lastmod`).toBeDefined();
        expect(dayOf(lastmod), `${post.filePath}`).toBe(lastChangedDay(post));
      }
    });

    it('reports the newest post change on the home page and its pagination', () => {
      const expected = newestDay(publishedPosts);
      const listingPages = [...sitemap.entries.keys()]
        .map((loc) => loc.slice(SITE_URL.length))
        .filter((urlPath) => urlPath === '/' || /^\/pages\/\d+\/$/.test(urlPath));
      expect(listingPages.length).toBeGreaterThan(1);

      for (const urlPath of listingPages) {
        expect(dayOf(sitemap.entries.get(absolute(urlPath))), urlPath).toBe(expected);
      }
    });

    it('reports the newest change among a topic’s own posts on each topic page', () => {
      const byTopic = new Map();
      for (const post of publishedPosts) {
        for (const topic of post.frontmatter.topics || []) {
          const slug = slugify(topic);
          byTopic.set(slug, [...(byTopic.get(slug) || []), post]);
        }
      }

      for (const [slug, posts] of byTopic) {
        expect(dayOf(sitemap.entries.get(absolute(`/topics/${slug}/`))), `/topics/${slug}/`).toBe(newestDay(posts));
      }
    });

    it('reports the newest change among a series’ posts on each series page', () => {
      for (const series of seriesMetadata) {
        const posts = publishedPosts.filter((p) => series.posts.includes(p.frontmatter.path));
        expect(posts.length, `series ${series.slug} has no published posts`).toBeGreaterThan(0);
        expect(dayOf(sitemap.entries.get(absolute(`/series/${series.slug}/`))), series.slug).toBe(newestDay(posts));
      }
    });

    it('is omitted on pages whose changes nothing tracks', () => {
      // Eleventy's fallback date for these is the file creation time, which on Cloudflare Pages
      // is the deploy time — a lastmod that moves on every deploy is worse than none.
      for (const urlPath of ['/about/', '/search/']) {
        expect(sitemap.entries.has(absolute(urlPath)), `${urlPath} missing`).toBe(true);
        expect(sitemap.entries.get(absolute(urlPath)), `${urlPath} should have no lastmod`).toBeUndefined();
      }
    });
  });
});

describe('getSitemapLastmod (unit)', () => {
  const post = (url, data, date) => ({ url, date, data: { pageKind: 'post', ...data } });
  const posts = [
    post('/a/', { topics: ['Java'], modifiedDate: '2020-01-01' }, new Date('2019-01-01')),
    post('/b/', { topics: ['Java', 'Spring'], modifiedDate: '2021-06-15' }, new Date('2021-06-15')),
    post('/c/', { topics: ['CSS'], modifiedDate: '2018-03-03' }, new Date('2018-03-03')),
  ];
  const iso = (date) => date?.toISOString();

  it('toDate handles Date instances, YYYY-MM-DD strings as UTC midnight, and rejects garbage', () => {
    expect(iso(toDate('2020-01-02'))).toBe('2020-01-02T00:00:00.000Z');
    expect(iso(toDate(new Date('2020-01-02T10:00:00Z')))).toBe('2020-01-02T10:00:00.000Z');
    expect(toDate('not a date')).toBeNull();
    expect(toDate(undefined)).toBeNull();
    expect(toDate(new Date('invalid'))).toBeNull();
  });

  it('uses modifiedDate for a post, then dateModified, then the publish date', () => {
    expect(iso(getPostLastmod(posts[0]))).toBe('2020-01-01T00:00:00.000Z');
    expect(iso(getPostLastmod(post('/x/', { dateModified: '2022-02-02' }, new Date('2020-01-01'))))).toBe(
      '2022-02-02T00:00:00.000Z',
    );
    expect(iso(getPostLastmod(post('/x/', {}, new Date('2020-01-01'))))).toBe('2020-01-01T00:00:00.000Z');
    expect(getSitemapLastmod(posts[1], posts)).toEqual(getPostLastmod(posts[1]));
  });

  it('picks the newest change across a post list, or null for an empty list', () => {
    expect(iso(newestPostLastmod(posts))).toBe('2021-06-15T00:00:00.000Z');
    expect(newestPostLastmod([])).toBeNull();
  });

  it('gives site-wide listings the newest change of any post', () => {
    for (const pageKind of ['home', 'homePaginated', 'topics', 'seriesListing']) {
      expect(iso(getSitemapLastmod({ data: { pageKind } }, posts)), pageKind).toBe('2021-06-15T00:00:00.000Z');
    }
  });

  it('scopes topic and series pages to their own posts', () => {
    expect(iso(getSitemapLastmod({ data: { pageKind: 'topic', topic: 'CSS' }, url: '/topics/css/' }, posts))).toBe(
      '2018-03-03T00:00:00.000Z',
    );
    expect(iso(getSitemapLastmod({ data: { pageKind: 'topic', topic: 'Java' } }, posts))).toBe(
      '2021-06-15T00:00:00.000Z',
    );
    expect(getSitemapLastmod({ data: { pageKind: 'topic', topic: 'Nope' } }, posts)).toBeNull();

    const series = { data: { pageKind: 'series', currentSeries: { posts: ['/a/', '/c/'] } } };
    expect(iso(getSitemapLastmod(series, posts))).toBe('2020-01-01T00:00:00.000Z');
    expect(getSitemapLastmod({ data: { pageKind: 'series', currentSeries: { posts: [] } } }, posts)).toBeNull();
  });

  it('omits lastmod for plain pages and anything it does not recognise', () => {
    expect(getSitemapLastmod({ data: { pageKind: 'page' } }, posts)).toBeNull();
    expect(getSitemapLastmod({ data: { pageKind: 'archive' } }, posts)).toBeNull();
    expect(getSitemapLastmod({ data: {} }, posts)).toBeNull();
    expect(getSitemapLastmod(undefined, posts)).toBeNull();
    expect(getSitemapLastmod({ data: { pageKind: 'home' } })).toBeNull();
  });
});
