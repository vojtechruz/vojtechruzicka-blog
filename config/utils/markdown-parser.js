import markdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import { slug as githubSlug } from 'github-slugger';
import shikiMarkdownPlugin from '@shikijs/markdown-it';
import { transformerMetaHighlight, transformerNotationDiff } from '@shikijs/transformers';
import { dataLanguageTransformer } from '../markdown-transform/data-language-transformer.js';
import { codeBlockTransformer } from '../markdown-transform/code-block-transformer.js';

/**
 * Heading permalink: an empty <a class="header-anchor"> appended after the
 * heading text (src/styles/components/_header-anchor.scss draws the icon,
 * src/scripts/header-anchor.js copies the link on click).
 *
 * Rendered here rather than patched by an HTML transform so the feed
 * (post.templateContent, which is pre-transform) and the page see the same
 * markup:
 * - no aria-hidden, and an aria-label naming the section so screen-reader
 *   users get a distinct link per heading instead of dozens of identical ones
 * - a title equal to the accessible name, so the mouse tooltip and what a
 *   screen reader announces agree
 * - tabindex="-1": deliberately out of the tab order, because an article has
 *   dozens of headings and each would otherwise become a tab stop
 */
export const HEADER_ANCHOR_LABEL_PREFIX = 'Copy link to this section: ';

function renderHeaderAnchor(slug, opts, state, idx) {
  const title = opts.getTokensText(state.tokens[idx + 1].children).trim();
  const label = HEADER_ANCHOR_LABEL_PREFIX + title;
  markdownItAnchor.permalink.linkInsideHeader({
    class: 'header-anchor',
    symbol: '',
    placement: 'after',
    renderAttrs: () => ({ 'aria-label': label, title: label, tabindex: '-1' }),
  })(slug, opts, state, idx);
}

let md;

export async function getMarkdownParser() {
  if (md) {
    return md;
  }

  const shikiPlugin = await shikiMarkdownPlugin({
    themes: {
      light: 'github-dark-dimmed',
      dark: 'github-dark-dimmed',
    },
    cssVariablePrefix: '--shiki-',
    inlineStyle: false,
    defaultBackground: false,
    defaultColor: false,
    transformers: [
      dataLanguageTransformer,
      transformerMetaHighlight(),
      transformerNotationDiff(),
      codeBlockTransformer,
    ],
  });

  md = markdownIt({
    html: true,
  })
    .use(markdownItAnchor, {
      // GitHub-style slugs ("What's next?" -> "whats-next"): the same ids the
      // Gatsby-era site produced via gatsby-remark-autolink-headers, so deep
      // links shared before the Eleventy migration keep resolving and copied
      // permalinks stay free of percent-encoding. markdown-it-anchor still
      // de-duplicates repeated headings with a "-1", "-2" suffix.
      slugify: githubSlug,
      // markdown-it-anchor puts tabindex="-1" on every heading by default;
      // headings are not interactive, so leave them alone.
      tabIndex: false,
      permalink: renderHeaderAnchor,
    })
    .use(shikiPlugin);

  // Custom renderer for code blocks to avoid double wrapping with <pre><code>
  // since Shiki and our code-block-transformer already provide the necessary wrapping.
  const defaultFence = md.renderer.rules.fence;
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const info = token.info ? md.utils.unescapeAll(token.info).trim() : '';
    const content = token.content;

    // Mermaid diagrams skip Shiki entirely. They are emitted as a placeholder
    // which the mermaid HTML transform converts to an inline SVG at build time.
    // The "caption" flag (```mermaid caption) renders the diagram's accTitle as a visible <figcaption>.
    const infoWords = info.split(/\s+/);
    if (infoWords[0] === 'mermaid') {
      const captionAttr = infoWords.includes('caption') ? ' data-caption' : '';
      return `<pre class="mermaid"${captionAttr}>${md.utils.escapeHtml(content.trim())}</pre>\n`;
    }

    if (options.highlight) {
      const infoParts = info.split(/\s+/);
      const langName = infoParts[0];
      const langAttrs = infoParts.slice(1).join(' ');

      const highlighted = options.highlight(content, langName, langAttrs);
      if (highlighted && highlighted !== content) {
        // If the highlighted content already contains a <pre> or <div> tag at the start,
        // we assume it's already fully wrapped and return it as is.
        if (highlighted.startsWith('<pre') || highlighted.startsWith('<div')) {
          return highlighted + '\n';
        }
      }
    }

    return defaultFence(tokens, idx, options, env, self);
  };

  return md;
}
