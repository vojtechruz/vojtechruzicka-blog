import { readableDateUTC, htmlDateString as htmlDate, toDateUtcMidnightIfDateOnly } from '../utils/formatting.js';

export default function registerDateFilters(eleventyConfig) {
  eleventyConfig.addFilter('readableDate', (value) => readableDateUTC(value));

  eleventyConfig.addFilter('readableMonthYear', (value) => {
    if (!value) {
      return '';
    }
    const date = toDateUtcMidnightIfDateOnly(value) || new Date(value);
    if (isNaN(date.getTime())) {
      return String(value);
    }
    const month = date.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
    return `${month} ${date.getUTCFullYear()}`;
  });

  // RFC 1123 / RFC 822-ish (HTTP date) in UTC, e.g. "Wed, 24 Apr 2024 22:12:03 GMT"
  eleventyConfig.addFilter('utcRfc822', (value) => {
    const d = (value instanceof Date ? value : toDateUtcMidnightIfDateOnly(value)) || new Date(value);
    return d.toUTCString();
  });

  // RFC 3339 in UTC (Atom), e.g. "2024-04-24T22:12:03Z"
  eleventyConfig.addFilter('toRfc3339', (value) => {
    const d = (value instanceof Date ? value : toDateUtcMidnightIfDateOnly(value)) || new Date(value);
    return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
  });

  // Add HTML date string filter (for <time datetime>) using shared utility
  eleventyConfig.addFilter('htmlDateString', (value) => htmlDate(value));
}
