// Local responsive video shortcode with optional WebM/MP4 sources and caption
// Usage examples (Nunjucks):
//   {% video "/videos/my-talk" %}                            {# expects /videos/my-talk.webm and /videos/my-talk.mp4 #}
//   {% video "/videos/my-talk.mp4" %}                        {# will also try /videos/my-talk.webm #}
//   {% video "/videos/my-talk", "My conference talk" %}
//   {% video "/videos/my-talk", "My conference talk", "/images/my-talk-poster.jpg" %}
//   {% video "/videos/my-talk", "My conference talk", "/images/my-talk-poster.jpg", "16:9", true %}
//
// Notes:
// - Put your files under _eleventy/src/static so they are copied to the site root.
//   Example path in repo: _eleventy/src/static/videos/my-talk.mp4 → site URL: /videos/my-talk.mp4
import { escapeHtml, hash } from '../utils/formatting.js';
import ffprobe from 'ffprobe-static';
import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';

export default async function video(input, title = 'Video', poster = '', showCaption = false) {
  const srcs = buildSources(String(input));

  // Detect dimensions
  let width = null;
  let height = null;

  // Try to find a local file to read metadata from
  for (const s of srcs) {
    const normalizedSrc = s.src.startsWith('/') ? s.src.slice(1) : s.src;
    const localPath = path.join(process.cwd(), 'src/static', normalizedSrc);
    if (fs.existsSync(localPath)) {
      const dims = getVideoDimensions(localPath);
      if (dims) {
        width = dims.width;
        height = dims.height;
        break;
      }
    }
  }

  const hasCaption = Boolean(showCaption && title);
  const captionId = `vid-caption-${hash(srcs.map((s) => s.src).join('|') + String(title))}`;
  const aria = hasCaption ? ` aria-labelledby="${captionId}"` : ` title="${escapeHtml(title)}"`;

  const posterAttr = poster ? ` poster="${escapeHtml(poster)}"` : '';
  const sizeAttrs = width && height ? ` width="${width}" height="${height}"` : '';
  const videoTitleAttr = title ? ` data-video-title="${escapeHtml(title)}"` : '';

  const sourcesHtml = srcs
    .map((s) => `    <source src="${escapeHtml(s.src)}"${s.type ? ` type="${s.type}"` : ''}>`)
    .join('\n');

  const fallbackLink = escapeHtml(srcs[0]?.src || '#');

  return `
<figure class="video-embed-figure">
  <video
    class="video-embed"
   ${aria}${sizeAttrs}${videoTitleAttr}
    controls
    playsinline
    preload="metadata"${posterAttr}
  >
${sourcesHtml}
    Your browser does not support the video tag. You can <a href="${fallbackLink}">download the video</a>.
  </video>
  ${hasCaption ? `<figcaption id="${captionId}" class="video-caption">${escapeHtml(title)}</figcaption>` : ''}
</figure>
`;
}

function getVideoDimensions(filePath) {
  try {
    const result = execFileSync(
      ffprobe.path,
      ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', filePath],
      { encoding: 'utf8' },
    );
    const data = JSON.parse(result);
    if (data.streams && data.streams[0]) {
      return {
        width: data.streams[0].width,
        height: data.streams[0].height,
      };
    }
  } catch (error) {
    console.warn(`[video shortcode] Warning: Could not read metadata for ${filePath}. Error: ${error.message}`);
  }
  return null;
}

function buildSources(input) {
  // If input has an extension, try to add a counterpart (webm/mp4). If not, generate both.
  const url = String(input);
  const { base, ext } = splitExt(url);
  const list = [];

  if (!ext) {
    // No extension → emit webm then mp4
    list.push({ src: `${base}.webm`, type: mimeFor('.webm') });
    list.push({ src: `${base}.mp4`, type: mimeFor('.mp4') });
  } else {
    // Has extension → include it first and try the counterpart
    list.push({ src: url, type: mimeFor(ext) });
    const alt = altExt(ext);

    if (alt) {
      list.push({ src: `${base}${alt}`, type: mimeFor(alt) });
    }
  }

  // Deduplicate by src (in case input already pointed to .webm and alt makes same string)
  const seen = new Set();
  return list.filter((it) => {
    if (seen.has(it.src)) {
      return false;
    }

    seen.add(it.src);
    return true;
  });
}

function splitExt(url) {
  // Works with absolute/relative URLs; finds last "." after last "/"
  const qIndex = url.indexOf('?');
  const clean = qIndex >= 0 ? url.slice(0, qIndex) : url;
  const hashIndex = clean.indexOf('#');
  const clean2 = hashIndex >= 0 ? clean.slice(0, hashIndex) : clean;
  const slash = clean2.lastIndexOf('/');
  const dot = clean2.lastIndexOf('.');
  if (dot > slash) {
    return { base: clean2.slice(0, dot), ext: clean2.slice(dot) };
  }
  return { base: clean2, ext: '' };
}

function altExt(ext) {
  switch (ext.toLowerCase()) {
    case '.mp4':
      return '.webm';
    case '.webm':
      return '.mp4';
    case '.ogv':
      return '.mp4';
    default:
      return '';
  }
}

function mimeFor(ext) {
  switch (String(ext).toLowerCase()) {
    case '.mp4':
      return 'video/mp4';
    case '.webm':
      return 'video/webm';
    case '.ogv':
      return 'video/ogg';
    default:
      return '';
  }
}
