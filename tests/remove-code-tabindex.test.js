import { describe, it, expect } from 'vitest';
import { stripPreTabindex } from '../config/html-transform/remove-code-tabindex.js';

// Unit tests for the build transform that keeps code blocks out of the tab order (Shiki emits
// <pre tabindex="0">). Overflowing blocks get a tab stop back at runtime from
// src/scripts/scroll-regions.js; the built pages are checked in tests/code-block-transformer.test.js.

describe('stripPreTabindex', () => {
  it('removes tabindex from every <pre> and keeps its other attributes', () => {
    const html =
      '<pre class="shiki dark" tabindex="0" style="color:#fff"><code>a</code></pre>' +
      '<pre tabindex="-1" data-language="js"><code>b</code></pre>';

    expect(stripPreTabindex(html, '_site/post/index.html')).toBe(
      '<pre class="shiki dark" style="color:#fff"><code>a</code></pre>' +
        '<pre data-language="js"><code>b</code></pre>',
    );
  });

  it('leaves tabindex on other elements alone', () => {
    const html = '<div class="toc" tabindex="-1"></div><a href="#x" tabindex="0">x</a><pre><code>c</code></pre>';
    expect(stripPreTabindex(html, '_site/post/index.html')).toBe(html);
  });

  it('does not take a <pre…>-like element name or text inside code for a <pre>', () => {
    const html = '<preview tabindex="0"></preview><pre><code>&lt;pre tabindex="0"&gt;</code></pre>';
    expect(stripPreTabindex(html, '_site/post/index.html')).toBe(html);
  });

  it.each([
    ['a non-HTML output', '_site/feed.xml'],
    ['no output path', undefined],
  ])('passes %s through unchanged', (_, outputPath) => {
    const xml = '<pre tabindex="0">x</pre>';
    expect(stripPreTabindex(xml, outputPath)).toBe(xml);
  });

  it('returns non-string content as it came', () => {
    const buffer = Buffer.from('<pre tabindex="0">');
    expect(stripPreTabindex(buffer, '_site/x.html')).toBe(buffer);
  });
});
