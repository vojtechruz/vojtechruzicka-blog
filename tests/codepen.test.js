import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { globSync } from 'glob';
import codepen, { codepenCalls, posterFilename } from '../config/shortcodes/codepen.js';

// The shortcode looks for the poster next to the page being rendered
const onPage = (inputPath, ...args) => codepen.call({ page: { inputPath } }, ...args);
const CSS_POSITION = './src/posts/css/css-position/index.md';

describe('codepen shortcode', () => {
  it('keeps the embed URL for the script to load on click', () => {
    const result = codepen('yMdQpQ');
    expect(result).toContain(
      'data-codepen-src="https://codepen.io/vojtechruz/embed/yMdQpQ?default-tab=result&amp;height=400"',
    );
    expect(result).toContain('data-codepen-height="400"');
    expect(result).toContain('style="height: 400px"');
    // Nothing from codepen.io until the reader asks for it
    expect(result).not.toContain('<iframe');
  });

  it('should show caption by default', () => {
    const result = codepen('slug', 'A Cool Pen');
    expect(result).toContain('<figcaption');
    expect(result).toContain('A Cool Pen');
    expect(result).toMatch(/<figcaption id="(cp-caption-\d+)"[\s\S]*data-codepen-labelledby="\1"/);
  });

  it('should hide caption if requested', () => {
    const result = codepen('slug', 'A Cool Pen', 400, 'result', false);
    expect(result).not.toContain('<figcaption');
    expect(result).not.toContain('data-codepen-labelledby');
    expect(result).toContain('data-codepen-title="A Cool Pen"');
  });

  it('offers a run button for the script and a link to the pen without it', () => {
    const result = codepen('yMdQpQ', 'A Cool Pen');
    expect(result).toMatch(/<button type="button" class="codepen-run" hidden>.*Run demo.*: A Cool Pen.*<\/button>/);
    expect(result).toMatch(
      /<a class="codepen-open" href="https:\/\/codepen.io\/vojtechruz\/pen\/yMdQpQ">.*Open on CodePen.*: A Cool Pen.*<\/a>/,
    );
  });

  it('puts the caption and the controls in a bar above the demo', () => {
    const result = onPage(CSS_POSITION, 'mdJamVb', 'Position relative');
    const order = ['<figcaption', 'class="codepen-actions"', 'class="codepen-facade"'].map((s) => result.indexOf(s));
    expect(order.every((index) => index > 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it('shows the poster next to the article when there is one, with a button to enlarge it', () => {
    const result = onPage(CSS_POSITION, 'mdJamVb', 'Position relative');
    expect(result).toContain('<img class="codepen-poster" src="./codepen-mdJamVb.png" alt="">');
    expect(result).toContain('aria-label="Enlarge screenshot: Position relative"');
    const without = onPage(CSS_POSITION, 'noSuchPen');
    expect(without).not.toContain('<img');
    expect(without).not.toContain('codepen-enlarge');
  });

  it('has no blank line, which would end the HTML block in markdown', () => {
    for (const result of [codepen('slug', 'Title', 400, 'result', false), onPage(CSS_POSITION, 'noSuchPen')]) {
      expect(result.trim()).not.toMatch(/\n\s*\n/);
    }
  });

  it('should expose the pen URL for print styles', () => {
    const result = codepen('yMdQpQ');
    expect(result).toContain('data-print-label="CodePen" data-print-url="https://codepen.io/vojtechruz/pen/yMdQpQ"');
  });
});

describe('codepenCalls', () => {
  it('reads the id, the title and the height, defaulting like the shortcode', () => {
    const markdown = [
      '{% codepen "aaa", "Title" %}',
      "{%- codepen 'bbb', 'Title, with comma', 500, \"result+css\" -%}",
      '{% codepen "ccc", 300 %}',
    ].join('\n\ntext\n\n');
    expect(codepenCalls(markdown)).toEqual([
      { id: 'aaa', title: 'Title', height: 400 },
      { id: 'bbb', title: 'Title, with comma', height: 500 },
      { id: 'ccc', title: undefined, height: 300 },
    ]);
  });
});

// A pen added without running `npm run codepen:screenshots` would show an empty box
describe('codepen posters', () => {
  const pens = globSync('src/posts/**/index.md', { posix: true }).flatMap((file) =>
    codepenCalls(readFileSync(file, 'utf-8')).map(({ id }) => ({
      id,
      poster: join(dirname(file), posterFilename(id)),
    })),
  );

  it('finds the pens in the posts', () => {
    expect(pens.length).toBeGreaterThan(0);
  });

  it.each(pens)('$id has a poster', ({ poster }) => {
    expect(existsSync(poster), `${poster} missing: run npm run codepen:screenshots`).toBe(true);
  });
});
