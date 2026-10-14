import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import sharp from 'sharp';
import { load } from 'cheerio';

// Unit tests for config/html-transform/lqip-svg-transform.js on synthetic HTML and generated images, so
// the mosaic colours are known exactly. The transform reads built images from ELEVENTY_OUTPUT_DIR, which
// it resolves once at import, so it points at a temporary directory before the module is loaded.
// The built pages are covered by tests/images.test.js and tests/lqip-browser.test.js.

let outDir;
let lqipSvgTransform;
let computeGrid;

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

/** The <img> after the transform, and its mosaic decoded: grid size and one fill per cell, row by row. */
async function transform(html) {
  const $ = load(await lqipSvgTransform(html, OUTPUT_PATH));
  const $img = $('img').first();
  const match = /url\('data:image\/svg\+xml;base64,([^']+)'\)/.exec($img.attr('style') || '');
  if (!match) {
    return { $img };
  }
  const svg = Buffer.from(match[1], 'base64').toString('utf-8');
  const [, width, height] = /viewBox="0 0 (\d+) (\d+)"/.exec(svg).map(Number);
  const fills = [...svg.matchAll(/fill="(#[0-9a-f]{6})"/g)].map((m) => m[1]);
  return { $img, width, height, fills };
}

beforeAll(async () => {
  outDir = mkdtempSync(join(tmpdir(), 'lqip-'));
  vi.stubEnv('ELEVENTY_OUTPUT_DIR', outDir);
  ({ lqipSvgTransform, computeGrid } = await import('../config/html-transform/lqip-svg-transform.js'));
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
  ])('fits about 160 cells to aspect ratio %d', (aspect, grid) => {
    expect(computeGrid(aspect)).toEqual(grid);
  });

  it('keeps at least 8 cells on the shorter side', () => {
    expect(computeGrid(1 / 4)).toEqual({ gridW: 8, gridH: 32 });
    expect(computeGrid(4)).toEqual({ gridW: 25, gridH: 8 });
  });

  it('does not cap the longer side of an extreme ratio (a strip 700 × 52 px gets 368 cells)', () => {
    // Known cost, open in the LQIP notes: the shorter side is clamped, the longer one is not
    const { gridW, gridH } = computeGrid(700 / 52);
    expect([gridW, gridH]).toEqual([46, 8]);
  });
});

describe('lqipSvgTransform', () => {
  it('puts a mosaic of the image behind the <img>, sized from its width and height', async () => {
    const { $img, width, height, fills } = await transform(
      picture('<img src="/red.png" width="1600" height="1000" alt="x">'),
    );

    expect([width, height]).toEqual([16, 10]);
    expect(fills).toHaveLength(16 * 10);
    expect(new Set(fills)).toEqual(new Set(['#ff0000']));
    expect($img.hasClass('lqip')).toBe(true);
    expect($img.attr('onload')).toBe('this.dataset.loaded=1;');
    expect($img.attr('style')).toMatch(/^display:block;background-image:url\('data:image\/svg\+xml;base64,/);
  });

  it('keeps the cells in place: a black left half and a white right half', async () => {
    const { width, height, fills } = await transform(picture('<img src="/split.png" width="200" height="100">'));

    expect([width, height]).toEqual(Object.values(computeGrid(2)));
    // Resampling softens the edge and rings a little (#010101, #fefefe), so compare brightness
    const brightness = (fill) => parseInt(fill.slice(1, 3), 16);
    for (let y = 0; y < height; y++) {
      const row = fills.slice(y * width, (y + 1) * width).map(brightness);
      expect(
        row.slice(0, width / 2 - 1).every((v) => v < 0x20),
        `row ${y} left: ${row}`,
      ).toBe(true);
      expect(
        row.slice(width / 2 + 1).every((v) => v > 0xe0),
        `row ${y} right: ${row}`,
      ).toBe(true);
    }
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

  it("keeps the author's own style after the mosaic, so it wins, and chains an existing onload", async () => {
    const { $img } = await transform(
      picture('<img src="/red.png" class="card" style="object-fit:contain;" onload="window.seen=1;">'),
    );

    expect($img.attr('style')).toMatch(/background-repeat:no-repeat;object-fit:contain;$/);
    expect($img.attr('onload')).toBe('window.seen=1;this.dataset.loaded=1;');
    expect($img.attr('class')).toBe('card lqip');
  });

  it('handles every <picture> on the page', async () => {
    const html = picture('<img src="/red.png">') + picture('<img src="/split.png">');
    const $ = load(await lqipSvgTransform(html, OUTPUT_PATH));
    expect($('img.lqip')).toHaveLength(2);
  });

  it('logs a missing image and leaves its <img> as it was, without failing the build', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { $img } = await transform(picture('<img src="/nowhere.png" alt="x">'));

    expect($img.attr('style')).toBeUndefined();
    expect($img.hasClass('lqip')).toBe(false);
    expect(error).toHaveBeenCalledWith('LQIP error for', '/nowhere.png', expect.any(Error));
  });

  it('reuses the mosaic of an image already seen on another page', async () => {
    await writeImage('cached.png', { color: '#00ff00' });
    const first = await transform(picture('<img src="/cached.png">'));
    rmSync(join(outDir, 'cached.png'));
    const second = await transform(picture('<img src="/cached.png">'));

    expect(second.$img.hasClass('lqip')).toBe(true);
    expect(second.fills).toEqual(first.fills);
  });

  it('does not remember a failure: a later page retries the image', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const before = await transform(picture('<img src="/later.png">'));
    expect(before.$img.hasClass('lqip')).toBe(false);

    await writeImage('later.png', { color: '#0000ff' });
    const after = await transform(picture('<img src="/later.png">'));
    expect(new Set(after.fills)).toEqual(new Set(['#0000ff']));
  });

  it('in serve mode reads the source image named by an /.11ty/image URL', async () => {
    const src = encodeURIComponent('./src/static/favicon.png');
    const { $img, fills } = await transform(picture(`<img src="/.11ty/image/?src=${src}&width=400&format=png">`));

    expect($img.hasClass('lqip')).toBe(true);
    expect(fills.length).toBeGreaterThan(0);
  });

  it.each([
    ['a non-HTML output', '<picture><img src="/red.png"></picture>', '_site/feed.xml'],
    ['a page without <picture>', '<p><img src="/red.png"></p>', OUTPUT_PATH],
    ['no output path', '<picture><img src="/red.png"></picture>', undefined],
  ])('passes %s through untouched', async (_, html, outputPath) => {
    expect(await lqipSvgTransform(html, outputPath)).toBe(html);
  });

  it('skips a <picture> without an <img> or without any image URL', async () => {
    const $ = load(
      await lqipSvgTransform(picture('<source srcset="/red.png">') + picture('<img alt="x">'), OUTPUT_PATH),
    );
    expect($('.lqip')).toHaveLength(0);
  });
});
