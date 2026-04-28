import { slugify } from '../utils/formatting.js';

const MINOR_THRESHOLD = 3;

export default function registerTopicsFilters(eleventyConfig) {
  /**
   * Enriches topicCategories with counts from topicStats.
   * Each category gets two arrays:
   *   - topics: count >= MINOR_THRESHOLD, ordered by count desc
   *   - minor:  count <  MINOR_THRESHOLD, ordered by count desc then name
   * Also returns a flat `minor` array collecting all minor topics across categories.
   */
  eleventyConfig.addFilter('categoriesWithStats', (categories, topicStats) => {
    const countMap = new Map((topicStats || []).map((s) => [s.name, s.count]));

    const allMinor = [];

    const enriched = (categories || []).map((cat) => {
      const withCounts = cat.topics
        .map((name) => ({ name, count: countMap.get(name) ?? 0, slug: slugify(name) }))
        .filter((t) => t.count > 0)
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

      const main = withCounts.filter((t) => t.count >= MINOR_THRESHOLD);
      const minor = withCounts.filter((t) => t.count < MINOR_THRESHOLD);

      allMinor.push(...minor);

      return { name: cat.name, topics: main };
    }).filter((cat) => cat.topics.length > 0);

    return { categories: enriched, minor: allMinor };
  });
}
