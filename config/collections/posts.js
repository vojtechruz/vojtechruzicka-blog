import { shouldIncludeDraft } from '../draft-utils.js';
import seriesMetadata from '../../src/_data/seriesMetadata.js';

const postToSeriesOrder = new Map();
seriesMetadata.forEach((series) => {
  series.posts.forEach((url, index) => {
    postToSeriesOrder.set(url, index + 1);
  });
});

export default function registerPostsCollection(eleventyConfig) {
  eleventyConfig.addCollection('posts', (api) =>
    api
      .getFilteredByGlob(['src/posts/**/*.md'])
      .filter((post) => {
        // Exclude review files TODO temporary
        if (post.inputPath.endsWith('review.md') || post.inputPath.endsWith('master-review.md')) {
          return false;
        }
        return shouldIncludeDraft(post.data.draftStatus);
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
}
