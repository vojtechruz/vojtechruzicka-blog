import path from 'node:path';

// This will work both for build via Github CI (currently using) and Cloudflare
export const getBranch = () => process.env.GITHUB_REF_NAME || process.env.CF_PAGES_BRANCH || '';

/**
 * Preview deploys are the branch deploys on Cloudflare Pages. `DEPLOY_ENV` ("production" or
 * "preview") overrides the branch heuristic outright — CI relies on it, because GITHUB_REF_NAME
 * makes every feature-branch build look like a preview deploy, while the tests assert against a
 * production artifact.
 */
export const isPreview = () => {
  if (process.env.DEPLOY_ENV) {
    return process.env.DEPLOY_ENV === 'preview';
  }

  const branch = getBranch();
  return branch !== '' && branch !== 'main' && branch !== 'master';
};

export const isLocalDevelopment = () => process.env.ELEVENTY_RUN_MODE === 'serve';

/**
 * On Cloudflare Pages (CF_PAGES=1) store Playwright browsers inside `.cache`,
 * which the CF build cache preserves between deploys because it detects Eleventy
 * from package.json (node_modules is NOT preserved — only package manager stores
 * are). Locally the shared per-user cache stays in use. Must run before Playwright
 * launches (mermaid rendering) and before `playwright install` — both resolve
 * the browser location from this variable.
 */
export const configurePlaywrightBrowserPath = () => {
  if (process.env.CF_PAGES && !process.env.PLAYWRIGHT_BROWSERS_PATH) {
    process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(process.cwd(), '.cache', 'ms-playwright');
  }
};
