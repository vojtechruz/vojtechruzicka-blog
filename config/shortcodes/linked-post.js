import { readableDateUTC, htmlDateString, slugify, escapeHtml } from '../utils/formatting.js';
import { logError } from '../logger.js';
import { isLocalDevelopment, isPreview } from '../env-utils.js';

// Renders a linked post card by permalink (URL)
// Usage examples:
// - In Nunjucks: {% linkedPost "/my-post/" %}
// - In Markdown (Nunjucks enabled): {% linkedPost page.url %}
// - In Nunjucks loops: {% linkedPost post.url %}
export default function linkedPost(permalink, maybeCollections) {
  // Resolve collections from passed argument or context
  const ctx = this && (this.ctx || this) ? this.ctx || this : {};
  const collections = maybeCollections || ctx.collections || (ctx.page && ctx.page.collections) || {};
  const collectionBuckets = [collections.posts || [], collections.archivedPosts || [], collections.all || []];
  const post = collectionBuckets.flat().find((p) => p && (p.url === permalink || (p.page && p.page.url === permalink)));

  if (!post) {
    const errorMessage = `Article not found for permalink: ${permalink}`;
    logError(errorMessage, 'Shortcode:linkedPost');

    throw new Error(errorMessage);
  }

  const data = post.data || {};
  const url = post.url || (post.page && post.page.url) || String(permalink || '');
  const title = String(data.title || '');

  const isArchived = !!data.archivedStatus;
  const dateValue = isArchived ? data.archivedDate || post.date : post.date;
  const readableDate = readableDateUTC(dateValue);
  const htmlDate = htmlDateString(dateValue);
  const datePrefix = isArchived ? 'Archived ' : '';

  const topics = Array.isArray(data.topics) ? data.topics : [];
  const topicLinks = topics
    .map((topic) => {
      const name = String(topic);
      const slug = slugify(name);
      return `<li><a href="/topics/${slug}/"><span class="topic-name">${escapeHtml(name)}</span></a></li>`;
    })
    .join('');

  const featuredImage = data.featuredImage;
  const postDir = data.postDir;
  const imgUrl = featuredImage && postDir ? `/../${postDir}/${featuredImage}` : '';
  const excerpt = String(data.excerpt || '');
  const draftStatus = data.draftStatus || '';
  const needsReview = data.needsReview === true && (isLocalDevelopment() || isPreview());

  const allSeriesMetadata = ctx.seriesMetadata || [];
  const postSeries = allSeriesMetadata.find((s) => s.posts.includes(url));
  let seriesBadge = '';
  if (postSeries) {
    const partIndex = postSeries.posts.indexOf(url);
    const partNumber = partIndex + 1;
    const totalParts = postSeries.posts.length;
    seriesBadge = `<span class="series-part-badge"><a title="View all posts in ${escapeHtml(postSeries.name)} series" href="/series/${escapeHtml(postSeries.slug)}/">${escapeHtml(postSeries.name)}</a> · Part ${partNumber}/${totalParts}</span>`;
  }

  // Draft badge HTML
  let draftBadge = '';
  if (draftStatus) {
    const icons = { draft: '🟠', review: '🔵', ready: '🟢' };
    const labels = { draft: 'Draft', review: 'In Review', ready: 'Ready' };
    const icon = icons[draftStatus] || '📝';
    const label = labels[draftStatus] || draftStatus;
    draftBadge = `<span class="draft-badge draft-badge-${escapeHtml(draftStatus)}">${icon} ${escapeHtml(label)}</span>`;
  }

  const currentVersionLink =
    isArchived && data.supersededBy
      ? `<p>
      <a href="${escapeHtml(data.supersededBy)}">Read the current version →</a>
    </p>`
      : '';
  const classes = [
    'linked-post',
    isArchived ? 'archived-linked-post' : '',
    draftStatus ? 'linked-post-draft' : '',
    draftStatus ? `linked-post-${escapeHtml(draftStatus)}` : '',
    needsReview ? 'linked-post-needs-review' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return `<div class="${classes}">
  <h2 class="front-post-title">
    <a href="${url}">${escapeHtml(title)}</a>${draftBadge}
  </h2>
  <div class="front-post-info">
    <time class="front-post-info-date" datetime="${htmlDate}">
      ${datePrefix}${escapeHtml(readableDate)}
    </time>
    ${seriesBadge}
    <ul class="post-topics" aria-label="Topics">
      ${topicLinks}
    </ul>
  </div>
  <div>
    <a class="front-post-image" href="${url}" aria-hidden="true" tabindex="-1">
      ${imgUrl ? `<img src="${imgUrl}" alt="" loading="lazy" decoding="async" sizes="(max-width: 600px) 200px, (max-width: 800px) 300px, 400px" eleventy:widths="200,300,400">` : ''}
    </a>
    <p class="front-post-excerpt">
      ${escapeHtml(excerpt)}
    </p>
    ${currentVersionLink}
  </div>
</div>
`;
}
