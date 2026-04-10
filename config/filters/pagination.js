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

  let start = Math.max(2, currentPage - windowSize);
  let end = Math.min(totalPages - 1, currentPage + windowSize);

  // Add ellipsis if there's a gap after the first page
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

  // Add ellipsis if there's a gap before the last page
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
