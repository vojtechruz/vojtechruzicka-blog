import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium } from 'playwright';
import { serveSite } from './static-server.js';
import { configurePlaywrightBrowserPath } from '../config/env-utils.js';

/**
 * Arrow-key navigation of search results against the real Pagefind UI and index (the jsdom tests in
 * search-script.test.js use a stub that only mimics its markup).
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

const focused = (page) =>
  page.evaluate(() => {
    const el = document.activeElement;
    return { className: el.className, href: el.getAttribute('href') };
  });

describe('Search results keyboard navigation', () => {
  it('moves from the input through the results, "Load more" and back with the arrow keys', async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    try {
      await page.goto(server.baseUrl + '/search/?q=java', { waitUntil: 'load' });
      const links = page.locator('#search-page .pagefind-ui__result-link');
      await links.nth(1).waitFor();
      const [first, second] = [await links.nth(0).getAttribute('href'), await links.nth(1).getAttribute('href')];

      await page.locator('#search-page .pagefind-ui__search-input').focus();
      await page.keyboard.press('ArrowDown');
      expect(await focused(page)).toMatchObject({ href: first });
      await page.keyboard.press('ArrowDown');
      expect(await focused(page)).toMatchObject({ href: second });
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('ArrowUp');
      expect((await focused(page)).className).toContain('pagefind-ui__search-input');

      // "Load more" comes after the results; using it moves focus to the first newly loaded one
      const shown = await links.count();
      for (let i = 0; i <= shown; i++) {
        await page.keyboard.press('ArrowDown');
      }
      expect((await focused(page)).className).toContain('pagefind-ui__button');
      await page.keyboard.press('Enter');
      await page.waitForFunction(
        (n) => document.activeElement === document.querySelectorAll('#search-page .pagefind-ui__result-link')[n],
        shown,
      );
      await page.keyboard.press('ArrowUp');
      expect(await focused(page)).toMatchObject({ href: await links.nth(shown - 1).getAttribute('href') });
      for (let i = 0; i < shown; i++) {
        await page.keyboard.press('ArrowUp');
      }
      expect((await focused(page)).className).toContain('pagefind-ui__search-input');

      // Enter on a focused result follows it
      await page.keyboard.press('ArrowDown');
      await Promise.all([page.waitForURL((url) => url.pathname === first), page.keyboard.press('Enter')]);
    } finally {
      await context.close();
    }
  });
});

describe('Search input names', () => {
  it('keep their names, the shortcut hint and the clear button name once the real Pagefind UI has taken over and searched', async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    try {
      await page.goto(server.baseUrl + '/search/?q=java', { waitUntil: 'load' });
      await page.locator('#search-page .pagefind-ui__result-link').first().waitFor();

      // Open the header search by its shortcut and search, so Pagefind re-renders around the input
      // (shortcuts are ignored inside a field, and /search/ may have put focus in its own input)
      await page.evaluate(() => document.activeElement?.blur());
      await page.keyboard.press('Control+k');
      await page.waitForFunction(() => document.activeElement?.closest('#search'));
      await page.keyboard.type('spring');
      await page.locator('#search .pagefind-ui__result-link').first().waitFor();

      const attrs = (selector) =>
        page.locator(selector).evaluate((el) => ({
          name: el.getAttribute('aria-label'),
          title: el.getAttribute('title'),
          keys: el.getAttribute('aria-keyshortcuts'),
        }));
      // Two search inputs on the page, both rendered by Pagefind (no pre-rendered placeholder left)
      expect(await page.locator('.pagefind-ui__search-input').count()).toBe(2);
      expect(await attrs('#search .pagefind-ui__search-input')).toEqual({
        name: 'Search the site',
        title: 'Shortcut: / or Ctrl+K',
        // The title is read as the description: NVDA announced the shortcut twice with aria-keyshortcuts too
        keys: null,
      });
      expect(await attrs('#search-page .pagefind-ui__search-input')).toEqual({
        name: 'Search posts',
        title: null,
        keys: null,
      });
      // Pagefind's only content for the button is "×", which screen readers read as "times"
      expect(await page.locator('#search .pagefind-ui__search-clear').getAttribute('aria-label')).toBe('Clear search');
      expect(await page.locator('#search-page .pagefind-ui__search-clear').getAttribute('aria-label')).toBe(
        'Clear search',
      );
    } finally {
      await context.close();
    }
  });
});

describe('Search shortcut on a narrow screen', () => {
  it('opens the collapsed menu to reach the search, and Escape closes both and returns focus', async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    try {
      await page.goto(server.baseUrl + '/about/', { waitUntil: 'load' });
      const input = page.locator('#search .pagefind-ui__search-input');
      await expect.poll(() => input.isVisible()).toBe(false); // the menu starts collapsed

      // Shortcut from a link in the page, the origin focus should return to
      const origin = page.locator('main a[href]').first();
      await origin.focus();
      await page.keyboard.press('Control+k');

      await page.waitForFunction(() => document.activeElement?.matches('#search .pagefind-ui__search-input'));
      expect(await input.isVisible()).toBe(true);
      expect(await page.locator('.nav-toggle').getAttribute('aria-expanded')).toBe('true');

      // With results open, Escape clears them, closes the menu and goes back to the link
      await page.keyboard.type('java');
      await page.locator('#search .pagefind-ui__result-link').first().waitFor();
      await page.keyboard.press('Escape');

      await expect.poll(() => input.isVisible()).toBe(false);
      expect(await page.locator('.nav-toggle').getAttribute('aria-expanded')).toBe('false');
      expect(await origin.evaluate((el) => el === document.activeElement)).toBe(true);
    } finally {
      await context.close();
    }
  });
});

describe('Search loading before the first keystroke', () => {
  // The pre-rendered input is a placeholder that Pagefind replaces once its script has loaded. On a touch
  // screen nothing loaded it before the tap, so the input was swapped under the finger: the first letters
  // typed were lost, and iOS closed the keyboard.
  it('loads when the compact menu opens, without moving focus into the search', async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    try {
      await page.goto(server.baseUrl + '/about/', { waitUntil: 'load' });
      await page.tap('.nav-toggle');
      await page.locator('#search .pagefind-ui__drawer').waitFor({ state: 'attached' });
      expect(await page.evaluate(() => document.activeElement?.matches('.nav-toggle'))).toBe(true);

      // The input under the finger is already Pagefind's own: the tap focuses it and typing just works
      await page.tap('#search .pagefind-ui__search-input');
      await page.keyboard.type('java');
      await page.locator('#search .pagefind-ui__result-link').first().waitFor();
      expect(await page.locator('#search .pagefind-ui__search-input').inputValue()).toBe('java');
    } finally {
      await context.close();
    }
  });

  it('keeps what was typed into the placeholder while the script was still loading', async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    try {
      // A slow connection: the placeholder takes the keystrokes before Pagefind arrives
      await page.route('**/pagefind/pagefind-ui.js', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        await route.continue();
      });
      await page.goto(server.baseUrl + '/about/', { waitUntil: 'domcontentloaded' });
      await page.locator('#search .pagefind-ui__search-input').click();
      await page.keyboard.type('java');
      expect(await page.locator('#search .pagefind-ui__drawer').count()).toBe(0); // still the placeholder

      await page.locator('#search .pagefind-ui__result-link').first().waitFor();
      const input = page.locator('#search .pagefind-ui__search-input');
      expect(await input.inputValue()).toBe('java');
      expect(await input.evaluate((el) => el === document.activeElement)).toBe(true);
      expect(await page.locator('#search .pagefind-ui__message').textContent()).toContain("'java'");
    } finally {
      await context.close();
    }
  });
});

