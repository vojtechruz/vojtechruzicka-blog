import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium } from 'playwright';
import { serveSite } from './static-server.js';
import { configurePlaywrightBrowserPath } from '../config/env-utils.js';

/**
 * The copy button in a real browser, against the clipboard: every block on a post must paste back exactly
 * as its Shiki lines read, blank lines included. It used to copy `pre.innerText`, whose line breaks depend
 * on layout, and in the grid of _code.scss that silently dropped blank lines; jsdom has no layout, so only
 * a browser shows what the reader really gets.
 */

const PAGE = '/java-records/'; // Java and shell blocks, with blank lines inside them

let server;
let browser;
let context;
let page;

beforeAll(async () => {
  server = await serveSite();
  configurePlaywrightBrowserPath();
  browser = await chromium.launch();
  context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: server.baseUrl });
  page = await context.newPage();
  await page.goto(server.baseUrl + PAGE, { waitUntil: 'load' });
}, 60000);

afterAll(async () => {
  await context?.close();
  await browser?.close();
  await server?.close();
});

/** What the reader should get: the block's lines as Shiki rendered them, one per line. */
const expectedText = (index) =>
  page.$$eval(
    '.code-block-container',
    (containers, i) => Array.from(containers[i].querySelectorAll('pre .line'), (line) => line.textContent).join('\n'),
    index,
  );

async function copyBlock(index) {
  // Clear first, so a copy that silently fails cannot pass on the previous block's text
  await page.evaluate(() => navigator.clipboard.writeText(''));
  const button = page.locator('.code-block-container .copy-code-button').nth(index);
  await button.scrollIntoViewIfNeeded();
  await button.click();
  await page.waitForFunction(async () => (await navigator.clipboard.readText()) !== '');
  return page.evaluate(() => navigator.clipboard.readText());
}

describe('copy button in a real browser', () => {
  it('copies every code block line for line, blank lines included', async () => {
    const count = await page.locator('.code-block-container').count();
    expect(count).toBeGreaterThan(3);

    let blankLines = 0;
    for (let i = 0; i < count; i++) {
      const expected = await expectedText(i);
      const copied = await copyBlock(i);
      // The Windows clipboard stores line breaks as CRLF
      expect(copied.replace(/\r\n/g, '\n'), `block ${i}`).toBe(expected);
      blankLines += expected.split('\n').filter((line) => line === '').length;
    }
    expect(blankLines, 'the page must still exercise blank lines inside a block').toBeGreaterThan(0);
  }, 60000);

  it('shows the copied state on the button', async () => {
    const button = page.locator('.code-block-container .copy-code-button').first();
    await copyBlock(0);

    await expect.poll(() => button.getAttribute('aria-label')).toBe('Copied!');
    expect(await button.getAttribute('title')).toBe('Copied!');
    expect(await button.evaluate((el) => el.classList.contains('copied'))).toBe(true);
  });
});
