import { existsSync } from 'fs';
import { describe, expect, it } from 'vitest';
import { loadPage, SITE_DIR } from './helpers.js';
import { getCanonicalUrl, getOgDescription, getOgImage, getOgTitle, getRobotsMeta } from './queries/seo.js';
import siteConfig from '../src/_data/site.js';

function getJsonLdBlocks($) {
  return $('script[type="application/ld+json"]')
    .map((_, el) => JSON.parse($(el).text()))
    .get();
}

function localPathForAbsoluteUrl(url) {
  const parsed = new URL(url);
  return `${SITE_DIR}${parsed.pathname}`;
}

describe('archive SEO metadata', () => {
  const siteUrl = siteConfig.url.replace(/\/$/, '');

  it('marks the archive landing page as a noindex collection page', () => {
    const $ = loadPage('/archive/');
    const jsonLdBlocks = getJsonLdBlocks($);

    expect(getRobotsMeta($)).toBe('noindex, follow');
    expect(getCanonicalUrl($)).toBe(`${siteUrl}/archive/`);
    expect(jsonLdBlocks.some((block) => block['@type'] === 'CollectionPage')).toBe(true);
    expect(jsonLdBlocks.some((block) => block['@type'] === 'BreadcrumbList')).toBe(true);
  });

  it('marks archived posts as noindex follow and canonicalizes to the current article', () => {
    const $ = loadPage('/archive/chrome-audit-lighthouse-2026-05/');

    expect(getRobotsMeta($)).toBe('noindex, follow');
    expect(getCanonicalUrl($)).toBe(`${siteUrl}/chrome-audit-lighthouse/`);
  });

  it('omits primary article/page JSON-LD for archived posts but keeps breadcrumb JSON-LD', () => {
    const $ = loadPage('/archive/chrome-audit-lighthouse-2026-05/');
    const jsonLdTypes = getJsonLdBlocks($).map((block) => block['@type']);

    expect(jsonLdTypes).toEqual(['BreadcrumbList']);
  });

  it('uses historical social metadata and an existing generated image for archived posts', () => {
    const $ = loadPage('/archive/chrome-audit-lighthouse-2026-05/');
    const ogImage = getOgImage($);

    expect(getOgTitle($)).toBe('Lighthouse: Web Page Audit with Chrome Developer Tools (Historical Archive)');
    expect(getOgDescription($)).toContain('Historical archive:');
    expect(ogImage).toBe(`${siteUrl}/archive/chrome-audit-lighthouse-2026-05/og-image.jpg`);
    expect($('meta[name="twitter:image"]').attr('content')).toBe(ogImage);
    expect(existsSync(localPathForAbsoluteUrl(ogImage))).toBe(true);
  });
});
