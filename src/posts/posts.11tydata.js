import path from 'path';

export default {
  layout: 'layouts/post.njk',
  draftStatus: undefined,
  eleventyComputed: {
    permalink: (data) => data.path || data.permalink,
    featuredImage: (data) => data.featuredImage || 'featured.jpg',
    postDir: (data) => path.dirname(data.page.inputPath),
  },
};
