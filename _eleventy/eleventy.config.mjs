import registerPassthrough from "./config/passthrough.js";
import registerPostsCollection from "./config/collections/posts.js";
import registerTagListCollection from "./config/collections/tagList.js";
import registerTagStatsCollection from "./config/collections/tagStats.js";
import registerSassPlugin from "./config/plugins/sass.js";
import registerImagePlugin from "./config/plugins/image.js";
import registerLayouts from "./config/layouts.js";
import configureNunjucks from "./config/templating.js";
import registerDateFilters from "./config/filters/dates.js";
import registerUrlFilters from "./config/filters/urls.js";
import registerSortingFilters from "./config/filters/sorting.js";
import registerShortcodes from "./config/shortcodes.js";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import { lqipSvgTransform } from "./config/htm-transform/lqipSvgTransform.js";

export default async function (eleventyConfig) {
  // Passthrough copy rules
  registerPassthrough(eleventyConfig);

  // Collections
  registerPostsCollection(eleventyConfig);
  registerTagListCollection(eleventyConfig);
  registerTagStatsCollection(eleventyConfig);

  // Layout aliases
  registerLayouts(eleventyConfig);

  // Plugins
  registerSassPlugin(eleventyConfig);
  registerImagePlugin(eleventyConfig);

  // Templating options
  configureNunjucks(eleventyConfig);

  // Filters
  registerDateFilters(eleventyConfig);
  registerUrlFilters(eleventyConfig);
  registerSortingFilters(eleventyConfig);

  //ShortCodes
  registerShortcodes(eleventyConfig);

  // Markdown library with heading anchors
  const md = markdownIt({
    html: true,
    linkify: true,
    typographer: true,
  }).use(markdownItAnchor, {
    // Auto-generate permalinks for headings
    permalink: markdownItAnchor.permalink.ariaHidden({
      placement: "before",
      class: "header-anchor",
      symbol: "🔗",
    }),
    // Keep default slugify or provide your own if needed
  });
  eleventyConfig.setLibrary("md", md);

  // náš transform MUSÍ přijít až po image transformu
  eleventyConfig.addTransform("lqip-svg", lqipSvgTransform);

  return {
    dir: {
      input: "src", // Input directory
      includes: "_includes", // Includes directory (relative to input)
      output: "_site", // Output directory
    },
    markdownTemplateEngine: "njk", // Use Nunjucks for markdown
    htmlTemplateEngine: "njk", // Use Nunjucks for HTML
    dataTemplateEngine: "njk",
  };
}
