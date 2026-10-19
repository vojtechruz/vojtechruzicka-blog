import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium } from 'playwright';
import { serveSite } from './static-server.js';
import { configurePlaywrightBrowserPath } from '../config/env-utils.js';

/**
 * Layout checks that need a real browser (jsdom has no layout): narrow-phone overflow,
 * the search overlay width, the floating copy button over long code lines and long TOC items.
 */

let server;
let browser;

beforeAll(async () => {
  server = await serveSite();
  configurePlaywrightBrowserPath();
  browser = await chromium.launch();
}, 60000);

afterAll(async () => {
  await browser?.close();
  await server?.close();
});

async function openPage(path, width) {
  const page = await browser.newPage({ viewport: { width, height: 800 } });
  await page.goto(server.baseUrl + path);
  return page;
}

describe('narrow phone (320 px)', () => {
  it('long inline code does not widen the page', async () => {
    // /css-flexbox/ has `justify-content: space-between;` inline, which overflowed by 10 px with nowrap
    const page = await openPage('/css-flexbox/', 320);
    try {
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(320);
    } finally {
      await page.close();
    }
  }, 30000);
});

describe('search overlay', () => {
  // Pagefind UI renders the drawer lazily, so measure the stylesheet on a stand-in element
  const drawerBox = (page) =>
    page.evaluate(() => {
      const drawer = document.createElement('div');
      drawer.className = 'pagefind-ui__drawer';
      document.body.append(drawer);
      const { left, right } = drawer.getBoundingClientRect();
      return { left, right };
    });

  it.each([320, 390])(
    'fits a %i px phone with a gutter',
    async (width) => {
      const page = await openPage('/', width);
      try {
        const { left, right } = await drawerBox(page);
        expect(left).toBeGreaterThanOrEqual(15);
        expect(right).toBeLessThanOrEqual(width - 15);
      } finally {
        await page.close();
      }
    },
    30000,
  );

  it('keeps the desktop width', async () => {
    const page = await openPage('/', 1440);
    try {
      const { left, right } = await drawerBox(page);
      expect(right - left).toBe(820);
    } finally {
      await page.close();
    }
  }, 30000);
});

describe('floating copy button', () => {
  it('sits above the first line of code, so a long line does not run into the icon', async () => {
    const page = await openPage('/css-flexbox/', 1280);
    try {
      const gap = await page.$eval('.code-block-container > .copy-code-button', (button) => {
        const icon = button.querySelector('svg').getBoundingClientRect();
        const line = button.parentElement.querySelector('pre .line').getBoundingClientRect();
        return line.top - icon.bottom;
      });
      // The line box has ~4 px of leading above the glyphs, so the icon may reach into that, not further
      expect(gap).toBeGreaterThanOrEqual(-4);
    } finally {
      await page.close();
    }
  }, 30000);

  it('is a target of at least 24 × 24 px (WCAG 2.5.8)', async () => {
    const page = await openPage('/css-flexbox/', 1280);
    try {
      const sizes = await page.$$eval('.copy-code-button', (buttons) =>
        buttons.map((button) => {
          const { width, height } = button.getBoundingClientRect();
          return { width, height };
        }),
      );
      expect(sizes.length).toBeGreaterThan(0);
      for (const { width, height } of sizes) {
        expect(width).toBeGreaterThanOrEqual(24);
        expect(height).toBeGreaterThanOrEqual(24);
      }
    } finally {
      await page.close();
    }
  }, 30000);

  it('gives every block with a floating button the extra top padding', async () => {
    const page = await openPage('/css-flexbox/', 1280);
    try {
      const paddings = await page.$$eval('.code-block-container:has(> .copy-code-button) > pre', (pres) =>
        pres.map((pre) => getComputedStyle(pre).paddingTop),
      );
      expect(paddings.length).toBeGreaterThan(0);
      expect(new Set(paddings)).toEqual(new Set(['20px']));
    } finally {
      await page.close();
    }
  }, 30000);
});

