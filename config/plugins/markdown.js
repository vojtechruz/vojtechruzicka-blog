import { getMarkdownParser } from "../utils/markdown-parser.js";

export default async function registerMarkdownPlugin(eleventyConfig) {
  const md = await getMarkdownParser();
  eleventyConfig.setLibrary("md", md);
}
