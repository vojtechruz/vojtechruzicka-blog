import { describe, it, expect } from 'vitest';
import { loadPage, getAllPosts } from './helpers.js';
import { getCanonicalUrl, getMetaDescriptionContent, getOgImage } from './queries/seo.js';
import { getPostTitleText } from './queries/post.js';
import siteConfig from '../src/_data/site.js';

// BlogPosting JSON-LD on post pages (src/_includes/components/jsonld.njk).
// Breadcrumbs and the archived-post case are covered elsewhere; this pins down
// the article block itself, field by field, against the rest of the page <head>.

const POSTS = ['/css-flexbox/', '/java-records/', '/commitlint/'];
/** Has `dateModified` in its frontmatter, so dateModified must differ from datePublished. */
const MODIFIED_POST = '/exam-notes-pivotal-certified-spring-professional/';

const RFC3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function jsonLdBlocks($) {
  return $('script[type="application/ld+json"]')
    .map((_, el) => JSON.parse($(el).text()))
    .get();
}

function blogPosting($) {
  const blocks = jsonLdBlocks($).filter((block) => block['@type'] === 'BlogPosting');
  expect(blocks, 'exactly one BlogPosting block').toHaveLength(1);
  return blocks[0];
}

describe('BlogPosting JSON-LD', () => {
  const siteUrl = siteConfig.url.replace(/\/$/, '');

  it.each([...POSTS, MODIFIED_POST])('%s identifies the article and page consistently', (url) => {
    const $ = loadPage(url);
    const post = blogPosting($);
    const canonical = getCanonicalUrl($);

    expect(post['@context']).toBe('https://schema.org');
    expect(canonical).toBe(`${siteUrl}${url}`);
    expect(post.url).toBe(canonical);
    expect(post.mainEntityOfPage).toEqual({ '@type': 'WebPage', '@id': canonical });

    expect(post.headline).toBe(getPostTitleText($));
    expect(post.description).toBe(getMetaDescriptionContent($));
    expect(post.description.length).toBeGreaterThan(0);
  });

  it.each([...POSTS, MODIFIED_POST])('%s uses the same share image as og:image', (url) => {
    const $ = loadPage(url);
    const post = blogPosting($);

    expect(post.image).toBe(getOgImage($));
    expect(post.image).toMatch(new RegExp(`^${siteUrl}/`));
  });

  it.each([...POSTS, MODIFIED_POST])('%s attributes the article to the author and the site as publisher', (url) => {
    const post = blogPosting(loadPage(url));

    expect(post.author).toEqual({ '@type': 'Person', name: siteConfig.author });
    expect(post.publisher['@type']).toBe('Organization');
    expect(post.publisher.name).toBe(siteConfig.title);
    expect(post.publisher.logo).toEqual({ '@type': 'ImageObject', url: `${siteUrl}/favicon.png` });
  });

  it.each([...POSTS, MODIFIED_POST])('%s carries RFC 3339 publish and modify dates in order', (url) => {
    const post = blogPosting(loadPage(url));

    expect(post.datePublished).toMatch(RFC3339);
    expect(post.dateModified).toMatch(RFC3339);
    expect(Date.parse(post.dateModified)).toBeGreaterThanOrEqual(Date.parse(post.datePublished));
  });

  it('falls back to the publish date when a post has never been modified', () => {
    // Any published post without dateModified in its frontmatter (modifiedDate → date in eleventyComputed)
    const untouched = getAllPosts().find(
      ({ filePath, frontmatter }) =>
        !frontmatter.dateModified &&
        frontmatter.path &&
        !filePath.includes('_drafts') &&
        !filePath.includes('archives'),
    );
    expect(untouched, 'a published post without dateModified').toBeDefined();

    const post = blogPosting(loadPage(untouched.frontmatter.path));
    expect(post.dateModified).toBe(post.datePublished);
  });

  it('reflects the frontmatter dateModified when a post was updated', () => {
    const $ = loadPage(MODIFIED_POST);
    const post = blogPosting($);

    expect(post.dateModified).not.toBe(post.datePublished);
    expect(post.datePublished.startsWith('2016-10-24')).toBe(true);
    expect(post.dateModified.startsWith('2018-07-12')).toBe(true);
    // ...and the visible "Updated:" line agrees with it
    expect($('.date-modified').text()).toContain('2018');
  });

  it.each(POSTS)('%s emits a BreadcrumbList next to the article block and nothing generic', (url) => {
    const types = jsonLdBlocks(loadPage(url)).map((block) => block['@type']);

    expect(types).toContain('BreadcrumbList');
    expect(types).not.toContain('WebPage');
    expect(types).not.toContain('CollectionPage');
  });
});
