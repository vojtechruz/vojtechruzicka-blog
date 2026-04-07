import { describe, it, expect } from 'vitest';
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
  it('should have at least one draft post in source for testing', () => {
    expect(draftPosts.length).toBeGreaterThan(0);
  });

  it('should have at least one published post in source', () => {
    expect(publishedPosts.length).toBeGreaterThan(0);
  });

  it('draft posts should not have built HTML output', () => {
    for (const { frontmatter, filePath } of draftPosts) {
      const htmlPath = `${SITE_DIR}${frontmatter.path}index.html`;
      expect(
        existsSync(htmlPath),
        `Draft post should not be built: ${filePath} → ${htmlPath}`
      ).toBe(false);
    }
  });

  it('published posts should have built HTML output', () => {
    for (const { frontmatter, filePath } of publishedPosts) {
      if (!frontmatter.path) {
        continue;
      }
      
      // Use frontmatter path (permalink) to find the built HTML
      const htmlPath = `${SITE_DIR}${frontmatter.path}index.html`;
      expect(
        existsSync(htmlPath),
        `Published post should be built: ${filePath} → ${htmlPath}`
      ).toBe(true);
    }
  });
});

describe('Draft posts excluded from sitemap', () => {
  const sitemapPath = `${SITE_DIR}/sitemap.xml`;

  it('sitemap.xml should exist', () => {
    expect(existsSync(sitemapPath)).toBe(true);
  });

  it('sitemap should not contain draft post URLs', () => {
    const sitemap = readFileSync(sitemapPath, 'utf-8');
    for (const { frontmatter } of draftPosts) {
      expect(
        sitemap,
        `Sitemap should not contain draft URL: ${frontmatter.path}`
      ).not.toContain(frontmatter.path);
    }
  });

  it('sitemap should contain published post URLs', () => {
    const sitemap = readFileSync(sitemapPath, 'utf-8');
    for (const { frontmatter} of publishedPosts) {
      if (!frontmatter.path) {
        continue;
      }
      // Use frontmatter path (permalink) as the actual URL
      const urlPath = frontmatter.path;
      expect(
        sitemap,
        `Sitemap should contain published URL: ${urlPath}`
      ).toContain(urlPath);
    }
  });
});

describe('Draft posts excluded from RSS feed', () => {
  const feedPath = `${SITE_DIR}/feed.xml`;

  it('feed.xml should exist', () => {
    expect(existsSync(feedPath)).toBe(true);
  });

  it('RSS feed should not contain draft post URLs', () => {
    const feed = readFileSync(feedPath, 'utf-8');
    for (const { frontmatter } of draftPosts) {
      expect(
        feed,
        `RSS feed should not contain draft URL: ${frontmatter.path}`
      ).not.toContain(frontmatter.path);
    }
  });
});

describe('Draft posts excluded from Atom feed', () => {
  const atomPath = `${SITE_DIR}/atom.xml`;

  it('atom.xml should exist', () => {
    expect(existsSync(atomPath)).toBe(true);
  });

  it('Atom feed should not contain draft post URLs', () => {
    const feed = readFileSync(atomPath, 'utf-8');
    for (const { frontmatter } of draftPosts) {
      expect(
        feed,
        `Atom feed should not contain draft URL: ${frontmatter.path}`
      ).not.toContain(frontmatter.path);
    }
  });
});

describe('Draft maturity stages', () => {
  it('all draft posts should have a valid draftStatus value', () => {
    const validStatuses = ['draft', 'review', 'ready'];
    for (const { frontmatter, filePath } of draftPosts) {
      expect(
        validStatuses,
        `Invalid draftStatus "${frontmatter.draftStatus}" in ${filePath}`
      ).toContain(frontmatter.draftStatus);
    }
  });

  it('source drafts should cover all three stages for adequate testing', () => {
    const stages = new Set(draftPosts.map((p) => p.frontmatter.draftStatus));
    expect(stages.has('draft'), 'Missing draft-stage test post').toBe(true);
    expect(stages.has('review'), 'Missing review-stage test post').toBe(true);
    expect(stages.has('ready'), 'Missing ready-stage test post').toBe(true);
  });
});

