import { shouldIncludeDraft } from './draft-utils.js';

export function isPublicPostForDiscovery(post) {
  return shouldIncludeDraft(post?.data?.draftStatus) && !post?.data?.archivedStatus;
}
