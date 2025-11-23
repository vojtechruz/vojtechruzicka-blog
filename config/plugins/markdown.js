import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import shikiMarkdownPlugin from "@shikijs/markdown-it";
import { transformerMetaHighlight, transformerNotationDiff } from "@shikijs/transformers";
import { dataLanguageTransformer } from "../markdown-transform/data-language-transformer.js";

export default async function registerMarkdownPlugin(eleventyConfig) {
  // Configure Shiki markdown-it plugin
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
    ],
  });

  // Markdown library with heading anchors
  const md = markdownIt({
    html: true,
  })
    .use(markdownItAnchor, {
      // Auto-generate permalinks for headings
      permalink: markdownItAnchor.permalink.ariaHidden({
        placement: "before",
        class: "header-anchor",
        symbol: "",
      }),
    })
    .use(shikiPlugin);

  eleventyConfig.setLibrary("md", md);
}