describe('sidebar table of contents', () => {
  it('wraps a long heading instead of cutting it off with an ellipsis', async () => {
    // /owasp-top-ten-2017/ has the longest TOC item (83 characters)
    const page = await openPage('/owasp-top-ten-2017/', 1100);
    try {
      const cut = await page.$$eval('.sidebar .toc-list a', (links) =>
        links.filter((a) => a.scrollWidth > a.clientWidth + 1).map((a) => a.textContent.trim()),
      );
      expect(cut).toEqual([]);
      const longest = page.locator('.sidebar .toc-list a', { hasText: 'Insecure Direct Object References' });
      const { height, lineHeight } = await longest.evaluate((a) => ({
        height: a.getBoundingClientRect().height,
        lineHeight: parseFloat(getComputedStyle(a).lineHeight),
      }));
      expect(height, 'the long item takes a second line').toBeGreaterThan(1.5 * lineHeight);
    } finally {
      await page.close();
    }
  }, 30000);
});

describe('search field outline', () => {
  const luminance = ([r, g, b]) => {
    const lin = (c) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  };
  const contrast = (a, b) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };

  // The outline is what shows where to type (the placeholder disappears with the first letter), so it
  // needs 3:1 (WCAG 1.4.11) against both the field and the bar or page around it
  it.each(['/', '/search/', '/404.html'])(
    'contrasts at least 3:1 with what it separates on %s',
    async (url) => {
      const page = await openPage(url, 1280);
      try {
        const fields = await page.$$eval('.pagefind-ui__search-input', (inputs) => {
          const rgb = (color) => color.match(/[\d.]+/g).slice(0, 3).map(Number);
          const opaque = (color) => !/rgba\(.*,\s*0\)|transparent/.test(color);
          // The colour behind an element: the nearest ancestor that paints a background
          const behind = (el) => {
            for (let node = el.parentElement; node; node = node.parentElement) {
              const bg = getComputedStyle(node).backgroundColor;
              if (opaque(bg)) {
                return rgb(bg);
              }
            }
            return rgb(getComputedStyle(document.documentElement).backgroundColor);
          };
          return inputs
            .filter((input) => input.checkVisibility())
            .map((input) => {
              const style = getComputedStyle(input);
              return { border: rgb(style.borderTopColor), field: rgb(style.backgroundColor), around: behind(input) };
            });
        });
        expect(fields.length).toBeGreaterThan(0);
        for (const { border, field, around } of fields) {
          expect(contrast(border, field), 'outline vs field').toBeGreaterThanOrEqual(3);
          expect(contrast(border, around), 'outline vs surroundings').toBeGreaterThanOrEqual(3);
        }
      } finally {
        await page.close();
      }
    },
    30000,
  );
});

describe('article image sizes', () => {
  // `sizes` tells the browser how wide an image will render before any CSS is in, and picks the srcset
  // candidate from it: it must not understate the real width (blurry) nor overstate it by much (a
  // bigger download; `100vw` once sent 768-1023 px tablets the full-size original). Checked on a
  // featured and in-post images at a phone, both tablet ends and desktop widths.
  it.each([390, 768, 1023, 1280, 1920])(
    'match the rendered width at %i px',
    async (width) => {
      const page = await openPage('/idea-compare-files-and-folders/', width);
      try {
        const images = await page.$$eval('.post-header-featured-image, .content .image-wrapper img', (imgs) =>
          imgs.map((img) => {
            // The width the sizes attribute declares for this viewport: first matching media condition
            const declared = img
              .getAttribute('sizes')
              .split(',')
              .map((entry) => entry.trim().match(/^(\(.+\))?\s*(\d+)(px|vw)$/))
              .find(([, media]) => !media || matchMedia(media).matches);
            const [, , value, unit] = declared;
            return {
              rendered: img.getBoundingClientRect().width,
              declared: unit === 'vw' ? (innerWidth * value) / 100 : Number(value),
            };
          }),
        );
        expect(images.length).toBeGreaterThan(2);
        // Hidden ones (card thumbnails under 480 px) are lazy and never download
        for (const { rendered, declared } of images.filter((image) => image.rendered > 0)) {
          expect(declared, 'sizes understates the width').toBeGreaterThanOrEqual(rendered);
          expect(declared, 'sizes overstates the width by more than 25 %').toBeLessThanOrEqual(rendered * 1.25);
        }
      } finally {
        await page.close();
      }
    },
    30000,
  );
});
