import { readableDateUTC, htmlDateString, escapeHtml } from '../utils/formatting.js';
import { logError } from '../logger.js';

export default function linkedPostCompact(permalink, maybeCollections) {
  const ctx = this && (this.ctx || this) ? this.ctx || this : {};
  const collections = maybeCollections || ctx.collections || (ctx.page && ctx.page.collections) || {};
  const posts = collections.posts || [];

  let post = posts.find((p) => p && (p.url === permalink || (p.page && p.page.url === permalink)));
  if (!post) {
    const all = collections.all || [];
    post = all.find((p) => p && (p.url === permalink || (p.page && p.page.url === permalink)));
  }

  if (!post) {
    const errorMessage = `Article not found for permalink: ${permalink}`;
    logError(errorMessage, 'Shortcode:linkedPostCompact');
    throw new Error(errorMessage);
  }

  const data = post.data || {};
  const url = post.url || (post.page && post.page.url) || String(permalink || '');
  const title = String(data.title || '');
  const readableDate = readableDateUTC(post.date);
  const htmlDate = htmlDateString(post.date);

  const featuredImage = data.featuredImage;
  const postDir = data.postDir;
  const imgUrl = featuredImage && postDir ? `/../${postDir}/${featuredImage}` : '';

  const imageHtml = imgUrl
    ? `<a class="linked-post-compact-image" href="${url}" aria-hidden="true" tabindex="-1">
    <img src="${imgUrl}" alt="" loading="lazy" decoding="async" sizes="80px" eleventy:widths="80,160">
  </a>`
    : '';

  return `<div class="linked-post-compact">
  ${imageHtml}
  <div class="linked-post-compact-body">
    <a class="linked-post-compact-title" href="${url}">${escapeHtml(title)}</a>
    <time class="linked-post-compact-date" datetime="${htmlDate}">${escapeHtml(readableDate)}</time>
  </div>
</div>`;
}
