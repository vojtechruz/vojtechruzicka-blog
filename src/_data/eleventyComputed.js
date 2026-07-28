// _data/eleventyComputed.js
// Centralized SEO + structure helpers. Works with "type": "module" in package.json.

import path from 'path';
import Image from '@11ty/eleventy-img';
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

// X, Mastodon and Bluesky all crop large summary cards to roughly 1.91:1, so the OG image is
// generated at exactly that ratio instead of letting each platform clip the featured image.
const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;

/**
 * Share image for pages with no generated OG image (supports http, /root, ./relative next to
 * page url). Returns { url, width?, height? } — dimensions are only known for the site-wide
 * default, so og:image:width/height is omitted for the other cases.
 */
function shareImageFallback({ featuredImage, page, site }) {
  if (!featuredImage) {
    return {
      url: `${site.url}${site.defaultShareImage || '/default-share.jpg'}`,
      width: site.defaultShareImageWidth,
      height: site.defaultShareImageHeight,
    };
  }

  if (featuredImage.startsWith('http')) {
    return { url: featuredImage };
  }

  if (featuredImage.startsWith('/')) {
    return { url: `${site.url}${featuredImage}` };
  }

  const filename = featuredImage.replace(/^\.\//, ''); // strip leading "./"

  return { url: `${site.url}${page.url}${filename}` };
}

/**
 * Render a social card image at a stable URL. The image transform plugin renames files with
 * content hashes (e.g. featured-a1b-800.avif), so crawlers need a plain JPEG at a predictable
 * path. eleventy-img caches by source hash, so incremental rebuilds skip unchanged images.
 * Returns undefined on failure so the caller can fall back to shareImageFallback.
 */
async function generateOgImage(src, urlPath) {
  try {
    const metadata = await Image(src, {
      formats: ['jpeg'],
      widths: [OG_IMAGE_WIDTH],
      outputDir: path.resolve('_site' + urlPath),
      urlPath,
      filenameFormat: () => 'og-image.jpg',
      // `transform` gives full sharp access before eleventy-img processes the image. Resizing
      // here marks the image as already resized, so eleventy-img keeps the cropped dimensions
      // instead of applying its own width-only resize.
      transform: (sharpInstance) => sharpInstance.resize(OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT, { fit: 'cover' }),
    });

    // The crop is deterministic, so report the constants rather than the stat eleventy-img
    // returns. `transform` only runs when the image is actually generated — on an output-cache
    // hit (serve mode, where _site is never cleaned) the stat still carries the uncropped
    // aspect-derived height, which would not match the file on disk.
    const [image] = metadata.jpeg;
    return { url: image.url, width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT };
  } catch {
    return undefined;
  }
}

/**
 * Compute a single "kind" (enum) for the current page.
 * Possible values: "home" | "homePaginated" | "archive" | "topics" | "topic" | "post" | "page"
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

  if (url === '/archive/') {
    return { url, stem, kind: 'archive' };
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
function buildBreadcrumbs({ url, title, topics, kind, topicName, seriesMetadata, archivedStatus }) {
  const crumbs = [{ name: 'Home', url: '/' }];

  switch (kind) {
    case 'home':
      return crumbs;

    case 'homePaginated': {
      const m = url.match(/^\/pages\/(\d+)\/?$/);
      const pageNum = m ? m[1] : url;
      return crumbs.concat({ name: 'Topics', url: '/topics/' }, { name: `Page ${pageNum}`, url });
    }

    case 'archive':
      return crumbs.concat({ name: 'Archive', url: '/archive/' });

    case 'topics':
      return crumbs.concat({ name: 'Topics', url: '/topics/' });

    case 'topic': {
      const topicSlug = url.replace(/^\/topics\/|\/$/g, '');
      return crumbs.concat({ name: 'Topics', url: '/topics/' }, { name: topicName || topicSlug, url });
    }

    case 'post': {
      if (archivedStatus) {
        return crumbs.concat({ name: 'Archive', url: '/archive/' }, { name: title || 'Archived Post', url });
      }

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
  pageTitle: (d) => {
    if (!d.title) {
      return d.site?.title;
    }
    return d.archivedStatus ? `${d.title} (Historical Archive)` : d.title;
  },
  pageDescription: (d) => {
    const description = d.description || d.excerpt || d.site?.description;
    return d.archivedStatus ? `Historical archive: ${description}` : description;
  },
  pageUrl: (d) => (d.site?.url || '') + (d.page?.url || '/'),

  // For archived posts, the canonical URL points to the superseding article
  canonicalUrl: (d) => {
    if (d.archivedStatus && d.supersededBy) {
      return (d.site?.url || '') + d.supersededBy;
    }
    return (d.site?.url || '') + (d.page?.url || '/');
  },

  isArchived: (d) => !!d.archivedStatus,

  // Reverse lookup: which archived posts point to this page via supersededBy.
  // Uses a pre-built map (historicalVersionsMap) to avoid accessing collections.all,
  // which would force a full rebuild of all pages on every file change.
  historicalVersions: (d) => {
    if (!d.historicalVersionsMap || !d.page?.url) {
      return [];
    }
    return d.historicalVersionsMap[d.page.url] || [];
  },

  // Page type flags
  isHome: (d) => getPageKind(d).kind === 'home',
  isHomePaginated: (d) => getPageKind(d).kind === 'homePaginated',
  isTopics: (d) => getPageKind(d).kind === 'topics',
  isTopic: (d) => getPageKind(d).kind === 'topic',
  isPost: (d) => getPageKind(d).kind === 'post',
  isArchive: (d) => getPageKind(d).kind === 'archive',
  isAbout: (d) => d.page?.url === '/about/',
  isSeries: (d) => getPageKind(d).kind === 'series',
  isSeriesListing: (d) => getPageKind(d).kind === 'seriesListing',

  // Generate a stable og-image.jpg at build time for posts and series pages.
  ogImage: async (d) => {
    const { kind } = getPageKind(d);

    if (kind === 'post') {
      if (!d.page?.inputPath) { return undefined; }
      // Use raw data.featuredImage — the computed version from posts.11tydata.js may not yet
      // be resolved when this global computed property runs.
      const imageFile = (d.featuredImage || 'featured.jpg').replace(/^\.\//, '');
      const src = path.resolve(path.dirname(d.page.inputPath), imageFile);
      return generateOgImage(src, d.path || d.page?.url || '/');
    }

    if (kind === 'series') {
      const series = d.currentSeries;
      if (!series?.image) { return undefined; }
      const src = path.resolve('src', 'images', 'series', series.slug, series.image);
      return generateOgImage(src, `/series/${series.slug}/`);
    }

    return undefined;
  },

  // { url, width?, height? } for the social card image — generated OG image when there is one,
  // otherwise the featured image or the site-wide default.
  shareImage: (d) =>
    d.ogImage
      ? { ...d.ogImage, url: (d.site?.url || '') + d.ogImage.url }
      : shareImageFallback({ featuredImage: d.featuredImage, page: d.page, site: d.site }),

  imageUrl: (d) => d.shareImage?.url,
  imageWidth: (d) => d.shareImage?.width,
  imageHeight: (d) => d.shareImage?.height,

  // Alt text for the social card image. Featured images are decorative in the page itself, but
  // on a card the image carries the article, so it needs a label.
  imageAlt: (d) => d.featuredImageAlt || (d.featuredImage ? d.title : null) || d.site?.defaultShareImageAlt,

  // Headline for link preview cards. The home page's own title ("Latest posts") is a poor card
  // headline when someone shares the site root, so use the site name there instead.
  socialTitle: (d) => (getPageKind(d).kind === 'home' ? d.site?.title : d.pageTitle),

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
      archivedStatus: d.archivedStatus,
    });
  },

  // For <title>
  metaTitle: (d) => {
    if (!d.title) {
      return d.site.title;
    }
    const suffix = d.archivedStatus ? ' (Historical Archive)' : '';
    return `${d.title}${suffix} | ${d.site.title}`;
  },

  isLocalDevelopment,
  isPreview,
};
