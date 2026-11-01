import { load } from 'cheerio';
import site from '../../src/_data/site.js';
import seriesMetadata from '../../src/_data/seriesMetadata.js';
import { escapeHtml } from '../utils/formatting.js';

/**
 * Footer appended to each feed item's content. Full-text feeds otherwise lose the
 * engagement chrome that lives below the article on the site: a link back for
 * comments (readers never load Giscus in a reader) and, for series posts, the
 * series context that only exists in the sidebar. Links are absolute since feed
 * items are read off-site.
 */
export function feedFooter(postUrl, base = site.url) {
  const abs = (p) => base.replace(/\/+$/, '') + '/' + String(p).replace(/^\/+/, '');
  const postAbs = abs(postUrl);
  const siteHost = new URL(base).host.replace(/^www\./, '');

  let seriesLine = '';
  const series = seriesMetadata.find((s) => s.posts.includes(postUrl));
  if (series) {
    const part = series.posts.indexOf(postUrl) + 1;
    const seriesAbs = abs(`/series/${series.slug}/`);
    seriesLine = `<p><em>Part ${part} of ${series.posts.length} in the <a href="${seriesAbs}">${escapeHtml(series.name)}</a> series.</em></p>`;
  }

  return (
    `<hr>${seriesLine}` +
    `<p><a href="${postAbs}#comments">Discuss this article</a> · ` +
    `<a href="${postAbs}">Read it on ${escapeHtml(siteHost)}</a></p>`
  );
}

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
 * - {% linkedPost %} cards are site chrome whose layout depends on the site CSS -
 *   in a reader they fall apart into a bare heading, date and topic list. Reduce
 *   to a plain link, labelled with the card's eyebrow ("Related article").
 * - {% video %} figures: many readers drop <video> (or never load its sources), leaving only the
 *   "Your browser does not support…" text. Reduce to the clip's title and a link to the MP4.
 * - {% codepen %} facades: a screenshot under a "Run demo" button that only the site JS can run.
 *   Reduce to the pen's title and a link to it on CodePen.
 * - Heading permalink anchors (<a class="header-anchor">) are empty icon links
 *   that only make sense with the site CSS and JS; in a reader they are dead
 *   empty links, so drop them.
 * - Code-block copy buttons work only with the site JS; in a reader they are
 *   empty dead buttons, so drop them (the code itself stays).
 * - Decorative icons (callout/msg SVGs, aria-hidden) rely on flexbox to sit
 *   inline with their title; without CSS they misalign above the text. They
 *   carry no information, so drop them.
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
    const label = $(el).find('.linked-post-eyebrow').text().trim() || 'Related article';
    const $fallback = $('<p><em></em><a></a></p>');
    $fallback.find('em').text(`${label}: `);
    $fallback.find('a').attr('href', href).text(title);
    $(el).replaceWith($fallback);
  });

  $('figure.video-embed-figure').each((_, el) => {
    const $video = $(el).find('video').first();
    const $sources = $(el).find('source');
    const href = $sources.filter('[type="video/mp4"]').first().attr('src') || $sources.first().attr('src');
    if (!href) {
      $(el).remove();
      return;
    }
    const title = ($video.attr('data-video-title') || '').trim();
    const $fallback = $('<p><em></em> (<a>watch the video</a>)</p>');
    $fallback.find('em').text(title && title !== 'Video' ? `Video: ${title}` : 'Video');
    $fallback.find('a').attr('href', href);
    $(el).replaceWith($fallback);
  });

  $('figure.codepen-embed-figure').each((_, el) => {
    const href = $(el).attr('data-print-url');
    if (!href) {
      $(el).remove();
      return;
    }
    const title = ($(el).find('.codepen-facade').attr('data-codepen-title') || '').trim();
    const $fallback = $('<p><em></em> (<a>open the demo on CodePen</a>)</p>');
    $fallback.find('em').text(title ? `Interactive demo: ${title}` : 'Interactive demo');
    $fallback.find('a').attr('href', href);
    $(el).replaceWith($fallback);
  });

  $('a.header-anchor').remove();

  // The code-block copy button needs the site JS; in a reader it is an empty, dead <button>.
  $('.copy-code-button').remove();

  // Decorative icons only look right with the component's flexbox CSS - drop them.
  $('svg[aria-hidden="true"]').remove();

  $('img').each((_, el) => {
    const alt = ($(el).attr('alt') || '').trim();
    // A markdown title is the image's visible caption (wrap-pictures-transform.js); it is text for
    // every reader, so it stays even when the image itself is decorative
    const caption = ($(el).attr('title') || '').trim();
    if (!alt && !caption) {
      $(el).remove();
      return;
    }
    const $fallback = $('<p></p>');
    if (alt) {
      $fallback.append($('<em></em>').text(`Image: ${alt}`));
    }
    if (caption) {
      if (alt) {
        $fallback.append('<br>');
      }
      $fallback.append($('<span></span>').text(caption));
    }
    $(el).replaceWith($fallback);
  });

  // The feeds wrap this HTML in <![CDATA[ ... ]]>; a literal "]]>" (e.g. a post about XML) would end
  // the section early and break the feed. Split it across two CDATA sections instead.
  return $.html().replaceAll(']]>', ']]]]><![CDATA[>');
}

export default function registerUrlFilters(eleventyConfig) {
  eleventyConfig.addFilter('feedContent', feedContent);
  eleventyConfig.addFilter('feedFooter', feedFooter);

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
