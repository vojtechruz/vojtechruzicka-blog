import EleventyPluginSass from "@11tyrocks/eleventy-plugin-sass-lightningcss";
import site from "./src/_data/site.js";

export default async function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({
    "./src/static/": "/" // Copy static files to the output directory
  });

  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByGlob("src/posts/**/*.md")
      .filter(it => !it.data.isDraft)
      .sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addLayoutAlias("post", "layouts/post.njk");

  eleventyConfig.addPlugin(EleventyPluginSass);

  eleventyConfig.addCollection("tagList", function (collectionApi) {
    const tagsSet = new Set();
    collectionApi.getAll().forEach(item => {
      if ("tags" in item.data) {
        let tags = item.data.tags;
        if (Array.isArray(tags)) {
          tags.forEach(tag => tagsSet.add(tag));
        }
      }
    });
    return [...tagsSet].sort();
  });

  eleventyConfig.setNunjucksEnvironmentOptions({
    trimBlocks: true,   // removes the newline after {% ... %}
    lstripBlocks: true, // strips leading spaces before {% ... %}
  });

  // --- Helpers (no external plugins) ---

  // RFC 1123 / RFC 822-ish (HTTP date) in UTC, e.g. "Wed, 24 Apr 2024 22:12:03 GMT"
  eleventyConfig.addFilter("utcRfc822", (value) => {
    const d = value instanceof Date ? value : new Date(value);
    return d.toUTCString();
  });

  // RFC 3339 in UTC (Atom), e.g. "2024-04-24T22:12:03Z"
  eleventyConfig.addFilter("toRfc3339", (value) => {
    const d = value instanceof Date ? value : new Date(value);
    return d.toISOString().replace(/\.\d{3}Z$/, "Z");
  });

  // Absolute URL
  eleventyConfig.addFilter("absoluteUrl", (path, base = site.url) => {
    if (!path) return base;
    if (/^https?:\/\//i.test(path)) return path;
    return (base.replace(/\/+$/, "") + "/" + path.replace(/^\/+/, ""));
  });

  // Naive HTML absolutizer for href/src beginning with "/" (good enough for feed)
  eleventyConfig.addFilter("htmlToAbsoluteUrls", (html, base = site.url) => {
    if (!html) return "";
    return html
      .replace(/(href|src)=["']\/([^"']*)["']/g, (_m, attr, p) =>
        `${attr}="${base.replace(/\/+$/, "")}/${p}"`
      );
  });

  return {
    dir: {
      input: "src",           // Input directory
      includes: "_includes",  // Includes directory (relative to input)
      output: "_site"         // Output directory
    },
    markdownTemplateEngine: "njk",  // Use Nunjucks for markdown
    htmlTemplateEngine: "njk",       // Use Nunjucks for HTML
    dataTemplateEngine: 'njk',
  };
}
