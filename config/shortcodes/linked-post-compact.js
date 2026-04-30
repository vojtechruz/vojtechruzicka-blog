import { escapeHtml } from '../utils/formatting.js';
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

  const featuredImage = data.featuredImage;
  const postDir = data.postDir;
  const imgUrl = featuredImage && postDir ? `/../${postDir}/${featuredImage}` : '';
  const excerpt = String(data.excerpt || '');

  const imageHtml = imgUrl
    ? `<a class="linked-post-compact-image" href="${url}" aria-hidden="true" tabindex="-1">
    <img src="${imgUrl}" alt="" loading="lazy" decoding="async" sizes="80px" eleventy:widths="80,160">
  </a>`
    : '';

  return `<div class="linked-post-compact">
  ${imageHtml}
  <div class="linked-post-compact-body">
    <a class="linked-post-compact-title" href="${url}">${escapeHtml(title)}</a>
    ${excerpt ? `<p class="linked-post-compact-excerpt">${escapeHtml(excerpt)}</p>` : ''}
  </div>
</div>`;
}
