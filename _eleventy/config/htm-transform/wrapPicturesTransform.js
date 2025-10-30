// config/htm-transform/wrapPicturesTransform.js
// ESM module
import { load } from "cheerio";

/**
 * Eleventy HTML transform that wraps every <picture> element
 * with <div class="image-wrapper"> ... </div>.
 *
 * Safety:
 * - Only runs on .html outputs
 * - Skips wrapping if the immediate parent is already a div.image-wrapper
 */
export async function wrapPicturesTransform(content, outputPath) {
  if (!outputPath || !outputPath.endsWith(".html")) return content;

  const $ = load(content);

  function parentHasOnlyPicture($parent, $pic) {
    const nodes = $parent.contents().toArray();
    for (const node of nodes) {
      // Skip the picture itself
      if (node === $pic.get(0)) continue;
      // Ignore empty text nodes and comments
      if (node.type === "text" && (node.data || "").trim() === "") continue;
      if (node.type === "comment") continue;
      // Any other node counts as extra content
      return false;
    }
    return true;
  }

  $("picture").each((_, el) => {
    const $pic = $(el);
    const $parent = $pic.parent();

    if ($parent && $parent.is("div.image-wrapper")) {
      return; // already wrapped
    }

    // If inside a paragraph, avoid placing a block-level div inside <p>
    if ($parent && $parent.is("p")) {
      const onlyPic = parentHasOnlyPicture($parent, $pic);
      if (onlyPic) {
        // Replace <p> with the wrapper containing the picture
        const $wrapper = $('<div class="image-wrapper"></div>');
        $pic.replaceWith($wrapper);
        $wrapper.append($pic);
        $parent.replaceWith($wrapper);
        return;
      } else {
        // Move the picture out of the paragraph into a wrapper placed after the <p>
        const $wrapper = $('<div class="image-wrapper"></div>');
        $parent.after($wrapper);
        $wrapper.append($pic);
        return;
      }
    }

    // Default: just wrap the picture in place
    $pic.wrap('<div class="image-wrapper"></div>');
  });

  return $.html();
}
