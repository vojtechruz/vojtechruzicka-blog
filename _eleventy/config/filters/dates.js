export default function registerDateFilters(eleventyConfig) {
  // Add readable date filter
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    if (!dateObj) return "";

    const date = dateObj instanceof Date ? dateObj : new Date(dateObj);

    if (isNaN(date.getTime())) {
      return String(dateObj);
    }

    // Use UTC methods to avoid timezone shifts
    const day = date.getUTCDate();
    const month = date.toLocaleDateString("en-US", {
      month: "long",
      timeZone: "UTC",
    });
    const year = date.getUTCFullYear();

    return `${month} ${day}, ${year}`;
  });

  // RFC 1123 / RFC 822-ish (HTTP date) in UTC, e.g. "Wed, 24 Apr 2024 22:12:03 GMT"
  eleventyConfig.addFilter("utcRfc822", (value) => {
    const d = value instanceof Date ? value : new Date(value);
    return d.toUTCString();
  });

  // RFC 3339 in UTC (Atom), e.g. "2024-04-24T22:12:03Z"
  eleventyConfig.addFilter("toRfc3339", (value) => {
    const d = value instanceof Date ? value : new Date(value);
    return d.toISOString().replace(/\.\d{3}Z$/, "Z");
  });

  // Add HTML date string filter (for <time datetime>)
  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    if (!dateObj) return "";

    const date = dateObj instanceof Date ? dateObj : new Date(dateObj);
    if (isNaN(date.getTime())) {
      return "";
    }

    // ISO 8601: YYYY-MM-DD
    return date.toISOString().split("T")[0];
  });
}
