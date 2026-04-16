// Draft preprocessor for Eleventy 3.x
// Uses addPreprocessor to completely ignore draft content during production builds.
// Returning false from a preprocessor tells Eleventy to skip the file entirely
// (no output, no collections, no sitemap — as if the file doesn't exist).

import { shouldIncludeDraft } from './draft-utils.js';

export default function registerDrafts(eleventyConfig) {
  eleventyConfig.addPreprocessor('drafts', 'md', (data) => {
    // Exclude review files TODO temporary
    if (data.page.inputPath.endsWith('review.md') || data.page.inputPath.endsWith('master-review.md')) {
      return false;
    }

    if (!data.draftStatus) {
      return;
    }

    if (shouldIncludeDraft(data.draftStatus)) {
      return;
    }

    return false; // completely ignore this file
  });
}
