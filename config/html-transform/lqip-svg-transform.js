// config/htm-transform/lqipSvgTransform.js
// ESM module

import path from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";
import { load } from "cheerio";

/**
 * --- Configuration ---
 */
const OUTPUT_DIR = process.env.ELEVENTY_OUTPUT_DIR || "_site";
const PROJECT_ROOT = process.cwd();

/**
 * Approximate total number of cells in the mosaic.
 * The grid (width x height) will adapt to image aspect ratio.
 * 160 ≈ 16×10 for 16:10 aspect ratio — tweak to your liking.
 */
const CELLS_TOTAL = 160;

/**
 * Minimum number of cells on the shorter side, to avoid being too coarse.
 */
const MIN_SIDE_CELLS = 8;

/** Convert 0–255 to two-digit hex */
function to2(v) {
  return v.toString(16).padStart(2, "0");
}

/**
 * Load binary buffer for the “smallest” image candidate.
 *
 * DEV mode (`--serve`):
 *   Eleventy Image outputs virtual URLs like /.11ty/image/?src=...&width=...
 *   → we extract the `src` param and read the original image from /src/ folder
 *
 * BUILD mode:
 *   Uses real static files in the output directory (_site/…)
 */
async function getBufferForSmallestPath(smallestUrl) {
  if (smallestUrl.startsWith("/.11ty/image/")) {
    const q = smallestUrl.split("?")[1] || "";
    const params = new URLSearchParams(q);
    const srcParam = params.get("src");
    if (!srcParam) throw new Error("Missing src param in /.11ty/image URL");
    const decoded = decodeURIComponent(srcParam);
    const abs = path.join(PROJECT_ROOT, decoded.replace(/^[\\/]/, ""));
    return fs.readFile(abs);
  }
  // build mode: file already exists in _site/
  const absOut = path.join(OUTPUT_DIR, smallestUrl.replace(/^\//, ""));
  return fs.readFile(absOut);
}

/**
 * Pick the smallest candidate URL inside a <picture>:
 * - Prefer first <source srcset>, then <img srcset>, then <img src>.
 */
function pickSmallestUrl($pic, $img) {
  const $firstSource = $pic.find("source").first();
  const srcset = $firstSource.attr("srcset") || $img.attr("srcset");
  if (srcset) {
    const candidate = srcset.split(",")[0].trim().split(" ")[0];
    if (candidate) return candidate;
  }
  return $img.attr("src") || "";
}

/**
 * Compute adaptive mosaic grid (number of cells in width/height)
 * based on image aspect ratio.
 */
function computeGrid(aspect) {
  const base = Math.sqrt(CELLS_TOTAL * aspect);
  let gridW = Math.max(MIN_SIDE_CELLS, Math.round(base));
  let gridH = Math.max(MIN_SIDE_CELLS, Math.round(gridW / aspect));

  // basic clamping to avoid extremes
  gridW = Math.max(MIN_SIDE_CELLS, gridW);
  gridH = Math.max(MIN_SIDE_CELLS, gridH);

  return { gridW, gridH };
}

// TODO this should fix cropping of images with weird aspect ratios
// - .resize(gridW, gridH, { fit: "cover" })
// + .resize(gridW, gridH, { fit: "inside" })
// diff
// Zkopírovat kód
// - preserveAspectRatio="xMidYMid slice"
// + preserveAspectRatio="xMidYMid meet"
// diff
// Zkopírovat kód
// - background-size:cover;
// + background-size:contain;

/**
 * Build inline SVG mosaic (no blur filter).
 * Uses viewBox matching pixel grid and preserveAspectRatio="xMidYMid slice"
 * to avoid stretching.
 */
function buildSvgFromRaw({ data, width, height, channels }) {
  let rects = "";
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const r = channels === 1 ? data[i] : data[i];
      const g = channels === 1 ? data[i] : data[i + 1];
      const b = channels === 1 ? data[i] : data[i + 2];
      rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="#${to2(r)}${to2(g)}${to2(b)}"/>`;
    }
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 ${width} ${height}"
     preserveAspectRatio="xMidYMid slice">
  <g>${rects}</g>
</svg>`.trim();
}

/**
 * --- Eleventy Transform ---
 * Runs on every generated HTML page.
 * Finds <picture> tags, generates a tiny SVG LQIP from the smallest image,
 * and injects it as background-image on the <img>.
 */
export async function lqipSvgTransform(content, outputPath) {
  if (!outputPath || !outputPath.endsWith(".html")) return content;

  const $ = load(content);
  const jobs = [];

  $("picture").each((_, pic) => {
    const $pic = $(pic);
    const $img = $pic.find("img").first();
    if (!$img.length) return;

    const smallest = pickSmallestUrl($pic, $img);
    if (!smallest) return;

    jobs.push((async () => {
      try {
        // Determine aspect ratio from width/height attributes if present
        const wAttr = parseInt($img.attr("width") || "", 10);
        const hAttr = parseInt($img.attr("height") || "", 10);
        const aspect = wAttr && hAttr ? (wAttr / hAttr) : (16 / 9);

        // Compute adaptive grid size
        const { gridW, gridH } = computeGrid(aspect);

        // Load image buffer (origin in serve mode, built file otherwise)
        const buf = await getBufferForSmallestPath(smallest);

        // Downsample and extract raw RGB data
        const { data, info } = await sharp(buf)
          .toColorspace("srgb")
          .resize(gridW, gridH, { fit: "cover" })
          .raw({ depth: "uchar" })
          .toBuffer({ resolveWithObject: true });

        // Build SVG mosaic
        const svg = buildSvgFromRaw({
          data,
          width: info.width,
          height: info.height,
          channels: info.channels,
        });

        // Base64-encode to avoid escaping issues
        const svgUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

        // Apply background LQIP to <img>
        const prevImgStyle = $img.attr("style") || "";
        $img.attr(
          "style",
          `display:block;` +
          `background-image:url('${svgUrl}');` +
          `background-size:cover;` +
          `background-position:center;` +
          `background-repeat:no-repeat;` +
          prevImgStyle
        );

        // Optional fade-in hook: add CSS class + data-loaded flag
        const existingOnload = $img.attr("onload") || "";
        $img.attr("onload", existingOnload + "this.dataset.loaded=1;");
        $img.addClass("lqip");

      } catch (e) {
        console.error("LQIP error for", smallest, e);
      }
    })());
  });

  await Promise.all(jobs);
  return $.html();
}

/**
 * --- Usage in .eleventy.js ---
 *
 * import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
 * import { lqipSvgTransform } from "./config/htm-transform/lqipSvgTransform.js";
 *
 * export default function(eleventyConfig) {
 *   eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
 *     extensions: "html",
 *     formats: ["avif","webp","jpeg"],
 *     widths: [400,800,1200],
 *     urlPath: "/img/",
 *     outputDir: "_site/img/",
 *   });
 *
 *   // Must run AFTER the image transform
 *   eleventyConfig.addTransform("lqip-svg", lqipSvgTransform);
 *
 *   // Rebuild when this file changes in --serve mode
 *   eleventyConfig.addWatchTarget("./config/htm-transform/lqipSvgTransform.js");
 * }
 *
 */
