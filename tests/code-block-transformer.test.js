import { describe, it, expect } from 'vitest';
import { codeBlockTransformer } from '../config/markdown-transform/code-block-transformer.js';

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

    const statusSpan = copyButton.children.find((c) => c.properties?.className?.includes('copy-status'));
    expect(statusSpan.children[0].value).toBe('Copy');
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
    expect(statusSpan.children[0].value).toBe('');
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
