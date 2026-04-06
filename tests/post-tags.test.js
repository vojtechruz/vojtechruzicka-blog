import { describe, it, expect } from 'vitest';
import { loadPage, getAllPosts } from './helpers.js';
import { existsSync } from 'fs';

describe('Post tag links', () => {
  const posts = getAllPosts();

  it('tag links use lowercase slugified hrefs with trailing slash', () => {
    for (const { frontmatter } of posts) {
      if (!frontmatter.path || !frontmatter.tags) {
        continue;
      }

      const $ = loadPage(frontmatter.path);
      const tagLinks = $('ul.post-tags a.tag-name');

      tagLinks.each((_, el) => {
        const href = $(el).attr('href');
        expect(href).toMatch(/^\/tags\/[a-z0-9-]+\/$/);
      });
    }
  });

  it('tag links point to existing tag pages', () => {
    for (const { frontmatter } of posts) {
      if (!frontmatter.path || !frontmatter.tags) {
        continue;
      }

      const $ = loadPage(frontmatter.path);
      const tagLinks = $('ul.post-tags a.tag-name');

      tagLinks.each((_, el) => {
        const href = $(el).attr('href');
        const tagPagePath = `_site${href}index.html`;
        expect(existsSync(tagPagePath), `Tag page missing: ${tagPagePath}`).toBe(true);
      });
    }
  });
});
