/**
 * Related posts filter for Eleventy.
 *
 * Resolution order:
 *  1. Explicit `relatedPosts` frontmatter array (paths) — kept in declaration order.
 *  2. Tag-based matching — posts sharing the most tags with the current post,
 *     with date as tiebreaker (newer first).
 *
 * Rules:
 *  - Posts belonging to any series are completely excluded.
 *  - Draft posts are excluded.
 *  - At least one shared tag is required for tag-based matches.
 *  - The current post is never included in its own related list.
 */

/**
 * Compute related posts for a given post.
 *
 * @param {object}   currentPost - The Eleventy page object for the current post.
 * @param {object[]} allPosts    - The `collections.posts` array.
 * @param {number}   maxCount    - Maximum number of related posts to return.
 * @returns {object[]} Array of Eleventy page objects.
 */
export function getRelatedPosts(currentPost, allPosts, maxCount) {
  if (!currentPost || !Array.isArray(allPosts) || maxCount <= 0) {
    return [];
  }

  const currentUrl = currentPost.url || '';
  const currentTags = new Set(currentPost.data?.tags || []);

  // Build the eligible pool: exclude self, series posts, and drafts
  const pool = allPosts.filter((p) => {
    if (p.url === currentUrl) {
      return false;
    }
    if (p.data?.series) {
      return false;
    }
    if (p.data?.draftStatus) {
      return false;
    }
    return true;
  });

  const results = [];
  const usedUrls = new Set();

  // --- Phase 1: Explicit related posts from frontmatter (in declaration order) ---
  const explicitPaths = currentPost.data?.relatedPosts;
  if (Array.isArray(explicitPaths)) {
    for (const relPath of explicitPaths) {
      if (results.length >= maxCount) {
        break;
      }

      const match = pool.find((p) => p.url === relPath);

      if (match && !usedUrls.has(match.url)) {
        results.push(match);
        usedUrls.add(match.url);
      }
    }
  }

  // --- Phase 2: Tag-based matching for remaining slots ---
  if (results.length < maxCount && currentTags.size > 0) {
    const candidates = pool
      .filter((p) => !usedUrls.has(p.url))
      .map((p) => {
        const postTags = new Set(p.data?.tags || []);
        const overlap = [...currentTags].filter((t) => postTags.has(t)).length;
        return { post: p, score: overlap };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || b.post.date - a.post.date);

    for (const { post } of candidates) {
      if (results.length >= maxCount) {
        break;
      }

      results.push(post);
    }
  }

  return results;
}

export default function registerRelatedPostsFilter(eleventyConfig) {
  eleventyConfig.addFilter('relatedPosts', function (currentPost, allPosts, maxCount) {
    return getRelatedPosts(currentPost, allPosts, maxCount);
  });
}
