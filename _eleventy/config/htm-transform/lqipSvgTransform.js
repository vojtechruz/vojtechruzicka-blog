import path from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";
import { load } from "cheerio";

const OUTPUT_DIR = "_site";     // přizpůsob svému outputu
const GRID_W = 16;              // šířka „mozaiky“ (čím méně, tím menší SVG)
const GRID_H = 10;              // výška „mozaiky“
const BLUR_STD_DEV = 0.2;        // intenzita rozostření ve filtru

const PROJECT_ROOT = process.cwd();

function getBufferForSmallestPath(smallest) {
  // DEV mód: eleventy --serve dává /.11ty/image/?src=...&width=...
  if (smallest.startsWith("/.11ty/image/")) {
    const q = smallest.split("?")[1] || "";
    const params = new URLSearchParams(q);
    const srcParam = params.get("src"); // např. "src\posts\...\featured.jpg"
    if (!srcParam) throw new Error("Missing src param in /.11ty/image URL");
    const decoded = decodeURIComponent(srcParam);
    // zdrojový obrázek ber z repo rootu
    const abs = path.join(PROJECT_ROOT, decoded.replace(/^[\\/]/, ""));
    return fs.readFile(abs);
  }

  // BUILD mód: už existuje fyzický soubor v _site
  const absOut = path.join(OUTPUT_DIR, smallest.replace(/^\//, ""));
  return fs.readFile(absOut);
}

function rgbToHex([r, g, b]) {
  return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}

function buildSvg({ pixels, width, height }) {
  const rectW = 1, rectH = 1; // pracujeme v „virtuálních“ jednotkách
  const svgW = width * rectW;
  const svgH = height * rectH;

  let rects = "";
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 3;
      const color = rgbToHex([pixels[idx], pixels[idx + 1], pixels[idx + 2]]);
      rects += `<rect x="${x}" y="${y}" width="${rectW}" height="${rectH}" fill="${color}"/>`;
    }
  }

  // Inline SVG s blur filtrem
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" preserveAspectRatio="none">
  <defs>
    <filter id="b" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="${BLUR_STD_DEV}" />
    </filter>
  </defs>
  <g filter="url(#b)">${rects}</g>
</svg>`.trim();
}

export async function lqipSvgTransform(content, outputPath) {
  if (!outputPath || !outputPath.endsWith(".html")) return content;

  const $ = load(content);
  const jobs = [];

  $("picture").each((_, pic) => {
    const $pic = $(pic);
    const $img = $pic.find("img").first();
    if (!$img.length) return;

    // vezmeme nejmenší kandidáta z libovolného srcsetu (obvykle je první)
    const $source = $pic.find("source").first();
    const srcset = $source.attr("srcset") || $img.attr("srcset");
    if (!srcset) return;
    const smallest = srcset.split(",")[0].trim().split(" ")[0];
    if (!smallest) return;

    const filePath = path.join(OUTPUT_DIR, smallest.replace(/^\//, ""));

    jobs.push((async () => {
      try {
        // načti a zmenši do pevné mřížky, ať je SVG malé a konzistentní
        const buf = await getBufferForSmallestPath(smallest);
        const meta = await sharp(buf).metadata();
        const svgW = GRID_W;
        const svgH = GRID_H;

        // Resamplujeme na GRID_W×GRID_H a vytáhneme raw RGB
        const { data } = await sharp(buf)
          .resize(svgW, svgH, { fit: "cover" })
          .removeAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true });

        const svg = buildSvg({ pixels: data, width: svgW, height: svgH });

        // data URL (UTF-8; escapneme uvozovky a procenta)
        const svgUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

        // nastavíme jako background-image na <img>
        const prev = $img.attr("style") || "";
        const style =
          `background-image:url('${svgUrl}');background-size:cover;` +
          `background-position:center;background-repeat:no-repeat;` +
          prev;
        $img.attr("style", style);
        console.log(`Processed ${filePath}`);
      } catch (e) {
        // nechceme zbourat build při chybě placeholderu
        console.error(`Error processing ${filePath}:`, e);
      }
    })());
  });

  await Promise.all(jobs);
  return $.html();
}
