import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { SITE_DIR } from './helpers.js';

// Cache-Control policy in src/static/_headers (Cloudflare Pages format), as shipped
// in _site/_headers. The immutable-only-for-hashed-assets rule is covered by
// tests/asset-version.test.js and the security headers by tests/security-headers.test.js;
// this file pins down the caching TTLs so a deploy never freezes HTML, feeds or the
// kill-switch service worker in browser caches.

const HEADERS_PATH = `${SITE_DIR}/_headers`;

/** Parse the file into { path: [header lines] }, ignoring comments. */
function parseHeaders(text) {
  const rules = {};
  let current = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trimEnd();
    if (!line.trim()) {
      continue;
    }
    if (!/^\s/.test(line)) {
      current = line.trim();
      rules[current] = rules[current] || [];
    } else if (current) {
      rules[current].push(line.trim());
    }
  }
  return rules;
}

const rules = existsSync(HEADERS_PATH) ? parseHeaders(readFileSync(HEADERS_PATH, 'utf-8')) : null;
const cacheControl = (path) =>
  (rules[path] || []).filter((h) => /^Cache-Control:/i.test(h)).map((h) => h.split(':')[1].trim());

describe('Cache-Control policy (_headers)', () => {
  it('ships the headers file at the site root', () => {
    expect(rules, `Missing ${HEADERS_PATH}`).not.toBeNull();
    expect(Object.keys(rules).length).toBeGreaterThan(10);
  });

  it('makes HTML revalidate on every request so deploys show up immediately', () => {
    for (const path of ['/*.html', '/']) {
      expect(cacheControl(path), path).toEqual(['public, max-age=0, must-revalidate']);
    }
  });

  it('never freezes the kill-switch service worker', () => {
    expect(cacheControl('/sw.js')).toEqual(['public, max-age=0, must-revalidate']);
  });

  it('gives feeds, sitemap and robots short TTLs', () => {
    expect(cacheControl('/sitemap.xml')).toEqual(['public, max-age=3600']);
    for (const feed of ['/rss.xml', '/atom.xml', '/feed.xml']) {
      expect(cacheControl(feed), feed).toEqual(['public, max-age=300']);
    }
    expect(cacheControl('/robots.txt')).toEqual(['public, max-age=86400']);
  });

  it('long-caches versioned stylesheets, script bundles and hashed Pagefind chunks as immutable', () => {
    for (const path of [
      '/styles/*',
      '/scripts/*',
      '/pagefind/index/*',
      '/pagefind/fragment/*',
      '/pagefind/*.pf_meta',
    ]) {
      expect(cacheControl(path), path).toEqual(['public, max-age=31536000, immutable']);
    }
  });

  it('long-caches content-hashed generated images and lets them be embedded cross-origin', () => {
    for (const ext of ['avif', 'webp', 'jpg', 'jpeg', 'png', 'svg']) {
      const path = `/*/*.${ext}`;
      expect(cacheControl(path), path).toEqual(['public, max-age=31536000, immutable']);
      expect(rules[path], path).toContain('Cross-Origin-Resource-Policy: cross-origin');
    }
  });

  it('keeps stable-URL images out of the immutable rule by detaching it first', () => {
    // These live under the /*/*.jpg wildcard but are regenerated in place, so the
    // immutable rule must be explicitly detached ("! Cache-Control") and replaced.
    for (const path of ['/*/og-image.jpg', '/videos/*']) {
      expect(rules[path], path).toContain('! Cache-Control');
      expect(cacheControl(path)[0], path).toMatch(/^public, max-age=\d+$/);
      expect(cacheControl(path)[0], path).not.toContain('immutable');
    }
  });

  it('gives root-level favicons, manifest and share images a short TTL', () => {
    for (const path of [
      '/favicon.ico',
      '/favicon.svg',
      '/apple-touch-icon.png',
      '/site.webmanifest',
      '/default-share.jpg',
    ]) {
      expect(cacheControl(path), path).toEqual(['public, max-age=3600']);
    }
  });

  it('exposes timing data to external monitoring', () => {
    expect(rules['/*']).toContain('Timing-Allow-Origin: *');
  });
});
