export default {
  layout: "layouts/post.njk",
  eleventyComputed: {
    // If Markdown still uses `path` (from Gatsby), treat it as Eleventy's permalink
    permalink: data => data.path || data.permalink,
  }
};