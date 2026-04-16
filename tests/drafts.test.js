import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { getAllPosts, SITE_DIR } from './helpers.js';

/**
 * Tests for draft functionality.
 *
 * These tests run against a production build (no INCLUDE_DRAFTS env var),
 * so all draft posts should be excluded from the built output.
 */

// Collect draft posts from source
const allSourcePosts = getAllPosts();
const draftPosts = allSourcePosts.filter((p) => p.frontmatter.draftStatus);
const publishedPosts = allSourcePosts.filter((p) => !p.frontmatter.draftStatus);

describe('Draft posts exclusion (production build)', () => {
  // Integration tests below are optional and depend on the presence of draft posts in source.
  // The core exclusion logic is fully covered by the unit tests at the end of this file,
  // which are independent of the source files.
  it('should have at least one published post in source', () => {
    expect(publishedPosts.length).toBeGreaterThan(0);
  });

  it.skipIf(draftPosts.length === 0)('draft posts should not have built HTML output', () => {
    for (const { frontmatter, filePath } of draftPosts) {
      const htmlPath = `${SITE_DIR}${frontmatter.path}index.html`;
      expect(existsSync(htmlPath), `Draft post should not be built: ${filePath} → ${htmlPath}`).toBe(false);
    }
  });

  it('published posts should have built HTML output', () => {
    for (const { frontmatter, filePath } of publishedPosts) {
      if (!frontmatter.path) {
        continue;
      }

      // Use frontmatter path (permalink) to find the built HTML
      const htmlPath = `${SITE_DIR}${frontmatter.path}index.html`;
      expect(existsSync(htmlPath), `Published post should be built: ${filePath} → ${htmlPath}`).toBe(true);
    }
  });
});

describe('Draft posts excluded from sitemap', () => {
  const sitemapPath = `${SITE_DIR}/sitemap.xml`;

  it('sitemap.xml should exist', () => {
    expect(existsSync(sitemapPath)).toBe(true);
  });

  it.skipIf(draftPosts.length === 0)('sitemap should not contain draft post URLs', () => {
    const sitemap = readFileSync(sitemapPath, 'utf-8');
    for (const { frontmatter } of draftPosts) {
      expect(sitemap, `Sitemap should not contain draft URL: ${frontmatter.path}`).not.toContain(frontmatter.path);
    }
  });

  it('sitemap should contain published post URLs', () => {
    const sitemap = readFileSync(sitemapPath, 'utf-8');
    for (const { frontmatter } of publishedPosts) {
      if (!frontmatter.path) {
        continue;
      }
      // Use frontmatter path (permalink) as the actual URL
      const urlPath = frontmatter.path;
      expect(sitemap, `Sitemap should contain published URL: ${urlPath}`).toContain(urlPath);
    }
  });
});

describe('Draft posts excluded from RSS feed', () => {
  const feedPath = `${SITE_DIR}/feed.xml`;

  it('feed.xml should exist', () => {
    expect(existsSync(feedPath)).toBe(true);
  });

  it.skipIf(draftPosts.length === 0)('RSS feed should not contain draft post URLs', () => {
    const feed = readFileSync(feedPath, 'utf-8');
    for (const { frontmatter } of draftPosts) {
      expect(feed, `RSS feed should not contain draft URL: ${frontmatter.path}`).not.toContain(frontmatter.path);
    }
  });
});

describe('Draft posts excluded from Atom feed', () => {
  const atomPath = `${SITE_DIR}/atom.xml`;

  it('atom.xml should exist', () => {
    expect(existsSync(atomPath)).toBe(true);
  });

  it.skipIf(draftPosts.length === 0)('Atom feed should not contain draft post URLs', () => {
    const feed = readFileSync(atomPath, 'utf-8');
    for (const { frontmatter } of draftPosts) {
      expect(feed, `Atom feed should not contain draft URL: ${frontmatter.path}`).not.toContain(frontmatter.path);
    }
  });
});

describe('Draft maturity stages', () => {
  it.skipIf(draftPosts.length === 0)('all draft posts should have a valid draftStatus value', () => {
    const validStatuses = ['draft', 'review', 'ready'];
    for (const { frontmatter, filePath } of draftPosts) {
      expect(validStatuses, `Invalid draftStatus "${frontmatter.draftStatus}" in ${filePath}`).toContain(
        frontmatter.draftStatus,
      );
    }
  });
});

