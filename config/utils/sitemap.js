// Sitemap helpers — see docs/SITEMAP.md.
//
// `<lastmod>` is only worth emitting when it reflects the content. Eleventy's default `date` for a
// template without a frontmatter date is the file's creation time, and Cloudflare Pages clones the
// repo fresh on every deploy, so a naive `page.date` stamps every listing page with the deploy time.
// Google stops trusting `lastmod` once it sees it change without the page changing, so instead:
//
// - posts report their `modifiedDate` (frontmatter `dateModified`, falling back to `date`)
// - listing pages (home, its pagination, topic pages, series pages, /topics/, /series/) report the
//   newest `modifiedDate` among the posts they list — that is the last time their content changed
// - everything else (about, search) omits `<lastmod>`; the element is optional and nothing tracks
//   when those pages change

import { toDateUtcMidnightIfDateOnly } from './formatting.js';

/** Kinds whose content is the whole post list, so they change whenever any post does. */
const SITE_WIDE_LISTING_KINDS = new Set(['home', 'homePaginated', 'topics', 'seriesListing']);

/** Normalize a frontmatter date (Date or string) to a Date, or null when unparsable. */
export function toDate(value) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : toDateUtcMidnightIfDateOnly(value);

  return date && !Number.isNaN(date.getTime()) ? date : null;
}

/** The date a single post last changed: `modifiedDate` (computed), else `dateModified`, else `date`. */
export function getPostLastmod(post) {
  return toDate(post?.data?.modifiedDate) || toDate(post?.data?.dateModified) || toDate(post?.date);
}

/** Newest post lastmod in the list, or null when the list is empty. */
export function newestPostLastmod(posts) {
  let newest = null;

  for (const post of posts) {
    const date = getPostLastmod(post);
    if (date && (!newest || date > newest)) {
      newest = date;
    }
  }

  return newest;
}

/**
 * Sitemap `<lastmod>` for a page, or null when the page should omit the element.
 * @param {object} page - collection item; relies on the computed `pageKind` (src/_data/eleventyComputed.js)
 * @param {object[]} posts - `collections.posts`
 * @returns {Date|null}
 */
export function getSitemapLastmod(page, posts = []) {
  const kind = page?.data?.pageKind;

  if (kind === 'post') {
    return getPostLastmod(page);
  }

  if (SITE_WIDE_LISTING_KINDS.has(kind)) {
    return newestPostLastmod(posts);
  }

  if (kind === 'topic') {
    const topic = page.data.topic;
    return newestPostLastmod(
      posts.filter((post) => Array.isArray(post.data?.topics) && post.data.topics.includes(topic)),
    );
  }

  if (kind === 'series') {
    const urls = new Set(page.data.currentSeries?.posts || []);
    return newestPostLastmod(posts.filter((post) => urls.has(post.url)));
  }

  return null;
}
