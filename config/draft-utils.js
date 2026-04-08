// Draft utility functions shared by posts.11tydata.js and drafts.js

// Draft status stages (ordered by maturity):
//   "draft"   – early work-in-progress, local dev only
//   "review"  – content complete, awaiting final review, local dev only
//   "ready"   – ready to publish, visible in Cloudflare preview deploys + local dev
//   falsy     – published (default)

const DRAFT_STAGES = ["draft", "review", "ready"];

/**
 * Determine whether drafts should be included in the current build.
 * Priority:
 *   1. INCLUDE_DRAFTS env var ("true" / "false" / stage name)
 *   2. ELEVENTY_RUN_MODE === "serve" → include all drafts (local dev)
 *   3. CF_PAGES_BRANCH exists and is not "master"/"main" → include "ready" drafts (Cloudflare preview)
 *   4. Otherwise → exclude all drafts (production)
 */
function getIncludeDrafts() {
  const envVal = process.env.INCLUDE_DRAFTS;

  if (envVal === "true" || envVal === "all") {
    return "all";
  }
  if (envVal === "false" || envVal === "none") {
    return "none";
  }
  if (envVal && DRAFT_STAGES.includes(envVal)) {
    return envVal;
  }

  // Local dev server → show all drafts
  if (process.env.ELEVENTY_RUN_MODE === "serve") {
    return "all";
  }

  // Cloudflare Pages preview deploy (non-production branch)
  const cfBranch = process.env.CF_PAGES_BRANCH;
  if (cfBranch && cfBranch !== "master" && cfBranch !== "main") {
    return "ready";
  }

  // Production build → no drafts
  return "none";
}

/**
 * Check if a given draft status should be included in the current build.
 * @param {string|undefined} draftStatus - the post's draftStatus value
 * @returns {boolean}
 */
export function shouldIncludeDraft(draftStatus) {
  // not a draft → always include
  if (!draftStatus) {
    return true;
  }

  const include = getIncludeDrafts();

  if (include === "all") {
    return true;
  }

  if (include === "none") {
    return false;
  }

  // Include only drafts at or above the specified stage
  const thresholdIndex = DRAFT_STAGES.indexOf(include);
  const statusIndex = DRAFT_STAGES.indexOf(draftStatus);

  // unknown stage → exclude
  if (statusIndex === -1) {
    return false;
  }
  return statusIndex >= thresholdIndex;
}
