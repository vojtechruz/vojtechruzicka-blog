export function registerLayouts(eleventyConfig) {
  eleventyConfig.addLayoutAlias('post', 'layouts/post.njk');
}

export function registerPassthrough(eleventyConfig) {
  eleventyConfig.addPassthroughCopy({
    './src/static/': '/', // Copy static files to the output directory
  });
  // copy attachment files from each post subdirectory to _site based on relative url in generated html files
  // Only files referenced via links are copied, not all files in the direcotry and only with whitelisted extensions
  eleventyConfig.addPassthroughCopy('./src/posts/**/*.{pdf,zip,doc,docx,xls,xlsx,ppt,pptx,css,xml}', {
    mode: 'html-relative',
  });
}

export function configureNunjucks(eleventyConfig) {
  eleventyConfig.setNunjucksEnvironmentOptions({
    trimBlocks: true, // removes the newline after {% ... %}
    lstripBlocks: true, // strips leading spaces before {% ... %}
  });
}
