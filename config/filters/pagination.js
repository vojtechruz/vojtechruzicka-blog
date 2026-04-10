/**
 * Generates an array of pagination link objects for a truncated pagination UI.
 *
 * The output includes:
 *  - The first page link
 *  - An ellipsis if there's a gap after the first page
 *  - A "window" of page links around the current page
 *  - An ellipsis if there's a gap before the last page
 *  - The last page link
 *
 * @param {object} pagination - The Eleventy pagination object from the template.
 * @param {number} windowSize - Number of pages to show before and after the current page.
 * @returns {Array<object>} Array of page objects: {number, url, current} or {ellipsis: true}.
 */
export function generatePaginationLinks(pagination, windowSize = 2) {
  const totalPages = pagination.hrefs.length;
  const currentPage = pagination.pageNumber + 1;
  const pages = [];

  // Always show first page
  pages.push({
    number: 1,
    url: pagination.hrefs[0],
    current: currentPage === 1
  });

  // Calculate the start and end of the middle "window" around the current page.
  // We start at 2 to avoid duplicating the first page (index 0).
  // We end at totalPages - 1 to avoid duplicating the last page (index totalPages - 1).
  const start = Math.max(2, currentPage - windowSize);
  const end = Math.min(totalPages - 1, currentPage + windowSize);

  // Add ellipsis if there's a gap after the first page (i.e., we skip page 2).
  if (start > 2) {
    pages.push({ ellipsis: true });
  }

  // Add middle pages
  for (let i = start; i <= end; i++) {
    pages.push({
      number: i,
      url: pagination.hrefs[i - 1],
      current: currentPage === i
    });
  }

  // Add ellipsis if there's a gap before the last page (i.e., we skip the page before the last).
  if (end < totalPages - 1) {
    pages.push({ ellipsis: true });
  }

  // Always show last page (if more than 1 page)
  if (totalPages > 1) {
    pages.push({
      number: totalPages,
      url: pagination.hrefs[totalPages - 1],
      current: currentPage === totalPages
    });
  }

  return pages;
}

export default function registerPaginationFilters(eleventyConfig) {
  eleventyConfig.addFilter("generatePaginationLinks", (pagination, windowSize = 2) => {
    return generatePaginationLinks(pagination, windowSize);
  });
}
