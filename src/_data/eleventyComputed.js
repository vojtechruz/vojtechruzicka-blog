// _data/eleventyComputed.js
// Centralized SEO + structure helpers. Works with "type": "module" in package.json.

const AVOID = new Set(["blog", "post", "misc", "general"]);

/** Pick first non-generic tag, else first tag */
function pickPrimaryTag(tags = []) {
  if (!Array.isArray(tags) || tags.length === 0) return null;
  const chosen = tags.find((t) => !AVOID.has(String(t).toLowerCase()));
  return chosen || tags[0] || null;
}

/** Share image absolute URL (supports http, /root, ./relative next to page url) */
function shareImageUrl({ featuredImage, page, site }) {
  if (!featuredImage) {
    return `${site.url}${site.defaultShareImage || "/images/default-share.png"}`;
  }
  if (featuredImage.startsWith("http")) return featuredImage;
  if (featuredImage.startsWith("/")) return `${site.url}${featuredImage}`;
  const filename = featuredImage.replace(/^.\//, ""); // strip leading "./"
  return `${site.url}${page.url}${filename}`;
}

/**
 * Compute a single "kind" (enum) for the current page.
 * Possible values: "home" | "homePaginated" | "topics" | "tag" | "post" | "page"
 */
function getPageKind(d) {
  const url = d.page?.url || "/";
  const stem = d.page?.filePathStem || "";

  if (url === "/") return { url, stem, kind: "home" };
  if (url.startsWith("/pages/")) return { url, stem, kind: "homePaginated" };
  if (url === "/tags/") return { url, stem, kind: "topics" };
  if (url.startsWith("/tags/") && url !== "/tags/") return { url, stem, kind: "tag" };
  if (stem.startsWith("/posts/")) return { url, stem, kind: "post" };

  return { url, stem, kind: "page" };
}

/** Build breadcrumb array based on kind */
function buildBreadcrumbs({ url, title, tags, kind }) {
  const crumbs = [{ name: "Home", url: "/" }];

  switch (kind) {
    case "home":
      return crumbs;

    case "homePaginated": {
      const pageNum = url.replace("/pages/", "").replace("/", "");
      return crumbs.concat(
        { name: "Archive", url: "/archives/" },
        { name: `Page ${pageNum}`, url }
      );
    }

    case "topics":
      return crumbs.concat({ name: "Topics", url: "/tags/" });

    case "tag": {
      const tagSlug = url.replace(/^\/tags\/|\/$/g, "");
      return crumbs.concat(
        { name: "Topics", url: "/tags/" },
        { name: tagSlug, url }
      );
    }

    case "post": {
      const primary = pickPrimaryTag(tags);
      const middle = [{ name: "Archive", url: "/archives/" }];
      if (primary) {
        middle.push({ name: primary, url: `/tags/${primary}/` });
      }
      return crumbs.concat(middle, { name: title || "Post", url });
    }

    case "page":
    default:
      return crumbs.concat({ name: title || "Page", url });
  }
}

export default {
  // Canonical basics
  pageTitle: (d) => d.title || d.site?.title,
  pageDescription: (d) => d.description || d.site?.description,
  pageUrl: (d) => (d.site?.url || "") + (d.page?.url || "/"),

  // Page type flags – všechny jedou přes jeden "kind"
  isHome: (d) => getPageKind(d).kind === "home",
  isHomePaginated: (d) => getPageKind(d).kind === "homePaginated",
  isTopics: (d) => getPageKind(d).kind === "topics",
  isTag: (d) => getPageKind(d).kind === "tag",
  isPost: (d) => getPageKind(d).kind === "post",
  isAbout: (d) => d.pageType === "about" || d.page?.url === "/about/",

  // Image
  imageUrl: (d) =>
    shareImageUrl({ featuredImage: d.featuredImage, page: d.page, site: d.site }),

  // Dates
  publishedDate: (d) => d.date,
  modifiedDate: (d) => d.dateModified || d.date,

  // Primary tag for posts
  primaryTag: (d) => pickPrimaryTag(d.tags),

  // Breadcrumbs (array of {name,url})
  breadcrumbs: (d) => {
    const { url, kind } = getPageKind(d);
    return buildBreadcrumbs({
      url,
      title: d.title,
      tags: d.tags,
      kind,
    });
  },

  // For <title>
  metaTitle: (d) =>
    d.title ? `${d.title} | ${d.site.title}` : d.site.title,

  isLocalDevelopment: process.env.ELEVENTY_RUN_MODE === "serve",
};
