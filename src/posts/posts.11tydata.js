import path from 'path';
import Image from '@11ty/eleventy-img';

export default {
  layout: 'layouts/post.njk',
  draftStatus: undefined,
  eleventyComputed: {
    permalink: (data) => data.path || data.permalink,
    featuredImage: (data) => data.featuredImage || 'featured.jpg',
    postDir: (data) => path.dirname(data.page.inputPath),

    // Generates a dedicated social-share image (og-image.jpg) at a stable, predictable URL.
    // The eleventy-img transform plugin renames in-page images to content-hashed filenames
    // (e.g. featured-a1b2c3-1200.jpg), so the raw featured.jpg URL referenced by shareImageUrl
    // never exists in the output. Social crawlers (Facebook, LinkedIn, Twitter/X) need a plain
    // JPEG at a known path — this produces _site/{postUrl}/og-image.jpg at build time.
    // eleventy-img caches by source hash, so incremental rebuilds skip unchanged images.
    // Returns undefined on failure (missing image, draft with no asset) so imageUrl can fall
    // back to the generic shareImageUrl logic.
    ogImageUrl: async (data) => {
      if (!data.page?.inputPath) {
        return undefined;
      }

      // Use raw data.featuredImage to avoid depending on the computed featuredImage property
      // in the same eleventyComputed object (resolution order is not guaranteed).
      const imageFile = (data.featuredImage || 'featured.jpg').replace(/^\.\//, '');
      const src = path.resolve(path.dirname(data.page.inputPath), imageFile);
      // data.path is the Gatsby-style permalink from front matter; preferred over data.page.url
      // because page.url may not yet be resolved when this computed property runs.
      const postUrl = data.path || data.page?.url || '/';

      try {
        const metadata = await Image(src, {
          formats: ['jpeg'],
          widths: [1200],
          outputDir: path.resolve('_site' + postUrl),
          urlPath: postUrl,
          filenameFormat: () => 'og-image.jpg',
        });
        return metadata.jpeg[0].url;
      } catch {
        return undefined;
      }
    },
  },
};
