// CodePen embed shortcode with optional visible caption
// Usage:
//   {% CodePenID "slug" %}
//   {% CodePenID "slug", "Optional title" %}
//   {% CodePenID "slug", 500 %}
//   {% CodePenID "slug", "Optional title", 500, "result+css" %}
//   {% CodePenID "slug", "Visible caption below", 500, "result+css", true %}
// Accepts only a CodePenID. Always uses the default user 'vojtechruz'.
import { escapeHtml, hash } from '../utils/formatting.js';
export default function codepen(
  id,
  title = 'CodePen example',
  height = 400,
  defaultTab = 'result',
  showCaption = true,
) {
  if (typeof height === 'string' && /^\d+$/.test(height)) {
    height = Number(height);
  }

  const embedUrl = `https://codepen.io/vojtechruz/embed/${id}`;
  const params = new URLSearchParams();

  if (defaultTab) {
    params.set('default-tab', String(defaultTab));
  }

  if (height) {
    params.set('height', String(height));
  }

  const src = `${embedUrl}?${params.toString()}`;

  // If a visible caption is requested, wrap in <figure> and link via aria-labelledby
  const captionId = `cp-caption-${hash(embedUrl + String(title))}`;
  const hasCaption = Boolean(showCaption && title);
  const aria = hasCaption ? ` aria-labelledby="${captionId}"` : ` title="${escapeHtml(title)}"`;

  return `
<figure class="codepen-embed-figure">
  <iframe
    class="codepen-embed"
    ${aria}
    height="${Number(height) || 400}"
    src="${src}"
    loading="lazy"
    allowfullscreen
    title="${escapeHtml(title)}"
  ></iframe>
  ${hasCaption ? `<figcaption id="${captionId}" class="codepen-caption">${escapeHtml(title)}</figcaption>` : ''}
</figure>
`;
}
