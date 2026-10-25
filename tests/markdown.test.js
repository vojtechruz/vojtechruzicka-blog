import { describe, it, expect } from 'vitest';
import * as cheerio from 'cheerio';
import { getMarkdownParser } from '../config/utils/markdown-parser.js';

describe('Markdown Code Blocks', () => {
  it('should render code blocks without double wrapping', async () => {
    const md = await getMarkdownParser();
    const content = '```java\nSystem.out.println("Hello");\n```';
    const result = md.render(content);

    // Check it has the container
    expect(result).toContain('class="code-block-container"');

    // Check it has the Shiki pre
    expect(result).toContain('<pre class="shiki');

    // Check it does NOT have double wrapping <pre><code><div ...>
    // The start should be <div, not <pre><code><div
    expect(result.trim().startsWith('<div class="code-block-container"')).toBe(true);

    // Check that we don't have <pre><code> as immediate parent of <div>
    expect(result).not.toContain('<pre><code><div');
    expect(result).not.toContain('</div></code></pre>');
  });

  it('should handle code block language attributes correctly', async () => {
    const md = await getMarkdownParser();
    const content = '```typescript {2}\nconst x = 1;\nconst y = 2;\n```';
    const result = md.render(content);

    expect(result).toContain('class="code-block-container"');
    expect(result).toContain('data-language="typescript"');
    expect(result).toContain('<pre class="shiki');
  });

  it('should render inline code correctly', async () => {
    const md = await getMarkdownParser();
    const content = 'Use `code` here.';
    const result = md.render(content);

    expect(result).toContain('<code>code</code>');
    expect(result).not.toContain('class="code-block-container"');
  });
});

// The title syntax end to end: info string -> fence renderer -> Shiki meta -> code-block-transformer.
// The transformer's own tests (tests/code-block-transformer.test.js) call it with a hand-made meta.
describe('Markdown code block titles', () => {
  const render = async (info, code = 'const x = 1;\nconst y = 2;') =>
    cheerio.load((await getMarkdownParser()).render('```' + info + '\n' + code + '\n```'), null, false);

  it.each(['js title="app.js"', "js title='app.js'", 'js title=app.js'])('renders a header for %s', async (info) => {
    const $ = await render(info);
    const container = $('.code-block-container');
    expect(container.attr('data-language')).toBe('js');
    // Header first, then the code; the copy button sits in the header, not over the code
    expect(
      container
        .children()
        .map((_, el) => $(el).attr('class').split(' ')[0])
        .get(),
    ).toEqual(['code-block-header', 'shiki']);
    expect($('.code-block-header > .code-block-title').text()).toBe('app.js');
    expect($('.code-block-header > .copy-code-button')).toHaveLength(1);
    expect($('.code-block-container > .copy-code-button')).toHaveLength(0);
  });

  it.each(['js title="app.js" {1}', 'js {1} title="app.js"'])(
    'combines a title with line highlights: %s',
    async (info) => {
      const $ = await render(info);
      expect($('.code-block-title').text()).toBe('app.js');
      expect(
        $('pre .line')
          .map((_, el) => $(el).hasClass('highlighted'))
          .get(),
      ).toEqual([true, false]);
    },
  );

  it('escapes the title', async () => {
    const $ = await render('js title="<b>a&b</b>.js"');
    expect($('.code-block-title').text()).toBe('<b>a&b</b>.js');
    expect($('.code-block-title b')).toHaveLength(0);
  });

  it('renders no header without a title', async () => {
    const $ = await render('js {1}');
    expect($('.code-block-header')).toHaveLength(0);
    expect($('.code-block-container > .copy-code-button')).toHaveLength(1);
  });
});
