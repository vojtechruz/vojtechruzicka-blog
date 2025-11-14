import path from "path";

export default {
  layout: "layouts/post.njk",
  eleventyComputed: {
    // If Markdown still uses `path` (from Gatsby), treat it as Eleventy's permalink
    permalink: data => data.path || data.permalink,
    // Default to `featured.jpg`, in most cases there should not be need to override this, mostly fallback for Gatbsy frontmatter
    featuredImage: data => data.featuredImage || "featured.jpg",
    postDir: (data) => path.dirname(data.page.inputPath),
  }
};