import warning from "./shortcodes/warning.js";
import info from "./shortcodes/info.js";
import youtube from "./shortcodes/youtube.js";
import codepen from "./shortcodes/codepen.js";
import video from "./shortcodes/video.js";
import linkedPost from "./shortcodes/linked-post.js";

export default function registerShortcodes(eleventyConfig) {
  // Paired shortcodes
  eleventyConfig.addPairedShortcode("warning", warning);
  eleventyConfig.addPairedShortcode("info", info);

  // Single shortcodes
  eleventyConfig.addShortcode("youtube", youtube);
  eleventyConfig.addShortcode("codepen", codepen);
  eleventyConfig.addShortcode("video", video);
  eleventyConfig.addShortcode("linkedPost", linkedPost);
}
