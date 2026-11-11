// Markdown renderer: what markdown-it-anchor emits for a heading (docs/HEADING-ANCHORS.md).
// Kept apart from header-anchor.test.js, which runs in jsdom: jsdom's Blob has no stream(), and
// Shiki (part of the markdown parser) decodes its inlined WASM with Blob#stream since 4.6.
import { describe, it, expect } from 'vitest';
import { getMarkdownParser, HEADER_ANCHOR_LABEL_PREFIX } from '../config/utils/markdown-parser.js';

describe('heading anchors — markdown output', () => {
  it('renders a GitHub-style slug and a labelled, unfocusable anchor after the heading text', async () => {
    const md = await getMarkdownParser();
    const html = md.render("## What's next?").trim();

    expect(html).toBe(
      '<h2 id="whats-next">What\'s next? ' +
        '<a class="header-anchor" href="#whats-next" aria-hidden="true" ' +
        `aria-label="${HEADER_ANCHOR_LABEL_PREFIX}What's next?" ` +
        `title="${HEADER_ANCHOR_LABEL_PREFIX}What's next?" tabindex="-1"></a></h2>`,
    );
  });

  it('uses github-slugger rules: punctuation dropped, inline code kept, spaces to dashes', async () => {
    const md = await getMarkdownParser();
    const html = md.render(
      '### `web.xml` and Servlet 3.0\n\n### Enabling / disabling endpoints\n\n#### Null & undefined',
    );

    expect(html).toContain('<h3 id="webxml-and-servlet-30">');
    expect(html).toContain('<h3 id="enabling--disabling-endpoints">');
    expect(html).toContain('<h4 id="null--undefined">');
    expect(html).not.toMatch(/id="[^"]*%/);
  });

  it('de-duplicates repeated headings with a numeric suffix', async () => {
    const md = await getMarkdownParser();
    const html = md.render('## Example\n\ntext\n\n## Example\n\ntext\n\n## Example');

    expect(html).toContain('<h2 id="example">');
    expect(html).toContain('<h2 id="example-1">');
    expect(html).toContain('<h2 id="example-2">');
    expect(html).toContain('href="#example-2"');
  });

  // Inside the heading, the link's name became part of the heading's: NVDA read
  // "Section Copy link to this section: Section" in its heading list
  it('hides the anchor from assistive tech, keeping it unfocusable and the heading too', async () => {
    const md = await getMarkdownParser();
    const html = md.render('## Section');

    expect(html).toMatch(/<a[^>]*aria-hidden="true"/);
    expect(html).not.toMatch(/<h2[^>]*tabindex/);
    expect(html).toMatch(/<a[^>]*tabindex="-1"/);
  });
});
