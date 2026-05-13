// Alphabetically ordered list of unique topics across all public discovery posts
import { isPublicPostForDiscovery } from '../post-discovery.js';

export default function registerTopicListCollection(eleventyConfig) {
  eleventyConfig.addCollection('topicList', function (collectionApi) {
    const topicsSet = new Set();
    collectionApi.getAll().forEach((item) => {
      if (!isPublicPostForDiscovery(item)) {
        return;
      }

      if ('topics' in item.data) {
        const topics = item.data.topics;
        if (Array.isArray(topics)) {
          topics.forEach((topic) => topicsSet.add(topic));
        }
      }
    });
    return [...topicsSet].sort();
  });
}
