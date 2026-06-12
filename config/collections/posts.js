import { isPublicPostForDiscovery } from '../post-discovery.js';
import seriesMetadata from '../../src/_data/seriesMetadata.js';

const postToSeriesOrder = new Map();
seriesMetadata.forEach((series) => {
  series.posts.forEach((url, index) => {
    postToSeriesOrder.set(url, index + 1);
  });
});

function isReviewFile(post) {
  return post.inputPath.endsWith('review.md') || post.inputPath.endsWith('master-review.md');
}

export default function registerPostsCollection(eleventyConfig) {
  eleventyConfig.addCollection('posts', (api) =>
    api
      .getFilteredByGlob(['src/posts/**/*.md'])
      .filter((post) => {
        // Exclude review files TODO temporary
        if (isReviewFile(post)) {
          return false;
        }
        return isPublicPostForDiscovery(post);
      })
      .sort((a, b) => {
        const dateDiff = b.date - a.date;
        if (dateDiff !== 0) {
          return dateDiff;
        }

        // If the date is same, order by series position
        const aOrder = postToSeriesOrder.get(a.data.path) || 0;
        const bOrder = postToSeriesOrder.get(b.data.path) || 0;
        return bOrder - aOrder;
      }),
  );

  eleventyConfig.addCollection('archivedPosts', (api) =>
    api
      .getFilteredByGlob(['src/posts/**/*.md'])
      .filter((post) => !isReviewFile(post) && post.data?.archivedStatus)
      .sort((a, b) => {
        const aDate = new Date(a.data?.archivedDate || a.date || 0);
        const bDate = new Date(b.data?.archivedDate || b.date || 0);
        return bDate - aDate;
      }),
  );
}
