export default function registerPassthrough(eleventyConfig) {
  eleventyConfig.addPassthroughCopy({
    "./src/static/": "/" // Copy static files to the output directory
  });
}
