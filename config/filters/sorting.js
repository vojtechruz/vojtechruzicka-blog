export default function registerSortingFilters(eleventyConfig) {
  // Sort tags by count desc, then name asc (for tie-breakers)
  eleventyConfig.addFilter("sortByCountThenName", (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.slice().sort((a, b) => {
      const countDiff = (Number(b.count) || 0) - (Number(a.count) || 0);
      if (countDiff !== 0) return countDiff;
      const aName = (a.name ?? "").toString();
      const bName = (b.name ?? "").toString();
      return aName.localeCompare(bName, undefined, { sensitivity: "base" });
    });
  });
}
