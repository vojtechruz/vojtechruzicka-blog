import path from "path";

export default {
  layout: "layouts/post.njk",
  eleventyComputed: {
    // If Markdown still uses `path` (from Gatsby), treat it as Eleventy's permalink
    permalink: data => data.path || data.permalink,
    featuredImage: data => data.featuredImage || "featured.jpg",
    postDir: (data) => path.dirname(data.page.inputPath),
  }
};