describe('shouldIncludeDraft logic (unit tests)', () => {
  // We dynamically import with env manipulation to test different scenarios.
  // The function reads process.env on each call, so we can manipulate it.

  // Save original env
  const originalEnv = { ...process.env };

  function resetEnv() {
    delete process.env.INCLUDE_DRAFTS;
    delete process.env.ELEVENTY_RUN_MODE;
    delete process.env.CF_PAGES_BRANCH;
    delete process.env.GITHUB_REF_NAME;
  }

  // We need a fresh import each time since the function reads env at call time
  // The function is already stateless (reads env on each call), so direct import works.
  let shouldIncludeDraft;

  beforeAll(async () => {
    const mod = await import('../config/draft-utils.js');
    shouldIncludeDraft = mod.shouldIncludeDraft;
  });

  beforeEach(() => {
    resetEnv();
  });

  afterAll(() => {
    resetEnv();
    Object.assign(process.env, originalEnv);
  });

  // Import once — the function reads process.env dynamically
  it('setup: import shouldIncludeDraft', async () => {
    expect(shouldIncludeDraft).toBeDefined();
  });

  it('published posts (no draftStatus) are always included', () => {
    expect(shouldIncludeDraft(undefined)).toBe(true);
    expect(shouldIncludeDraft(null)).toBe(true);
    expect(shouldIncludeDraft('')).toBe(true);
    expect(shouldIncludeDraft(false)).toBe(true);
  });

  it('production build excludes all drafts', () => {
    expect(shouldIncludeDraft('draft')).toBe(false);
    expect(shouldIncludeDraft('review')).toBe(false);
    expect(shouldIncludeDraft('ready')).toBe(false);
  });

  it('INCLUDE_DRAFTS=all includes all drafts', () => {
    process.env.INCLUDE_DRAFTS = 'all';
    expect(shouldIncludeDraft('draft')).toBe(true);
    expect(shouldIncludeDraft('review')).toBe(true);
    expect(shouldIncludeDraft('ready')).toBe(true);
  });

  it('INCLUDE_DRAFTS=true includes all drafts', () => {
    process.env.INCLUDE_DRAFTS = 'true';
    expect(shouldIncludeDraft('draft')).toBe(true);
    expect(shouldIncludeDraft('review')).toBe(true);
    expect(shouldIncludeDraft('ready')).toBe(true);
  });

  it('INCLUDE_DRAFTS=none excludes all drafts', () => {
    process.env.INCLUDE_DRAFTS = 'none';
    expect(shouldIncludeDraft('draft')).toBe(false);
    expect(shouldIncludeDraft('review')).toBe(false);
    expect(shouldIncludeDraft('ready')).toBe(false);
  });

  it('INCLUDE_DRAFTS=false excludes all drafts', () => {
    process.env.INCLUDE_DRAFTS = 'false';
    expect(shouldIncludeDraft('draft')).toBe(false);
    expect(shouldIncludeDraft('review')).toBe(false);
    expect(shouldIncludeDraft('ready')).toBe(false);
  });

  it('INCLUDE_DRAFTS=ready includes only ready drafts', () => {
    process.env.INCLUDE_DRAFTS = 'ready';
    expect(shouldIncludeDraft('draft')).toBe(false);
    expect(shouldIncludeDraft('review')).toBe(false);
    expect(shouldIncludeDraft('ready')).toBe(true);
  });

  it('INCLUDE_DRAFTS=review includes review and ready drafts', () => {
    process.env.INCLUDE_DRAFTS = 'review';
    expect(shouldIncludeDraft('draft')).toBe(false);
    expect(shouldIncludeDraft('review')).toBe(true);
    expect(shouldIncludeDraft('ready')).toBe(true);
  });

  it('INCLUDE_DRAFTS=draft includes all draft stages', () => {
    process.env.INCLUDE_DRAFTS = 'draft';
    expect(shouldIncludeDraft('draft')).toBe(true);
    expect(shouldIncludeDraft('review')).toBe(true);
    expect(shouldIncludeDraft('ready')).toBe(true);
  });

  it('local dev server (ELEVENTY_RUN_MODE=serve) includes all drafts', () => {
    delete process.env.INCLUDE_DRAFTS;
    process.env.ELEVENTY_RUN_MODE = 'serve';
    expect(shouldIncludeDraft('draft')).toBe(true);
    expect(shouldIncludeDraft('review')).toBe(true);
    expect(shouldIncludeDraft('ready')).toBe(true);
  });

  it('Cloudflare preview deploy includes only ready drafts', () => {
    process.env.CF_PAGES_BRANCH = 'feature/my-branch';
    expect(shouldIncludeDraft('draft')).toBe(false);
    expect(shouldIncludeDraft('review')).toBe(false);
    expect(shouldIncludeDraft('ready')).toBe(true);
  });

  it('Cloudflare production deploy (master) excludes all drafts', () => {
    process.env.CF_PAGES_BRANCH = 'master';
    expect(shouldIncludeDraft('draft')).toBe(false);
    expect(shouldIncludeDraft('review')).toBe(false);
    expect(shouldIncludeDraft('ready')).toBe(false);
  });

  it('GitHub Actions preview deploy includes only ready drafts', () => {
    process.env.GITHUB_REF_NAME = 'feature/my-branch';
    expect(shouldIncludeDraft('draft')).toBe(false);
    expect(shouldIncludeDraft('review')).toBe(false);
    expect(shouldIncludeDraft('ready')).toBe(true);
  });

  it('GitHub Actions production deploy (main) excludes all drafts', () => {
    process.env.GITHUB_REF_NAME = 'main';
    expect(shouldIncludeDraft('draft')).toBe(false);
    expect(shouldIncludeDraft('review')).toBe(false);
    expect(shouldIncludeDraft('ready')).toBe(false);
  });

  it('INCLUDE_DRAFTS env var takes priority over ELEVENTY_RUN_MODE', () => {
    process.env.INCLUDE_DRAFTS = 'none';
    process.env.ELEVENTY_RUN_MODE = 'serve';
    expect(shouldIncludeDraft('draft')).toBe(false);
    expect(shouldIncludeDraft('ready')).toBe(false);
  });
});
