export function registerLayouts(eleventyConfig) {
  eleventyConfig.addLayoutAlias("post", "layouts/post.njk");
}

export function registerPassthrough(eleventyConfig) {
  eleventyConfig.addPassthroughCopy({
    "./src/static/": "/", // Copy static files to the output directory
    "./src/scripts/": "/scripts/"
  });
}

export function configureNunjucks(eleventyConfig) {
  eleventyConfig.setNunjucksEnvironmentOptions({
    trimBlocks: true, // removes the newline after {% ... %}
    lstripBlocks: true, // strips leading spaces before {% ... %}
  });
}
