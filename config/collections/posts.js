import { shouldIncludeDraft } from '../draft-utils.js';

export default function registerPostsCollection(eleventyConfig) {
  eleventyConfig.addCollection('posts', (api) =>
    api
      .getFilteredByGlob('src/posts/**/*.md')
      .filter((post) => shouldIncludeDraft(post.data.draftStatus))
      .sort((a, b) => b.date - a.date),
  );
}
