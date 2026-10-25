// config/html-transform/wrap-pictures-transform.js
// ESM module
import { load } from 'cheerio';

/**
 * Eleventy HTML transform that wraps every <picture> element
 * with <div class="image-wrapper"> ... </div>.
 *
 * A block-level div cannot sit inside a <p>, so pictures in a paragraph are moved out of it:
 * - a paragraph holding nothing but pictures is replaced by their wrappers
 * - a paragraph that also has text keeps the text, and the wrappers go right after it
 * All pictures of one paragraph are moved together, in source order — handling them one at a
 * time used to reverse two images written side by side (`![a](a.png) ![b](b.png)`).
 *
 * A picture whose <img> has a title (markdown `![alt](x.png "Caption")`) becomes a captioned figure:
 * <figure class="image-figure"><div class="image-wrapper">…</div><figcaption class="image-caption">
 * Caption</figcaption></figure>. The title attribute is dropped, so the caption is not also a tooltip.
 *
 * Safety:
 * - Only runs on .html outputs that actually contain a <picture>
 * - Skips wrapping if the immediate parent is already a div.image-wrapper
 */
export async function wrapPicturesTransform(content, outputPath) {
  if (!outputPath || !outputPath.endsWith('.html') || !content.includes('<picture')) {
    return content;
  }

  const $ = load(content);

  /** The wrapper for one picture, inside a captioned figure when its image has a title. */
  const wrap = (pic) => {
    const $wrapper = $('<div class="image-wrapper"></div>').append(pic);
    const $img = $(pic).children('img').first();
    const caption = ($img.attr('title') || '').trim();
    if (!caption) {
      return $wrapper;
    }
    $img.removeAttr('title');
    const $caption = $('<figcaption class="image-caption"></figcaption>').text(caption);
    return $('<figure class="image-figure"></figure>').append($wrapper, $caption);
  };

  // Whitespace text and comments do not count as paragraph content
  const isIgnorable = (node) => node.type === 'comment' || (node.type === 'text' && (node.data || '').trim() === '');

  $('picture').each((_, el) => {
    const $pic = $(el);
    const $parent = $pic.parent();

    // Already wrapped — also true for later pictures of a paragraph handled below
    if ($parent.is('div.image-wrapper')) {
      return;
    }

    if ($parent.is('p')) {
      const pictures = $parent.children('picture').toArray();
      const onlyPictures = $parent
        .contents()
        .toArray()
        .every((node) => pictures.includes(node) || isIgnorable(node));
      const wrappers = pictures.map(wrap);

      if (onlyPictures) {
        $parent.replaceWith(wrappers);
      } else {
        $parent.after(wrappers);
      }
      return;
    }

    // Default: just wrap the picture in place
    const $placeholder = $('<span></span>');
    $pic.replaceWith($placeholder);
    $placeholder.replaceWith(wrap(el));
  });

  return $.html();
}
