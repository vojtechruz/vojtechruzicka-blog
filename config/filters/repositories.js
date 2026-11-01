// The GitHub repositories an article's code lives in, from its front matter (docs/REPOSITORIES.md):
//
//   repository: https://github.com/vojtechruz/spring-ai-demo
//   repository:
//     - url: https://github.com/vojtechruz/spring-rest-docs-example
//     - url: https://github.com/vojtechruz/rest-docs-starter
//       label: Starter project to follow along
//
// An archived copy (src/posts/archives/) adds `repositoryRef: archive/<archive-slug>`, the tag the
// /archive-post command creates in each repository: its links then show the code as it was when the
// article was archived, while the current article links the default branch.
//
// Shown by components/repository-card.njk (below the article) and the post header.

const GITHUB_REPO = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+?)\/?$/;
export const DEFAULT_LABEL = 'Example code for this article';

/**
 * Normalised repositories: [{ url, href, name, label }], [] when there are none. Throws on a URL that is
 * not a GitHub repository, so a typo fails the build instead of shipping a broken link.
 */
export function repositories(repository, repositoryRef) {
  if (!repository) {
    return [];
  }
  const entries = (Array.isArray(repository) ? repository : [repository]).map((entry) =>
    typeof entry === 'string' ? { url: entry } : entry,
  );
  return entries.map(({ url, label }) => {
    const match = GITHUB_REPO.exec(String(url ?? '').trim());
    if (!match) {
      throw new Error(`repository: "${url}" is not a GitHub repository URL (https://github.com/<owner>/<repo>)`);
    }
    const [, owner, repo] = match;
    const base = `https://github.com/${owner}/${repo}`;
    return {
      url: base,
      href: repositoryRef ? `${base}/tree/${repositoryRef}` : base,
      name: `${owner}/${repo}`,
      label: label || DEFAULT_LABEL,
    };
  });
}

export default function registerRepositoryFilters(eleventyConfig) {
  eleventyConfig.addFilter('repositories', repositories);
}
