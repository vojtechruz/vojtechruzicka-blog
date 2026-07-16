import { eleventyImageTransformPlugin } from '@11ty/eleventy-img';
import path from 'path';
import { logWarning } from '../logger.js';

/**
 * Formats/widths are overridable via env so CI can build a lean variant
 * (e.g. ELEVENTY_IMAGE_FORMATS=webp,auto ELEVENTY_IMAGE_WIDTHS=800,auto) -
 * avif encoding dominates build time and CI only validates markup.
 * Production (Cloudflare) builds keep the full defaults.
 */
function fromEnvList(name, defaults) {
  if (!process.env[name]) {
    return defaults;
  }
  return process.env[name].split(',').map((item) => {
    const trimmed = item.trim();
    return /^\d+$/.test(trimmed) ? Number(trimmed) : trimmed;
  });
}

export default function registerImagePlugin(eleventyConfig) {
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    // output image formats
    formats: fromEnvList('ELEVENTY_IMAGE_FORMATS', ['avif', 'webp', 'auto']),

    // output image widths ('auto' is the original size)
    widths: fromEnvList('ELEVENTY_IMAGE_WIDTHS', [400, 800, 1200, 'auto']),
    sizes: '100vw',

    // optional, attributes assigned on <img> nodes override these values
    // Default attributes for <img> tags
    defaultAttributes: {
      loading: 'lazy',
      decoding: 'async',
      sizes: '(min-width: 1024px) 800px, 100vw',
    },
    filenameFormat: function (id, src, width, format, _options) {
      // Define custom filenames for generated images
      // id: hash of the original image
      // src: original image path
      // width: current width in px
      // format: current file format
      // options: set of options passed to the Image call

      // Extract filename without extension
      const filenameRaw = path.basename(src, path.extname(src));
      const filenameSanitized = filenameRaw
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/[^a-z0-9-]/g, ''); // Remove special chars

      if (filenameRaw !== filenameSanitized) {
        logWarning(`Image filename "${filenameRaw}" sanitized to "${filenameSanitized}"`);
      }

      return `${filenameSanitized}-${id}-${width}.${format}`;
    },
  });
}
