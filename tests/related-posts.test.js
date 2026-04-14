import { describe, it, expect } from 'vitest';
import { loadPage, getAllPosts } from './helpers.js';
import { getRelatedPosts } from '../config/filters/related-posts.js';

// ---------------------------------------------------------------------------
// Unit tests for getRelatedPosts()
// ---------------------------------------------------------------------------

function makePost(url, tags = [], extra = {}) {
  return {
    url,
    date: extra.date || new Date('2024-01-01'),
    data: { tags, title: url, ...extra },
  };
}

describe('getRelatedPosts – unit tests', () => {
  const postA = makePost('/a/', ['Java', 'Spring']);
  const postB = makePost('/b/', ['Java']);
  const postC = makePost('/c/', ['Spring', 'OOP']);
  const postD = makePost('/d/', ['Angular']);
  const postE = makePost('/e/', ['Java', 'Spring', 'OOP']);
  const pool = [postA, postB, postC, postD, postE];

  it('returns empty array when inputs are invalid', () => {
    expect(getRelatedPosts(null, pool, 5)).toEqual([]);
    expect(getRelatedPosts(postA, null, 5)).toEqual([]);
    expect(getRelatedPosts(postA, pool, 0)).toEqual([]);
    expect(getRelatedPosts(postA, pool, -1)).toEqual([]);
  });

  it('excludes the current post from results', () => {
    const results = getRelatedPosts(postA, pool, 10);
    expect(results.find((p) => p.url === postA.url)).toBeUndefined();
  });

  it('excludes posts that belong to a series', () => {
    const seriesPost = makePost('/s/', ['Java'], { series: 'My Series' });
    const results = getRelatedPosts(postA, [...pool, seriesPost], 10);
    expect(results.find((p) => p.url === '/s/')).toBeUndefined();
  });

  it('excludes draft posts', () => {
    const draftPost = makePost('/draft/', ['Java'], { draftStatus: 'draft' });
    const results = getRelatedPosts(postA, [...pool, draftPost], 10);
    expect(results.find((p) => p.url === '/draft/')).toBeUndefined();
  });

  it('requires at least one shared tag', () => {
    const results = getRelatedPosts(postA, pool, 10);
    expect(results.find((p) => p.url === postD.url)).toBeUndefined();
  });

  it('ranks by number of shared tags (most shared first)', () => {
    // postA has ['Java', 'Spring']
    // postE has ['Java', 'Spring', 'OOP'] → 2 shared tags
    // postB has ['Java'] → 1 shared tag
    // postC has ['Spring', 'OOP'] → 1 shared tag
    const results = getRelatedPosts(postA, pool, 10);
    expect(results[0].url).toBe('/e/');
  });

  it('respects maxCount limit', () => {
    const results = getRelatedPosts(postA, pool, 2);
    expect(results.length).toBe(2);
  });

  it('uses date as tiebreaker (newer first) when tag overlap is equal', () => {
    const older = makePost('/old/', ['Java'], { date: new Date('2020-01-01') });
    const newer = makePost('/new/', ['Java'], { date: new Date('2024-06-01') });
    const current = makePost('/me/', ['Java']);
    const results = getRelatedPosts(current, [older, newer], 10);
    expect(results[0].url).toBe('/new/');
    expect(results[1].url).toBe('/old/');
  });

  it('honours explicit relatedPosts in declaration order', () => {
    const current = makePost('/me/', ['Java'], { relatedPosts: ['/c/', '/b/'] });
    const results = getRelatedPosts(current, pool, 10);
    expect(results[0].url).toBe('/c/');
    expect(results[1].url).toBe('/b/');
  });

  it('fills remaining slots with tag-based matches after explicit posts', () => {
    // current shares Java+Spring; explicit is postD (Angular, no shared tags but explicit)
    // wait — postD has Angular only, it's in pool but excluded from tag matches
    // Let's use postB as explicit, then tag matches fill the rest
    const current = makePost('/me/', ['Java', 'Spring'], { relatedPosts: ['/b/'] });
    const results = getRelatedPosts(current, pool, 3);
    expect(results[0].url).toBe('/b/'); // explicit first
    expect(results.length).toBe(3); // filled by tag matches
    expect(results.find((p) => p.url === '/b/')).toBeDefined();
    // postB should not appear twice
    const urls = results.map((r) => r.url);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('does not duplicate explicit posts in tag-based results', () => {
    const current = makePost('/me/', ['Java', 'Spring'], { relatedPosts: ['/e/'] });
    const results = getRelatedPosts(current, pool, 10);
    const urls = results.map((r) => r.url);
    expect(urls.filter((u) => u === '/e/').length).toBe(1);
  });

  it('returns empty when current post has no tags and no explicit related', () => {
    const noTags = makePost('/lonely/', []);
    const results = getRelatedPosts(noTags, pool, 10);
    expect(results).toEqual([]);
  });

  it('ignores explicit paths that are not in the pool', () => {
    const current = makePost('/me/', ['Java'], { relatedPosts: ['/nonexistent/', '/b/'] });
    const results = getRelatedPosts(current, pool, 10);
    expect(results[0].url).toBe('/b/');
  });

  it('ignores explicit paths pointing to series posts', () => {
    const seriesPost = makePost('/s/', ['Java'], { series: 'Tutorial' });
    const current = makePost('/me/', ['Java'], { relatedPosts: ['/s/'] });
    const results = getRelatedPosts(current, [...pool, seriesPost], 10);
    expect(results.find((p) => p.url === '/s/')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Integration tests – verify related posts in built HTML
// ---------------------------------------------------------------------------

describe('Related posts in built output', () => {
  const posts = getAllPosts().filter((p) => !p.frontmatter.draftStatus);
  // Non-series, non-draft posts that should potentially have related posts
  const nonSeriesPosts = posts.filter((p) => !p.frontmatter.series && p.frontmatter.path);

  it('series posts should NOT have a related-posts section', () => {
    const seriesPosts = posts.filter((p) => p.frontmatter.series && p.frontmatter.path);
    for (const { frontmatter } of seriesPosts) {
      const $ = loadPage(frontmatter.path);
      const section = $('section.related-posts');
      expect(section.length, `Series post ${frontmatter.path} should not have related posts`).toBe(0);
    }
  });

  it('related posts links should point to existing built pages', () => {
    for (const { frontmatter } of nonSeriesPosts) {
      const $ = loadPage(frontmatter.path);
      const links = $('section.related-posts a');
      links.each((_, el) => {
        const href = $(el).attr('href');
        expect(() => loadPage(href)).not.toThrow();
      });
    }
  });

  it('related posts should not include the current post itself', () => {
    for (const { frontmatter } of nonSeriesPosts) {
      const $ = loadPage(frontmatter.path);
      const links = $('section.related-posts a');
      links.each((_, el) => {
        const href = $(el).attr('href');
        expect(href).not.toBe(frontmatter.path);
      });
    }
  });

  it('related posts should not include any series posts', () => {
    const seriesPaths = posts.filter((p) => p.frontmatter.series).map((p) => p.frontmatter.path);

    for (const { frontmatter } of nonSeriesPosts) {
      const $ = loadPage(frontmatter.path);
      const links = $('section.related-posts a');
      links.each((_, el) => {
        const href = $(el).attr('href');
        expect(seriesPaths, `Related post on ${frontmatter.path} links to series post ${href}`).not.toContain(href);
      });
    }
  });
});
