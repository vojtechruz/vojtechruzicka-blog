import markdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import shikiMarkdownPlugin from '@shikijs/markdown-it';
import { transformerMetaHighlight, transformerNotationDiff } from '@shikijs/transformers';
import { dataLanguageTransformer } from '../markdown-transform/data-language-transformer.js';
import { codeBlockTransformer } from '../markdown-transform/code-block-transformer.js';

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
      permalink: markdownItAnchor.permalink.ariaHidden({
        placement: 'before',
        class: 'header-anchor',
        symbol: '',
      }),
    })
    .use(shikiPlugin);

  // Custom renderer for code blocks to avoid double wrapping with <pre><code>
  // since Shiki and our code-block-transformer already provide the necessary wrapping.
  const defaultFence = md.renderer.rules.fence;
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const info = token.info ? md.utils.unescapeAll(token.info).trim() : '';
    const content = token.content;

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
