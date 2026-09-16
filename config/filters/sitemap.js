import { getSitemapLastmod } from '../utils/sitemap.js';

export default function registerSitemapFilters(eleventyConfig) {
  // `{{ page | sitemapLastmod(collections.posts) }}` → Date or null (chain with `toRfc3339`).
  // Lives in the sitemap template rather than in eleventyComputed on purpose: computed data that
  // touches `collections` makes every page collection-dependent and forces full rebuilds in
  // --serve mode (see src/_data/historicalVersionsMap.js), while the sitemap already depends on
  // collections.all and rebuilds whenever anything changes anyway.
  eleventyConfig.addFilter('sitemapLastmod', (page, posts) => getSitemapLastmod(page, posts || []));
}
