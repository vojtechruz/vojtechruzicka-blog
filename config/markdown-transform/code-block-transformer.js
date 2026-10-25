export const codeBlockTransformer = {
  name: 'code-block-enhancement',
  root(root) {
    const pre = root.children.find((child) => child.tagName === 'pre');
    if (!pre) {
      return;
    }

    // Extract title from meta string (e.g., ```js title="filename.js")
    const meta = typeof this.options.meta === 'string' ? this.options.meta : this.options.meta?.__raw || '';
    // Anchored at a word start so `subtitle=` or `data-title=` are not taken for a title
    const titleMatch = meta.match(/(?:^|\s)title=(?:"([^"]+)"|'([^']+)'|(\S+))/);
    const title = titleMatch ? titleMatch[1] || titleMatch[2] || titleMatch[3] : '';
    const language = this.options.lang || 'text';

    // Create the Copy Button with SVG icon
    const copyButton = {
      type: 'element',
      tagName: 'button',
      properties: {
        className: ['copy-code-button'],
        'aria-label': 'Copy code to clipboard',
        type: 'button',
        title: 'Copy code to clipboard',
      },
      children: [
        {
          type: 'element',
          tagName: 'span',
          properties: { className: ['copy-icon'] },
          children: [
            {
              type: 'element',
              tagName: 'svg',
              properties: { viewBox: '0 0 26 26', fill: 'currentColor', 'aria-hidden': 'true', focusable: 'false' },
              children: [
                {
                  type: 'element',
                  tagName: 'path',
                  properties: {
                    d: 'M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 18H8V7h11v16z',
                  },
                },
              ],
            },
          ],
        },
        {
          type: 'element',
          tagName: 'span',
          // Empty: the button is the icon alone, in a title header as over bare code, so every copy button
          // looks the same; src/scripts/code-block.js shows "Copied!" here after a copy
          properties: { className: ['copy-status'] },
          children: [],
        },
      ],
    };

    const containerChildren = [];

    if (title) {
      // Create the header children (Title and Copy Button)
      const headerChildren = [];

      // Title
      headerChildren.push({
        type: 'element',
        tagName: 'span',
        properties: { className: ['code-block-title'] },
        children: [{ type: 'text', value: title }],
      });

      // Add copy button to header
      headerChildren.push(copyButton);

      const header = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['code-block-header'] },
        children: headerChildren,
      };

      containerChildren.push(header, pre);
    } else {
      // If no title, the copy button floats over the code's top right corner. It still follows the code
      // in the DOM, so keyboard focus reaches the (scrollable) block first and its copy button second.
      containerChildren.push(pre, copyButton);
    }

    // Wrap the pre in a container div
    const container = {
      type: 'element',
      tagName: 'div',
      properties: {
        className: ['code-block-container'],
        'data-language': language,
      },
      children: containerChildren,
    };

    root.children = [container];
  },
};
