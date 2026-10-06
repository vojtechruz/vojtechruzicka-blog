/**
 * Find a post by its URL for the linkedPost / linkedPostCompact shortcodes. Searches published
 * posts first, then archived copies (not part of collections.posts), then everything else.
 * @returns {object|undefined} the collection item
 */
export function findPostByUrl(permalink, collections = {}) {
  const buckets = [collections.posts || [], collections.archivedPosts || [], collections.all || []];
  return buckets.flat().find((p) => p && (p.url === permalink || (p.page && p.page.url === permalink)));
}

/** Collections passed explicitly win; otherwise take them from the Eleventy shortcode context. */
export function resolveCollections(ctx, maybeCollections) {
  return maybeCollections || ctx.collections || (ctx.page && ctx.page.collections) || {};
}
