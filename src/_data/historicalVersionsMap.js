// Builds a reverse-lookup map { [livePostUrl]: archivedPost[] } from archive frontmatter.
//
// This exists to avoid accessing d.collections.all in eleventyComputed.js. Any computed
// property that touches d.collections marks every page as collection-dependent, forcing
// Eleventy to rebuild all ~147 pages on every file change (~6s) instead of only the
// changed file (~1.3s). Running as a global data file means it executes once per build.
//
// Caveat: adding a new archive file while the dev server is running won't update the live
// post's "Previous Versions" section in incremental mode — restart the server to pick it up.

import { glob } from 'glob';
import { readFileSync } from 'fs';
import { load as yamlLoad } from 'js-yaml';

/** Extract YAML frontmatter from a markdown file string. */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    return {};
  }
  try {
    return yamlLoad(match[1]) || {};
  } catch {
    return {};
  }
}

export default async function () {
  const files = await glob('src/posts/archives/**/*.md');
  const map = {};

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const data = parseFrontmatter(content);

    if (data.archivedStatus && data.supersededBy) {
      const liveUrl = data.supersededBy;
      if (!map[liveUrl]) {
        map[liveUrl] = [];
      }
      map[liveUrl].push({
        url: data.path || null,
        label: data.title || null,
        archivedDate: data.archivedDate || null,
      });
    }
  }

  return map;
}
