// This will work both for build via Github CI (currently using) and Cloudflare
export const getBranch = () => process.env.GITHUB_REF_NAME || process.env.CF_PAGES_BRANCH || '';

export const isPreview = () => {
  const branch = getBranch();
  return branch !== '' && branch !== 'main' && branch !== 'master';
};

export const isLocalDevelopment = () => process.env.ELEVENTY_RUN_MODE === 'serve';
