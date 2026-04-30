import { describe, it, expect } from 'vitest';
import { loadPage, getAllPosts, SITE_DIR } from './helpers.js';
import { existsSync } from 'fs';

describe('Topics functionality', () => {
  // We use a known published post and its topic for testing
  const testPostPath = '/break-java-generics-naming-convention/';
  const testTopicName = 'Java';
  const testTopicSlug = 'java';

  describe('Post Header Topics (post.njk)', () => {
    it('should display topics in the post header', () => {
      const $ = loadPage(testPostPath);
      const topicLinks = $('.post-topics .topic-name');

      expect(topicLinks.length).toBeGreaterThan(0);

      const topicTexts = topicLinks.map((i, el) => $(el).text()).get();
      expect(topicTexts).toContain(testTopicName);
    });

    it('topic links in header should point to the correct topic page', () => {
      const $ = loadPage(testPostPath);
      // Layout uses <a class="topic-name" href="...">{{topic}}</a>
      const topicLink = $(`.post-topics a[href="/topics/${testTopicSlug}/"]`);

      expect(topicLink.length).toBe(1);
      expect(topicLink.text()).toBe(testTopicName);
    });
  });

  describe('Linked Post Topics (linkedPost shortcode)', () => {
    it('should display topics in the post list card', () => {
      // Home page contains the linked post cards
      const $ = loadPage('/');

      // Find the first post card on the home page to test dynamically
      const firstPostCard = $('.linked-post').first();
      expect(firstPostCard.length).toBeGreaterThan(0);

      const postLink = firstPostCard.find('h2.front-post-title a');
      const postPath = postLink.attr('href');
      expect(postPath).toBeDefined();

      // Get metadata for this post to know which topics to expect
      const allPosts = getAllPosts();
      const postMetadata = allPosts.find((p) => p.frontmatter.path === postPath);
      expect(postMetadata).toBeDefined();
      expect(postMetadata.frontmatter.topics).toBeDefined();
      expect(postMetadata.frontmatter.topics.length).toBeGreaterThan(0);

      const expectedTopicName = postMetadata.frontmatter.topics[0];
      const expectedTopicSlug = expectedTopicName.toLowerCase().replace(/\s+/g, '-');

      // Shortcode renders topics as: <li><a href="/topics/${slug}/"><span class="topic-name">${name}</span></a></li>
      const topicLinks = firstPostCard.find('.post-topics .topic-name');
      expect(topicLinks.length).toBeGreaterThan(0);

      const topicTexts = topicLinks.map((i, el) => $(el).text()).get();
      expect(topicTexts).toContain(expectedTopicName);

      const topicLink = firstPostCard.find(`.post-topics a[href="/topics/${expectedTopicSlug}/"]`);
      expect(topicLink.length).toBe(1);
    });
  });

  describe('Topic Pages (topic.njk)', () => {
    const topicPagePath = `/topics/${testTopicSlug}/`;

    it('topic page should exist in the build output', () => {
      const filePath = `${SITE_DIR}${topicPagePath}index.html`;
      expect(existsSync(filePath), `Topic page should exist at ${filePath}`).toBe(true);
    });

    it('topic page should have the correct title and header', () => {
      const $ = loadPage(topicPagePath);
      // title is 'Posts about {{topic}}'
      expect($('title').text()).toContain(`Posts about ${testTopicName}`);
      // h1 is {{ title }}
      expect($('h1').text()).toContain(`Posts about ${testTopicName}`);
    });

    it('topic page should list posts belonging to that topic', () => {
      const $ = loadPage(topicPagePath);
      // topic.njk renders: <li><a href="{{ post.url }}">{{ post.data.title }}</a></li>
      const postLinks = $('ul a');

      const hrefs = postLinks.map((i, el) => $(el).attr('href')).get();
      expect(hrefs).toContain(testPostPath);
    });

    it('topic page should NOT list draft posts', () => {
      const allPosts = getAllPosts();
      const draftJavaPosts = allPosts.filter(
        (p) => p.frontmatter.draftStatus && p.frontmatter.topics && p.frontmatter.topics.includes(testTopicName),
      );

      if (draftJavaPosts.length > 0) {
        const $ = loadPage(topicPagePath);
        const hrefs = $('ul a')
          .map((i, el) => $(el).attr('href'))
          .get();

        for (const draft of draftJavaPosts) {
          if (draft.frontmatter.path) {
            expect(hrefs, `Topic page should NOT contain draft post: ${draft.frontmatter.path}`).not.toContain(
              draft.frontmatter.path,
            );
          }
        }
      }
    });
  });

  describe('Topics Page (topics.njk)', () => {
    const archivesPath = '/topics/';

    it('archives page should list topics and link to their pages', () => {
      const $ = loadPage(archivesPath);
      const topicLink = $(`.topic-chip[href="/topics/${testTopicSlug}/"]`);

      expect(topicLink.length).toBe(1);
      expect(topicLink.text()).toContain(testTopicName);

      // Verify count is present as a numeric chip-count element
      expect(topicLink.find('.topic-chip-count').text().trim()).toMatch(/\d+/);
    });

    it('archives page should show correct count of published posts for a topic', () => {
      const $ = loadPage(archivesPath);
      const topicLink = $(`.topic-chip[href="/topics/${testTopicSlug}/"]`);
      const countText = topicLink.find('.topic-chip-count').text().trim();
      const countOnPage = parseInt(countText.replace(/\D/g, ''), 10);

      const allPosts = getAllPosts();
      const publishedJavaPosts = allPosts.filter(
        (p) => !p.frontmatter.draftStatus && p.frontmatter.topics && p.frontmatter.topics.includes(testTopicName),
      );

      expect(countOnPage).toBe(publishedJavaPosts.length);
    });
  });

  describe('Post topic links - all posts', () => {
    const posts = getAllPosts().filter((post) => !post.frontmatter.draftStatus);

    it('topic links use lowercase slugified hrefs with trailing slash', () => {
      for (const { frontmatter } of posts) {
        if (!frontmatter.path || !frontmatter.topics) {
          continue;
        }

        const $ = loadPage(frontmatter.path);
        const topicLinks = $('ul.post-topics a.topic-name');

        topicLinks.each((_, el) => {
          const href = $(el).attr('href');
          expect(href).toMatch(/^\/topics\/[a-z0-9-]+\/$/);
        });
      }
    });

    it('topic links point to existing topic pages', () => {
      for (const { frontmatter } of posts) {
        if (!frontmatter.path || !frontmatter.topics) {
          continue;
        }

        const $ = loadPage(frontmatter.path);
        const topicLinks = $('ul.post-topics a.topic-name');

        topicLinks.each((_, el) => {
          const href = $(el).attr('href');
          const topicPagePath = `_site${href}index.html`;
          expect(existsSync(topicPagePath), `Topic page missing: ${topicPagePath}`).toBe(true);
        });
      }
    });
  });
});
