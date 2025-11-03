import { readableDateUTC, htmlDateString, slugify, escapeHtml } from "../utils/formatting.js";
// Renders a linked article card by permalink (URL)
// Usage examples:
// - In Nunjucks: {% linkedArticle "/my-post/" %}
// - In Markdown (Nunjucks enabled): {% linkedArticle page.url %}
// - In Nunjucks loops: {% linkedArticle post.url %}
export default function linkedArticle(permalink, maybeCollections) {
  // Resolve collections from passed argument or context
  const ctx = (this && (this.ctx || this)) ? (this.ctx || this) : {};
  const collections = maybeCollections || ctx.collections || (ctx.page && ctx.page.collections) || {};
  const posts = collections.posts || [];

  let post = posts.find(p => p && (p.url === permalink || (p.page && p.page.url === permalink)));
  if (!post) {
    const all = collections.all || [];
    post = all.find(p => p && (p.url === permalink || (p.page && p.page.url === permalink)));
  }

  if (!post) {
    return `<div class="linked-article linked-article--missing"><p>Article not found for permalink: ${escapeHtml(String(permalink ?? ""))}</p></div>`;
  }

  const data = post.data || {};
  const url = post.url || (post.page && post.page.url) || String(permalink || "");
  const title = String(data.title || "");

  const readableDate = readableDateUTC(post.date);
  const htmlDate = htmlDateString(post.date);

  const tags = Array.isArray(data.tags) ? data.tags : [];
  const tagLinks = tags.map(tag => {
    const name = String(tag);
    const slug = slugify(name);
    return `<li><a href="/tags/${slug}/"><span class="tag-name">${escapeHtml(name)}</span></a></li>`;
  }).join("");

  const featuredImage = data.featuredImage;
  const postDir = data.postDir;
  const imgUrl = (featuredImage && postDir) ? `/../${postDir}/${featuredImage}` : "";
  const excerpt = String(data.excerpt || "");

  return `<div class="linked-article">
  <h2 class="front-post-title">
    <a href="${url}">${escapeHtml(title)}</a>
  </h2>
  <div class="front-post-info">
    <time class="front-post-info-date" datetime="${htmlDate}">
      ${escapeHtml(readableDate)}
    </time>
    <ul class="post-tags" aria-label="Tags">
      ${tagLinks}
    </ul>
  </div>
  <div>
    <a class="front-post-image" href="${url}" aria-hidden="true" tabindex="-1">
      ${imgUrl ? `<img src="${imgUrl}" alt="" loading="lazy" decoding="async" sizes="(max-width: 600px) 200px, (max-width: 800px) 300px, 400px" eleventy:widths="200,300,400">` : ""}
    </a>
    <p class="front-post-excerpt">
      ${escapeHtml(excerpt)}
    </p>
  </div>
</div>`;
}



