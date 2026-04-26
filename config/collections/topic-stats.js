// Collection of pairs - topic name and number of posts with that topic (excluding drafts)
import { shouldIncludeDraft } from '../draft-utils.js';

export default function registerTopicStatsCollection(eleventyConfig) {
  eleventyConfig.addCollection('topicStats', (api) => {
    const counts = new Map();

    for (const item of api.getAll()) {
      if (!shouldIncludeDraft(item.data.draftStatus)) {
        continue;
      }

      const topics = item?.data?.topics;
      if (Array.isArray(topics)) {
        for (const topic of topics) {
          counts.set(topic, (counts.get(topic) || 0) + 1);
        }
      }
    }

    return Array.from(counts, ([name, count]) => ({ name, count }));
  });
}
