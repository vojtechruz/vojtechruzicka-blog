// CodePen embed shortcode with optional visible caption
// Usage:
//   {% codepen "https://codepen.io/user/pen/slug" %}
//   {% codepen "user/pen/slug", "Optional title" %}
//   {% codepen "user/pen/slug", 500 %}
//   {% codepen "user/pen/slug", "Optional title", 500, "result+css" %}
//   {% codepen "user/pen/slug", "Visible caption below", 500, "result+css", true %}
// Accepts a full URL or a partial path (user/pen/slug or user/embed/slug). Ensures embed URL.
export default function codepen(
  input,
  title = "CodePen embed",
  height = 400,
  defaultTab = "result",
  showCaption = true
) {
  // Normalize flexible arguments for Nunjucks friendliness
  if (typeof title === "number" || (typeof title === "string" && /^\d+$/.test(title))) {
    showCaption = false;
    defaultTab = String(height ?? "result");
    height = Number(title) || 400;
    title = "CodePen embed";
  }
  if (typeof height === "string" && /^\d+$/.test(height)) height = Number(height);

  const embedUrl = toEmbedUrl(String(input));
  const params = new URLSearchParams();
  if (defaultTab) params.set("default-tab", String(defaultTab));
  if (height) params.set("height", String(height));

  const src = `${embedUrl}?${params.toString()}`;

  // If a visible caption is requested, wrap in <figure> and link via aria-labelledby
  const captionId = `cp-caption-${hash(embedUrl + String(title))}`;
  const hasCaption = Boolean(showCaption && title);
  const aria = hasCaption
    ? ` aria-labelledby="${captionId}"`
    : ` title="${escapeHtml(title)}"`;

  return `
<figure class="codepen-embed-figure">
  <iframe
    class="codepen-embed"
    ${aria}
    height="${Number(height) || 400}"
    style="width: 100%"
    scrolling="no"
    src="${src}"
    frameborder="no"
    loading="lazy"
    allowtransparency="true"
    allowfullscreen
  ></iframe>
  ${hasCaption ? `<figcaption id="${captionId}" class="codepen-caption">${escapeHtml(title)}</figcaption>` : ""}
</figure>`;
}

function toEmbedUrl(input) {
  try {
    const u = new URL(input);
    // Normalize to /embed/ path and strip preview variant
    u.pathname = u.pathname
      .replace(/\/details\//, "/pen/")
      .replace(/\/embed\/preview\//, "/embed/")
      .replace(/\/(pen|details)\//, "/embed/")
      .replace(/\/embed\//, "/embed/");
    return u.toString().replace(/#.*$/, "");
  } catch (e) {
    // Not a full URL: accept patterns like user/pen/slug or user/embed/slug
    const path = String(input).replace(/^\/+|\/+$/g, "");
    const parts = path.split("/");
    if (parts.length >= 3) {
      return `https://codepen.io/${parts[0]}/embed/${parts[2]}`;
    }
    return `https://codepen.io/${path}/embed`;
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}
