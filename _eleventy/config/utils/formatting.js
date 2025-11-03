// Shared formatting utilities for filters and shortcodes

export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

// Matches existing filters/dates.js behavior (UTC, fallback to String(value) when invalid)
export function readableDateUTC(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
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
  const date = value instanceof Date ? value : new Date(value);
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
