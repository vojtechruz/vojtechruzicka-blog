import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { loadPage, SITE_DIR } from './helpers.js';

/**
 * Posts verified to contain a featured image plus several in-post images in the build output.
 * Using more than one post keeps the assertions about the pipeline rather than about one file.
 */
const POSTS_WITH_IMAGES = ['/css-position/', '/chrome-audit-lighthouse/', '/commitlint/', '/css-flexbox/'];

/** Widths configured in config/plugins/image.js (plus 'auto' = the original width). */
const CONFIGURED_WIDTHS = [400, 800, 1200];

/** Modern formats emitted as <source> elements, most preferred first. */
const MODERN_SOURCE_TYPES = ['image/avif', 'image/webp'];

/** Featured images are rendered inside the post <header>; in-post images are direct children of <article>. */
const FEATURED_SELECTOR = 'main.post > article > header .image-wrapper > picture';
const IN_POST_SELECTOR = 'main.post > article > .image-wrapper > picture';

/**
 * Parse a srcset attribute into [{ url, width }], preserving order.
 * @param {string} srcset
 */
function parseSrcset(srcset) {
  return srcset
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [url, descriptor] = entry.split(/\s+/);
      return { url, width: Number.parseInt(descriptor, 10), descriptor };
    });
}

/** Map a site-absolute URL to its path inside the build output. */
function toOutputPath(url) {
  return `${SITE_DIR}${decodeURIComponent(url)}`;
}

/** Collect every <picture> matching a selector as { $pic, $img } pairs. */
function collectPictures($, selector) {
  return $(selector)
    .toArray()
    .map((el) => ({ $pic: $(el), $img: $(el).find('img').first() }));
}

/**
 * Whether this build emitted AVIF at all. CI builds a lean variant
 * (ELEVENTY_IMAGE_FORMATS=webp,auto), so AVIF assertions are conditional on the
 * build actually producing it — but if it is produced, it must be produced consistently.
 */
function buildEmitsAvif($) {
  return $('source[type="image/avif"]').length > 0;
}

