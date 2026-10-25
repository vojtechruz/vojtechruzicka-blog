import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import sharp from 'sharp';
import { globSync } from 'glob';
import { loadPage, SITE_DIR } from './helpers.js';
import { resolveImageFormats, resolveImageWidths } from '../config/plugins/image.js';

/**
 * Posts verified to contain a featured image plus several in-post images in the build output.
 * Using more than one post keeps the assertions about the pipeline rather than about one file.
 */
const POSTS_WITH_IMAGES = ['/css-position/', '/chrome-audit-lighthouse/', '/commitlint/', '/css-flexbox/'];

/**
 * Expectations are derived from the pipeline configuration (config/plugins/image.js),
 * not from the build output: with no env override the full production defaults
 * (avif + webp, every configured width) are required, so silently dropping a format or width from
 * the defaults fails the tests. CI sets ELEVENTY_IMAGE_FORMATS / ELEVENTY_IMAGE_WIDTHS
 * at job level, so its lean build and this test see the same overrides.
 */

/** Widths configured in config/plugins/image.js, without 'auto' (= the original width). */
const CONFIGURED_WIDTHS = resolveImageWidths().filter((width) => width !== 'auto');

/** Modern formats emitted as <source> elements, most preferred first ('auto' is the <img> fallback). */
const MODERN_SOURCE_TYPES = resolveImageFormats()
  .filter((format) => format !== 'auto')
  .map((format) => `image/${format}`);

/** Featured images are rendered inside the post <header>; in-post images are direct children of <article>. */
const FEATURED_SELECTOR = 'main.post > article > header .image-wrapper > picture';
/** In-post images, uncaptioned or in a captioned figure (wrap-pictures-transform.js) */
const IN_POST_SELECTOR = ':is(main.post > article, main.post > article > .image-figure) > .image-wrapper > picture';
/** Both kinds share the plugin defaults: configured widths up to the original, the same `sizes`. */
const ARTICLE_IMAGES_SELECTOR = `${FEATURED_SELECTOR}, ${IN_POST_SELECTOR}`;

/**
 * Thumbnails on cards and in navigation override the default widths with `eleventy:widths`: exactly a
 * 1x and a 2x candidate for their CSS size, never the original (config/shortcodes/linked-post.js,
 * linked-series.js, linked-post-compact.js, components/series-nav.njk). Keyed by the `sizes` each declares.
 */
const THUMBNAIL_WIDTHS = {
  '(max-width: 768px) 90px, 160px': [160, 320], // linkedPost / linkedSeries cards
  '80px': [80, 160], // compact related-post cards
  '56px': [80, 160], // series prev/next cards
};
/** `sizes` of featured images, and of the lazy in-post ones led by `auto` (config/plugins/image.js). */
const ARTICLE_IMAGE_SIZES = '(min-width: 768px) 760px, 100vw';
const LAZY_ARTICLE_IMAGE_SIZES = `auto, ${ARTICLE_IMAGE_SIZES}`;

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

