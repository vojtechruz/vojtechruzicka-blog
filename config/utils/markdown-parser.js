import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import shikiMarkdownPlugin from "@shikijs/markdown-it";
import { transformerMetaHighlight, transformerNotationDiff } from "@shikijs/transformers";
import { dataLanguageTransformer } from "../markdown-transform/data-language-transformer.js";
import { codeBlockTransformer } from "../markdown-transform/code-block-transformer.js";

let md;

export async function getMarkdownParser() {
  if (md) {
    return md;
  }

  const shikiPlugin = await shikiMarkdownPlugin({
    themes: {
      light: "github-dark-dimmed",
      dark: "github-dark-dimmed",
    },
    cssVariablePrefix: "--shiki-",
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
        placement: "before",
        class: "header-anchor",
        symbol: "",
      }),
    })
    .use(shikiPlugin);

  return md;
}
