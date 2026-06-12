// Collection of pairs - topic name and number of public discovery posts with that topic
import { isPublicPostForDiscovery } from '../post-discovery.js';

export default function registerTopicStatsCollection(eleventyConfig) {
  eleventyConfig.addCollection('topicStats', (api) => {
    const counts = new Map();

    for (const item of api.getAll()) {
      if (!isPublicPostForDiscovery(item)) {
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
