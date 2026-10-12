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

/** Output image formats; 'auto' keeps the original format for the <img> fallback. */
export const DEFAULT_IMAGE_FORMATS = ['avif', 'webp', 'auto'];

/** Output image widths; 'auto' is the original size. */
export const DEFAULT_IMAGE_WIDTHS = [400, 800, 1200, 1600, 'auto'];

/**
 * The formats/widths a build with the current environment produces. Exported so
 * tests/images.test.js can assert against the configured pipeline (and fail when a
 * default is changed) rather than against whatever the build happened to emit.
 */
export function resolveImageFormats() {
  return fromEnvList('ELEVENTY_IMAGE_FORMATS', DEFAULT_IMAGE_FORMATS);
}

export function resolveImageWidths() {
  return fromEnvList('ELEVENTY_IMAGE_WIDTHS', DEFAULT_IMAGE_WIDTHS);
}

/**
 * Output filename `<name>-<hash>-<width>.<format>`. The content hash (`id`) makes a stale build cache
 * safe (docs/IMAGES.md); the name is the source basename lowercased, spaces turned into hyphens and
 * anything else outside [a-z0-9-] dropped, with a build warning when that changed the name.
 */
export function imageFilename(id, src, width, format) {
  const filenameRaw = path.basename(src, path.extname(src));
  const filenameSanitized = filenameRaw
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, ''); // Remove special chars

  if (filenameRaw !== filenameSanitized) {
    logWarning(`Image filename "${filenameRaw}" sanitized to "${filenameSanitized}"`);
  }

  return `${filenameSanitized}-${id}-${width}.${format}`;
}

export default function registerImagePlugin(eleventyConfig) {
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    // output image formats
    formats: resolveImageFormats(),

    // output image widths
    widths: resolveImageWidths(),

    // optional, attributes assigned on <img> nodes override these values
    // Default attributes for <img> tags
    defaultAttributes: {
      loading: 'lazy',
      decoding: 'async',
      sizes: '(min-width: 1024px) 800px, 100vw',
    },
    filenameFormat: imageFilename,
  });
}
