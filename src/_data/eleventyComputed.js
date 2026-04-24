// _data/eleventyComputed.js
// Centralized SEO + structure helpers. Works with "type": "module" in package.json.

import { isLocalDevelopment, isPreview } from '../../config/env-utils.js';
import { slugify } from '../../config/utils/formatting.js';

const AVOID = new Set(['blog', 'post', 'misc', 'general']);

/** Pick first non-generic tag, else first tag */
function pickPrimaryTag(tags = []) {
  if (!Array.isArray(tags) || tags.length === 0) {
    return null;
  }

  const chosen = tags.find((t) => !AVOID.has(String(t).toLowerCase()));
  return chosen || tags[0] || null;
}

/** Share image absolute URL (supports http, /root, ./relative next to page url) */
function shareImageUrl({ featuredImage, page, site }) {
  if (!featuredImage) {
    return `${site.url}${site.defaultShareImage || '/default-share.jpg'}`;
  }

  if (featuredImage.startsWith('http')) {
    return featuredImage;
  }

  if (featuredImage.startsWith('/')) {
    return `${site.url}${featuredImage}`;
  }

  const filename = featuredImage.replace(/^\.\//, ''); // strip leading "./"

  return `${site.url}${page.url}${filename}`;
}

/**
 * Compute a single "kind" (enum) for the current page.
 * Possible values: "home" | "homePaginated" | "topics" | "tag" | "post" | "page"
 */
function getPageKind(d) {
  const url = d.page?.url || '/';
  const stem = d.page?.filePathStem || '';

  if (url === '/') {
    return { url, stem, kind: 'home' };
  }

  if (url.startsWith('/pages/')) {
    return { url, stem, kind: 'homePaginated' };
  }

  if (url === '/archives/') {
    return { url, stem, kind: 'topics' };
  }

  if (url.startsWith('/tags/') && url !== '/tags/') {
    return { url, stem, kind: 'tag' };
  }

  if (url === '/series/') {
    return { url, stem, kind: 'seriesListing' };
  }

  if (url.startsWith('/series/')) {
    return { url, stem, kind: 'series' };
  }

  if (stem.startsWith('/posts/')) {
    return { url, stem, kind: 'post' };
  }

  return { url, stem, kind: 'page' };
}

/** Build breadcrumb array based on kind */
function buildBreadcrumbs({ url, title, tags, kind, tagName }) {
  const crumbs = [{ name: 'Home', url: '/' }];

  switch (kind) {
    case 'home':
      return crumbs;

    case 'homePaginated': {
      const m = url.match(/^\/pages\/(\d+)\/?$/);
      const pageNum = m ? m[1] : url;
      return crumbs.concat({ name: 'Topics', url: '/archives/' }, { name: `Page ${pageNum}`, url });
    }

    case 'topics':
      return crumbs.concat({ name: 'Topics', url: '/archives/' });

    case 'tag': {
      const tagSlug = url.replace(/^\/tags\/|\/$/g, '');
      return crumbs.concat({ name: 'Topics', url: '/archives/' }, { name: tagName || tagSlug, url });
    }

    case 'post': {
      const primary = pickPrimaryTag(tags);
      const middle = [{ name: 'Topics', url: '/archives/' }];
      if (primary) {
        middle.push({ name: primary, url: `/tags/${slugify(primary)}/` });
      }
      return crumbs.concat(middle, { name: title || 'Post', url });
    }

    case 'seriesListing':
      return crumbs.concat({ name: 'Series', url: '/series/' });

    case 'series':
      return crumbs.concat({ name: 'Series', url: '/series/' }, { name: title || 'Series', url });

    case 'page':
    default:
      return crumbs.concat({ name: title || 'Page', url });
  }
}

export default {
  // Canonical basics
  pageTitle: (d) => d.title || d.site?.title,
  pageDescription: (d) => d.description || d.excerpt || d.site?.description,
  pageUrl: (d) => (d.site?.url || '') + (d.page?.url || '/'),

  // Page type flags
  isHome: (d) => getPageKind(d).kind === 'home',
  isHomePaginated: (d) => getPageKind(d).kind === 'homePaginated',
  isTopics: (d) => getPageKind(d).kind === 'topics',
  isTag: (d) => getPageKind(d).kind === 'tag',
  isPost: (d) => getPageKind(d).kind === 'post',
  isAbout: (d) => d.page?.url === '/about/',
  isSeries: (d) => getPageKind(d).kind === 'series',
  isSeriesListing: (d) => getPageKind(d).kind === 'seriesListing',

  // Prefer the pre-generated og-image.jpg (posts only) over the raw featuredImage path.
  // The transform plugin's hashed filenames are not predictable at data-computation time,
  // so posts.11tydata.js generates a stable JPEG via eleventy-img and exposes it as ogImageUrl.
  // Non-post pages (home, tag, about) fall back to shareImageUrl.
  imageUrl: (d) =>
    d.ogImageUrl
      ? (d.site?.url || '') + d.ogImageUrl
      : shareImageUrl({ featuredImage: d.featuredImage, page: d.page, site: d.site }),

  // Dates
  publishedDate: (d) => d.date,
  modifiedDate: (d) => d.dateModified || d.date,

  // Breadcrumbs (array of {name,url})
  breadcrumbs: (d) => {
    const { url, kind } = getPageKind(d);
    return buildBreadcrumbs({
      url,
      title: d.title,
      tags: d.tags,
      kind,
      tagName: d.tag,
    });
  },

  // For <title>
  metaTitle: (d) => (d.title ? `${d.title} | ${d.site.title}` : d.site.title),

  isLocalDevelopment,
  isPreview,
};
