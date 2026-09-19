import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { loadPage, SITE_DIR } from './helpers.js';

/** One page per layout (page, post-list, post) — all of them must be indexable by Pagefind. */
const INDEXED_PAGES = ['/about/', '/', '/topics/java/', '/css-flexbox/'];

function jsonLdBlocks($) {
  return $('script[type="application/ld+json"]')
    .map((_, el) => JSON.parse($(el).html()))
    .get();
}

describe('Site search', () => {
  describe('/search/ page', () => {
    it('is built with an inline Pagefind container', () => {
      const $ = loadPage('/search/');
      const container = $('#search-page.js-pagefind');

      expect(container.length).toBe(1);
      expect(container.attr('data-search-inline')).toBeDefined();
      expect(container.find('input.pagefind-ui__search-input').length, 'no-JS placeholder input').toBe(1);
      expect($('body').hasClass('search-page')).toBe(true);
    });

    it('stays out of the Pagefind index (no data-pagefind-body)', () => {
      const $ = loadPage('/search/');
      expect($('[data-pagefind-body]').length).toBe(0);
    });

    it('loads the search script that initialises inline containers', () => {
      const $ = loadPage('/search/');
      const src = $('script[src^="/scripts/search.js"]').attr('src');
      expect(src).toBeTruthy();
    });
  });

  describe('Pagefind indexing scope', () => {
    it.each(INDEXED_PAGES)('%s marks its <main> as the indexed body', (url) => {
      const $ = loadPage(url);
      expect($('main[data-pagefind-body]').length, `${url} must carry data-pagefind-body`).toBe(1);
    });
  });

  describe('Homepage SearchAction JSON-LD', () => {
    it('targets the built /search/ page with a {query} placeholder', () => {
      const $ = loadPage('/');
      const website = jsonLdBlocks($).find((block) => block['@type'] === 'WebSite');
      const action = website?.potentialAction;

      expect(action?.['@type']).toBe('SearchAction');
      expect(action['query-input']).toBe('required name=query');

      const target = new URL(action.target);
      expect(target.searchParams.get('q')).toBe('{query}');
      expect(existsSync(`${SITE_DIR}${target.pathname}index.html`), `${target.pathname} must exist`).toBe(true);
    });
  });
});
