export default function registerTagListCollection(eleventyConfig) {
  eleventyConfig.addCollection("tagList", function (collectionApi) {
    const tagsSet = new Set();
    collectionApi.getAll().forEach((item) => {
      if ("tags" in item.data) {
        let tags = item.data.tags;
        if (Array.isArray(tags)) {
          tags.forEach((tag) => tagsSet.add(tag));
        }
      }
    });
    return [...tagsSet].sort();
  });
}
