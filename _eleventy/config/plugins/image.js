import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import path from "path";

export default function registerImagePlugin(eleventyConfig) {
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    // output image formats
    formats: ["avif", "webp", "auto"],

    // output image widths
    widths: [400, 800, 1200, "auto"], // auto is the original size
    sizes: "100vw",

    // optional, attributes assigned on <img> nodes override these values
    // Default attributes for <img> tags
    defaultAttributes: {
      loading: "lazy",
      decoding: "async",
      sizes: "(min-width: 1024px) 800px, 100vw"
    },
    filenameFormat: function (id, src, width, format, options) {
      // Define custom filenames for generated images
      // id: hash of the original image
      // src: original image path
      // width: current width in px
      // format: current file format
      // options: set of options passed to the Image call

      // Extract filename without extension
      const filename = path.basename(src, path.extname(src))
        .toLowerCase()
        .replace(/\s+/g, '-')  // Replace spaces with hyphens
        .replace(/[^a-z0-9-]/g, '');  // Remove special chars


      return `${filename}-${id}-${width}.${format}`;
    }
  });
}
