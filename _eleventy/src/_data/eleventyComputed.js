// _data/eleventyComputed.js
// Centralized SEO + structure helpers. Works with "type": "module" in package.json.

const AVOID = new Set(["blog", "post", "misc", "general"]);

/** Pick first non-generic tag, else first tag */
function pickPrimaryTag(tags = []) {
  if (!Array.isArray(tags) || tags.length === 0) return null;
  const chosen = tags.find(t => !AVOID.has(String(t).toLowerCase()));
  return chosen || tags[0] || null;
}

/** Share image absolute URL (supports http, /root, ./relative next to page url) */
function shareImageUrl({ featuredImage, page, site }) {
  if (!featuredImage) return `${site.url}${site.defaultShareImage || "/images/default-share.png"}`;
  if (featuredImage.startsWith("http")) return featuredImage;
  if (featuredImage.startsWith("/")) return `${site.url}${featuredImage}`;
  const filename = featuredImage.replace(/^.\//, ""); // strip leading "./"
  return `${site.url}${page.url}${filename}`;
}

/** Detect page type flags once */
function detectKinds(url, filePathStem, hasDate) {
  const isHome = url === "/";
  const isHomePaginated = url.startsWith("/pages/");
  const isTopics = url === "/tags/";                           // topics index (historical: /tags/)
  const isTag = url.startsWith("/tags/") && url !== "/tags/";
  const isPost = Boolean(hasDate) || (filePathStem || "").startsWith("/posts/");
  return { isHome, isHomePaginated, isTopics, isTag, isPost };
}

/** Build breadcrumb array */
function buildBreadcrumbs({ url, title, tags, isHome, isHomePaginated, isTopics, isTag, isPost }) {
  const crumbs = [{ name: "Home", url: "/" }];
  if (isHome) return crumbs;

  if (isHomePaginated) {
    const pageNum = url.replace("/pages/", "").replace("/", "");
    return crumbs.concat(
      { name: "Archive", url: "/archives/" },
      { name: `Page ${pageNum}`, url }
    );
  }

  if (isTopics) return crumbs.concat({ name: "Topics", url: "/tags/" });

  if (isTag) {
    const tagSlug = url.replace(/^\/tags\/|\/$/g, "");
    return crumbs.concat(
      { name: "Topics", url: "/tags/" },
      { name: tagSlug, url }
    );
  }

  if (isPost) {
    const primary = pickPrimaryTag(tags);
    const middle = [{ name: "Archive", url: "/archives/" }];
    if (primary) middle.push({ name: primary, url: `/tags/${primary}/` });
    return crumbs.concat(middle, { name: title || "Post", url });
  }

  // Generic static page
  return crumbs.concat({ name: title || "Page", url });
}

export default {
  // Canonical basics
  pageTitle: (d) => d.metaTitle || d.title || d.site?.title,
  pageDescription: (d) => d.description || d.site?.description,
  pageUrl: (d) => (d.site?.url || "") + (d.page?.url || "/"),

  // Page type flags
  isHome: (d) => d.page?.url === "/",
  isHomePaginated: (d) => (d.page?.url || "").startsWith("/pages/"),
  isTopics: (d) => d.page?.url === "/tags/",
  isTag: (d) => {
    const u = d.page?.url || "/";
    return u.startsWith("/tags/") && u !== "/tags/";
  },
  isPost: (d) => Boolean(d.date) || (d.page?.filePathStem || "").startsWith("/posts/"),
  isAbout: (d) => d.pageType === "about" || (d.page?.url === "/about/"),

  // Image
  imageUrl: (d) => shareImageUrl({ featuredImage: d.featuredImage, page: d.page, site: d.site }),

  // Dates
  publishedDate: (d) => d.date,
  modifiedDate: (d) => d.dateModified || d.date,

  // Primary tag for posts
  primaryTag: (d) => pickPrimaryTag(d.tags),

  // Breadcrumbs (array of {name,url})
  breadcrumbs: (d) => {
    const url = d.page?.url || "/";
    const kinds = detectKinds(url, d.page?.filePathStem, d.date);
    return buildBreadcrumbs({ url, title: d.title, tags: d.tags, ...kinds });
  },

  metaTitle: (data) =>
    data.title ? `${data.title} | ${data.site.title}` : data.site.title,
};
//TODO verify and clean, there are still some dummy data and not all fields may be used
// TODO move functions from this file?