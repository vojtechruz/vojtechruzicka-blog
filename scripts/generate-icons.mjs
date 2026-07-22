// One-off generator for the production app icons, all derived from a single
// vector source so every icon shares the exact same brand blue (#0074E0).
//
// Produces two visual families:
//   - "any"      – the rounded-square VR mark on transparent corners (favicon, PWA any)
//   - "maskable" – full-bleed blue with the VR shrunk into the maskable safe zone
//     (inner 80%), so Android/iOS can crop to any shape without clipping the logo.
//
// Run from the repo root: `node scripts/generate-icons.mjs`. Outputs are static
// assets committed to src/static/ — nothing here runs during the Eleventy build.
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';

const STATIC = 'src/static';
const BLUE = '#0074E0';

// The rounded-square mark (matches favicon.svg). Transparent outside the shape.
const markSvg = readFileSync(`${STATIC}/favicon.svg`, 'utf8');

// Full-bleed variant: solid blue to the edges, VR scaled to 78% around the
// centre so it stays within the maskable safe zone whatever shape crops it.
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="${BLUE}"/>
  <g transform="translate(32 32) scale(0.78) translate(-32 -32)">
    <text x="32" y="46" text-anchor="middle" font-family="sans-serif" font-size="38" font-weight="normal" fill="#ffffff">VR</text>
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

// "any" rounded-square icons
write('favicon.png', await png(markSvg, 64));
write('web-app-manifest-192x192.png', await png(markSvg, 192));
write('web-app-manifest-512x512.png', await png(markSvg, 512));

// full-bleed icons (Apple touch must be opaque; maskable for Android home screen)
write('apple-touch-icon.png', await png(maskableSvg, 180));
write('web-app-manifest-maskable-192x192.png', await png(maskableSvg, 192));
write('web-app-manifest-maskable-512x512.png', await png(maskableSvg, 512));

// legacy .ico (multi-size, PNG-encoded)
const icoSizes = [48, 32, 16];
const icoImages = await Promise.all(icoSizes.map(async (size) => ({ size, buf: await png(markSvg, size) })));
write('favicon.ico', buildIco(icoImages));

console.log('done');
