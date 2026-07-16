import { load } from 'cheerio';
import site from '../../src/_data/site.js';

/** Rewrite root-relative href/src to absolute URLs (exported for tests). */
export function htmlToAbsoluteUrls(html, base = site.url) {
  if (!html) {
    return '';
  }

  return String(html).replace(
    /(href|src)=["']\/([^"']*)["']/g,
    (_m, attr, p) => `${attr}="${base.replace(/\/+$/, '')}/${p}"`,
  );
}

/**
 * Feeds are built from post.templateContent, which is HTML BEFORE Eleventy
 * transforms run. Two consequences:
 *
 * - Mermaid diagrams are still raw <pre class="mermaid"> source placeholders
 *   (build-time SVG rendering only happens for .html outputs). Replace them
 *   with the diagram's accessible prose summary (accTitle/accDescr).
 * - <img> tags still point at source paths (e.g. /../src/posts/…) that do not
 *   exist on the deployed site - the eleventy-img rewrite also only runs for
 *   .html outputs. Replace images with their alt text, or drop decorative ones.
 * - {% linkedPost %} cards are site chrome that depends on the site CSS (even
 *   their "Related article" label is a CSS ::before) - in a reader they fall
 *   apart into a bare heading, date and topic list. Reduce to a plain link.
 */
export function feedContent(html) {
  if (!html) {
    return html;
  }

  const $ = load(html, null, false);

  $('pre.mermaid').each((_, el) => {
    const source = $(el).text();
    const title = source.match(/accTitle:\s*(.+)/)?.[1]?.trim();
    const descr = source.match(/accDescr:\s*(.+)/)?.[1]?.trim();
    const text =
      [title && `Diagram: ${title}.`, descr].filter(Boolean).join(' ') || 'Diagram available in the original article.';

    const $fallback = $('<p><em></em></p>');
    $fallback.find('em').text(text);
    $(el).replaceWith($fallback);
  });

  $('.linked-post').each((_, el) => {
    const $title = $(el).find('.front-post-title a').first();
    const href = $title.attr('href');
    const title = $title.text().trim();
    if (!href || !title) {
      $(el).remove();
      return;
    }
    const $fallback = $('<p><em>Related article: </em><a></a></p>');
    $fallback.find('a').attr('href', href).text(title);
    $(el).replaceWith($fallback);
  });

  $('img').each((_, el) => {
    const alt = ($(el).attr('alt') || '').trim();
    if (!alt) {
      $(el).remove();
      return;
    }
    const $fallback = $('<p><em></em></p>');
    $fallback.find('em').text(`Image: ${alt}`);
    $(el).replaceWith($fallback);
  });

  return $.html();
}

export default function registerUrlFilters(eleventyConfig) {
  eleventyConfig.addFilter('feedContent', feedContent);

  // Absolute URL
  eleventyConfig.addFilter('absoluteUrl', (path, base = site.url) => {
    if (!path) {
      return base;
    }

    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    return base.replace(/\/+$/, '') + '/' + String(path).replace(/^\/+/, '');
  });

  // Naive HTML absolutizer for href/src beginning with "/" (good enough for feed)
  eleventyConfig.addFilter('htmlToAbsoluteUrls', htmlToAbsoluteUrls);
}
