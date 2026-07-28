// One-off generator for the production app icons, all derived from a single
// vector source so every icon shares the exact same brand-blue gradient.
//
// Produces two visual families:
//   - "any"      – the rounded-square VR mark on transparent corners (favicon, PWA any)
//   - "maskable" – full-bleed blue with the VR shrunk into the maskable safe zone
//     (inner 80%), so Android/iOS can crop to any shape without clipping the logo.
//
// The VR letterforms are outlined paths (kept in sync with favicon.svg) rather than
// live <text>, so every rasterised size is identical regardless of installed fonts.
//
// Optical sizing: small icons (favicon.svg/.png/.ico, shown in a browser tab) use the
// heavier Inter ExtraBold so the mark stays legible once shrunk to ~16px; large icons
// (apple-touch, PWA manifest, maskable) use the lighter Inter Bold, which reads more
// refined at those sizes. Nobody sees the two side by side.
//
// Run from the repo root: `node scripts/generate-icons.mjs`. Outputs are static
// assets committed to src/static/ — nothing here runs during the Eleventy build.
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';

const STATIC = 'src/static';

// Brand-blue gradient, shared by the generated icons.
const GRAD = `<linearGradient id="vr-bg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#1a86ea"/><stop offset="1" stop-color="#0068ca"/>
  </linearGradient>`;

// Large-icon monogram: Inter Bold (700), outlined. The ExtraBold (800) counterpart
// used for the small icons lives in favicon.svg and is read in as markSvg800 below.
const MONO_700 = `<path fill="#ffffff" d="M23.22 47L15.18 47L4.67 17L11.5 17L16.29 31.48Q17.16 34.21 18.04 37.51Q18.93 40.8 19.91 44.7L19.91 44.7L18.58 44.7Q19.55 40.76 20.4 37.49Q21.24 34.21 22.07 31.48L22.07 31.48L26.7 17L33.48 17L23.22 47M42.09 47L35.95 47L35.95 17L47.65 17Q51.07 17 53.47 18.21Q55.86 19.42 57.12 21.61Q58.38 23.81 58.38 26.77L58.38 26.77Q58.38 29.72 57.1 31.87Q55.82 34.01 53.4 35.15Q50.97 36.29 47.51 36.29L47.51 36.29L39.58 36.29L39.58 31.32L46.52 31.32Q48.42 31.32 49.62 30.8Q50.83 30.29 51.44 29.27Q52.04 28.26 52.04 26.77L52.04 26.77Q52.04 25.23 51.44 24.2Q50.83 23.16 49.61 22.62Q48.39 22.07 46.5 22.07L46.5 22.07L42.09 22.07L42.09 47M59.45 47L52.64 47L45.33 33.35L52 33.35L59.45 47"/>`;

// Small "any" mark (ExtraBold rounded square) — straight from favicon.svg.
const markSvg800 = readFileSync(`${STATIC}/favicon.svg`, 'utf8');

// Large "any" mark: same rounded square, Bold weight.
const markSvg700 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>${GRAD}</defs>
  <rect width="64" height="64" rx="13" fill="url(#vr-bg)"/>
  ${MONO_700}
</svg>`;

// Large full-bleed maskable: Bold, scaled to 78% around the centre so it stays within
// the maskable safe zone whatever shape crops it.
const maskable700 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>${GRAD}</defs>
  <rect width="64" height="64" fill="url(#vr-bg)"/>
  <g transform="translate(32 32) scale(0.78) translate(-32 -32)">
    ${MONO_700}
  </g>
</svg>`;

const png = (svg, size) => sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();

// Minimal PNG-in-ICO container (accepted by every modern browser). Sizes are
// packed newest-first; width/height byte 0 means 256 per the ICO spec.
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + images.length * 16;
  const entries = [];
  for (const { size, buf } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(buf.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    offset += buf.length;
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.buf)]);
}

const write = (name, buf) => {
  writeFileSync(`${STATIC}/${name}`, buf);
  console.log('wrote', name, `(${buf.length} B)`);
};

// small "any" rounded-square icon — ExtraBold (tab-strip legibility)
write('favicon.png', await png(markSvg800, 64));

// large "any" rounded-square icons — Bold (refined at PWA sizes)
write('web-app-manifest-192x192.png', await png(markSvg700, 192));
write('web-app-manifest-512x512.png', await png(markSvg700, 512));

// large full-bleed icons — Bold (Apple touch must be opaque; maskable for Android home screen)
write('apple-touch-icon.png', await png(maskable700, 180));
write('web-app-manifest-maskable-192x192.png', await png(maskable700, 192));
write('web-app-manifest-maskable-512x512.png', await png(maskable700, 512));

// legacy .ico (multi-size, PNG-encoded) — ExtraBold at every small size
const icoSizes = [48, 32, 16];
const icoImages = await Promise.all(icoSizes.map(async (size) => ({ size, buf: await png(markSvg800, size) })));
write('favicon.ico', buildIco(icoImages));

console.log('done');
