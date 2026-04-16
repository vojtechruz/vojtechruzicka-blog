import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { getAllPosts, SITE_DIR } from './helpers.js';
import siteConfig from '../src/_data/site.js';

describe('Sitemap (sitemap.xml)', () => {
  const sitemapPath = `${SITE_DIR}/sitemap.xml`;
  const allSourcePosts = getAllPosts();
  const draftPosts = allSourcePosts.filter((p) => p.frontmatter.draftStatus);
  const publishedPosts = allSourcePosts.filter((p) => !p.frontmatter.draftStatus);

  it('sitemap.xml should exist in the build output', () => {
    expect(existsSync(sitemapPath), 'sitemap.xml does not exist. Run "npm run build" first.').toBe(true);
  });

  describe('Sitemap Content and Structure', () => {
    let sitemapContent = '';

    it('should be valid XML and have the correct namespace', () => {
      sitemapContent = readFileSync(sitemapPath, 'utf-8');
      expect(sitemapContent).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(sitemapContent).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
      expect(sitemapContent).toContain('</urlset>');
    });

    it('should contain absolute URLs starting with the site URL', () => {
      const siteUrl = siteConfig.url.replace(/\/$/, ''); // Normalize site URL
      const locMatch = sitemapContent.match(/<loc>(.*?)<\/loc>/g);
      expect(locMatch).not.toBeNull();

      for (const locTag of locMatch) {
        const url = locTag.replace('<loc>', '').replace('</loc>', '');
        expect(url.startsWith(siteUrl), `Sitemap URL "${url}" should start with "${siteUrl}"`).toBe(true);
      }
    });

    it('should have a valid lastmod format (W3C Datetime)', () => {
      const lastmodMatch = sitemapContent.match(/<lastmod>(.*?)<\/lastmod>/g);
      expect(lastmodMatch).not.toBeNull();

      // ISO 8601 / RFC 3339 format check: YYYY-MM-DDTHH:mm:ss.sssZ or YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2}))?$/;

      for (const lastmodTag of lastmodMatch) {
        const dateStr = lastmodTag.replace('<lastmod>', '').replace('</lastmod>', '');
        expect(dateStr).toMatch(dateRegex);
      }
    });
  });

  describe('Post Inclusion/Exclusion', () => {
    let sitemapContent = '';

    it('setup: read sitemap content', () => {
      sitemapContent = readFileSync(sitemapPath, 'utf-8');
    });

    it('should contain all published post URLs', () => {
      for (const { frontmatter } of publishedPosts) {
        if (!frontmatter.path) {
          continue;
        }
        const expectedUrl = `${siteConfig.url.replace(/\/$/, '')}${frontmatter.path}`;
        expect(sitemapContent, `Sitemap should contain published post URL: ${expectedUrl}`).toContain(
          `<loc>${expectedUrl}</loc>`,
        );
      }
    });

    it('should NOT contain any draft post URLs', () => {
      for (const { frontmatter } of draftPosts) {
        if (!frontmatter.path) {
          continue;
        }
        const expectedUrl = `${siteConfig.url.replace(/\/$/, '')}${frontmatter.path}`;
        expect(sitemapContent, `Sitemap should NOT contain draft post URL: ${expectedUrl}`).not.toContain(
          `<loc>${expectedUrl}</loc>`,
        );
      }
    });
  });

  describe('Page Inclusion', () => {
    let sitemapContent = '';

    it('setup: read sitemap content', () => {
      sitemapContent = readFileSync(sitemapPath, 'utf-8');
    });

    it('should contain core pages', () => {
      const corePages = ['/', '/about/', '/archives/'];

      for (const pagePath of corePages) {
        const expectedUrl = `${siteConfig.url.replace(/\/$/, '')}${pagePath}`;
        expect(sitemapContent, `Sitemap should contain core page: ${expectedUrl}`).toContain(
          `<loc>${expectedUrl}</loc>`,
        );
      }
    });

    it('should contain tag pages', () => {
      // Tags from published posts should be in sitemap
      const publishedTags = new Set();
      for (const { frontmatter } of publishedPosts) {
        if (frontmatter.tags) {
          frontmatter.tags.forEach((t) => publishedTags.add(t.toLowerCase()));
        }
      }

      for (const tag of publishedTags) {
        const expectedUrl = `${siteConfig.url.replace(/\/$/, '')}/tags/${tag}/`;
        expect(sitemapContent, `Sitemap should contain tag page: ${expectedUrl}`).toContain(
          `<loc>${expectedUrl}</loc>`,
        );
      }
    });

    it('should NOT contain excluded pages (like 404)', () => {
      const excludedPages = ['/404.html', '/404/'];

      for (const pagePath of excludedPages) {
        const url = `${siteConfig.url.replace(/\/$/, '')}${pagePath}`;
        expect(sitemapContent, `Sitemap should NOT contain excluded page: ${url}`).not.toContain(`<loc>${url}</loc>`);
      }
    });
  });
});