describe('Search overlay position', () => {
  // Where the overlay starts, and whether the input is still the element on top at its own centre
  const layout = (page) =>
    page.evaluate(() => {
      const input = document.querySelector('#search .pagefind-ui__search-input').getBoundingClientRect();
      const drawer = document.querySelector('#search .pagefind-ui__drawer').getBoundingClientRect();
      const hit = document.elementFromPoint(input.left + input.width / 2, input.top + input.height / 2);
      return {
        inputBottom: input.bottom,
        drawerTop: drawer.top,
        drawerBottom: drawer.bottom,
        inputOnTop: Boolean(hit?.closest('.pagefind-ui__search-input, .pagefind-ui__search-clear')),
      };
    });

  // In the open compact menu the input sits under the menu links, far below the overlay's usual 12dvh:
  // the overlay used to cover it, so the query disappeared as soon as the results appeared
  it('opens below the input in the compact menu, leaving the query visible', async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    try {
      await page.goto(server.baseUrl + '/about/', { waitUntil: 'load' });
      await page.tap('.nav-toggle');
      await page.tap('#search .pagefind-ui__search-input');
      // The tap loads Pagefind, which replaces the pre-rendered input; type once it has taken over
      await page.locator('#search .pagefind-ui__drawer').waitFor({ state: 'attached' });
      await page.waitForFunction(() => document.activeElement?.matches('#search .pagefind-ui__search-input'));
      await page.keyboard.type('java');
      await page.locator('#search .pagefind-ui__result-link').first().waitFor();

      const { inputBottom, drawerTop, drawerBottom, inputOnTop } = await layout(page);
      expect(drawerTop).toBeGreaterThanOrEqual(inputBottom);
      expect(inputOnTop).toBe(true);
      expect(drawerBottom).toBeLessThanOrEqual(844);
      // The menu links make way, so the input sits right under the top bar
      expect(await page.locator('.main-navigation .menu-items').isVisible()).toBe(false);
      expect(inputBottom).toBeLessThan(150);
    } finally {
      await context.close();
    }
  });

  it('leaves room for the results on a phone held sideways', async () => {
    const context = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    try {
      await page.goto(server.baseUrl + '/about/', { waitUntil: 'load' });
      await page.tap('.nav-toggle');
      await page.tap('#search .pagefind-ui__search-input');
      await page.locator('#search .pagefind-ui__drawer').waitFor({ state: 'attached' });
      await page.waitForFunction(() => document.activeElement?.matches('#search .pagefind-ui__search-input'));
      await page.keyboard.type('java');
      await page.locator('#search .pagefind-ui__result-link').first().waitFor();

      const { inputBottom, drawerTop, drawerBottom, inputOnTop } = await layout(page);
      expect(drawerTop).toBeGreaterThanOrEqual(inputBottom);
      expect(inputOnTop).toBe(true);
      expect(drawerBottom - drawerTop).toBeGreaterThan(150);

      // Clearing the query closes the results and brings the menu links back, menu still open
      await page.tap('#search .pagefind-ui__search-clear');
      await expect.poll(() => page.evaluate(() => document.body.classList.contains('search-open'))).toBe(false);
      expect(await page.locator('.main-navigation .menu-items').isVisible()).toBe(true);
    } finally {
      await context.close();
    }
  });

  it('keeps its place under the header on a wide screen', async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    try {
      await page.goto(server.baseUrl + '/about/', { waitUntil: 'load' });
      await page.keyboard.press('Control+k');
      await page.waitForFunction(() => document.activeElement?.matches('#search .pagefind-ui__search-input'));
      await page.keyboard.type('java');
      await page.locator('#search .pagefind-ui__result-link').first().waitFor();

      const { inputBottom, drawerTop, inputOnTop } = await layout(page);
      // 12dvh of 900 px: the header input ends above it, so the overlay does not move
      expect(drawerTop).toBeCloseTo(108, 0);
      expect(inputBottom).toBeLessThan(drawerTop);
      expect(inputOnTop).toBe(true);
    } finally {
      await context.close();
    }
  });
});

