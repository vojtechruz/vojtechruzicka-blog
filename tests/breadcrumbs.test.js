import { describe, it, expect } from 'vitest';
import { loadPage, loadPageHtml } from './helpers.js';
import seriesMetadata from '../src/_data/seriesMetadata.js';
import eleventyComputed from '../src/_data/eleventyComputed.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a minimal data object for eleventyComputed.breadcrumbs().
 * filePathStem must start with /posts/ for getPageKind to return 'post'.
 */
function makePostData({ url, title = 'Test Post', topics = [], seriesMeta = seriesMetadata } = {}) {
  return {
    page: { url, filePathStem: `/posts${url}index` },
    title,
    topics,
    seriesMetadata: seriesMeta,
  };
}

/** Extract the BreadcrumbList JSON-LD block from raw HTML, or return null. */
function extractBreadcrumbList(html) {
  const matches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  for (const [, json] of matches) {
    try {
      const parsed = JSON.parse(json.trim());
      if (parsed['@type'] === 'BreadcrumbList') {
        return parsed;
      }
    } catch {
      // skip malformed blocks
    }
  }
  return null;
}

// A known published non-series post used for integration tests
const NON_SERIES_POST_URL = '/break-java-generics-naming-convention/';

// ---------------------------------------------------------------------------
// Unit tests – eleventyComputed.breadcrumbs() for series posts
// ---------------------------------------------------------------------------

