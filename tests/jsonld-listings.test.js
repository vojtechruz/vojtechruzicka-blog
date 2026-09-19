import { describe, it, expect } from 'vitest';
import { globSync } from 'glob';
import { loadPage, SITE_DIR } from './helpers.js';
import { getCanonicalUrl } from './queries/seo.js';

// JSON-LD page type per page kind (src/_includes/components/jsonld.njk).
// Listing pages must emit CollectionPage; the branch used to test a variable
// (`isTag`) that never existed, so every topic page silently fell through to the
// generic WebPage block and nothing noticed. This sweeps every built listing page.

function jsonLdTypes($) {
  return $('script[type="application/ld+json"]')
    .map((_, el) => JSON.parse($(el).text()))
    .get()
    .map((block) => block['@type']);
}

function jsonLdBlock($, type) {
  return $('script[type="application/ld+json"]')
    .map((_, el) => JSON.parse($(el).text()))
    .get()
    .find((block) => block['@type'] === type);
}

/** Every built page under a directory, as URL paths ('/topics/java/'). */
function builtPagesUnder(dir) {
  return globSync(`${SITE_DIR}/${dir}/*/index.html`).map((file) =>
    file
      .replace(/\\/g, '/')
      .replace(SITE_DIR, '')
      .replace(/index\.html$/, ''),
  );
}

const LISTING_ROOTS = ['/topics/', '/series/', '/archive/'];
const topicPages = builtPagesUnder('topics');
const seriesPages = builtPagesUnder('series');
const paginatedHomePages = builtPagesUnder('pages');

describe('JSON-LD page types', () => {
  it('finds listing pages to sweep', () => {
    expect(topicPages.length).toBeGreaterThan(5);
    expect(seriesPages.length).toBeGreaterThan(0);
    expect(paginatedHomePages.length).toBeGreaterThan(1);
  });

  describe('CollectionPage on listing pages', () => {
    const listingPages = [...LISTING_ROOTS, ...topicPages, ...seriesPages, ...paginatedHomePages];

    it.each(listingPages)('%s emits exactly one CollectionPage and no WebPage', (url) => {
      const types = jsonLdTypes(loadPage(url));

      expect(
        types.filter((type) => type === 'CollectionPage'),
        `types on ${url}: ${types}`,
      ).toHaveLength(1);
      expect(types, `${url} must not fall through to the generic WebPage block`).not.toContain('WebPage');
      expect(types).toContain('BreadcrumbList');
    });

    it.each(listingPages)('%s describes itself consistently with the page <head>', (url) => {
      const $ = loadPage(url);
      const collection = jsonLdBlock($, 'CollectionPage');

      expect(collection.name).toBeTruthy();
      expect(collection.url).toBe(getCanonicalUrl($));
      expect(collection.description).toBe($('meta[name="description"]').attr('content'));
    });
  });

  describe('other page kinds keep their own type', () => {
    it('the homepage is a WebSite, not a CollectionPage', () => {
      const types = jsonLdTypes(loadPage('/'));
      expect(types).toContain('WebSite');
      expect(types).not.toContain('CollectionPage');
    });

    it('a post is a BlogPosting, not a CollectionPage', () => {
      const types = jsonLdTypes(loadPage('/css-flexbox/'));
      expect(types).toContain('BlogPosting');
      expect(types).not.toContain('CollectionPage');
      expect(types).not.toContain('WebPage');
    });

    it('the about page is an AboutPage', () => {
      const types = jsonLdTypes(loadPage('/about/'));
      expect(types).toContain('AboutPage');
      expect(types).not.toContain('CollectionPage');
    });

    it('a generic page (search) falls back to WebPage', () => {
      const types = jsonLdTypes(loadPage('/search/'));
      expect(types.filter((type) => type === 'WebPage')).toHaveLength(1);
      expect(types).not.toContain('CollectionPage');
    });
  });
});
