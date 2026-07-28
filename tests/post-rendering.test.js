import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { loadPage, getAllPosts, SITE_DIR } from './helpers.js';
import {
  getPostTitleText,
  getPostDate,
  getPostDateModified,
  getPostTopicNames,
  getPostTopicHrefs,
  getPostContent,
  getPostExcerpt,
  getFeaturedImage,
} from './queries/post.js';
import { readableDateUTC, slugify } from '../config/utils/formatting.js';

/** Collapse whitespace so YAML folded/wrapped frontmatter compares cleanly against rendered text. */
function normalize(text) {
  return String(text).replace(/\s+/g, ' ').trim();
}

/**
 * Published posts (no drafts, no archives) that actually produced HTML in this build.
 * getAllPosts() globs the Markdown sources, which include drafts excluded from a production build.
 */
const publishedPosts = getAllPosts().filter(({ frontmatter }) => {
  if (frontmatter.draftStatus || frontmatter.archivedStatus || !frontmatter.path) {
    return false;
  }
  return existsSync(`${SITE_DIR}${frontmatter.path}index.html`);
});

describe('Post rendering (post.njk header)', () => {
  it('the build contains a meaningful number of published posts to assert against', () => {
    expect(publishedPosts.length).toBeGreaterThan(20);
  });

  describe('Frontmatter to page', () => {
    it('renders the frontmatter title as the single post h1', () => {
      for (const { filePath, frontmatter } of publishedPosts) {
        const $ = loadPage(frontmatter.path);

        expect($('h1.post-header').length, `Expected exactly one h1.post-header in ${filePath}`).toBe(1);
        expect(normalize(getPostTitleText($)), `Title mismatch for ${filePath}`).toBe(normalize(frontmatter.title));
      }
    });

    it('renders the frontmatter date as a human readable published date', () => {
      for (const { filePath, frontmatter } of publishedPosts) {
        const $ = loadPage(frontmatter.path);
        const published = getPostDate($);

        expect(published.length, `Expected a .date-published in ${filePath}`).toBe(1);
        expect(frontmatter.date, `Missing date in frontmatter of ${filePath}`).toBeDefined();
        expect(normalize(published.text()), `Published date mismatch for ${filePath}`).toBe(
          readableDateUTC(frontmatter.date),
        );
      }
    });

    it('renders every frontmatter topic as a topic link, in order', () => {
      for (const { filePath, frontmatter } of publishedPosts) {
        const $ = loadPage(frontmatter.path);
        const expectedTopics = frontmatter.topics || [];

        expect(getPostTopicNames($), `Topic names mismatch for ${filePath}`).toEqual(expectedTopics);
      }
    });

    it('topic links point at the slugified topic page of each frontmatter topic', () => {
      for (const { filePath, frontmatter } of publishedPosts) {
        const $ = loadPage(frontmatter.path);
        const expectedHrefs = (frontmatter.topics || []).map((topic) => `/topics/${slugify(topic)}/`);

        expect(getPostTopicHrefs($), `Topic hrefs mismatch for ${filePath}`).toEqual(expectedHrefs);
      }
    });

    it('renders the frontmatter excerpt in the post header', () => {
      for (const { filePath, frontmatter } of publishedPosts) {
        const $ = loadPage(frontmatter.path);

        expect(frontmatter.excerpt, `Missing excerpt in frontmatter of ${filePath}`).toBeTruthy();
        expect($('.post-header-excerpt').length, `Expected one .post-header-excerpt in ${filePath}`).toBe(1);
        expect(normalize(getPostExcerpt($)), `Excerpt mismatch for ${filePath}`).toBe(normalize(frontmatter.excerpt));
      }
    });

    it('renders the post body inside a single article element', () => {
      for (const { filePath, frontmatter } of publishedPosts) {
        const $ = loadPage(frontmatter.path);
        const article = getPostContent($);

        expect(article.length, `Expected exactly one article in ${filePath}`).toBe(1);
        expect(article.text().trim().length, `Empty article body in ${filePath}`).toBeGreaterThan(0);
      }
    });
  });

  describe('dateModified', () => {
    it('there are posts both with and without dateModified, so both branches are exercised', () => {
      const withModified = publishedPosts.filter((p) => p.frontmatter.dateModified);

      expect(withModified.length).toBeGreaterThan(0);
      expect(withModified.length).toBeLessThan(publishedPosts.length);
    });

    it('renders .date-modified with the readable date only for posts declaring dateModified', () => {
      for (const { filePath, frontmatter } of publishedPosts) {
        const $ = loadPage(frontmatter.path);
        const modified = getPostDateModified($);

        if (frontmatter.dateModified) {
          expect(modified.length, `Expected a .date-modified in ${filePath}`).toBe(1);
          expect(normalize(modified.text()), `Modified date mismatch for ${filePath}`).toBe(
            `Updated: ${readableDateUTC(frontmatter.dateModified)}`,
          );
        } else {
          expect(modified.length, `Unexpected .date-modified in ${filePath}`).toBe(0);
        }
      }
    });
  });

  describe('Featured image', () => {
    it('every published post renders exactly one featured image', () => {
      for (const { filePath, frontmatter } of publishedPosts) {
        const $ = loadPage(frontmatter.path);

        expect(getFeaturedImage($).length, `Expected one featured image in ${filePath}`).toBe(1);
      }
    });

    it('featured image is eagerly loaded with high fetch priority', () => {
      for (const { filePath, frontmatter } of publishedPosts) {
        const $ = loadPage(frontmatter.path);
        const image = getFeaturedImage($);

        expect(image.attr('loading'), `loading attribute for ${filePath}`).toBe('eager');
        expect(image.attr('fetchpriority'), `fetchpriority attribute for ${filePath}`).toBe('high');
        expect(image.attr('decoding'), `decoding attribute for ${filePath}`).toBe('async');
      }
    });

    it('featured image is marked decorative, since the title already conveys its meaning', () => {
      for (const { filePath, frontmatter } of publishedPosts) {
        const $ = loadPage(frontmatter.path);
        const image = getFeaturedImage($);

        expect(image.attr('alt'), `alt attribute for ${filePath}`).toBe('');
        expect(image.attr('aria-hidden'), `aria-hidden attribute for ${filePath}`).toBe('true');
      }
    });

    it('featured image src resolves to a file that exists in the build output', () => {
      for (const { filePath, frontmatter } of publishedPosts) {
        const $ = loadPage(frontmatter.path);
        const src = getFeaturedImage($).attr('src');

        expect(src, `Missing featured image src in ${filePath}`).toBeTruthy();
        expect(src.startsWith('/'), `Featured image src should be root relative in ${filePath}: ${src}`).toBe(true);
        expect(existsSync(`${SITE_DIR}${src}`), `Featured image missing from build: ${SITE_DIR}${src}`).toBe(true);
      }
    });
  });
});
