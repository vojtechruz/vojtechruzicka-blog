import { readdirSync, readFileSync } from 'fs';
import path from 'path';

const POSTS_DIR = path.resolve('src', 'posts');

let byUrl;

/** First frontmatter value of `key`, unquoted; undefined when the key is absent. */
function frontmatterValue(source, key) {
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source)?.[1] ?? '';
  const value = new RegExp(`^${key}:\\s*(.+?)\\s*$`, 'm').exec(frontmatter)?.[1];
  return value?.replace(/^(['"])(.*)\1$/, '$2');
}

/**
 * Absolute path of a post's featured image, looked up by the post's URL (its `path` frontmatter).
 * For computed data that needs another post's image: collections are not reliably populated while
 * eleventyComputed runs, so the post sources are read directly (once per build).
 * @returns {string|undefined}
 */
export function featuredImagePathForUrl(url) {
  if (!byUrl) {
    byUrl = new Map();
    const files = readdirSync(POSTS_DIR, { recursive: true }).filter((f) => path.basename(f) === 'index.md');
    for (const file of files) {
      const fullPath = path.join(POSTS_DIR, file);
      const source = readFileSync(fullPath, 'utf-8');
      const postUrl = frontmatterValue(source, 'path');
      if (postUrl) {
        // Same default as posts.11tydata.js
        const image = (frontmatterValue(source, 'featuredImage') || 'featured.jpg').replace(/^\.\//, '');
        byUrl.set(postUrl, path.resolve(path.dirname(fullPath), image));
      }
    }
  }
  return byUrl.get(url);
}
