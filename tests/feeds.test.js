import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { getAllPosts, SITE_DIR } from './helpers.js';

// Load feed config
import feedsConfig from '../src/_data/feeds.js';

const minDate = new Date(feedsConfig.minDate);

// Post bodies in <content:encoded>/<content> may legitimately link to other (old or draft) posts,
// so membership checks must look at item URLs (<guid> in RSS, entry <id> in Atom), not the raw XML.
function getFeedItemUrls(feedContent) {
  const urls = [];
  for (const match of feedContent.matchAll(/<guid[^>]*>([^<]+)<\/guid>/g)) {
    urls.push(match[1]);
  }
  for (const match of feedContent.matchAll(/<id>([^<]+)<\/id>/g)) {
    urls.push(match[1]);
  }
  return urls;
}

function feedHasItem(feedContent, postPath) {
  return getFeedItemUrls(feedContent).some((url) => url.includes(postPath));
}

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
    const olderPosts = allPosts.filter((p) => p.frontmatter.date && new Date(p.frontmatter.date) < minDate);

    // Note: skipIf must test .length - arrays are always truthy, so skipIf(!olderPosts) never skips
    it.skipIf(olderPosts.length === 0)('should not contain posts older than minDate', () => {
      for (const post of olderPosts) {
        const postPath = post.frontmatter.path;
        if (postPath) {
          expect(feedHasItem(rssContent, postPath), `RSS feed should not contain old post: ${postPath}`).toBe(false);
          expect(feedHasItem(atomContent, postPath), `Atom feed should not contain old post: ${postPath}`).toBe(false);
        }
      }
    });

    // NOTE: as of 2026-07 the feeds are intentionally empty - minDate (2026-01-01) is newer than
    // every published post, so nothing qualifies yet. This skip makes that state visible in the
    // test report instead of passing vacuously; the test activates once a post publishes past minDate.
    const newerPublishedPosts = allPosts.filter(
      (p) => new Date(p.frontmatter.date) >= minDate && !p.frontmatter.draftStatus,
    );

    it.skipIf(newerPublishedPosts.length === 0)('should contain published posts newer than or equal to minDate', () => {
      for (const post of newerPublishedPosts) {
        const postPath = post.frontmatter.path;
        if (postPath) {
          expect(feedHasItem(rssContent, postPath), `RSS feed should contain newer published post: ${postPath}`).toBe(
            true,
          );
          expect(feedHasItem(atomContent, postPath), `Atom feed should contain newer published post: ${postPath}`).toBe(
            true,
          );
        }
      }
    });
  });

  describe('Draft exclusion from feeds', () => {
    const rssContent = existsSync(rssPath) ? readFileSync(rssPath, 'utf-8') : '';
    const atomContent = existsSync(atomPath) ? readFileSync(atomPath, 'utf-8') : '';

    const allPosts = getAllPosts();
    const draftPosts = allPosts.filter((p) => p.frontmatter.draftStatus);

    it.skipIf(draftPosts.length === 0)('should not contain any draft posts, regardless of date', () => {
      for (const post of draftPosts) {
        const postPath = post.frontmatter.path;
        if (postPath) {
          expect(feedHasItem(rssContent, postPath), `RSS feed should not contain draft post: ${postPath}`).toBe(false);
          expect(feedHasItem(atomContent, postPath), `Atom feed should not contain draft post: ${postPath}`).toBe(
            false,
          );
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
