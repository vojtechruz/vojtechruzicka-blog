import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

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
  });
}
