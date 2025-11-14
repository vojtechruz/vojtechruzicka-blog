import { registerPassthrough, registerLayouts, configureNunjucks} from "./config/basic-config.js";
import registerPostsCollection from "./config/collections/posts.js";
import registerTagListCollection from "./config/collections/tagList.js";
import registerTagStatsCollection from "./config/collections/tagStats.js";
import registerSassPlugin from "./config/plugins/sass.js";
import registerImagePlugin from "./config/plugins/image.js";
import registerDateFilters from "./config/filters/dates.js";
import registerUrlFilters from "./config/filters/urls.js";
import registerSortingFilters from "./config/filters/sorting.js";
import registerTextFilters from "./config/filters/text.js";
import registerShortcodes from "./config/shortcodes.js";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import pluginTOC from "eleventy-plugin-nesting-toc";
import { lqipSvgTransform } from "./config/htm-transform/lqip-svg-transform.js";
import { wrapPicturesTransform } from "./config/htm-transform/wrap-pictures-transform.js";
import shikiMarkdownPlugin from "@shikijs/markdown-it";
import { transformerMetaHighlight, transformerNotationDiff } from "@shikijs/transformers";

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
  eleventyConfig.addPlugin(pluginTOC, {
    tags: ["h2", "h3", "h4"],
  });

  // Templating options
  configureNunjucks(eleventyConfig);

  // Filters
  registerDateFilters(eleventyConfig);
  registerUrlFilters(eleventyConfig);
  registerSortingFilters(eleventyConfig);
  registerTextFilters(eleventyConfig);

  //ShortCodes
  registerShortcodes(eleventyConfig);

  const dataLanguageTransformer = {
    name: "data-language",
    pre() {
      // this.options.lang is the detected fence language (e.g., 'js', 'java')
      this.pre.properties ??= {};
      this.pre.properties["data-language"] = this.options.lang || "text";
    }
  };

  const shikiPlugin = await shikiMarkdownPlugin({
    themes: {
      light: "github-dark-dimmed",
      dark: "github-dark-dimmed"
    },
    cssVariablePrefix: "--shiki-",
    inlineStyle: false,
    defaultBackground: false,
    defaultColor: false,
    transformers: [dataLanguageTransformer, transformerMetaHighlight(), transformerNotationDiff()]
  });

  // Markdown library with heading anchors
  const md = markdownIt({
    html: true
  }).use(markdownItAnchor, {
    // Auto-generate permalinks for headings
    permalink: markdownItAnchor.permalink.ariaHidden({
      placement: "before",
      class: "header-anchor",
      symbol: "",
    }),
    // Keep default slugify or provide your own if needed
  }).use(shikiPlugin);
  eleventyConfig.setLibrary("md", md);

  eleventyConfig.addTransform("lqip-svg", lqipSvgTransform);

  // Wrap <picture> in a div.image-wrapper (run after LQIP transform)
  eleventyConfig.addTransform("wrap-pictures", wrapPicturesTransform);

  // Rebuild when these files change in --serve mode
  eleventyConfig.addWatchTarget("./config/htm-transform/lqipSvgTransform.js");
  eleventyConfig.addWatchTarget("./config/htm-transform/wrapPicturesTransform.js");

  // CORS for giscus iframe for local development
  eleventyConfig.setServerOptions({
    headers: {
      "Access-Control-Allow-Origin": "https://giscus.app",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cross-Origin-Resource-Policy": "cross-origin"
    },
    showAllHosts: true
  });

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