describe('Search overlay focus trap', () => {
  it('keeps Tab and Shift+Tab inside the open overlay, wrapping at both ends', async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    try {
      await page.goto(server.baseUrl + '/about/', { waitUntil: 'load' });
      await page.keyboard.press('Control+k');
      await page.waitForFunction(() => document.activeElement?.matches('#search .pagefind-ui__search-input'));
      await page.keyboard.type('java');
      await page.locator('#search .pagefind-ui__result-link').first().waitFor();

      // What really takes focus, by layout: every element Tab visits from the input
      const where = () =>
        page.evaluate(() => {
          const el = document.activeElement;
          return { inside: Boolean(el.closest('#search')), input: el.matches('.pagefind-ui__search-input') };
        });
      const stops = await page.$$eval(
        '#search :is(a[href], button, input)',
        (els) => els.filter((el) => el.checkVisibility() && !el.disabled).length,
      );
      expect(stops).toBeGreaterThan(3);

      // A full lap and a bit: never leaves the overlay, and comes back round to the input
      let backAtInput = false;
      for (let i = 0; i < stops + 2; i++) {
        await page.keyboard.press('Tab');
        const now = await where();
        expect(now.inside, `Tab ${i + 1}`).toBe(true);
        backAtInput ||= now.input;
      }
      expect(backAtInput, 'Tab wraps from the last stop to the input').toBe(true);

      // Backwards from the input wraps to the last stop, still inside
      await page.locator('#search .pagefind-ui__search-input').focus();
      await page.keyboard.press('Shift+Tab');
      expect(await where()).toEqual({ inside: true, input: false });
    } finally {
      await context.close();
    }
  });
});

