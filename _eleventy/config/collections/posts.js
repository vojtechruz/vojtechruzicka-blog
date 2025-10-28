export default function registerPostsCollection(eleventyConfig) {
  eleventyConfig.addCollection("posts", (api) =>
    api
      .getFilteredByGlob("src/posts/**/*.md")
      .filter((it) => !it.data.isDraft)
      .sort((a, b) => b.date - a.date)
  );
}
