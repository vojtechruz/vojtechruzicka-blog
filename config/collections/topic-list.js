// Alphabetically ordered list of unique topics across all posts (excluding drafts)
import { shouldIncludeDraft } from '../draft-utils.js';

export default function registerTopicListCollection(eleventyConfig) {
  eleventyConfig.addCollection('topicList', function (collectionApi) {
    const topicsSet = new Set();
    collectionApi.getAll().forEach((item) => {
      if (!shouldIncludeDraft(item.data.draftStatus)) {
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
