import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { SITE_DIR } from './helpers.js';
import siteConfig from '../src/_data/site.js';

// src/static/robots.txt is copied verbatim to the site root. Crawling is allowed
// everywhere on purpose (preview deploys are kept out of indexes by the page-level
// noindex meta, see tests/preview-noindex.test.js): a Disallowed page can still be
// indexed URL-only, and a blocked crawler never fetches the page to read the tag.

const ROBOTS_PATH = `${SITE_DIR}/robots.txt`;

describe('robots.txt', () => {
  const robots = existsSync(ROBOTS_PATH) ? readFileSync(ROBOTS_PATH, 'utf-8') : null;
  const lines = (robots || '').split(/\r?\n/).map((line) => line.trim());

  it('is served from the site root', () => {
    expect(robots, `Missing ${ROBOTS_PATH}`).not.toBeNull();
  });

  it('addresses every crawler and blocks nothing', () => {
    expect(lines).toContain('User-agent: *');
    const disallows = lines
      .filter((line) => /^Disallow:/i.test(line))
      .map((line) => line.replace(/^Disallow:\s*/i, ''));
    expect(
      disallows.every((path) => path === ''),
      `unexpected Disallow rules: ${disallows}`,
    ).toBe(true);
  });

  it('advertises the production sitemap by absolute URL', () => {
    const siteUrl = siteConfig.url.replace(/\/$/, '');
    expect(lines).toContain(`Sitemap: ${siteUrl}/sitemap.xml`);
    expect(existsSync(`${SITE_DIR}/sitemap.xml`)).toBe(true);
  });

  it('ends with a newline', () => {
    expect(robots.endsWith('\n')).toBe(true);
  });
});
