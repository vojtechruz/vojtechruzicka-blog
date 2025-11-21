export default function registerPostsCollection(eleventyConfig) {
  eleventyConfig.addCollection("posts", (api) =>
    api
      .getFilteredByGlob("src/posts/**/*.md")
      .filter((post) => !post.data.isDraft)
      .sort((a, b) => b.date - a.date)
  );
}
