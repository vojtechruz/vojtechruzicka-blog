export default async function (eleventyConfig) {

  return {
    dir: {
      input: "src",           // Input directory
      includes: "_includes",  // Includes directory (relative to input)
      output: "_site"         // Output directory
    },
    markdownTemplateEngine: "njk",  // Use Nunjucks for markdown
    htmlTemplateEngine: "njk"       // Use Nunjucks for HTML
  };
}