describe('Responsive image pipeline', () => {
  it('is configured to produce at least one modern format and several widths', () => {
    // Guards the expectations themselves: if the defaults (or a CI override) were
    // reduced to the original format only, the assertions below would test nothing.
    expect(MODERN_SOURCE_TYPES.length).toBeGreaterThan(0);
    expect(CONFIGURED_WIDTHS.length).toBeGreaterThan(0);
  });

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

    // Two images written side by side in one paragraph (`![typedoc-1](…) ![typedoc-2](…)`) used to
    // come out reversed; unit coverage of the transform is in wrap-pictures.test.js.
    it('keeps side-by-side images of one paragraph in source order', () => {
      const $ = loadPage('/documenting-angular-apps-with-typedoc-compodoc-and-angulardoc/');
      const alts = $(`${IN_POST_SELECTOR} > img`)
        .toArray()
        .map((img) => $(img).attr('alt'))
        .filter((alt) => alt.startsWith('typedoc-'));

      expect(alts).toEqual(['typedoc-1', 'typedoc-2']);
    });

    // `![alt](x.png "Caption")`: the markdown title survives eleventy-img and becomes the caption
    it('renders a captioned image as a figure with a figcaption, with no title tooltip left', () => {
      const $ = loadPage('/java-by-comparison-book-review/');
      const $figure = $('main.post > article > figure.image-figure');
      expect($figure.length).toBe(1);
      expect($figure.find('> .image-wrapper > picture > img').attr('alt')).toMatch(/^Two facing pages/);
      expect($figure.find('> figcaption.image-caption').text()).toBe(
        'A two-page spread from Java by Comparison (The Pragmatic Bookshelf)',
      );

      for (const postPath of POSTS_WITH_IMAGES) {
        expect(loadPage(postPath)('article img[title]').length, postPath).toBe(0);
      }
    });
  });

  describe('Modern formats (image plugin)', () => {
    it('emits modern-format sources before the original-format <img> fallback', () => {
      for (const postPath of POSTS_WITH_IMAGES) {
        const $ = loadPage(postPath);

        for (const { $pic } of collectPictures($, IN_POST_SELECTOR)) {
          const types = $pic
            .find('source')
            .map((_, el) => $(el).attr('type'))
            .get();

          // Order matters: the browser picks the first source it supports,
          // so avif must precede webp and both must precede the <img> fallback.
          expect(types, `Unexpected source formats in ${postPath}`).toEqual(MODERN_SOURCE_TYPES);
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

    it('points the <img> fallback src at the largest srcset candidate, which crawlers index', () => {
      // eleventy-img writes the smallest width into src; largest-img-src-transform.js swaps it.
      for (const postPath of POSTS_WITH_IMAGES) {
        const $ = loadPage(postPath);

        for (const { $img } of collectPictures($, `${FEATURED_SELECTOR}, ${IN_POST_SELECTOR}`)) {
          const candidates = parseSrcset($img.attr('srcset'));
          const largest = candidates.reduce((a, b) => (b.width > a.width ? b : a));
          expect($img.attr('src'), `src is not the largest variant in ${postPath}`).toBe(largest.url);
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

        for (const { $pic, $img } of collectPictures($, ARTICLE_IMAGES_SELECTOR)) {
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
            const widths = entries.map((entry) => entry.width);
            for (const width of widths) {
              expect(
                CONFIGURED_WIDTHS.includes(width) || width === originalWidth,
                `Unexpected width ${width} in ${postPath}`,
              ).toBe(true);
            }

            // ...and every configured breakpoint narrower than the original must be present
            // (eleventy-img skips only the ones that would upscale).
            for (const width of CONFIGURED_WIDTHS.filter((candidate) => candidate < originalWidth)) {
              expect(widths, `Configured width ${width} missing from srcset in ${postPath}`).toContain(width);
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

        for (const { $pic, $img } of collectPictures($, ARTICLE_IMAGES_SELECTOR)) {
          const imgSizes = $img.attr('sizes');
          expect(imgSizes, `Missing sizes on <img> in ${postPath}`).toBeTruthy();

          $pic.find('source').each((_, el) => {
            expect($(el).attr('sizes'), `Missing sizes on <source> in ${postPath}`).toBe(imgSizes);
          });
        }
      }
    });

    it('measures lazy in-post images with sizes="auto"; the eager featured image declares its width', () => {
      for (const postPath of POSTS_WITH_IMAGES) {
        const $ = loadPage(postPath);
        const featured = collectPictures($, FEATURED_SELECTOR);
        const inPost = collectPictures($, IN_POST_SELECTOR);
        expect(featured.length, postPath).toBe(1);
        expect(inPost.length, postPath).toBeGreaterThan(0);

        for (const { $img } of featured) {
          expect($img.attr('loading'), postPath).toBe('eager');
          expect($img.attr('sizes'), postPath).toBe(ARTICLE_IMAGE_SIZES);
        }
        for (const { $img } of inPost) {
          expect($img.attr('loading'), postPath).toBe('lazy');
          expect($img.attr('sizes'), postPath).toBe(LAZY_ARTICLE_IMAGE_SIZES);
        }
      }
    });
  });

  describe('Card and navigation thumbnails', () => {
    const builtPages = globSync('**/index.html', { cwd: SITE_DIR, posix: true })
      .filter((file) => !file.startsWith('pagefind/'))
      .map((file) => `/${file.replace(/index\.html$/, '')}`);

    /** Every <picture> with a srcset in the build, with the page it is on. */
    const allPictures = builtPages.flatMap((pagePath) => {
      const $ = loadPage(pagePath);
      return collectPictures($, 'picture')
        .filter(({ $img }) => $img.attr('srcset'))
        .map((picture) => ({ ...picture, $, pagePath }));
    });
    const thumbnails = allPictures.filter(({ $img }) => $img.attr('sizes') in THUMBNAIL_WIDTHS);

    it('every responsive image in the build is either an article image or a known thumbnail kind', () => {
      const unknown = allPictures
        .filter(
          ({ $img }) =>
            !($img.attr('sizes') in THUMBNAIL_WIDTHS) &&
            ![ARTICLE_IMAGE_SIZES, LAZY_ARTICLE_IMAGE_SIZES].includes($img.attr('sizes')),
        )
        .map(({ $img, pagePath }) => `${pagePath}: sizes="${$img.attr('sizes')}"`);

      // A new image context needs its own widths and sizes decided, and an entry above.
      expect(unknown).toEqual([]);
    });

    it('uses sizes="auto" only on lazy images, the only ones it is valid on', () => {
      const eagerAuto = allPictures
        .filter(({ $img }) => /^\s*auto\b/i.test($img.attr('sizes')) && $img.attr('loading') !== 'lazy')
        .map(({ pagePath }) => pagePath);
      expect(eagerAuto).toEqual([]);
    });

    it('gives thumbnails only their average colour as the LQIP placeholder, other images a tiny WebP', () => {
      // lqip-transform.js: at 56-160 px a blurred image is indistinguishable from one colour
      const wrong = allPictures
        .filter(({ $img }) => {
          const style = $img.attr('style') || '';
          return thumbnails.some((thumbnail) => thumbnail.$img === $img)
            ? !/^display:block;background-color:#[0-9a-f]{6};$/.test(style)
            : !style.includes("background-image:url('data:image/webp;base64,");
        })
        .map(({ $img, pagePath }) => `${pagePath}: sizes="${$img.attr('sizes')}" style="${$img.attr('style')}"`);
      expect(wrong).toEqual([]);
    });

    it.each(Object.keys(THUMBNAIL_WIDTHS))('thumbnails with sizes="%s" appear in the build', (sizes) => {
      expect(thumbnails.filter(({ $img }) => $img.attr('sizes') === sizes).length).toBeGreaterThan(0);
    });

    it('offer exactly their 1x and 2x widths in every format, named by width', () => {
      const problems = [];

      for (const { $, $pic, $img, pagePath } of thumbnails) {
        const sizes = $img.attr('sizes');
        const expected = THUMBNAIL_WIDTHS[sizes];
        const srcsets = [
          ...$pic
            .find('source')
            .map((_, el) => $(el).attr('srcset'))
            .get(),
          $img.attr('srcset'),
        ];

        expect($pic.find('source').length, `${pagePath}: modern-format sources`).toBe(MODERN_SOURCE_TYPES.length);

        for (const srcset of srcsets) {
          const entries = parseSrcset(srcset);
          const widths = entries.map((entry) => entry.width);
          if (JSON.stringify(widths) !== JSON.stringify(expected)) {
            problems.push(`${pagePath}: ${widths.join(',')} instead of ${expected.join(',')} (${sizes})`);
          }
          for (const { url, width } of entries) {
            if (!new RegExp(`-${width}\\.[a-z0-9]+$`).test(url)) {
              problems.push(`${pagePath}: ${url} is not named by its ${width}w descriptor`);
            }
          }
        }
      }

      expect(problems).toEqual([]);
    });

    it('declare the same sizes on every <source> and fall back to the 2x candidate', () => {
      for (const { $, $pic, $img, pagePath } of thumbnails) {
        const sizes = $img.attr('sizes');
        const largest = parseSrcset($img.attr('srcset')).at(-1);

        $pic.find('source').each((_, el) => {
          expect($(el).attr('sizes'), `${pagePath}: <source> sizes`).toBe(sizes);
        });
        expect($img.attr('src'), `${pagePath}: fallback src`).toBe(largest.url);
        expect(Number($img.attr('width')), `${pagePath}: intrinsic width`).toBe(largest.width);
        expect($img.attr('loading'), `${pagePath}: thumbnails are lazy`).toBe('lazy');
      }
    });

    it('reference files that exist in the build output', () => {
      const referenced = new Set();

      for (const { $, $pic, $img } of thumbnails) {
        referenced.add($img.attr('src'));
        for (const el of [...$pic.find('source').toArray(), $img.get(0)]) {
          for (const entry of parseSrcset($(el).attr('srcset'))) {
            referenced.add(entry.url);
          }
        }
      }

      expect(referenced.size).toBeGreaterThan(50);
      const missing = [...referenced].filter((url) => !existsSync(toOutputPath(url)));
      expect(missing).toEqual([]);
    });
  });

  describe('Generated files on disk', () => {
    it('every srcset candidate and fallback src resolves to a real file in the build output', () => {
      const referenced = new Set();

      for (const postPath of POSTS_WITH_IMAGES) {
        const $ = loadPage(postPath);

        for (const { $pic, $img } of collectPictures($, ARTICLE_IMAGES_SELECTOR)) {
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

  describe('LQIP placeholders (lqip-transform)', () => {
    const WEBP_PLACEHOLDER = /background-image:url\('data:image\/webp;base64,([^']+)'\)/;

    it('puts a tiny inline WebP behind every featured and in-post image', () => {
      for (const postPath of POSTS_WITH_IMAGES) {
        const $ = loadPage(postPath);
        const pictures = collectPictures($, ARTICLE_IMAGES_SELECTOR);

        expect(pictures.length).toBeGreaterThan(0);

        for (const { $img } of pictures) {
          expect($img.hasClass('lqip'), `Missing lqip class in ${postPath}`).toBe(true);

          const style = $img.attr('style') || '';
          expect(style, `LQIP should be an inline WebP data URI in ${postPath}`).toMatch(WEBP_PLACEHOLDER);
          expect(style).toContain('background-size:cover');
        }
      }
    });

    it('encodes a WebP of about 160 pixels in the aspect ratio of the image, in a few hundred bytes', async () => {
      const $ = loadPage('/css-position/');
      const { $img } = collectPictures($, IN_POST_SELECTOR)[0];
      const webp = Buffer.from(WEBP_PLACEHOLDER.exec($img.attr('style'))[1], 'base64');
      const { format, width, height } = await sharp(webp).metadata();

      expect(format).toBe('webp');
      expect(width * height).toBeGreaterThan(100);
      expect(width * height).toBeLessThan(400);
      const imageAspect = Number($img.attr('width')) / Number($img.attr('height'));
      expect(Math.abs(width / height - imageAspect)).toBeLessThan(imageAspect * 0.3);
      expect(webp.length).toBeLessThan(400);
    });

    it('keeps placeholders a small part of every page', () => {
      // The old SVG mosaics were ~13 KB each and two thirds of all HTML (a topic page: 533 of 611 KB)
      const pages = globSync(`${SITE_DIR}/**/*.html`);
      expect(pages.length).toBeGreaterThan(100);
      const over = [];
      for (const file of pages) {
        const html = readFileSync(file, 'utf8');
        const placeholders = [...html.matchAll(/background-(?:image:url\('data:[^']*'\)|color:#[0-9a-f]{6})/g)];
        const bytes = placeholders.reduce((sum, [match]) => sum + match.length, 0);
        if (bytes > html.length * 0.1) {
          over.push(`${file}: ${bytes} of ${html.length} bytes`);
        }
      }
      expect(over).toEqual([]);
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
