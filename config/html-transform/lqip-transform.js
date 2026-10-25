// config/html-transform/lqip-transform.js
// ESM module

import path from 'node:path';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import { load } from 'cheerio';

/**
 * LQIP results are deterministic per (image URL, grid size), and the same featured
 * image appears on many pages (homepage, topic/series listings, related posts).
 * Cache the generated placeholder so each image is decoded only once
 * per build instead of once per page it appears on.
 */
const lqipCache = new Map();

/**
 * --- Configuration ---
 */
const OUTPUT_DIR = process.env.ELEVENTY_OUTPUT_DIR || '_site';
const PROJECT_ROOT = process.cwd();

/**
 * Approximate total number of pixels in the placeholder image.
 * The grid (width x height) will adapt to image aspect ratio.
 * 160 ≈ 16×10 for 16:10 aspect ratio.
 */
const CELLS_TOTAL = 160;

/**
 * Minimum number of pixels on the shorter side, to avoid being too coarse.
 */
const MIN_SIDE_CELLS = 8;

/**
 * Lossy WebP quality of the placeholder. Under the 60 px blur the colour error (~4/255 on average)
 * is invisible, and a 16×10 image comes out at ~100–180 bytes.
 */
const WEBP_QUALITY = 80;

/**
 * Images displayed at most this wide (every length in `sizes` is in px and no larger) are
 * thumbnails: post cards, compact linked posts, series navigation. They get a single average
 * colour instead of an image - at 56–160 px the difference is not visible, and they are most of
 * the pictures on listing pages.
 */
const THUMBNAIL_MAX_PX = 200;

/** Convert 0–255 to two-digit hex */
function to2(v) {
  return v.toString(16).padStart(2, '0');
}

/**
 * Load binary buffer for the “smallest” image candidate.
 *
 * DEV mode (`--serve`):
 *   Eleventy Image outputs virtual URLs like /.11ty/image/?src=...&width=...
 *   → we extract the `src` param and read the original image from /src/ folder
 *
 * BUILD mode:
 *   Uses real static files in the output directory (_site/…)
 */
