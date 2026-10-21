import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import sharp from 'sharp';
import { load } from 'cheerio';

// Unit tests for config/html-transform/lqip-transform.js on synthetic HTML and generated images, so
// the placeholder colours are known exactly. The transform reads built images from ELEVENTY_OUTPUT_DIR,
// which it resolves once at import, so it points at a temporary directory before the module is loaded.
// The built pages are covered by tests/images.test.js and tests/lqip-browser.test.js.

let outDir;
let lqipTransform;
let computeGrid;
let isThumbnail;

const OUTPUT_PATH = '_site/post/index.html';

/** A solid-colour PNG, or one with a black left and white right half. */
async function writeImage(name, { width = 32, height = 20, color = '#ff0000', split = false } = {}) {
  const image = sharp({ create: { width, height, channels: 3, background: split ? '#000000' : color } });
  const composed = split
    ? image.composite([
        {
          input: await sharp({
            create: { width: width / 2, height, channels: 3, background: '#ffffff' },
          })
            .png()
            .toBuffer(),
          left: width / 2,
          top: 0,
        },
      ])
    : image;
  await composed.png().toFile(join(outDir, name));
}

const picture = (img, source = '') => `<p>text</p><picture>${source}${img}</picture>`;

/** The WebP inside the <img>'s inline background-image data URI, if any. */
const placeholderWebp = ($img) => {
  const match = /url\('data:image\/webp;base64,([^']+)'\)/.exec($img.attr('style') || '');
  return match ? Buffer.from(match[1], 'base64') : null;
};

/**
 * The <img> after the transform, and its placeholder: the tiny WebP decoded (size, bytes, one RGB
 * triple per pixel, row by row), or the thumbnail's average colour.
 */
