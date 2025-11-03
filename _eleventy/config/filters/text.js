import { slugify } from "../utils/formatting.js";

export default function registerTextFilters(eleventyConfig) {
  // Slugify text consistently across templates and JS shortcodes
  eleventyConfig.addFilter("slugify", (value) => slugify(value));
}
