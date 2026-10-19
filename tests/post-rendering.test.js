import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { join } from 'path';
import { loadPage, loadPageHtml, getAllPosts, SITE_DIR } from './helpers.js';
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

  describe('Links to the blog itself', () => {
    // Every built post page, archived copies included: they link to live posts too
    const builtPosts = getAllPosts().filter(
      ({ frontmatter }) => frontmatter.path && existsSync(`${SITE_DIR}${frontmatter.path}index.html`),
    );

    it('are root-relative, so the internal link check covers them and previews stay on the preview', () => {
      for (const { filePath, frontmatter } of builtPosts) {
        const $ = loadPage(frontmatter.path);
        const absolute = getPostContent($)
          .find('a[href]')
          .map((_, a) => $(a).attr('href'))
          .get()
          .filter((href) => /^(?:https?:)?\/\/(?:www\.)?vojtechruzicka\.com(?:[/?#]|$)/i.test(href));
        expect(absolute, `${filePath}: write /slug/ instead`).toEqual([]);
      }
    });
  });
});

describe('Image lightbox script', () => {
  it('loads on every post with an in-post image, and not on posts without images', () => {
    const SCRIPT = /<script src="\/scripts\/lightbox\.js(?:\?v=[^"]*)?" defer(?:="")?><\/script>/;
    const built = getAllPosts()
      .map(({ frontmatter }) => frontmatter.path)
      .filter((url) => url && existsSync(join(SITE_DIR, url, 'index.html')));
    // The template tests for any <img> in the content: in-post images, but also linkedPost card
    // thumbnails, where the script finds nothing to do and stops. The featured image is in the header.
    const inPostImages = (url) => loadPage(url)('main.post > article > .image-wrapper').length;
    const contentImages = (url) => loadPage(url)('main.post > article img').not('article > header img').length;
    const withInPostImages = built.filter((url) => inPostImages(url) > 0);
    const withoutImages = built.filter((url) => contentImages(url) === 0);

    expect(withInPostImages.length).toBeGreaterThan(0);
    expect(withoutImages.length, 'some posts have no images').toBeGreaterThan(0);
    for (const url of withInPostImages) {
      expect(SCRIPT.test(loadPageHtml(url)), url).toBe(true);
    }
    for (const url of withoutImages) {
      expect(SCRIPT.test(loadPageHtml(url)), url).toBe(false);
    }
  });
});

describe('Scrollable box script', () => {
  it('loads exactly on posts with a code block, table or diagram', () => {
    const SCRIPT = /<script src="\/scripts\/scroll-regions\.js(?:\?v=[^"]*)?" defer(?:="")?><\/script>/;
    const BOX = /<pre class="shiki|class="table-wrapper"|class="mermaid-diagram"/;
    const built = getAllPosts()
      .map(({ frontmatter }) => frontmatter.path)
      .filter((url) => url && existsSync(join(SITE_DIR, url, 'index.html')));
    const withBoxes = built.filter((url) => BOX.test(loadPageHtml(url)));

    expect(withBoxes.length).toBeGreaterThan(0);
    expect(withBoxes.length, 'some posts have none').toBeLessThan(built.length);
    for (const url of built) {
      expect(SCRIPT.test(loadPageHtml(url)), url).toBe(withBoxes.includes(url));
    }
  });
});
