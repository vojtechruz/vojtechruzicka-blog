import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { globSync } from 'glob';
import { load } from 'cheerio';
import { codeBlockTransformer } from '../config/markdown-transform/code-block-transformer.js';
import { SITE_DIR } from './helpers.js';

describe('codeBlockTransformer', () => {
  it('wraps pre in a container with data-language attribute', () => {
    const pre = { tagName: 'pre', children: [] };
    const mockRoot = {
      children: [pre],
    };

    const context = {
      options: {
        meta: '',
        lang: 'javascript',
      },
    };

    codeBlockTransformer.root.call(context, mockRoot);

    const container = mockRoot.children[0];
    expect(container.tagName).toBe('div');
    expect(container.properties.className).toContain('code-block-container');
    expect(container.properties['data-language']).toBe('javascript');
    expect(container.children).toContain(pre);
  });

  it('puts the floating copy button after the code, so Tab reaches the block first', () => {
    const pre = { tagName: 'pre', children: [] };
    const mockRoot = { children: [pre] };

    codeBlockTransformer.root.call({ options: { meta: '' } }, mockRoot);

    const [first, second] = mockRoot.children[0].children;
    expect(first).toBe(pre);
    expect(second.properties.className).toContain('copy-code-button');
  });

  it('keeps a title header above the code', () => {
    const pre = { tagName: 'pre', children: [] };
    const mockRoot = { children: [pre] };

    codeBlockTransformer.root.call({ options: { meta: 'title="app.js"' } }, mockRoot);

    const [first, second] = mockRoot.children[0].children;
    expect(first.properties.className).toContain('code-block-header');
    expect(second).toBe(pre);
  });

  it('uses "text" as default language if not provided', () => {
    const pre = { tagName: 'pre', children: [] };
    const mockRoot = { children: [pre] };
    const context = { options: {} };

    codeBlockTransformer.root.call(context, mockRoot);

    const container = mockRoot.children[0];
    expect(container.properties['data-language']).toBe('text');
  });

  it('extracts title correctly with double quotes', () => {
    const pre = { tagName: 'pre', children: [] };
    const mockRoot = { children: [pre] };
    const context = {
      options: {
        meta: 'title="my-file.js"',
      },
    };

    codeBlockTransformer.root.call(context, mockRoot);

    const container = mockRoot.children[0];
    const header = container.children.find((c) => c.properties?.className?.includes('code-block-header'));
    expect(header).toBeDefined();

    const titleSpan = header.children.find((c) => c.properties?.className?.includes('code-block-title'));
    expect(titleSpan.children[0].value).toBe('my-file.js');
  });

  it('extracts title correctly with single quotes', () => {
    const pre = { tagName: 'pre', children: [] };
    const mockRoot = { children: [pre] };
    const context = {
      options: {
        meta: "title='my-file.js'",
      },
    };

    codeBlockTransformer.root.call(context, mockRoot);

    const container = mockRoot.children[0];
    const header = container.children.find((c) => c.properties?.className?.includes('code-block-header'));
    expect(header.children[0].children[0].value).toBe('my-file.js');
  });

  it('extracts title correctly without quotes', () => {
    const pre = { tagName: 'pre', children: [] };
    const mockRoot = { children: [pre] };
    const context = {
      options: {
        meta: 'title=my-file.js',
      },
    };

    codeBlockTransformer.root.call(context, mockRoot);

    const container = mockRoot.children[0];
    const header = container.children.find((c) => c.properties?.className?.includes('code-block-header'));
    expect(header.children[0].children[0].value).toBe('my-file.js');
  });

  it('adds copy button to header if title is present', () => {
    const pre = { tagName: 'pre', children: [] };
    const mockRoot = { children: [pre] };
    const context = {
      options: {
        meta: 'title="test.js"',
      },
    };

    codeBlockTransformer.root.call(context, mockRoot);

    const container = mockRoot.children[0];
    const header = container.children.find((c) => c.properties?.className?.includes('code-block-header'));
    const copyButton = header.children.find((c) => c.properties?.className?.includes('copy-code-button'));
    expect(copyButton).toBeDefined();

    // Icon only, like the floating button over code without a title
    const statusSpan = copyButton.children.find((c) => c.properties?.className?.includes('copy-status'));
    expect(statusSpan.children).toEqual([]);
  });

  it('adds copy button directly to container if no title is present', () => {
    const pre = { tagName: 'pre', children: [] };
    const mockRoot = { children: [pre] };
    const context = { options: {} };

    codeBlockTransformer.root.call(context, mockRoot);

    const container = mockRoot.children[0];
    const copyButton = container.children.find((c) => c.properties?.className?.includes('copy-code-button'));
    expect(copyButton).toBeDefined();

    const statusSpan = copyButton.children.find((c) => c.properties?.className?.includes('copy-status'));
    expect(statusSpan.children).toEqual([]);
  });

  it('extracts title correctly when meta is an object with __raw', () => {
    const pre = { tagName: 'pre', children: [] };
    const mockRoot = { children: [pre] };
    const context = {
      options: {
        meta: { __raw: 'title="object-meta.js"' },
      },
    };

    codeBlockTransformer.root.call(context, mockRoot);

    const container = mockRoot.children[0];
    const header = container.children.find((c) => c.properties?.className?.includes('code-block-header'));
    expect(header.children[0].children[0].value).toBe('object-meta.js');
  });

  it.each(['subtitle="not-a-title.js"', 'data-title="not-a-title.js"'])('does not take %s for a title', (meta) => {
    const pre = { tagName: 'pre', children: [] };
    const mockRoot = { children: [pre] };
    const context = { options: { meta } };

    codeBlockTransformer.root.call(context, mockRoot);

    const container = mockRoot.children[0];
    const header = container.children.find((c) => c.properties?.className?.includes('code-block-header'));
    expect(header).toBeUndefined();
  });

  it('extracts a title that follows other meta', () => {
    const pre = { tagName: 'pre', children: [] };
    const mockRoot = { children: [pre] };
    const context = { options: { meta: '{1} title="after-highlight.js"' } };

    codeBlockTransformer.root.call(context, mockRoot);

    const container = mockRoot.children[0];
    const header = container.children.find((c) => c.properties?.className?.includes('code-block-header'));
    expect(header.children[0].children[0].value).toBe('after-highlight.js');
  });

  it('does nothing if no pre element is found', () => {
    const mockRoot = {
      children: [{ tagName: 'div' }],
    };
    const context = { options: {} };

    codeBlockTransformer.root.call(context, mockRoot);

    expect(mockRoot.children[0].tagName).toBe('div');
    expect(mockRoot.children.length).toBe(1);
  });
});

