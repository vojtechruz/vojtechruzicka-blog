// Collection of pairs - tag name and number of posts with a that tag
export default function registerTagStatsCollection(eleventyConfig) {
  eleventyConfig.addCollection("tagStats", (api) => {
    const counts = new Map();

    for (const item of api.getAll()) {
      const tags = item?.data?.tags;
      if (Array.isArray(tags)) {
        for (const tag of tags) {
          counts.set(tag, (counts.get(tag) || 0) + 1);
        }
      }
    }

    return Array.from(counts, ([name, count]) => ({ name, count }));
  });
}
