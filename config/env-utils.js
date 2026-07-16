// This will work both for build via Github CI (currently using) and Cloudflare
export const getBranch = () => process.env.GITHUB_REF_NAME || process.env.CF_PAGES_BRANCH || '';

export const isPreview = () => {
  const branch = getBranch();
  return branch !== '' && branch !== 'main' && branch !== 'master';
};

export const isLocalDevelopment = () => process.env.ELEVENTY_RUN_MODE === 'serve';

/**
 * On Cloudflare Pages (CF_PAGES=1) store Playwright browsers inside `.cache`,
 * which the CF build cache preserves between deploys for the Eleventy framework
 * preset (node_modules is NOT preserved — only package manager stores are).
 * Locally the shared per-user cache stays in use. Must run before Playwright
 * launches (mermaid rendering) and before `playwright install` — both resolve
 * the browser location from this variable.
 */
export const configurePlaywrightBrowserPath = () => {
  if (process.env.CF_PAGES && !process.env.PLAYWRIGHT_BROWSERS_PATH) {
    process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(process.cwd(), '.cache', 'ms-playwright');
  }
};