describe('Responsive image pipeline', () => {
  describe('<picture> wrapping (wrap-pictures-transform)', () => {
    it('renders in-post images as <picture> elements with <source> children', () => {
      for (const postPath of POSTS_WITH_IMAGES) {
        const $ = loadPage(postPath);
        const pictures = collectPictures($, IN_POST_SELECTOR);

        expect(pictures.length, `${postPath} should contain in-post images`).toBeGreaterThan(0);

        for (const { $pic, $img } of pictures) {
          expect($pic.find('source').length, `Missing <source> in ${postPath}`).toBeGreaterThan(0);
          expect($img.length, `Missing <img> fallback in ${postPath}`).toBe(1);
        }
      }
    });

    it('wraps every <picture> in a div.image-wrapper and never leaves one inside a <p>', () => {
      for (const postPath of POSTS_WITH_IMAGES) {
        const $ = loadPage(postPath);
        const pictures = $('picture').toArray();

        expect(pictures.length, `${postPath} should contain pictures`).toBeGreaterThan(0);

        for (const el of pictures) {
          const $parent = $(el).parent();
          expect($parent.is('div.image-wrapper'), `Unwrapped <picture> in ${postPath}`).toBe(true);
          expect($(el).parents('p').length, `<picture> nested in <p> in ${postPath}`).toBe(0);
        }
      }
    });
  });

  describe('Modern formats (image plugin)', () => {
    it('emits modern-format sources before the original-format <img> fallback', () => {
      for (const postPath of POSTS_WITH_IMAGES) {
        const $ = loadPage(postPath);
        const expectedTypes = buildEmitsAvif($) ? MODERN_SOURCE_TYPES : ['image/webp'];

        for (const { $pic } of collectPictures($, IN_POST_SELECTOR)) {
          const types = $pic
            .find('source')
            .map((_, el) => $(el).attr('type'))
            .get();

          // Order matters: the browser picks the first source it supports,
          // so avif must precede webp and both must precede the <img> fallback.
          expect(types, `Unexpected source formats in ${postPath}`).toEqual(expectedTypes);
        }
      }
    });

    it('serves the original (non-modern) format as the <img> fallback', () => {
      for (const postPath of POSTS_WITH_IMAGES) {
        const $ = loadPage(postPath);

        for (const { $img } of collectPictures($, IN_POST_SELECTOR)) {
          const src = $img.attr('src');
          expect(src, `Missing src in ${postPath}`).toBeTruthy();
          expect(src, `Fallback <img> should not use a modern format in ${postPath}`).toMatch(/\.(png|jpe?g|gif)$/i);
        }
      }
    });

    it('generates a matching variant of each source format for the same image', () => {
      const $ = loadPage('/css-position/');
      const { $pic, $img } = collectPictures($, IN_POST_SELECTOR)[0];
      const fallbackWidths = parseSrcset($img.attr('srcset')).map((entry) => entry.width);

      $pic.find('source').each((_, el) => {
        const type = $(el).attr('type');
        const extension = type.replace('image/', '');
        const entries = parseSrcset($(el).attr('srcset'));

        expect(entries.map((entry) => entry.width)).toEqual(fallbackWidths);
        for (const entry of entries) {
          expect(entry.url, `Source type ${type} should point at .${extension} files`).toMatch(
            new RegExp(`\\.${extension}$`),
          );
        }
      });
    });
  });

  describe('Multiple resolutions', () => {
    it('exposes several ascending widths whose descriptors match the generated filenames', () => {
      for (const postPath of POSTS_WITH_IMAGES) {
        const $ = loadPage(postPath);

        for (const { $pic, $img } of collectPictures($, IN_POST_SELECTOR)) {
          const srcsets = [
            ...$pic
              .find('source')
              .map((_, el) => $(el).attr('srcset'))
              .get(),
            $img.attr('srcset'),
          ];

          for (const srcset of srcsets) {
            expect(srcset, `Missing srcset in ${postPath}`).toBeTruthy();
            const entries = parseSrcset(srcset);

            expect(entries.length, `Too few srcset candidates in ${postPath}`).toBeGreaterThanOrEqual(2);

            let previousWidth = 0;
            for (const { url, width, descriptor } of entries) {
              expect(descriptor, `srcset must use w descriptors in ${postPath}`).toMatch(/^\d+w$/);
              expect(width, `srcset widths must ascend in ${postPath}`).toBeGreaterThan(previousWidth);
              previousWidth = width;

              // filenameFormat is `<name>-<hash>-<width>.<format>` — the file must
              // really be the width its descriptor advertises.
              expect(url, `Filename width does not match descriptor in ${postPath}: ${url}`).toMatch(
                new RegExp(`-${width}\\.[a-z0-9]+$`),
              );
            }

            // Every width is either a configured breakpoint or the original ('auto') width.
            const originalWidth = Number.parseInt($img.attr('width'), 10);
            for (const { width } of entries) {
              expect(
                CONFIGURED_WIDTHS.includes(width) || width === originalWidth,
                `Unexpected width ${width} in ${postPath}`,
              ).toBe(true);
            }

            // The largest candidate is the original image.
            expect(entries[entries.length - 1].width).toBe(originalWidth);
          }
        }
      }
    });

    it('declares a sizes attribute on the <img> and on every <source>', () => {
      for (const postPath of POSTS_WITH_IMAGES) {
        const $ = loadPage(postPath);

        for (const { $pic, $img } of collectPictures($, IN_POST_SELECTOR)) {
          const imgSizes = $img.attr('sizes');
          expect(imgSizes, `Missing sizes on <img> in ${postPath}`).toBeTruthy();

          $pic.find('source').each((_, el) => {
            expect($(el).attr('sizes'), `Missing sizes on <source> in ${postPath}`).toBe(imgSizes);
          });
        }
      }
    });
  });

  describe('Generated files on disk', () => {
    it('every srcset candidate and fallback src resolves to a real file in the build output', () => {
      const referenced = new Set();

      for (const postPath of POSTS_WITH_IMAGES) {
        const $ = loadPage(postPath);

        for (const { $pic, $img } of collectPictures($, IN_POST_SELECTOR)) {
          referenced.add($img.attr('src'));
          for (const entry of parseSrcset($img.attr('srcset'))) {
            referenced.add(entry.url);
          }
          $pic.find('source').each((_, el) => {
            for (const entry of parseSrcset($(el).attr('srcset'))) {
              referenced.add(entry.url);
            }
          });
        }
      }

      // Sanity check that the sweep collected a meaningful number of variants.
      expect(referenced.size).toBeGreaterThan(50);

      const missing = [...referenced].filter((url) => !existsSync(toOutputPath(url)));
      expect(missing, `Referenced image files missing from ${SITE_DIR}`).toEqual([]);
    });
  });

  describe('LQIP placeholders (lqip-svg-transform)', () => {
    it('adds the lqip class and an inline SVG background to every image', () => {
      for (const postPath of POSTS_WITH_IMAGES) {
        const $ = loadPage(postPath);
        const pictures = collectPictures($, `${FEATURED_SELECTOR}, ${IN_POST_SELECTOR}`);

        expect(pictures.length).toBeGreaterThan(0);

        for (const { $img } of pictures) {
          expect($img.hasClass('lqip'), `Missing lqip class in ${postPath}`).toBe(true);

          const style = $img.attr('style') || '';
          expect(style, `Missing LQIP background in ${postPath}`).toContain('background-image:url(');
          expect(style, `LQIP should be an inline SVG data URI in ${postPath}`).toContain('data:image/svg+xml;base64,');
          expect(style).toContain('background-size:cover');
        }
      }
    });

    it('encodes a real SVG mosaic sized to the image aspect ratio', () => {
      const $ = loadPage('/css-position/');
      const { $img } = collectPictures($, IN_POST_SELECTOR)[0];
      const base64 = /data:image\/svg\+xml;base64,([^')]+)/.exec($img.attr('style'))[1];
      const svg = Buffer.from(base64, 'base64').toString('utf-8');

      expect(svg).toContain('<svg');
      expect(svg).toContain('<rect');

      const [, gridWidth, gridHeight] = /viewBox="0 0 (\d+) (\d+)"/.exec(svg).map(Number);
      const imageAspect = Number($img.attr('width')) / Number($img.attr('height'));
      expect(Math.abs(gridWidth / gridHeight - imageAspect)).toBeLessThan(imageAspect * 0.3);

      // One <rect> per mosaic cell.
      expect(svg.match(/<rect/g).length).toBe(gridWidth * gridHeight);
    });
  });

  describe('Layout stability and loading hints', () => {
    it('declares positive intrinsic width and height on every image', () => {
      for (const postPath of POSTS_WITH_IMAGES) {
        const $ = loadPage(postPath);

        for (const { $img } of collectPictures($, `${FEATURED_SELECTOR}, ${IN_POST_SELECTOR}`)) {
          const width = Number.parseInt($img.attr('width'), 10);
          const height = Number.parseInt($img.attr('height'), 10);

          expect(Number.isInteger(width) && width > 0, `Missing width in ${postPath}`).toBe(true);
          expect(Number.isInteger(height) && height > 0, `Missing height in ${postPath}`).toBe(true);
        }
      }
    });

    it('loads the featured image eagerly with high fetch priority', () => {
      for (const postPath of POSTS_WITH_IMAGES) {
        const $ = loadPage(postPath);
        const featured = collectPictures($, FEATURED_SELECTOR);

        expect(featured.length, `${postPath} should have a featured image`).toBe(1);

        const { $img } = featured[0];
        expect($img.attr('loading'), `Featured image should not be lazy in ${postPath}`).toBe('eager');
        expect($img.attr('fetchpriority'), `Featured image should be high priority in ${postPath}`).toBe('high');
        expect($img.attr('decoding')).toBe('async');
      }
    });

    it('lazy-loads in-post images and decodes them asynchronously', () => {
      for (const postPath of POSTS_WITH_IMAGES) {
        const $ = loadPage(postPath);

        for (const { $img } of collectPictures($, IN_POST_SELECTOR)) {
          expect($img.attr('loading'), `In-post image should be lazy in ${postPath}`).toBe('lazy');
          expect($img.attr('decoding'), `In-post image should decode async in ${postPath}`).toBe('async');
          expect($img.attr('fetchpriority'), `In-post image should not be high priority in ${postPath}`).not.toBe(
            'high',
          );
        }
      }
    });

    it('gives in-post images a non-empty alt text', () => {
      for (const postPath of POSTS_WITH_IMAGES) {
        const $ = loadPage(postPath);

        for (const { $img } of collectPictures($, IN_POST_SELECTOR)) {
          expect(($img.attr('alt') || '').trim(), `Missing alt text in ${postPath}`).not.toBe('');
        }
      }
    });
  });
});
