// _data/eleventyComputed.js
// Centralized SEO + structure helpers. Works with "type": "module" in package.json.

import { isLocalDevelopment, isPreview } from '../../config/env-utils.js';
import { slugify } from '../../config/utils/formatting.js';

const AVOID = new Set(['blog', 'post', 'misc', 'general']);

/** Pick first non-generic topic, else first topic */
function pickPrimaryTopic(topics = []) {
  if (!Array.isArray(topics) || topics.length === 0) {
    return null;
  }

  const chosen = topics.find((t) => !AVOID.has(String(t).toLowerCase()));
  return chosen || topics[0] || null;
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
 * Possible values: "home" | "homePaginated" | "topics" | "topic" | "post" | "page"
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

  if (url === '/topics/') {
    return { url, stem, kind: 'topics' };
  }

  if (url.startsWith('/topics/') && url !== '/topics/') {
    return { url, stem, kind: 'topic' };
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
function buildBreadcrumbs({ url, title, topics, kind, topicName, seriesMetadata }) {
  const crumbs = [{ name: 'Home', url: '/' }];

  switch (kind) {
    case 'home':
      return crumbs;

    case 'homePaginated': {
      const m = url.match(/^\/pages\/(\d+)\/?$/);
      const pageNum = m ? m[1] : url;
      return crumbs.concat({ name: 'Topics', url: '/topics/' }, { name: `Page ${pageNum}`, url });
    }

    case 'topics':
      return crumbs.concat({ name: 'Topics', url: '/topics/' });

    case 'topic': {
      const topicSlug = url.replace(/^\/topics\/|\/$/g, '');
      return crumbs.concat({ name: 'Topics', url: '/topics/' }, { name: topicName || topicSlug, url });
    }

    case 'post': {
      const postSeries = Array.isArray(seriesMetadata) ? seriesMetadata.find((s) => s.posts.includes(url)) : null;
      if (postSeries) {
        return crumbs.concat(
          { name: 'Series', url: '/series/' },
          { name: postSeries.name, url: `/series/${postSeries.slug}/` },
          { name: title || 'Post', url },
        );
      }

      const primary = pickPrimaryTopic(topics);
      const middle = [{ name: 'Topics', url: '/topics/' }];
      if (primary) {
        middle.push({ name: primary, url: `/topics/${slugify(primary)}/` });
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
  isTopic: (d) => getPageKind(d).kind === 'topic',
  isPost: (d) => getPageKind(d).kind === 'post',
  isAbout: (d) => d.page?.url === '/about/',
  isSeries: (d) => getPageKind(d).kind === 'series',
  isSeriesListing: (d) => getPageKind(d).kind === 'seriesListing',

  // Prefer the pre-generated og-image.jpg (posts only) over the raw featuredImage path.
  // The transform plugin's hashed filenames are not predictable at data-computation time,
  // so posts.11tydata.js generates a stable JPEG via eleventy-img and exposes it as ogImageUrl.
  // Non-post pages (home, topic, about) fall back to shareImageUrl.
  imageUrl: (d) =>
    d.ogImageUrl
      ? (d.site?.url || '') + d.ogImageUrl
      : shareImageUrl({ featuredImage: d.featuredImage, page: d.page, site: d.site }),

  // Short title for use within a series TOC — strips everything up to and including the first ': '
  seriesTitle: (d) => {
    if (!d.series || !d.title) {
      return null;
    }

    const idx = d.title.indexOf(': ');
    return idx !== -1 ? d.title.slice(idx + 2) : null;
  },

  // Dates
  publishedDate: (d) => d.date,
  modifiedDate: (d) => d.dateModified || d.date,

  // Breadcrumbs (array of {name,url})
  breadcrumbs: (d) => {
    const { url, kind } = getPageKind(d);
    return buildBreadcrumbs({
      url,
      title: d.title,
      topics: d.topics,
      kind,
      topicName: d.topic,
      seriesMetadata: d.seriesMetadata,
    });
  },

  // For <title>
  metaTitle: (d) => (d.title ? `${d.title} | ${d.site.title}` : d.site.title),

  isLocalDevelopment,
  isPreview,
};
