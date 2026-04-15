import { describe, it, expect } from 'vitest';
import { globSync } from 'glob';
import { loadPage, SITE_DIR } from './helpers.js';
import { getCanonicalUrl } from './queries/seo.js';
import siteConfig from '../src/_data/site.js';

describe('Canonical URLs', () => {
  const siteUrl = siteConfig.url.replace(/\/$/, '');

  // Find all HTML files in the build output to test all pages
  const htmlFiles = globSync(`${SITE_DIR}/**/*.html`);

  it('should have a list of HTML files to check', () => {
    expect(htmlFiles.length).toBeGreaterThan(0);
  });

  htmlFiles.forEach((filePath) => {
    // Convert file path back to URL path
    // e.g., "_site/about/index.html" -> "/about/"
    // e.g., "_site/404.html" -> "/404.html"
    const urlPath = filePath.replace(SITE_DIR, '').replace(/\\/g, '/');

    // Skip Google verification files or other known non-page HTML files
    if (urlPath.includes('google') && urlPath.endsWith('.html')) {
      return;
    }

    const isIndex = urlPath.endsWith('/index.html');
    const normalizedUrlPath = isIndex ? urlPath.replace(/index\.html$/, '') : urlPath;

    it(`page "${normalizedUrlPath}" should have a correct canonical URL`, () => {
      const $ = loadPage(urlPath);

      // Some files might not use the base layout and thus won't have a canonical URL
      // We check if it looks like a standard page by looking for a <title>
      if ($('title').length === 0) {
        return;
      }

      const canonical = getCanonicalUrl($);

      expect(canonical, `Canonical URL missing for ${normalizedUrlPath}`).toBeDefined();

      // The canonical URL should be absolute and match site.url + page.url
      const expectedCanonical = `${siteUrl}${normalizedUrlPath}`;
      expect(canonical).toBe(expectedCanonical);
    });
  });
});
