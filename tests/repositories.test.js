import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { basename, dirname } from 'path';
import { globSync } from 'glob';
import matter from 'gray-matter';
import { repositories, DEFAULT_LABEL } from '../config/filters/repositories.js';
import { loadPage } from './helpers.js';

const REPO = 'https://github.com/vojtechruz/spring-ai-demo';

describe('repositories filter', () => {
  it('takes a single URL', () => {
    expect(repositories(REPO)).toEqual([
      { url: REPO, href: REPO, name: 'vojtechruz/spring-ai-demo', label: DEFAULT_LABEL },
    ]);
  });

  it('takes a list with optional labels, in order', () => {
    const result = repositories([{ url: REPO }, { url: 'https://github.com/vojtechruz/starter/', label: 'Starter' }]);
    expect(result.map(({ name, label }) => [name, label])).toEqual([
      ['vojtechruz/spring-ai-demo', DEFAULT_LABEL],
      ['vojtechruz/starter', 'Starter'],
    ]);
    // A trailing slash is not part of the repository
    expect(result[1].url).toBe('https://github.com/vojtechruz/starter');
  });

  it('links the archive tag for an archived copy', () => {
    expect(repositories(REPO, 'archive/spring-ai-2027-01')[0].href).toBe(`${REPO}/tree/archive/spring-ai-2027-01`);
  });

  it('is empty without a repository', () => {
    expect(repositories(undefined)).toEqual([]);
  });

  it('fails the build on something that is not a GitHub repository', () => {
    expect(() => repositories('https://gitlab.com/x/y')).toThrow(/not a GitHub repository/);
    expect(() => repositories('https://github.com/vojtechruz/repo/pull/2')).toThrow(/not a GitHub repository/);
  });
});

describe('repository front matter', () => {
  const posts = globSync('src/posts/**/index.md', { posix: true }).map((file) => ({
    file,
    data: matter(readFileSync(file, 'utf-8')).data,
  }));
  const withRepo = posts.filter(({ data }) => data.repository);

  it('is used by the articles that come with code', () => {
    expect(withRepo.length).toBeGreaterThanOrEqual(13);
  });

  it.each(withRepo.map(({ file, data }) => [file, data]))('%s names valid repositories', (_, data) => {
    expect(repositories(data.repository, data.repositoryRef).length).toBeGreaterThan(0);
  });

  // An archived copy keeps the code it was written for: the tag /archive-post creates in each repository
  it.each(withRepo.filter(({ data }) => data.archivedStatus).map(({ file, data }) => [file, data]))(
    '%s (archived) links its archive tag',
    (file, data) => {
      expect(data.repositoryRef).toBe(`archive/${basename(dirname(file))}`);
    },
  );

  it('sets repositoryRef only on archived copies', () => {
    const stray = posts.filter(({ data }) => data.repositoryRef && !data.archivedStatus).map(({ file }) => file);
    expect(stray).toEqual([]);
  });
});

describe('repository links on the built page', () => {
  it('lists every repository below the article, the first one also in the header', () => {
    const $ = loadPage('/spring-rest-docs/');
    const buttons = $('article .repository-card .resource-card-button');
    expect(buttons.map((_, el) => $(el).attr('href')).get()).toEqual([
      'https://github.com/vojtechruz/spring-rest-docs-example',
      'https://github.com/vojtechruz/rest-docs-starter',
    ]);
    expect($('.repository-card').attr('data-pagefind-ignore')).toBeDefined();
    expect($('.repository-card').text()).toContain('Starter project to follow along');

    const chip = $('.post-metadata a.post-repo-link');
    expect(chip.attr('href')).toBe('https://github.com/vojtechruz/spring-rest-docs-example');
    // The visible text is part of the accessible name (WCAG 2.5.3)
    expect(chip.attr('aria-label').toLowerCase()).toContain(chip.text().trim().toLowerCase());
  });

  it('shows nothing for an article without a repository', () => {
    const $ = loadPage('/css-flexbox/');
    expect($('.repository-card').length).toBe(0);
    expect($('.post-repo-link').length).toBe(0);
  });
});
