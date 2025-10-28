import warning from "./shortcodes/warning.js";

export default function registerLayouts(eleventyConfig) {
  eleventyConfig.addPairedShortcode("warning", warning);
}
