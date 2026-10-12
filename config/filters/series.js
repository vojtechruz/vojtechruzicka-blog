/**
 * Where a post sits in its series: `{ series, position, total }` or null.
 *
 * Parts are the series' `posts` (seriesMetadata order) that are in `posts` (collections.posts), so an
 * unpublished part is skipped and the numbering matches the series TOC and previous/next navigation.
 *
 * @param {string}   seriesSlug     - The post's `series` front matter.
 * @param {string}   url            - The post's URL.
 * @param {object[]} seriesMetadata - Global `seriesMetadata` data.
 * @param {object[]} posts          - The `collections.posts` array.
 */
export function getSeriesPart(seriesSlug, url, seriesMetadata, posts) {
  const series = (seriesMetadata || []).find((s) => s.slug === seriesSlug);
  if (!series) {
    return null;
  }
  const published = new Set((posts || []).map((p) => p.url));
  const parts = series.posts.filter((partUrl) => published.has(partUrl));
  const index = parts.indexOf(url);
  return index < 0 ? null : { series, position: index + 1, total: parts.length };
}

export default function registerSeriesFilters(eleventyConfig) {
  // `{% set part = series | seriesPart(page.url, seriesMetadata, collections.posts) %}`
  eleventyConfig.addFilter('seriesPart', (seriesSlug, url, seriesMetadata, posts) =>
    getSeriesPart(seriesSlug, url, seriesMetadata, posts),
  );
}
