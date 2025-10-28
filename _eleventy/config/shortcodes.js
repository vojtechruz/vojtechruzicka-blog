import warning from "./shortcodes/warning.js";
import info from "./shortcodes/info.js";

export default function registerLayouts(eleventyConfig) {
  eleventyConfig.addPairedShortcode("warning", warning);
  eleventyConfig.addPairedShortcode("info", info);
}
