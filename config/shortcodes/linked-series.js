import { slugify, escapeHtml } from '../utils/formatting.js';
import { logError } from '../logger.js';

// Renders a series card by slug — same visual layout as linkedPost.
// Usage: {% linkedSeries "angular-tutorial" %}
export default function linkedSeries(slug) {
  const ctx = this && (this.ctx || this) ? this.ctx || this : {};
  const posts = ctx.collections?.posts || [];
  const allSeriesMetadata = ctx.seriesMetadata || [];

  const series = allSeriesMetadata.find((s) => s.slug === slug);
  if (!series) {
    const msg = `Series not found for slug: ${slug}`;
    logError(msg, 'Shortcode:linkedSeries');
    throw new Error(msg);
  }

  const url = `/series/${series.slug}/`;
  const count = series.posts.length;
  const articleLabel = count === 1 ? 'article' : 'articles';

  const tags = Array.isArray(series.tags) ? series.tags : [];
  const tagLinks = tags
    .map((tag) => {
      const name = String(tag);
      const tagSlug = slugify(name);
      return `<li><a href="/tags/${tagSlug}/"><span class="tag-name">${escapeHtml(name)}</span></a></li>`;
    })
    .join('');

  // Use the first post's featured image as the series cover
  const firstPost = posts.find((p) => p.url === series.posts[0]);
  const featuredImage = firstPost?.data?.featuredImage;
  const postDir = firstPost?.data?.postDir;
  const imgUrl = featuredImage && postDir ? `/../${postDir}/${featuredImage}` : '';

  return `<div class="linked-post linked-series">
  <h2 class="front-post-title">
    <a href="${url}">${escapeHtml(series.name)}</a>
  </h2>
  <div class="front-post-info">
    <span class="series-article-count">${count} ${articleLabel}</span>
    <ul class="post-tags" aria-label="Tags">
      ${tagLinks}
    </ul>
  </div>
  <div>
    <a class="front-post-image" href="${url}" aria-hidden="true" tabindex="-1">
      ${imgUrl ? `<img src="${imgUrl}" alt="" loading="lazy" decoding="async" sizes="(max-width: 600px) 200px, (max-width: 800px) 300px, 400px" eleventy:widths="200,300,400">` : ''}
    </a>
    <p class="front-post-excerpt">
      ${escapeHtml(series.description)}
    </p>
  </div>
</div>
`;
}