describe('shouldIncludeDraft logic (unit tests)', () => {
  // We dynamically import with env manipulation to test different scenarios.
  // The function reads process.env on each call, so we can manipulate it.

  // Save original env
  const originalEnv = { ...process.env };

  function resetEnv() {
    // Restore only the keys we modify
    delete process.env.INCLUDE_DRAFTS;
    delete process.env.ELEVENTY_RUN_MODE;
    delete process.env.CF_PAGES_BRANCH;
    Object.assign(process.env, originalEnv);
  }

  // We need a fresh import each time since the function reads env at call time
  // The function is already stateless (reads env on each call), so direct import works.
  let shouldIncludeDraft;

  // Import once — the function reads process.env dynamically
  it('setup: import shouldIncludeDraft', async () => {
    const mod = await import('../config/draft-utils.js');
    shouldIncludeDraft = mod.shouldIncludeDraft;
    expect(shouldIncludeDraft).toBeDefined();
  });

  it('published posts (no draftStatus) are always included', () => {
    resetEnv();
    expect(shouldIncludeDraft(undefined)).toBe(true);
    expect(shouldIncludeDraft(null)).toBe(true);
    expect(shouldIncludeDraft('')).toBe(true);
    expect(shouldIncludeDraft(false)).toBe(true);
  });

  it('production build excludes all drafts', () => {
    resetEnv();
    delete process.env.INCLUDE_DRAFTS;
    delete process.env.ELEVENTY_RUN_MODE;
    delete process.env.CF_PAGES_BRANCH;
    expect(shouldIncludeDraft('draft')).toBe(false);
    expect(shouldIncludeDraft('review')).toBe(false);
    expect(shouldIncludeDraft('ready')).toBe(false);
  });

  it('INCLUDE_DRAFTS=all includes all drafts', () => {
    resetEnv();
    process.env.INCLUDE_DRAFTS = 'all';
    expect(shouldIncludeDraft('draft')).toBe(true);
    expect(shouldIncludeDraft('review')).toBe(true);
    expect(shouldIncludeDraft('ready')).toBe(true);
  });

  it('INCLUDE_DRAFTS=true includes all drafts', () => {
    resetEnv();
    process.env.INCLUDE_DRAFTS = 'true';
    expect(shouldIncludeDraft('draft')).toBe(true);
    expect(shouldIncludeDraft('review')).toBe(true);
    expect(shouldIncludeDraft('ready')).toBe(true);
  });

  it('INCLUDE_DRAFTS=none excludes all drafts', () => {
    resetEnv();
    process.env.INCLUDE_DRAFTS = 'none';
    expect(shouldIncludeDraft('draft')).toBe(false);
    expect(shouldIncludeDraft('review')).toBe(false);
    expect(shouldIncludeDraft('ready')).toBe(false);
  });

  it('INCLUDE_DRAFTS=false excludes all drafts', () => {
    resetEnv();
    process.env.INCLUDE_DRAFTS = 'false';
    expect(shouldIncludeDraft('draft')).toBe(false);
    expect(shouldIncludeDraft('review')).toBe(false);
    expect(shouldIncludeDraft('ready')).toBe(false);
  });

  it('INCLUDE_DRAFTS=ready includes only ready drafts', () => {
    resetEnv();
    process.env.INCLUDE_DRAFTS = 'ready';
    expect(shouldIncludeDraft('draft')).toBe(false);
    expect(shouldIncludeDraft('review')).toBe(false);
    expect(shouldIncludeDraft('ready')).toBe(true);
  });

  it('INCLUDE_DRAFTS=review includes review and ready drafts', () => {
    resetEnv();
    process.env.INCLUDE_DRAFTS = 'review';
    expect(shouldIncludeDraft('draft')).toBe(false);
    expect(shouldIncludeDraft('review')).toBe(true);
    expect(shouldIncludeDraft('ready')).toBe(true);
  });

  it('INCLUDE_DRAFTS=draft includes all draft stages', () => {
    resetEnv();
    process.env.INCLUDE_DRAFTS = 'draft';
    expect(shouldIncludeDraft('draft')).toBe(true);
    expect(shouldIncludeDraft('review')).toBe(true);
    expect(shouldIncludeDraft('ready')).toBe(true);
  });

  it('local dev server (ELEVENTY_RUN_MODE=serve) includes all drafts', () => {
    resetEnv();
    delete process.env.INCLUDE_DRAFTS;
    process.env.ELEVENTY_RUN_MODE = 'serve';
    expect(shouldIncludeDraft('draft')).toBe(true);
    expect(shouldIncludeDraft('review')).toBe(true);
    expect(shouldIncludeDraft('ready')).toBe(true);
  });

  it('Cloudflare preview deploy includes only ready drafts', () => {
    resetEnv();
    delete process.env.INCLUDE_DRAFTS;
    delete process.env.ELEVENTY_RUN_MODE;
    process.env.CF_PAGES_BRANCH = 'feature/my-branch';
    expect(shouldIncludeDraft('draft')).toBe(false);
    expect(shouldIncludeDraft('review')).toBe(false);
    expect(shouldIncludeDraft('ready')).toBe(true);
  });

  it('Cloudflare production deploy (master) excludes all drafts', () => {
    resetEnv();
    delete process.env.INCLUDE_DRAFTS;
    delete process.env.ELEVENTY_RUN_MODE;
    process.env.CF_PAGES_BRANCH = 'master';
    expect(shouldIncludeDraft('draft')).toBe(false);
    expect(shouldIncludeDraft('review')).toBe(false);
    expect(shouldIncludeDraft('ready')).toBe(false);
  });

  it('INCLUDE_DRAFTS env var takes priority over ELEVENTY_RUN_MODE', () => {
    resetEnv();
    process.env.INCLUDE_DRAFTS = 'none';
    process.env.ELEVENTY_RUN_MODE = 'serve';
    expect(shouldIncludeDraft('draft')).toBe(false);
    expect(shouldIncludeDraft('ready')).toBe(false);
  });

  // Cleanup
  it('cleanup: restore env', () => {
    resetEnv();
  });
});
