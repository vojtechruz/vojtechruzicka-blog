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
 * Safety:
 * - Only runs on .html outputs that actually contain a <picture>
 * - Skips wrapping if the immediate parent is already a div.image-wrapper
 */
export async function wrapPicturesTransform(content, outputPath) {
  if (!outputPath || !outputPath.endsWith('.html') || !content.includes('<picture')) {
    return content;
  }

  const $ = load(content);

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
      const wrappers = pictures.map((pic) => $('<div class="image-wrapper"></div>').append(pic));

      if (onlyPictures) {
        $parent.replaceWith(wrappers);
      } else {
        $parent.after(wrappers);
      }
      return;
    }

    // Default: just wrap the picture in place
    $pic.wrap('<div class="image-wrapper"></div>');
  });

  return $.html();
}