describe('Code blocks in the build', () => {
  const pages = globSync(`${SITE_DIR}/**/*.html`, { ignore: [`${SITE_DIR}/pagefind/**`] })
    .map((file) => ({ file, $: load(readFileSync(file, 'utf-8')) }))
    .filter(({ $ }) => $('pre.shiki').length > 0);
  const SCRIPT = /^\/scripts\/code-block\.js(?:\?v=\w+)?$/;

  it('exist', () => {
    expect(pages.length).toBeGreaterThan(10);
  });

  it('sit in a container with exactly one copy button, after the code', () => {
    for (const { file, $ } of pages) {
      $('pre.shiki').each((_, pre) => {
        const $container = $(pre).parent('.code-block-container');
        expect($container.length, `${file}: <pre> outside a .code-block-container`).toBe(1);
        const $buttons = $container.find('.copy-code-button');
        expect($buttons.length, `${file}: copy buttons in one block`).toBe(1);
        expect($buttons.attr('type')).toBe('button');
        expect($buttons.attr('aria-label')).toBe('Copy code to clipboard');
        if (!$container.children('.code-block-header').length) {
          expect($(pre).next().is('.copy-code-button'), `${file}: floating button must follow the code`).toBe(true);
        }
      });
    }
  });

  it('load the copy script on every page that has them', () => {
    for (const { file, $ } of pages) {
      const sources = $('script[src]')
        .map((_, el) => $(el).attr('src'))
        .get();
      expect(sources.filter((src) => SCRIPT.test(src)).length, file).toBe(1);
    }
  });

  // Copying joins every Shiki `.line`, including the red "removed" lines of a diff block (`// [!code --]`,
  // transformerNotationDiff), so a reader would paste code that should not be there. No post uses diff
  // removals yet, so the copy script does not handle them; this fails the build the first time one does.
  it('contain no removed diff lines, which the copy button would copy too', () => {
    const offenders = pages.filter(({ $ }) => $('pre.shiki .line.diff.remove').length > 0).map(({ file }) => file);
    expect(
      offenders,
      'A code block now uses `// [!code --]`. Before publishing, make the copy button skip removed lines: ' +
        'in src/scripts/code-block.js leave `.line.diff.remove` out of the lines it joins (the +/- signs are ' +
        'CSS, not text), then test it in ' +
        'tests/code-block.test.js and delete this guard.',
    ).toEqual([]);
  });

  it('are not in the tab order unless they overflow (Shiki tabindex stripped at build)', () => {
    for (const { file, $ } of pages) {
      expect($('pre[tabindex]').length, file).toBe(0);
    }
  });
});
