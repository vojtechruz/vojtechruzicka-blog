import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { loadPage } from './helpers.js';
import { getRobotsMeta } from './queries/seo.js';

/**
 * Preview deploys build from a non-production branch, so they serve unpublished "ready" drafts
 * (config/draft-utils.js) from a crawlable *.pages.dev URL. base.njk keeps that environment out
 * of search results with a noindex tag — production must never inherit it.
 */

const LAYOUT_PATH = 'src/_includes/layouts/base.njk';
const layout = readFileSync(LAYOUT_PATH, 'utf-8');

/** Ordinary indexable pages — nothing here may carry a robots restriction in production. */
const INDEXABLE_PAGES = ['/', '/java-records/', '/topics/', '/about/'];

describe('Preview deploy noindex', () => {
  describe('Production build', () => {
    it('leaves ordinary pages fully indexable', () => {
      for (const path of INDEXABLE_PAGES) {
        const $ = loadPage(path);

        expect(getRobotsMeta($), `${path} must not be restricted in production`).toBeUndefined();
      }
    });

    it('still marks archived pages noindex, follow', () => {
      // The preview branch is checked first in the template, so it must not shadow this one.
      for (const path of ['/archive/']) {
        const $ = loadPage(path);

        expect(getRobotsMeta($), `${path} should stay noindex, follow`).toBe('noindex, follow');
      }
    });
  });

  describe('Template wiring', () => {
    it('gates a noindex tag on the preview environment', () => {
      expect(layout, `${LAYOUT_PATH} must emit noindex on preview deploys`).toMatch(
        /{%\s*if\s+isPreview\s*%}\s*<meta name="robots" content="noindex/,
      );
    });

    it('keeps preview crawlable in robots.txt so the noindex tag can be read', () => {
      // Disallowing the crawler instead would be counterproductive: it could still index the URL
      // itself, and it would never fetch the page to see the noindex tag.
      const robots = readFileSync('src/static/robots.txt', 'utf-8');

      expect(robots).not.toMatch(/^Disallow:[ \t]*\S/m);
    });
  });
});
