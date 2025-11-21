import site from "../../src/_data/site.js";

export default function registerUrlFilters(eleventyConfig) {
  // Absolute URL
  eleventyConfig.addFilter("absoluteUrl", (path, base = site.url) => {
    if (!path) return base;
    if (/^https?:\/\//i.test(path)) return path;
    return base.replace(/\/+$/, "") + "/" + String(path).replace(/^\/+/, "");
  });

  // Naive HTML absolutizer for href/src beginning with "/" (good enough for feed)
  eleventyConfig.addFilter("htmlToAbsoluteUrls", (html, base = site.url) => {
    if (!html) return "";
    return String(html).replace(/(href|src)=["']\/([^"']*)["']/g, (_m, attr, p) =>
      `${attr}="${base.replace(/\/+$/, "")}/${p}`
    );
  });
}
