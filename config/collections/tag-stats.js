// Collection of pairs - tag name and number of posts with that tag (excluding drafts)
import { shouldIncludeDraft } from "../draft-utils.js";

export default function registerTagStatsCollection(eleventyConfig) {
  eleventyConfig.addCollection("tagStats", (api) => {
    const counts = new Map();

    for (const item of api.getAll()) {
      if (!shouldIncludeDraft(item.data.draftStatus)) {
        continue;
      }

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
