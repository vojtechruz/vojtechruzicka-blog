import { describe, it, expect } from 'vitest';
import { loadPage, getAllPosts, SITE_DIR } from './helpers.js';
import { existsSync } from 'fs';

describe('Tags functionality', () => {
  // We use a known published post and its tag for testing
  const testPostPath = '/break-java-generics-naming-convention/';
  const testTagName = 'Java';
  const testTagSlug = 'java';

  describe('Post Header Tags (post.njk)', () => {
    it('should display tags in the post header', () => {
      const $ = loadPage(testPostPath);
      const tagLinks = $('.post-tags .tag-name');

      expect(tagLinks.length).toBeGreaterThan(0);

      const tagTexts = tagLinks.map((i, el) => $(el).text()).get();
      expect(tagTexts).toContain(testTagName);
    });

    it('tag links in header should point to the correct tag page', () => {
      const $ = loadPage(testPostPath);
      // Layout uses <a class="tag-name" href="...">{{tag}}</a>
      const tagLink = $(`.post-tags a[href="/tags/${testTagSlug}/"]`);

      expect(tagLink.length).toBe(1);
      expect(tagLink.text()).toBe(testTagName);
    });
  });

  describe('Linked Post Tags (linkedPost shortcode)', () => {
    it('should display tags in the post list card', () => {
      // Home page contains the linked post cards
      const $ = loadPage('/');

      // Find the card for our test post by its link
      // We use a recent post that is guaranteed to be on the home page (first 10 posts)
      const recentPostPath = '/spring-ai/';
      const recentPostTagName = 'Spring';
      const recentPostTagSlug = 'spring';

      // Shortcode renders: <div class="linked-post ..."> ... <a href="${url}">${title}</a> ... </div>
      const postCard = $(`.linked-post:has(a[href="${recentPostPath}"])`);
      expect(postCard.length).toBeGreaterThan(0);

      // Shortcode renders tags as: <li><a href="/tags/${slug}/"><span class="tag-name">${name}</span></a></li>
      const tagLinks = postCard.find('.post-tags .tag-name');
      expect(tagLinks.length).toBeGreaterThan(0);

      const tagTexts = tagLinks.map((i, el) => $(el).text()).get();
      expect(tagTexts).toContain(recentPostTagName);

      const tagLink = postCard.find(`.post-tags a[href="/tags/${recentPostTagSlug}/"]`);
      expect(tagLink.length).toBe(1);
    });
  });

  describe('Tag Pages (tag.njk)', () => {
    const tagPagePath = `/tags/${testTagSlug}/`;

    it('tag page should exist in the build output', () => {
      const filePath = `${SITE_DIR}${tagPagePath}index.html`;
      expect(existsSync(filePath), `Tag page should exist at ${filePath}`).toBe(true);
    });

    it('tag page should have the correct title and header', () => {
      const $ = loadPage(tagPagePath);
      // title is 'Posts tagged {{tag}}'
      expect($('title').text()).toContain(`Posts tagged ${testTagName}`);
      // h1 is {{ title }}
      expect($('h1').text()).toContain(`Posts tagged ${testTagName}`);
    });

    it('tag page should list posts belonging to that tag', () => {
      const $ = loadPage(tagPagePath);
      // tag.njk renders: <li><a href="{{ post.url }}">{{ post.data.title }}</a></li>
      const postLinks = $('ul a');

      const hrefs = postLinks.map((i, el) => $(el).attr('href')).get();
      expect(hrefs).toContain(testPostPath);
    });

    it('tag page should NOT list draft posts', () => {
      const allPosts = getAllPosts();
      const draftJavaPosts = allPosts.filter(
        (p) => p.frontmatter.draftStatus && p.frontmatter.tags && p.frontmatter.tags.includes(testTagName),
      );

      if (draftJavaPosts.length > 0) {
        const $ = loadPage(tagPagePath);
        const hrefs = $('ul a')
          .map((i, el) => $(el).attr('href'))
          .get();

        for (const draft of draftJavaPosts) {
          if (draft.frontmatter.path) {
            expect(hrefs, `Tag page should NOT contain draft post: ${draft.frontmatter.path}`).not.toContain(
              draft.frontmatter.path,
            );
          }
        }
      }
    });
  });

  describe('Archives/Topics Page (topics.njk)', () => {
    const archivesPath = '/archives/';

    it('archives page should list tags and link to their pages', () => {
      const $ = loadPage(archivesPath);
      // topics.njk renders: <a href="/tags/{{ tag.name | slugify }}/">{{ tag.name }} ({{ tag.count }})</a>
      const tagLink = $(`.tag-list a[href="/tags/${testTagSlug}/"]`);

      expect(tagLink.length).toBe(1);
      expect(tagLink.text()).toContain(testTagName);

      // Verify count is present (numeric in parentheses)
      expect(tagLink.text()).toMatch(/\(\d+\)/);
    });

    it('archives page should show correct count of published posts for a tag', () => {
      const $ = loadPage(archivesPath);
      const tagLink = $(`.tag-list a[href="/tags/${testTagSlug}/"]`);
      const text = tagLink.text();
      const match = text.match(/\((\d+)\)/);
      expect(match).not.toBeNull();
      const countOnPage = parseInt(match[1], 10);

      const allPosts = getAllPosts();
      const publishedJavaPosts = allPosts.filter(
        (p) => !p.frontmatter.draftStatus && p.frontmatter.tags && p.frontmatter.tags.includes(testTagName),
      );

      expect(countOnPage).toBe(publishedJavaPosts.length);
    });
  });

  describe('Post tag links - all posts', () => {
    const posts = getAllPosts().filter((post) => !post.frontmatter.draftStatus);

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
});