async function getBufferForSmallestPath(smallestUrl) {
  if (smallestUrl.startsWith('/.11ty/image/')) {
    const q = smallestUrl.split('?')[1] || '';
    const params = new URLSearchParams(q);
    const srcParam = params.get('src');

    if (!srcParam) {
      throw new Error('Missing src param in /.11ty/image URL');
    }

    const decoded = decodeURIComponent(srcParam);
    const abs = path.join(PROJECT_ROOT, decoded.replace(/^[\\/]/, ''));
    return fs.readFile(abs);
  }
  // build mode: file already exists in _site/
  const absOut = path.join(OUTPUT_DIR, smallestUrl.replace(/^\//, ''));
  return fs.readFile(absOut);
}

/**
 * Pick the smallest candidate URL inside a <picture>:
 * - Prefer first <source srcset>, then <img srcset>, then <img src>.
 */
function pickSmallestUrl($pic, $img) {
  const $firstSource = $pic.find('source').first();
  const srcset = $firstSource.attr('srcset') || $img.attr('srcset');
  if (srcset) {
    const candidate = srcset.split(',')[0].trim().split(' ')[0];

    if (candidate) {
      return candidate;
    }
  }
  return $img.attr('src') || '';
}

/**
 * Compute the adaptive placeholder size (pixels in width/height)
 * based on image aspect ratio.
 */
export function computeGrid(aspect) {
  const base = Math.sqrt(CELLS_TOTAL * aspect);
  const gridW = Math.max(MIN_SIDE_CELLS, Math.round(base));
  const gridH = Math.max(MIN_SIDE_CELLS, Math.round(gridW / aspect));

  return { gridW, gridH };
}

// The placeholder is taken from the same crop as the picture (`fit: 'cover'` below, `background-size:
// cover` on the <img>): cards show their image through `object-fit: cover`, and in-post images take
// their aspect ratio from width/height, so the placeholder lines up with what the reader eventually sees.

/**
 * Whether the <img> is a thumbnail by its `sizes`: every slot length is in px and at most
 * THUMBNAIL_MAX_PX (`auto` is ignored). No `sizes`, or a viewport-relative length, means a large image.
 */
export function isThumbnail(sizes) {
  if (!sizes) {
    return false;
  }
  const lengths = sizes
    .split(',')
    .map((entry) => entry.trim().split(/\s+/).pop())
    .filter((length) => length !== 'auto');
  return (
    lengths.length > 0 &&
    lengths.every((length) => /^\d+(\.\d+)?px$/.test(length) && parseFloat(length) <= THUMBNAIL_MAX_PX)
  );
}

/** The average colour of the image, as #rrggbb (alpha ignored, like the image placeholder's RGB). */
async function averageColor(buf) {
  const data = await sharp(buf)
    .toColorspace('srgb')
    .removeAlpha()
    .resize(1, 1, { fit: 'fill', kernel: 'cubic' })
    .raw()
    .toBuffer();
  return `#${to2(data[0])}${to2(data[1])}${to2(data[2] ?? data[0])}`;
}

/** A tiny lossy WebP of the image, gridW × gridH pixels, as a data URI. Transparency is kept. */
async function tinyImage(buf, gridW, gridH) {
  const webp = await sharp(buf)
    .toColorspace('srgb')
    .resize(gridW, gridH, { fit: 'cover' })
    .webp({ quality: WEBP_QUALITY, smartSubsample: true, effort: 6 })
    .toBuffer();
  return `data:image/webp;base64,${webp.toString('base64')}`;
}

/**
 * --- Eleventy Transform ---
 * Runs on every generated HTML page.
 * Finds <picture> tags and puts a placeholder behind each <img>, read from its smallest candidate:
 * a tiny blurred image for in-post and featured images, an average colour for thumbnails.
 */
export async function lqipTransform(content, outputPath) {
  if (!outputPath || !outputPath.endsWith('.html') || !content.includes('<picture')) {
    return content;
  }

  const $ = load(content);
  const jobs = [];

  $('picture').each((_, pic) => {
    const $pic = $(pic);
    const $img = $pic.find('img').first();

    if (!$img.length) {
      return;
    }

    const smallest = pickSmallestUrl($pic, $img);

    if (!smallest) {
      return;
    }

    jobs.push(
      (async () => {
        try {
          const thumbnail = isThumbnail($img.attr('sizes'));

          // Determine aspect ratio from width/height attributes if present
          const wAttr = parseInt($img.attr('width') || '', 10);
          const hAttr = parseInt($img.attr('height') || '', 10);
          const aspect = wAttr && hAttr ? wAttr / hAttr : 16 / 9;
          const { gridW, gridH } = computeGrid(aspect);

          // Reuse the placeholder when this image was already processed on another page.
          // Cache the in-flight promise (not just the result) so concurrent pages
          // referencing the same image do not start duplicate sharp pipelines.
          const cacheKey = thumbnail ? `${smallest}|color` : `${smallest}|${gridW}x${gridH}`;
          if (!lqipCache.has(cacheKey)) {
            lqipCache.set(
              cacheKey,
              (async () => {
                // Load image buffer (origin in serve mode, built file otherwise)
                const buf = await getBufferForSmallestPath(smallest);
                return thumbnail ? averageColor(buf) : tinyImage(buf, gridW, gridH);
              })().catch((e) => {
                // Do not cache failures - let a later page retry
                lqipCache.delete(cacheKey);
                throw e;
              }),
            );
          }
          const placeholder = await lqipCache.get(cacheKey);

          // Apply the placeholder as the <img> background; the author's own style goes last, so it wins
          const prevImgStyle = $img.attr('style') || '';
          $img.attr(
            'style',
            thumbnail
              ? `display:block;background-color:${placeholder};${prevImgStyle}`
              : `display:block;` +
                  `background-image:url('${placeholder}');` +
                  `background-size:cover;` +
                  `background-position:center;` +
                  `background-repeat:no-repeat;` +
                  prevImgStyle,
          );

          // src/scripts/lqip.js ends the placeholder once the image loads (or fails)
          $img.addClass('lqip');
        } catch (e) {
          console.error('LQIP error for', smallest, e);
        }
      })(),
    );
  });

  await Promise.all(jobs);
  return $.html();
}
