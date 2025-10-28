import registerPassthrough from "./config/passthrough.js";
import registerPostsCollection from "./config/collections/posts.js";
import registerTagListCollection from "./config/collections/tagList.js";
import registerSassPlugin from "./config/plugins/sass.js";
import registerLayouts from "./config/layouts.js";
import configureNunjucks from "./config/templating/nunjucks.js";
import registerDateFilters from "./config/filters/dates.js";
import registerUrlFilters from "./config/filters/urls.js";
import registerSortingFilters from "./config/filters/sorting.js";

export default async function (eleventyConfig) {
  // Passthrough copy rules
  registerPassthrough(eleventyConfig);

  // Collections
  registerPostsCollection(eleventyConfig);
  registerTagListCollection(eleventyConfig);

  // Layout aliases
  registerLayouts(eleventyConfig);

  // Plugins
  registerSassPlugin(eleventyConfig);

  // Templating options
  configureNunjucks(eleventyConfig);

  // Filters
  registerDateFilters(eleventyConfig);
  registerUrlFilters(eleventyConfig);
  registerSortingFilters(eleventyConfig);

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
