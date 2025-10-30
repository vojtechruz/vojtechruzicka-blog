// YouTube embed shortcode (privacy-enhanced mode)
// Usage (Nunjucks/Liquid):
//   {% youtube "VIDEO_ID" %}
//   {% youtube "VIDEO_ID", "A descriptive title" %}
//   {% youtube "VIDEO_ID", 400 %}
//   {% youtube "VIDEO_ID", "A descriptive title", 400, 30 %}  {# start at 30s #}
// Accepts either a plain video ID or a full YouTube URL; will extract the ID.
export default function youtube(input, title = "YouTube video", height = 400, start = 0) {
  // Normalize flexible arguments for Nunjucks friendliness
  if (typeof title === "number") {
    start = Number(height) || 0;
    height = Number(title) || 400;
    title = "YouTube video";
  }
  if (typeof height === "string" && /^\d+$/.test(height)) height = Number(height);
  if (typeof start === "string" && /^\d+$/.test(start)) start = Number(start);

  const videoId = extractYouTubeId(input);
  const params = new URLSearchParams();
  if (start && Number(start) > 0) params.set("start", String(start));
  params.set("rel", "0");
  params.set("modestbranding", "1");
  const src = `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;

  return `
<iframe
  class="yt-embed"
  title="${escapeHtml(title)}"
  width="100%"
  height="${Number(height) || 400}"
  src="${src}"
  frameborder="0"
  loading="lazy"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  allowfullscreen
></iframe>`;
}

function extractYouTubeId(input) {
  if (!input) return "";
  // If plain ID (no slashes and length typical), return as-is
  if (!String(input).includes("/")) return String(input);
  try {
    const url = new URL(String(input));
    // Patterns: youtu.be/<id>, youtube.com/watch?v=<id>, /embed/<id>
    if (url.hostname === "youtu.be") {
      return url.pathname.replace(/^\//, "");
    }
    if (url.searchParams.has("v")) {
      return url.searchParams.get("v");
    }
    const m = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{6,})/);
    if (m) return m[1];
  } catch (e) {
    // fallthrough
  }
  // Fallback: try to pull last path segment
  const parts = String(input).split("/");
  return parts[parts.length - 1];
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
