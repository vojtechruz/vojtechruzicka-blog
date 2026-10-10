// config/html-transform/largest-img-src-transform.js
// ESM module
import { load } from 'cheerio';

/**
 * Eleventy HTML transform that points the `src` of every responsive <img> at the largest
 * candidate of its own `srcset`.
 *
 * eleventy-img always writes the smallest width into `src` (its `fallback` option only changes
 * width/height). Browsers never fetch it — they pick from `srcset` — but crawlers do: Google
 * Images reads `src`, so 2600px screenshots were offered to it as 400px thumbnails. Image search
 * impressions fell ~85% after the Gatsby → Eleventy switch (April 2026); this is one suspected
 * cause (see docs/IMAGES.md).
 *
 * Safety:
 * - Only runs on .html outputs that contain a srcset
 * - Only touches an <img> whose `src` is one of its own `srcset` candidates (eleventy-img output)
 */
export async function largestImgSrcTransform(content, outputPath) {
  if (!outputPath || !outputPath.endsWith('.html') || !content.includes('srcset=')) {
    return content;
  }

  const $ = load(content);
  let changed = false;

  $('img[srcset][src]').each((_, el) => {
    const $img = $(el);
    const candidates = $img
      .attr('srcset')
      .split(',')
      .map((entry) => {
        const [url, descriptor = ''] = entry.trim().split(/\s+/);
        return { url, width: parseInt(descriptor, 10) };
      })
      .filter((c) => c.url && Number.isFinite(c.width));

    if (candidates.length < 2 || !candidates.some((c) => c.url === $img.attr('src'))) {
      return;
    }

    const largest = candidates.reduce((a, b) => (b.width > a.width ? b : a));
    if (largest.url !== $img.attr('src')) {
      $img.attr('src', largest.url);
      changed = true;
    }
  });

  return changed ? $.html() : content;
}
