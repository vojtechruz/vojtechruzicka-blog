import { versionedAssetUrl } from '../utils/asset-version.js';

export default function registerAssetVersionFilter(eleventyConfig) {
  // {{ "/styles/main.css" | assetUrl }} → /styles/main.css?v=<content hash>
  eleventyConfig.addFilter('assetUrl', versionedAssetUrl);
}
