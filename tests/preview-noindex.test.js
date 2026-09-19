import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import * as cheerio from 'cheerio';
// Nunjucks is Eleventy's engine for the .njk templates this site is built from, so it is always
// installed alongside @11ty/eleventy. Rendering the component standalone is what lets the preview
// environment be tested at all — a production build contains no preview output to assert against.
import nunjucks from 'nunjucks';
import { loadPage } from './helpers.js';
import eleventyComputed from '../src/_data/eleventyComputed.js';

/**
 * Preview deploys build from a non-production branch, so they serve unpublished "ready" drafts
 * (config/draft-utils.js) from a crawlable *.pages.dev URL. components/robots-meta.njk keeps that
 * environment out of search results — production must never inherit the restriction.
 */

const COMPONENT_PATH = 'src/_includes/components/robots-meta.njk';
const LAYOUT_PATH = 'src/_includes/layouts/base.njk';
const component = readFileSync(COMPONENT_PATH, 'utf-8');

/** Ordinary indexable pages — nothing here may carry a robots restriction in production. */
const INDEXABLE_PAGES = ['/', '/java-records/', '/topics/', '/about/'];

/** Render the robots component on its own for a given page/environment. */
function renderDirective(context = {}) {
  const html = nunjucks.renderString(component, context);
  const $ = cheerio.load(html, null, false);
  return $('meta[name="robots"]').attr('content');
}

/**
 * Every robots directive in <head>, in document order. Scoped deliberately: a robots meta placed
 * anywhere else is ignored by crawlers, so selecting site-wide would hide a misplaced tag.
 */
function headRobotsDirectives($) {
  return $('head meta[name="robots"]')
    .map((_, el) => $(el).attr('content'))
    .get();
}

describe('Robots directives', () => {
  describe('isIndexable (computed data shared with the sitemap)', () => {
    // src/_data/eleventyComputed.js is the single place that decides which pages are noindex for
    // content reasons; both the robots component and src/sitemap.xml.njk read this flag.
    const { isIndexable } = eleventyComputed;

    it('keeps ordinary pages indexable', () => {
      for (const url of [
        '/',
        '/pages/2/',
        '/java-records/',
        '/topics/',
        '/topics/java/',
        '/series/javafx/',
        '/about/',
      ]) {
        expect(isIndexable({ page: { url } }), url).toBe(true);
      }
    });

    it('marks archived posts and the archive listing as not indexable', () => {
      expect(isIndexable({ page: { url: '/archive/old-post/' }, archivedStatus: 'archived' })).toBe(false);
      expect(isIndexable({ page: { url: '/archive/' } })).toBe(false);
    });
  });

  describe('Per environment (component)', () => {
    it('keeps ordinary production pages indexable by emitting no tag at all', () => {
      expect(renderDirective({ isIndexable: true })).toBeUndefined();
    });

    it('locks a preview deploy out of search results entirely', () => {
      expect(renderDirective({ isIndexable: true, isPreview: true })).toBe('noindex, nofollow');
    });

    it('lets non-indexable pages keep passing link equity to the current article', () => {
      expect(renderDirective({ isIndexable: false })).toBe('noindex, follow');
    });

    it('prefers the preview restriction when a page is not indexable as well', () => {
      // Order matters: "noindex, follow" on a preview deploy would still invite crawlers onward.
      expect(renderDirective({ isPreview: true, isIndexable: false })).toBe('noindex, nofollow');
    });
  });

  describe('Production build output', () => {
    it('leaves ordinary pages fully indexable', () => {
      for (const path of INDEXABLE_PAGES) {
        const $ = loadPage(path);

        expect(headRobotsDirectives($), `${path} must not be restricted in production`).toEqual([]);
      }
    });

    it('still marks archived pages noindex, follow', () => {
      for (const path of ['/archive/', '/archive/chrome-audit-lighthouse-2026-05/']) {
        const $ = loadPage(path);

        expect(headRobotsDirectives($), `${path} should stay noindex, follow`).toEqual(['noindex, follow']);
      }
    });

    it('places every robots directive inside <head>, exactly once', () => {
      // A robots meta in the body is silently ignored by crawlers, so position is the whole point.
      for (const path of [...INDEXABLE_PAGES, '/archive/']) {
        const $ = loadPage(path);
        const anywhere = $('meta[name="robots"]').length;

        expect(anywhere, `${path} has a robots meta outside <head>`).toBe(headRobotsDirectives($).length);
        expect(anywhere, `${path} declares conflicting robots metas`).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Wiring', () => {
    it('is included from the base layout', () => {
      // Without this the component above would be dead code and every page silently indexable.
      const layout = readFileSync(LAYOUT_PATH, 'utf-8');

      expect(layout, `${LAYOUT_PATH} must include ${COMPONENT_PATH}`).toContain('components/robots-meta.njk');
    });

    it('keeps preview crawlable in robots.txt so the noindex tag can be read', () => {
      // Disallowing the crawler instead would be counterproductive: it could still index the URL
      // itself, and it would never fetch the page to see the noindex tag.
      const robots = readFileSync('src/static/robots.txt', 'utf-8');

      expect(robots).not.toMatch(/^Disallow:[ \t]*\S/m);
    });
  });
});
