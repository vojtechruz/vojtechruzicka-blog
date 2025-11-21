// Shared formatting utilities for filters and shortcodes

export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

// Matches existing filters/dates.js behavior (UTC, fallback to String(value) when invalid)
/**
 * Coerce various inputs into a Date. If the input is a date-only string
 * like "YYYY-MM-DD", interpret it as midnight UTC of that day so that
 * downstream ISO/RFC formatters include a time component at 00:00:00Z.
 */
export function toDateUtcMidnightIfDateOnly(value) {
  if (!value) return null;
  if (value instanceof Date) {
    // If it's exactly local midnight (common when frontmatter had only YYYY-MM-DD),
    // convert to UTC midnight of the same calendar date to avoid TZ shifting to previous/next day.
    if (
      value.getHours() === 0 &&
      value.getMinutes() === 0 &&
      value.getSeconds() === 0 &&
      value.getMilliseconds() === 0
    ) {
      const y = value.getFullYear();
      const m = value.getMonth(); // 0-11
      const d = value.getDate();
      return new Date(Date.UTC(y, m, d, 0, 0, 0));
    }
    return value;
  }
  const str = String(value).trim();
  // Detect plain date without time (YYYY-MM-DD)
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(str);
  if (isDateOnly) {
    // Explicitly construct as UTC midnight to avoid TZ shifts
    const [y, m, d] = str.split("-").map((n) => parseInt(n, 10));
    // Date.UTC uses month 0-11
    return new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

export function readableDateUTC(value) {
  if (!value) return "";
  const date = toDateUtcMidnightIfDateOnly(value) || new Date(value);
  if (isNaN(date.getTime())) {
    return String(value);
  }
  const day = date.getUTCDate();
  const month = date.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" });
  const year = date.getUTCFullYear();
  return `${month} ${day}, ${year}`;
}

export function htmlDateString(value) {
  if (!value) return "";
  const date = toDateUtcMidnightIfDateOnly(value) || new Date(value);
  if (isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString().split("T")[0];
}

export function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Deterministic non-cryptographic string hash (for DOM ids, etc.)
export function hash(str) {
  let h = 0;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0; // force 32-bit int
  }
  return Math.abs(h);
}