describe('breadcrumbs – series posts (unit)', () => {
  it('every series post gets a series-based hierarchy', () => {
    for (const series of seriesMetadata) {
      for (const postUrl of series.posts) {
        const crumbs = eleventyComputed.breadcrumbs(makePostData({ url: postUrl }));
        expect(
          crumbs.map((c) => c.url),
          `wrong path for ${postUrl}`,
        ).toEqual(['/', '/series/', `/series/${series.slug}/`, postUrl]);
      }
    }
  });

  it('series crumb carries the correct series name', () => {
    for (const series of seriesMetadata) {
      const crumbs = eleventyComputed.breadcrumbs(makePostData({ url: series.posts[0] }));
      expect(crumbs[2].name, `wrong name for ${series.slug}`).toBe(series.name);
    }
  });

  it('last crumb carries the post title', () => {
    const series = seriesMetadata[0];
    const crumbs = eleventyComputed.breadcrumbs(makePostData({ url: series.posts[0], title: 'Getting Started' }));
    expect(crumbs.at(-1)).toEqual({ name: 'Getting Started', url: series.posts[0] });
  });

  it('produces exactly 4 crumbs: Home / Series / Series Name / Post', () => {
    const series = seriesMetadata[0];
    const crumbs = eleventyComputed.breadcrumbs(makePostData({ url: series.posts[0] }));
    expect(crumbs).toHaveLength(4);
  });

  it('first crumb is always Home /', () => {
    const series = seriesMetadata[0];
    const crumbs = eleventyComputed.breadcrumbs(makePostData({ url: series.posts[0] }));
    expect(crumbs[0]).toEqual({ name: 'Home', url: '/' });
  });

  it('second crumb is the Series listing page', () => {
    const series = seriesMetadata[0];
    const crumbs = eleventyComputed.breadcrumbs(makePostData({ url: series.posts[0] }));
    expect(crumbs[1]).toEqual({ name: 'Series', url: '/series/' });
  });

  it('does not include /topics/ for series posts', () => {
    for (const series of seriesMetadata) {
      const crumbs = eleventyComputed.breadcrumbs(makePostData({ url: series.posts[0] }));
      expect(crumbs.some((c) => c.url === '/topics/')).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// Unit tests – eleventyComputed.breadcrumbs() for non-series posts
// ---------------------------------------------------------------------------

describe('breadcrumbs – non-series posts (unit)', () => {
  const url = '/some-standalone-post/';

  it('routes non-series post with a topic through Topics hierarchy', () => {
    const crumbs = eleventyComputed.breadcrumbs(makePostData({ url, topics: ['JavaScript'] }));
    expect(crumbs.map((c) => c.url)).toEqual(['/', '/topics/', '/topics/javascript/', url]);
  });

  it('includes Topics as second crumb', () => {
    const crumbs = eleventyComputed.breadcrumbs(makePostData({ url, topics: ['Java'] }));
    expect(crumbs[1]).toEqual({ name: 'Topics', url: '/topics/' });
  });

  it('uses the first non-generic topic as primary', () => {
    const crumbs = eleventyComputed.breadcrumbs(makePostData({ url, topics: ['blog', 'Spring'] }));
    expect(crumbs[2]).toEqual({ name: 'Spring', url: '/topics/spring/' });
  });

  it('omits the topic level when no topics are present', () => {
    const crumbs = eleventyComputed.breadcrumbs(makePostData({ url, topics: [] }));
    expect(crumbs.map((c) => c.url)).toEqual(['/', '/topics/', url]);
  });

  it('produces 4 crumbs when a topic is present', () => {
    const crumbs = eleventyComputed.breadcrumbs(makePostData({ url, topics: ['Java'] }));
    expect(crumbs).toHaveLength(4);
  });

  it('produces 3 crumbs when no topics are present', () => {
    const crumbs = eleventyComputed.breadcrumbs(makePostData({ url, topics: [] }));
    expect(crumbs).toHaveLength(3);
  });

  it('never produces a /series/ crumb for a non-series URL', () => {
    const crumbs = eleventyComputed.breadcrumbs(makePostData({ url, topics: ['Java'] }));
    expect(crumbs.some((c) => c.url.startsWith('/series/'))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Integration tests – visual breadcrumbs nav in built HTML
// ---------------------------------------------------------------------------

describe('breadcrumbs – visual nav on series posts', () => {
  it('every series post renders a nav.breadcrumbs', () => {
    for (const series of seriesMetadata) {
      for (const postUrl of series.posts) {
        const $ = loadPage(postUrl);
        expect($('nav.breadcrumbs').length, `nav.breadcrumbs missing on ${postUrl}`).toBe(1);
      }
    }
  });

  it('breadcrumb trail links to /series/ and the series page', () => {
    for (const series of seriesMetadata) {
      for (const postUrl of series.posts) {
        const $ = loadPage(postUrl);
        const hrefs = $('nav.breadcrumbs a')
          .map((_, el) => $(el).attr('href'))
          .get();
        expect(hrefs, `missing /series/ on ${postUrl}`).toContain('/series/');
        expect(hrefs, `missing /series/${series.slug}/ on ${postUrl}`).toContain(`/series/${series.slug}/`);
      }
    }
  });

  it('series page link text matches the series name', () => {
    for (const series of seriesMetadata) {
      const $ = loadPage(series.posts[0]);
      const seriesLink = $(`nav.breadcrumbs a[href="/series/${series.slug}/"]`);
      expect(seriesLink.length, `series link missing on ${series.posts[0]}`).toBe(1);
      expect(seriesLink.text().trim()).toBe(series.name);
    }
  });

  it('last breadcrumb item has aria-current="page"', () => {
    for (const series of seriesMetadata) {
      for (const postUrl of series.posts) {
        const $ = loadPage(postUrl);
        expect($('nav.breadcrumbs [aria-current="page"]').length, `aria-current missing on ${postUrl}`).toBe(1);
      }
    }
  });

  it('series post breadcrumbs do not link to /topics/', () => {
    for (const series of seriesMetadata) {
      for (const postUrl of series.posts) {
        const $ = loadPage(postUrl);
        const hrefs = $('nav.breadcrumbs a')
          .map((_, el) => $(el).attr('href'))
          .get();
        expect(hrefs, `unexpected /topics/ on ${postUrl}`).not.toContain('/topics/');
      }
    }
  });
});

describe('breadcrumbs – visual nav on non-series posts', () => {
  it('renders a nav.breadcrumbs', () => {
    const $ = loadPage(NON_SERIES_POST_URL);
    expect($('nav.breadcrumbs').length).toBe(1);
  });

  it('links to /topics/', () => {
    const $ = loadPage(NON_SERIES_POST_URL);
    const hrefs = $('nav.breadcrumbs a')
      .map((_, el) => $(el).attr('href'))
      .get();
    expect(hrefs).toContain('/topics/');
  });

  it('does not link to /series/', () => {
    const $ = loadPage(NON_SERIES_POST_URL);
    const hrefs = $('nav.breadcrumbs a')
      .map((_, el) => $(el).attr('href'))
      .get();
    expect(hrefs.some((h) => h.startsWith('/series/'))).toBe(false);
  });

  it('last breadcrumb item has aria-current="page"', () => {
    const $ = loadPage(NON_SERIES_POST_URL);
    expect($('nav.breadcrumbs [aria-current="page"]').length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Integration tests – JSON-LD BreadcrumbList in built HTML
// ---------------------------------------------------------------------------

describe('breadcrumbs – JSON-LD BreadcrumbList on series posts', () => {
  it('every series post has a BreadcrumbList block', () => {
    for (const series of seriesMetadata) {
      for (const postUrl of series.posts) {
        const html = loadPageHtml(postUrl);
        const blist = extractBreadcrumbList(html);
        expect(blist, `BreadcrumbList missing on ${postUrl}`).not.toBeNull();
      }
    }
  });

  it('BreadcrumbList has 4 items for series posts', () => {
    for (const series of seriesMetadata) {
      for (const postUrl of series.posts) {
        const blist = extractBreadcrumbList(loadPageHtml(postUrl));
        expect(blist.itemListElement, `wrong item count on ${postUrl}`).toHaveLength(4);
      }
    }
  });

  it('item at position 2 points to /series/ with name "Series"', () => {
    for (const series of seriesMetadata) {
      for (const postUrl of series.posts) {
        const blist = extractBreadcrumbList(loadPageHtml(postUrl));
        const item = blist.itemListElement.find((i) => i.position === 2);
        expect(item.item, `item 2 URL wrong on ${postUrl}`).toMatch(/\/series\/$/);
        expect(item.name, `item 2 name wrong on ${postUrl}`).toBe('Series');
      }
    }
  });

  it('item at position 3 points to the series page with the series name', () => {
    for (const series of seriesMetadata) {
      for (const postUrl of series.posts) {
        const blist = extractBreadcrumbList(loadPageHtml(postUrl));
        const item = blist.itemListElement.find((i) => i.position === 3);
        expect(item.item, `item 3 URL wrong on ${postUrl}`).toContain(`/series/${series.slug}/`);
        expect(item.name, `item 3 name wrong on ${postUrl}`).toBe(series.name);
      }
    }
  });

  it('BreadcrumbList has no item pointing to /topics/', () => {
    for (const series of seriesMetadata) {
      for (const postUrl of series.posts) {
        const blist = extractBreadcrumbList(loadPageHtml(postUrl));
        expect(
          blist.itemListElement.some((i) => i.item.includes('/topics/')),
          `unexpected /topics/ item on ${postUrl}`,
        ).toBe(false);
      }
    }
  });
});

describe('breadcrumbs – JSON-LD BreadcrumbList on non-series posts', () => {
  it('has a BreadcrumbList block', () => {
    const blist = extractBreadcrumbList(loadPageHtml(NON_SERIES_POST_URL));
    expect(blist).not.toBeNull();
  });

  it('item at position 2 points to /topics/ with name "Topics"', () => {
    const blist = extractBreadcrumbList(loadPageHtml(NON_SERIES_POST_URL));
    const item = blist.itemListElement.find((i) => i.position === 2);
    expect(item.item).toMatch(/\/topics\/$/);
    expect(item.name).toBe('Topics');
  });

  it('has no item pointing to /series/', () => {
    const blist = extractBreadcrumbList(loadPageHtml(NON_SERIES_POST_URL));
    expect(blist.itemListElement.some((i) => i.item.includes('/series/'))).toBe(false);
  });
});