describe('Escape in the search overlay on a wide screen', () => {
  // Pagefind's own Escape handler on the input clears the query and blurs the input before ours runs;
  // focus used to end up on <body>, with no visible focus anywhere
  const openAndEscape = async (page) => {
    await page.waitForFunction(() => document.activeElement?.matches('#search .pagefind-ui__search-input'));
    await page.keyboard.type('java');
    await page.locator('#search .pagefind-ui__result-link').first().waitFor();
    await page.keyboard.press('Escape');
    await expect.poll(() => page.evaluate(() => document.body.classList.contains('search-open'))).toBe(false);
  };

  it('returns focus to the link the shortcut was pressed on', async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    try {
      await page.goto(server.baseUrl + '/about/', { waitUntil: 'load' });
      const origin = page.locator('main a[href]').first();
      await origin.focus();
      await page.keyboard.press('/');
      await openAndEscape(page);
      expect(await origin.evaluate((el) => el === document.activeElement)).toBe(true);
    } finally {
      await context.close();
    }
  });

  // Nothing typed: no results are open, but Pagefind still blurs the input on Escape
  it.each([
    ['from a link', true],
    ['with nothing focused', false],
  ])('keeps a focus when Escape is pressed before typing anything, opened %s', async (_, fromLink) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    try {
      await page.goto(server.baseUrl + '/about/', { waitUntil: 'load' });
      const origin = page.locator('main a[href]').first();
      if (fromLink) {
        await origin.focus();
      }
      await page.keyboard.press('/');
      await page.waitForFunction(() => document.activeElement?.matches('#search .pagefind-ui__search-input'));
      await page.keyboard.press('Escape');
      const onInput = await page.evaluate(() => document.activeElement.matches('#search .pagefind-ui__search-input'));
      const onOrigin = await origin.evaluate((el) => el === document.activeElement);
      expect(fromLink ? onOrigin : onInput).toBe(true);
    } finally {
      await context.close();
    }
  });

  it('keeps focus in the emptied input when nothing had focus before', async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    try {
      await page.goto(server.baseUrl + '/about/', { waitUntil: 'load' });
      await page.keyboard.press('/');
      await openAndEscape(page);
      const state = await page.evaluate(() => ({
        input: document.activeElement.matches('#search .pagefind-ui__search-input'),
        value: document.activeElement.value,
      }));
      expect(state).toEqual({ input: true, value: '' });
    } finally {
      await context.close();
    }
  });
});
