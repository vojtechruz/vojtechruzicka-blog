import { describe, it, expect } from 'vitest';
import * as cheerio from 'cheerio';
import { getMarkdownParser } from '../config/utils/markdown-parser.js';
import { mermaidTransform } from '../config/html-transform/mermaid-transform.js';

const DIAGRAM = 'flowchart TD\n    A[Start] --> B[End]';

function mermaidFence(source) {
  return '```mermaid\n' + source + '\n```\n';
}

describe('mermaid markdown fence', () => {
  it('emits a pre.mermaid placeholder instead of a Shiki code block', async () => {
    const md = await getMarkdownParser();
    const html = md.render(mermaidFence(DIAGRAM));

    expect(html).toContain('<pre class="mermaid">');
    expect(html).not.toContain('shiki');
    expect(html).not.toContain('code-block-container');
  });

  it('escapes the diagram source inside the placeholder', async () => {
    const md = await getMarkdownParser();
    const html = md.render(mermaidFence('flowchart LR\n    A --> B["<script>"]'));

    expect(html).toContain('--&gt;');
    expect(html).not.toContain('<script>');
  });

  it('does not affect other languages, which still go through Shiki', async () => {
    const md = await getMarkdownParser();
    const html = md.render('```javascript\nconst a = 1;\n```\n');

    expect(html).toContain('code-block-container');
    expect(html).not.toContain('<pre class="mermaid">');
  });

  it('marks the placeholder when the caption flag is present', async () => {
    const md = await getMarkdownParser();
    const withCaption = md.render('```mermaid caption\n' + DIAGRAM + '\n```\n');
    const withoutCaption = md.render(mermaidFence(DIAGRAM));

    expect(withCaption).toContain('<pre class="mermaid" data-caption>');
    expect(withoutCaption).not.toContain('data-caption');
  });
});

