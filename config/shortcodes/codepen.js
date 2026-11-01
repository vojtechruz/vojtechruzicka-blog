// CodePen embed shortcode with optional visible caption
// Usage:
//   {% codepen "slug" %}
//   {% codepen "slug", "Optional title" %}
//   {% codepen "slug", 500 %}
//   {% codepen "slug", "Optional title", 500, "result+css" %}
//   {% codepen "slug", "Visible caption below", 500, "result+css", true %}
// Accepts only a CodePenID. Always uses the default user 'vojtechruz'.
//
// Click-to-load facade: the page shows a screenshot of the pen's result (codepen-<id>.png next to the
// article, taken by scripts/codepen-screenshots.mjs) under a title bar with "Run demo"; src/scripts/codepen.js
// swaps in the real iframe on click. Until then nothing loads from codepen.io - no editor JavaScript,
// no third-party cookies. Without JS the button stays hidden and a link opens the pen on CodePen.
// Details in docs/CODEPEN.md.
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { escapeHtml, hash } from '../utils/formatting.js';

// The embed's width in the article column on desktop; posters are taken at this width (at 2x)
export const POSTER_WIDTH = 615;
const DEFAULT_HEIGHT = 400;

export const posterFilename = (id) => `codepen-${id}.png`;

/** Every {% codepen %} call in a markdown source, with its title and the height the shortcode will use. */
export function codepenCalls(markdown) {
  return [...markdown.matchAll(/\{%-?\s*codepen\s+(.+?)\s*-?%\}/g)].map(([, args]) => {
    const values = [...args.matchAll(/"([^"]*)"|'([^']*)'|(\d+)/g)];
    const id = values[0]?.[1] ?? values[0]?.[2];
    // The title is the second argument, when it is a string (a number there is the height)
    const second = values[1];
    const title = second && second[3] === undefined ? (second[1] ?? second[2]) : undefined;
    const height = values.slice(1).find((value) => value[3] !== undefined)?.[3];
    return { id, title, height: Number(height) || DEFAULT_HEIGHT };
  });
}

const PLAY_ICON =
  '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2.5v11l9.5-5.5z"/></svg>';
// Two diagonal arrows pointing out, the usual "expand" glyph
const ENLARGE_ICON =
  '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2.5h4v4M13.5 2.5 9 7M6.5 13.5h-4v-4M2.5 13.5 7 9"/></svg>';

export default function codepen(
  id,
  title = 'CodePen example',
  height = DEFAULT_HEIGHT,
  defaultTab = 'result',
  showCaption = true,
) {
  if (typeof height === 'string' && /^\d+$/.test(height)) {
    height = Number(height);
  }
  height = Number(height) || DEFAULT_HEIGHT;

  const embedUrl = `https://codepen.io/vojtechruz/embed/${id}`;
  const params = new URLSearchParams();

  if (defaultTab) {
    params.set('default-tab', String(defaultTab));
  }

  params.set('height', String(height));

  const src = `${embedUrl}?${params.toString()}`;

  // If a visible caption is requested, wrap in <figure> and link via aria-labelledby
  const captionId = `cp-caption-${hash(embedUrl + String(title))}`;
  const hasCaption = Boolean(showCaption && title);

  // A printed iframe is an empty box - print styles add this URL (_print.scss); the poster prints too
  const penUrl = `https://codepen.io/vojtechruz/pen/${id}`;

  // The poster is optional: a pen added without running the screenshot script still gets a working
  // facade, just an empty one. Shortcodes called outside Eleventy (unit tests) have no page.
  const inputPath = this?.page?.inputPath;
  const hasPoster = Boolean(inputPath && existsSync(join(dirname(inputPath), posterFilename(id))));
  const poster = hasPoster ? `<img class="codepen-poster" src="./${posterFilename(id)}" alt="">` : '';

  const label = `<span class="visually-hidden">: ${escapeHtml(title)}</span>`;

  // A title bar like a code block's: the caption, then the controls, then the poster under them, so the
  // controls never cover the demo. Both buttons start hidden: src/scripts/codepen.js shows "Run demo"
  // (and drops the no-JS link), src/scripts/lightbox.js shows "Enlarge" where the dialog would show
  // the poster noticeably larger.
  // No blank lines: one would end markdown-it's HTML block and turn the indented rest into a code block
  const lines = [
    `<figure class="codepen-embed-figure" data-print-label="CodePen" data-print-url="${escapeHtml(penUrl)}">`,
    hasCaption && `  <figcaption id="${captionId}" class="codepen-caption">${escapeHtml(title)}</figcaption>`,
    '  <div class="codepen-actions">',
    poster &&
      `    <button type="button" class="codepen-enlarge" aria-haspopup="dialog" aria-label="Enlarge screenshot: ${escapeHtml(title)}" title="Enlarge screenshot" hidden>${ENLARGE_ICON}</button>`,
    `    <button type="button" class="codepen-run" hidden>${PLAY_ICON}Run demo${label}</button>`,
    `    <a class="codepen-open" href="${escapeHtml(penUrl)}">Open on CodePen${label}</a>`,
    '  </div>',
    `  <div class="codepen-facade" style="height: ${height}px" data-codepen-src="${escapeHtml(src)}"` +
      ` data-codepen-title="${escapeHtml(title)}" data-codepen-height="${height}"` +
      (hasCaption ? ` data-codepen-labelledby="${captionId}"` : '') +
      '>',
    poster && `    ${poster}`,
    '  </div>',
    '</figure>',
  ];
  return `\n${lines.filter(Boolean).join('\n')}\n`;
}
