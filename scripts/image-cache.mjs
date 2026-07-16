// Persistent cache for eleventy-img generated images.
//
// eleventy-img skips encoding when the output file already exists, and output
// filenames contain a content hash of the source image + processing options -
// so restoring previously generated images into _site before the build makes
// unchanged images free, and a stale cache can never serve wrong content
// (changed source -> different hash -> different filename).
//
// Usage: node scripts/image-cache.mjs restore|save
//   restore - copy cached images into _site (run after clean, before eleventy)
//   save    - mirror generated images from _site into the cache dir
//
// Cache location: .cache/image-mirror (gitignored) everywhere. Cloudflare Pages
// preserves `.cache` between builds for the Eleventy framework preset, GitHub
// Actions persists it via actions/cache, and locally it just stays on disk.

import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';

const SITE_DIR = '_site';
const CACHE_DIR = '.cache/image-mirror';

// Matches the filenameFormat in config/plugins/image.js: <name>-<hash>-<width>.<format>
const GENERATED_IMAGE = /-[A-Za-z0-9_-]{8,12}-\d+\.(avif|webp|png|jpe?g|gif)$/i;

function* walkFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkFiles(fullPath);
    } else if (entry.isFile()) {
      yield fullPath;
    }
  }
}

function copyTree(fromDir, toDir, filter) {
  let count = 0;
  for (const file of walkFiles(fromDir)) {
    if (!filter(file)) {
      continue;
    }
    const target = path.join(toDir, path.relative(fromDir, file));
    mkdirSync(path.dirname(target), { recursive: true });
    copyFileSync(file, target);
    count++;
  }
  return count;
}

const mode = process.argv[2];

if (mode === 'restore') {
  if (!existsSync(CACHE_DIR)) {
    console.log(`[image-cache] no cache at ${CACHE_DIR}, starting cold`);
    process.exit(0);
  }
  const count = copyTree(CACHE_DIR, SITE_DIR, () => true);
  console.log(`[image-cache] restored ${count} images from ${CACHE_DIR}`);
} else if (mode === 'save') {
  if (!existsSync(SITE_DIR)) {
    console.log(`[image-cache] no ${SITE_DIR} to save from`);
    process.exit(0);
  }
  const count = copyTree(SITE_DIR, CACHE_DIR, (file) => GENERATED_IMAGE.test(path.basename(file)));
  console.log(`[image-cache] saved ${count} generated images to ${CACHE_DIR}`);
} else {
  console.error('Usage: node scripts/image-cache.mjs restore|save');
  process.exit(1);
}
