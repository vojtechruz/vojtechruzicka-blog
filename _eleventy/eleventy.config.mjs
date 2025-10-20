export default async function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({
      "./src/static/": "/" // Copy static files to the output directory
    })

  eleventyConfig.addLayoutAlias("post", "layouts/post.njk");


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
