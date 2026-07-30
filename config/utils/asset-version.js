import { createHash } from 'crypto';
import { readdirSync, readFileSync } from 'fs';
import path from 'path';
import { logWarning } from '../logger.js';

/**
 * Cache-busting for assets served under a stable URL (main.css, bundled scripts,
 * favicons). These are long-cached as immutable by src/static/_headers, so the URL
 * must change whenever the content does — otherwise CDN/browser caches keep serving
 * the old version after a deploy. Appends a short content hash as a query parameter.
 *
 * The hash is computed from the source files (not the build output), because
 * templates render before/parallel to the Sass and esbuild plugins.
 */

const VERSION_LENGTH = 10;

const cache = new Map();

function collectFiles(dir) {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name))
    .sort();
}

function hashFiles(files) {
  const hash = createHash('md5');
  for (const file of files) {
    hash.update(readFileSync(file));
  }
  return hash.digest('hex').slice(0, VERSION_LENGTH);
}

/**
 * Source files that determine the content of a given root-relative asset URL.
 * Compiled bundles hash their whole source directory (any partial/module can
 * affect the output); static passthrough files hash the file itself.
 */
function sourcesFor(assetUrl) {
  if (assetUrl.startsWith('/styles/')) {
    return collectFiles('src/styles');
  }
  if (assetUrl.startsWith('/scripts/')) {
    return collectFiles('src/scripts');
  }
  return [path.join('src/static', assetUrl)];
}

export function versionedAssetUrl(assetUrl) {
  if (cache.has(assetUrl)) {
    return cache.get(assetUrl);
  }
  let result;
  try {
    result = `${assetUrl}?v=${hashFiles(sourcesFor(assetUrl))}`;
  } catch (error) {
    logWarning(`Could not compute cache-busting version for "${assetUrl}": ${error.message}`);
    result = assetUrl;
  }
  cache.set(assetUrl, result);
  return result;
}
