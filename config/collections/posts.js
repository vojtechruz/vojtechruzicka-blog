import { shouldIncludeDraft } from '../draft-utils.js';

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
      .sort((a, b) => b.date - a.date),
  );
}