async function transform(html) {
  const $ = load(await lqipTransform(html, OUTPUT_PATH));
  const $img = $('img').first();
  const color = /background-color:(#[0-9a-f]{6});/.exec($img.attr('style') || '')?.[1];
  const webp = placeholderWebp($img);
  if (!webp) {
    return { $img, color };
  }
  const { data, info } = await sharp(webp).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const pixels = [];
  for (let i = 0; i < data.length; i += 3) {
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }
  return { $img, width: info.width, height: info.height, bytes: webp.length, pixels };
}

/** Each channel within `tolerance` of the expected one: the placeholder is lossy WebP. */
const near = (actual, expected, tolerance = 12) => actual.every((v, i) => Math.abs(v - expected[i]) <= tolerance);

beforeAll(async () => {
  outDir = mkdtempSync(join(tmpdir(), 'lqip-'));
  vi.stubEnv('ELEVENTY_OUTPUT_DIR', outDir);
  ({ lqipTransform, computeGrid, isThumbnail } = await import('../config/html-transform/lqip-transform.js'));
  await writeImage('red.png');
  await writeImage('split.png', { width: 40, height: 20, split: true });
});

afterAll(() => {
  vi.unstubAllEnvs();
  rmSync(outDir, { recursive: true, force: true });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('computeGrid', () => {
  it.each([
    [16 / 10, { gridW: 16, gridH: 10 }],
    [16 / 9, { gridW: 17, gridH: 10 }],
    [1, { gridW: 13, gridH: 13 }],
  ])('fits about 160 pixels to aspect ratio %d', (aspect, grid) => {
    expect(computeGrid(aspect)).toEqual(grid);
  });

  it('keeps at least 8 pixels on the shorter side', () => {
    expect(computeGrid(1 / 4)).toEqual({ gridW: 8, gridH: 32 });
    expect(computeGrid(4)).toEqual({ gridW: 25, gridH: 8 });
  });

  it('does not cap the longer side of an extreme ratio (a strip 700 × 52 px gets 368 pixels)', () => {
    // The shorter side is clamped, the longer one is not; in a WebP that costs a few bytes
    const { gridW, gridH } = computeGrid(700 / 52);
    expect([gridW, gridH]).toEqual([46, 8]);
  });
});

describe('isThumbnail', () => {
  it.each(['80px', '56px', '(max-width: 768px) 90px, 160px', 'auto, 200px'])('%s is a thumbnail', (sizes) => {
    expect(isThumbnail(sizes)).toBe(true);
  });

  it.each([
    'auto, (min-width: 768px) 760px, 100vw',
    '(min-width: 768px) 760px, 100vw',
    '(max-width: 768px) 90px, 400px',
    '10em',
    'auto',
    '',
    undefined,
  ])('%s is not', (sizes) => {
    expect(isThumbnail(sizes)).toBe(false);
  });
});

describe('lqipTransform', () => {
  it('puts a tiny WebP of the image behind the <img>, sized from its width and height', async () => {
    const { $img, width, height, bytes, pixels } = await transform(
      picture('<img src="/red.png" width="1600" height="1000" alt="x" sizes="auto, 760px">'),
    );

    expect([width, height]).toEqual([16, 10]);
    expect(bytes).toBeLessThan(300);
    expect(
      pixels.every((rgb) => near(rgb, [255, 0, 0])),
      JSON.stringify(pixels),
    ).toBe(true);
    expect($img.hasClass('lqip')).toBe(true);
    // No inline handler (the CSP allows none): src/scripts/lqip.js ends the placeholder
    expect($img.attr('onload')).toBeUndefined();
    expect($img.attr('style')).toMatch(/^display:block;background-image:url\('data:image\/webp;base64,/);
  });

  it('keeps the pixels in place: a black left half and a white right half', async () => {
    const { width, height, pixels } = await transform(picture('<img src="/split.png" width="200" height="100">'));

    expect([width, height]).toEqual(Object.values(computeGrid(2)));
    // Resampling and the lossy encoding soften the edge, so compare brightness away from it
    for (let y = 0; y < height; y++) {
      const row = pixels.slice(y * width, (y + 1) * width).map(([r]) => r);
      expect(
        row.slice(0, width / 2 - 2).every((v) => v < 0x20),
        `row ${y} left: ${row}`,
      ).toBe(true);
      expect(
        row.slice(width / 2 + 2).every((v) => v > 0xe0),
        `row ${y} right: ${row}`,
      ).toBe(true);
    }
  });

  it('gives a thumbnail (every sizes slot at most 200 px) its average colour instead', async () => {
    const red = await transform(picture('<img src="/red.png" width="1600" height="1000" sizes="80px">'));
    expect(red.$img.attr('style')).toBe('display:block;background-color:#ff0000;');
    expect(red.$img.hasClass('lqip')).toBe(true);

    const split = await transform(picture('<img src="/split.png" sizes="(max-width: 768px) 90px, 160px">'));
    const rgb = [1, 3, 5].map((i) => parseInt(split.color.slice(i, i + 2), 16));
    expect(near(rgb, [128, 128, 128], 4), split.color).toBe(true);
  });

  it('keeps transparency, so the dark placeholder background shows through it', async () => {
    await sharp({ create: { width: 32, height: 20, channels: 4, background: { r: 0, g: 0, b: 255, alpha: 0 } } })
      .png()
      .toFile(join(outDir, 'clear.png'));
    const { $img } = await transform(picture('<img src="/clear.png" width="32" height="20">'));
    const { isOpaque, channels } = await sharp(placeholderWebp($img)).stats();

    expect(isOpaque).toBe(false);
    expect(channels[3].max).toBe(0);
  });

  it('assumes 16:9 when the <img> has no dimensions', async () => {
    const { width, height } = await transform(picture('<img src="/red.png">'));
    expect([width, height]).toEqual(Object.values(computeGrid(16 / 9)));
  });

  it('reads the smallest candidate: the first <source> srcset entry, then the <img> srcset, then src', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const missingElsewhere = [
      picture(
        '<img src="/missing-a.png" srcset="/missing-b.png 400w">',
        '<source type="image/avif" srcset="/red.png 400w, /missing-c.png 800w">',
      ),
      picture('<img src="/missing-a.png" srcset="/red.png 400w, /missing-b.png 800w">'),
      picture('<img src="/red.png">'),
    ];
    for (const html of missingElsewhere) {
      const { $img } = await transform(html);
      expect($img.hasClass('lqip'), html).toBe(true);
    }
    expect(error).not.toHaveBeenCalled();
  });

  it("keeps the author's own style after the placeholder, so it wins, and leaves other attributes alone", async () => {
    const { $img } = await transform(
      picture('<img src="/red.png" class="card" style="object-fit:contain;" onload="window.seen=1;">'),
    );

    expect($img.attr('style')).toMatch(/background-repeat:no-repeat;object-fit:contain;$/);
    expect($img.attr('onload')).toBe('window.seen=1;');
    expect($img.attr('class')).toBe('card lqip');

    const thumbnail = await transform(picture('<img src="/red.png" sizes="80px" style="object-fit:contain;">'));
    expect(thumbnail.$img.attr('style')).toBe('display:block;background-color:#ff0000;object-fit:contain;');
  });

  it('handles every <picture> on the page', async () => {
    const html = picture('<img src="/red.png">') + picture('<img src="/split.png">');
    const $ = load(await lqipTransform(html, OUTPUT_PATH));
    expect($('img.lqip')).toHaveLength(2);
  });

  it('logs a missing image and leaves its <img> as it was, without failing the build', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { $img } = await transform(picture('<img src="/nowhere.png" alt="x">'));

    expect($img.attr('style')).toBeUndefined();
    expect($img.hasClass('lqip')).toBe(false);
    expect(error).toHaveBeenCalledWith('LQIP error for', '/nowhere.png', expect.any(Error));
  });

  it('reuses the placeholder of an image already seen on another page', async () => {
    await writeImage('cached.png', { color: '#00ff00' });
    const first = await transform(picture('<img src="/cached.png">'));
    const firstThumbnail = await transform(picture('<img src="/cached.png" sizes="80px">'));
    rmSync(join(outDir, 'cached.png'));
    const second = await transform(picture('<img src="/cached.png">'));
    const secondThumbnail = await transform(picture('<img src="/cached.png" sizes="80px">'));

    expect(second.$img.hasClass('lqip')).toBe(true);
    expect(second.$img.attr('style')).toBe(first.$img.attr('style'));
    expect(secondThumbnail.color).toBe('#00ff00');
    expect(secondThumbnail.$img.attr('style')).toBe(firstThumbnail.$img.attr('style'));
  });

  it('does not remember a failure: a later page retries the image', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const before = await transform(picture('<img src="/later.png">'));
    expect(before.$img.hasClass('lqip')).toBe(false);

    await writeImage('later.png', { color: '#0000ff' });
    const after = await transform(picture('<img src="/later.png">'));
    expect(after.pixels.every((rgb) => near(rgb, [0, 0, 255]))).toBe(true);
  });

  it('in serve mode reads the source image named by an /.11ty/image URL', async () => {
    const src = encodeURIComponent('./src/static/favicon.png');
    const { $img, pixels } = await transform(picture(`<img src="/.11ty/image/?src=${src}&width=400&format=png">`));

    expect($img.hasClass('lqip')).toBe(true);
    expect(pixels.length).toBeGreaterThan(0);
  });

  it.each([
    ['a non-HTML output', '<picture><img src="/red.png"></picture>', '_site/feed.xml'],
    ['a page without <picture>', '<p><img src="/red.png"></p>', OUTPUT_PATH],
    ['no output path', '<picture><img src="/red.png"></picture>', undefined],
  ])('passes %s through untouched', async (_, html, outputPath) => {
    expect(await lqipTransform(html, outputPath)).toBe(html);
  });

  it('skips a <picture> without an <img> or without any image URL', async () => {
    const $ = load(await lqipTransform(picture('<source srcset="/red.png">') + picture('<img alt="x">'), OUTPUT_PATH));
    expect($('.lqip')).toHaveLength(0);
  });
});