describe('mermaidTransform', () => {
  function pageWith(body) {
    return `<html><head></head><body>${body}</body></html>`;
  }

  function placeholder(source) {
    const md = { escape: (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') };
    return `<pre class="mermaid">${md.escape(source)}</pre>`;
  }

  it('leaves non-HTML output untouched', async () => {
    const content = pageWith(placeholder(DIAGRAM));
    expect(await mermaidTransform(content, 'feed/feed.xml')).toBe(content);
    expect(await mermaidTransform(content, undefined)).toBe(content);
  });

  it('leaves HTML without mermaid placeholders untouched', async () => {
    const content = pageWith('<p>Hello</p>');
    expect(await mermaidTransform(content, 'page/index.html')).toBe(content);
  });

  it('replaces the placeholder with a rendered inline SVG', { timeout: 90_000 }, async () => {
    const output = await mermaidTransform(pageWith(placeholder(DIAGRAM)), 'page/index.html');
    const $ = cheerio.load(output);

    expect($('pre.mermaid').length).toBe(0);
    expect($('.mermaid-diagram').length).toBe(1);

    const $svg = $('.mermaid-diagram svg');
    expect($svg.length).toBe(1);
    expect($svg.text()).toContain('Start');
    expect($svg.text()).toContain('End');
  });

  it('themes the SVG with the blog palette and font stack', { timeout: 90_000 }, async () => {
    const output = await mermaidTransform(pageWith(placeholder(DIAGRAM)), 'page/index.html');
    const $ = cheerio.load(output);
    const style = $('.mermaid-diagram svg style').text();

    expect(style).toContain('Inter');
    expect(style).toContain('#c7d2da'); // --color-text
  });

  it('rounds node corners to match the blog styling', { timeout: 90_000 }, async () => {
    const output = await mermaidTransform(pageWith(placeholder(DIAGRAM)), 'page/index.html');
    const $ = cheerio.load(output);

    const $rects = $('.mermaid-diagram svg g.node rect');
    expect($rects.length).toBeGreaterThan(0);
    $rects.each((_, el) => {
      expect($(el).attr('rx')).toBe('3');
    });
  });

  it('renders labels as pure SVG text, not foreignObject HTML', { timeout: 90_000 }, async () => {
    const withLineBreak = 'flowchart TD\n    A["Multi<br>line"] --> B[Plain]';
    const output = await mermaidTransform(pageWith(placeholder(withLineBreak)), 'page/index.html');
    const $ = cheerio.load(output);

    expect(output).not.toContain('<foreignObject');
    expect($('.mermaid-diagram svg text').length).toBeGreaterThan(0);
    expect($('.mermaid-diagram svg').text()).toContain('Multi');
  });

  it('renders multiple diagrams on one page with unique SVG ids', { timeout: 90_000 }, async () => {
    const second = 'flowchart LR\n    X[One] --> Y[Two]';
    const output = await mermaidTransform(pageWith(placeholder(DIAGRAM) + placeholder(second)), 'page/index.html');
    const $ = cheerio.load(output);

    const ids = $('.mermaid-diagram svg')
      .map((_, el) => $(el).attr('id'))
      .get();
    expect(ids.length).toBe(2);
    expect(new Set(ids).size).toBe(2);
  });

  it('serves identical diagrams from cache with a consistent result', { timeout: 90_000 }, async () => {
    const first = await mermaidTransform(pageWith(placeholder(DIAGRAM)), 'a/index.html');
    const second = await mermaidTransform(pageWith(placeholder(DIAGRAM)), 'b/index.html');

    const svgOf = (html) => cheerio.load(html)('.mermaid-diagram svg').attr('id');
    expect(svgOf(first)).toBeDefined();
    expect(svgOf(first)).toBe(svgOf(second));
  });

  it('renders accTitle as a visible figcaption when the caption flag is set', { timeout: 90_000 }, async () => {
    const withTitle = 'flowchart TD\n    accTitle: My diagram caption\n    A[Start] --> B[End]';
    const captioned = `<pre class="mermaid" data-caption>${withTitle.replace(/>/g, '&gt;')}</pre>`;
    const output = await mermaidTransform(pageWith(captioned), 'page/index.html');
    const $ = cheerio.load(output);

    expect($('figure.mermaid-figure').length).toBe(1);
    expect($('figure.mermaid-figure .mermaid-diagram svg').length).toBe(1);
    expect($('figcaption.mermaid-caption').text()).toBe('My diagram caption');
  });

  it('renders no figure without the caption flag, even when accTitle exists', { timeout: 90_000 }, async () => {
    const withTitle = 'flowchart TD\n    accTitle: Hidden caption\n    A[Start] --> B[End]';
    const plain = `<pre class="mermaid">${withTitle.replace(/>/g, '&gt;')}</pre>`;
    const output = await mermaidTransform(pageWith(plain), 'page/index.html');
    const $ = cheerio.load(output);

    expect($('figure').length).toBe(0);
    expect($('figcaption').length).toBe(0);
    expect($('.mermaid-diagram svg').length).toBe(1);
  });

  it('renders no empty figcaption when caption is requested but accTitle is missing', { timeout: 90_000 }, async () => {
    const noTitle = 'flowchart TD\n    A[Solo] --> B[NoTitle]';
    const captioned = `<pre class="mermaid" data-caption>${noTitle.replace(/>/g, '&gt;')}</pre>`;
    const output = await mermaidTransform(pageWith(captioned), 'page/index.html');
    const $ = cheerio.load(output);

    expect($('figcaption').length).toBe(0);
    expect($('.mermaid-diagram svg').length).toBe(1);
  });

  it('keeps the placeholder when the diagram source is invalid', { timeout: 90_000 }, async () => {
    const output = await mermaidTransform(
      pageWith(placeholder('this is not a valid mermaid diagram %%%{')),
      'page/index.html',
    );
    const $ = cheerio.load(output);

    expect($('.mermaid-diagram').length).toBe(0);
    expect($('pre.mermaid').length).toBe(1);
  });
});
