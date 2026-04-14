import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { getAllPosts, SITE_DIR } from './helpers.js';

// Load feed config
import feedsConfig from '../src/_data/feeds.js';

const minDate = new Date(feedsConfig.minDate);

describe('Feeds (RSS and Atom)', () => {
  const rssPath = `${SITE_DIR}/feed.xml`;
  const atomPath = `${SITE_DIR}/atom.xml`;

  it('RSS feed (feed.xml) should exist', () => {
    expect(existsSync(rssPath), 'feed.xml does not exist. Run "npm run build" first.').toBe(true);
  });

  it('Atom feed (atom.xml) should exist', () => {
    expect(existsSync(atomPath), 'atom.xml does not exist. Run "npm run build" first.').toBe(true);
  });

  describe('minDate cutoff logic', () => {
    const rssContent = existsSync(rssPath) ? readFileSync(rssPath, 'utf-8') : '';
    const atomContent = existsSync(atomPath) ? readFileSync(atomPath, 'utf-8') : '';

    const allPosts = getAllPosts();

    it('should not contain posts older than minDate', () => {
      const olderPosts = allPosts.filter((p) => p.frontmatter.date && new Date(p.frontmatter.date) < minDate);

      if (olderPosts.length === 0) {
        console.warn('[DEBUG_LOG] No posts older than minDate found in source. Cutoff test may be less effective.');
        return;
      }

      for (const post of olderPosts) {
        // Checking for the path/URL of the post in the feed content
        const postPath = post.frontmatter.path;
        if (postPath) {
          expect(rssContent, `RSS feed should not contain old post: ${postPath}`).not.toContain(postPath);
          expect(atomContent, `Atom feed should not contain old post: ${postPath}`).not.toContain(postPath);
        }
      }
    });

    it('should contain published posts newer than or equal to minDate', () => {
      const newerPublishedPosts = allPosts.filter(
        (p) => new Date(p.frontmatter.date) >= minDate && !p.frontmatter.draftStatus,
      );

      if (newerPublishedPosts.length === 0) {
        return;
      }

      for (const post of newerPublishedPosts) {
        const postPath = post.frontmatter.path;
        if (postPath) {
          expect(rssContent, `RSS feed should contain newer published post: ${postPath}`).toContain(postPath);
          expect(atomContent, `Atom feed should contain newer published post: ${postPath}`).toContain(postPath);
        }
      }
    });
  });

  describe('Draft exclusion from feeds', () => {
    const rssContent = existsSync(rssPath) ? readFileSync(rssPath, 'utf-8') : '';
    const atomContent = existsSync(atomPath) ? readFileSync(atomPath, 'utf-8') : '';

    const allPosts = getAllPosts();
    const draftPosts = allPosts.filter((p) => p.frontmatter.draftStatus);

    it('should not contain any draft posts, regardless of date', () => {
      expect(draftPosts.length).toBeGreaterThan(0);

      for (const post of draftPosts) {
        const postPath = post.frontmatter.path;
        if (postPath) {
          expect(rssContent, `RSS feed should not contain draft post: ${postPath}`).not.toContain(postPath);
          expect(atomContent, `Atom feed should not contain draft post: ${postPath}`).not.toContain(postPath);
        }
      }
    });
  });

  describe('Feed Metadata', () => {
    it('RSS feed should have basic required tags', () => {
      const rssContent = readFileSync(rssPath, 'utf-8');
      expect(rssContent).toContain('<rss version="2.0"');
      expect(rssContent).toContain('<channel>');
      expect(rssContent).toContain('<title>');
      expect(rssContent).toContain('<link>');
      expect(rssContent).toContain('<description>');
      expect(rssContent).toContain('<lastBuildDate>');
    });

    it('Atom feed should have basic required tags', () => {
      const atomContent = readFileSync(atomPath, 'utf-8');
      expect(atomContent).toContain('<feed xmlns="http://www.w3.org/2005/Atom">');
      expect(atomContent).toContain('<title>');
      expect(atomContent).toContain('<link');
      expect(atomContent).toContain('<updated>');
      expect(atomContent).toContain('<id>');
      if (atomContent.includes('<entry>')) {
        expect(atomContent).toContain('<entry>');
      }
    });
  });
});
