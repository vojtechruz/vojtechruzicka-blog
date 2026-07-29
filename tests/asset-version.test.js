import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { loadPage, SITE_DIR } from './helpers.js';

// Assets under /styles/ and /scripts/ are long-cached as immutable (src/static/_headers),
// so every reference in the built HTML must carry a ?v=<content hash> query — otherwise
// CDN/browser caches keep serving the old version after a deploy.
const VERSIONED = /\?v=[0-9a-f]{10}$/;

const HOME = '/';
const POST = '/java-records/';

describe('Asset cache busting', () => {
  it('versions the main stylesheet link', () => {
    const $ = loadPage(HOME);
    const href = $('link[rel="stylesheet"]').attr('href');

    expect(href).toContain('/styles/main.css');
    expect(href).toMatch(VERSIONED);
  });

  it('versions every local script on the home page and on a post page', () => {
    for (const path of [HOME, POST]) {
      const $ = loadPage(path);
      const sources = $('script[src^="/scripts/"]')
        .map((_, el) => $(el).attr('src'))
        .get();

      expect(sources.length).toBeGreaterThan(0);
      for (const src of sources) {
        expect(src, `${path}: ${src} is missing a cache-busting version`).toMatch(VERSIONED);
      }
    }
  });

  it('versions favicon and manifest links', () => {
    const $ = loadPage(HOME);
    const hrefs = $('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"], link[rel="manifest"]')
      .map((_, el) => $(el).attr('href'))
      .get();

    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(href, `${href} is missing a cache-busting version`).toMatch(VERSIONED);
    }
  });

  it('versions the giscus theme stylesheet URL', () => {
    const $ = loadPage(POST);
    const theme = $('script[src="https://giscus.app/client.js"]').attr('data-theme');

    expect(theme).toContain('/styles/giscus-theme.css');
    expect(theme).toMatch(VERSIONED);
  });

  it('marks only hashed or versioned asset paths as immutable in _headers', () => {
    const headers = readFileSync(`${SITE_DIR}/_headers`, 'utf-8');
    const immutablePaths = [];
    let currentPath = null;
    for (const line of headers.split('\n')) {
      if (/^\//.test(line)) {
        currentPath = line.trim();
      } else if (/^\s+\S/.test(line) && /immutable/.test(line)) {
        immutablePaths.push(currentPath);
      }
    }

    // Nested wildcard image rules match eleventy-img output (content-hashed filenames);
    // /styles/* and /scripts/* references always carry ?v= (assetUrl filter).
    const allowed = /^\/(styles|scripts)\/\*$|^\/\*\/\*\.(avif|webp|jpeg|jpg|png|svg)$/;
    expect(immutablePaths.length).toBeGreaterThan(0);
    for (const path of immutablePaths) {
      expect(path, `"${path}" must not be cached as immutable — its URL has no content hash`).toMatch(allowed);
    }
  });
});
