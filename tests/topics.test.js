import { describe, it, expect } from 'vitest';
import { loadPage, getAllPosts, SITE_DIR } from './helpers.js';
import { existsSync } from 'fs';
import registerTopicListCollection from '../config/collections/topic-list.js';
import registerTopicStatsCollection from '../config/collections/topic-stats.js';
import registerTopicsFilters, { UNCATEGORIZED_CATEGORY_NAME } from '../config/filters/topics.js';
import topicCategories from '../src/_data/topicCategories.js';
import { slugify } from '../config/utils/formatting.js';

function getRegisteredCollection(registerCollection, collectionName, items) {
  const collections = new Map();
  const eleventyConfig = {
    addCollection(name, callback) {
      collections.set(name, callback);
    },
  };

  registerCollection(eleventyConfig);

  return collections.get(collectionName)({ getAll: () => items });
}

function getRegisteredFilter(registerFilters, filterName) {
  const filters = new Map();
  const eleventyConfig = {
    addFilter(name, callback) {
      filters.set(name, callback);
    },
  };

  registerFilters(eleventyConfig);

  return filters.get(filterName);
}

/** Topics of public, non-archived posts with the number of such posts per topic - mirrors the topicStats collection. */
function getPublishedTopicCounts() {
  const counts = new Map();
  for (const { frontmatter } of getAllPosts()) {
    if (frontmatter.draftStatus || frontmatter.archivedStatus || !Array.isArray(frontmatter.topics)) {
      continue;
    }
    for (const topic of frontmatter.topics) {
      counts.set(topic, (counts.get(topic) || 0) + 1);
    }
  }
  return counts;
}

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
        (p) =>
          !p.frontmatter.draftStatus &&
          !p.frontmatter.archivedStatus &&
          p.frontmatter.topics &&
          p.frontmatter.topics.includes(testTopicName),
      );

      expect(countOnPage).toBe(publishedJavaPosts.length);
    });

    it('visible topic counts should exclude archived posts', () => {
      const $ = loadPage(archivesPath);
      const allPosts = getAllPosts();
      const visibleCountedArchivedTopicLinks = $('.topic-chip')
        .toArray()
        .filter((el) => $(el).find('.topic-chip-count').length > 0)
        .filter((el) =>
          allPosts.some(
            (p) =>
              p.frontmatter.archivedStatus &&
              Array.isArray(p.frontmatter.topics) &&
              p.frontmatter.topics.some((topic) => $(el).attr('href') === `/topics/${slugify(topic)}/`),
          ),
        );

      for (const el of visibleCountedArchivedTopicLinks) {
        const href = $(el).attr('href');
        const topic = allPosts
          .filter((p) => p.frontmatter.archivedStatus && Array.isArray(p.frontmatter.topics))
          .flatMap((p) => p.frontmatter.topics)
          .find((candidate) => href === `/topics/${slugify(candidate)}/`);
        const expectedCount = allPosts.filter(
          (p) =>
            !p.frontmatter.draftStatus &&
            !p.frontmatter.archivedStatus &&
            Array.isArray(p.frontmatter.topics) &&
            p.frontmatter.topics.includes(topic),
        ).length;
        const countText = $(el).find('.topic-chip-count').text().trim();
        const countOnPage = parseInt(countText.replace(/\D/g, ''), 10);

        expect(countOnPage, `Topic count should exclude archived posts for ${topic}`).toBe(expectedCount);
      }
    });

    it('should not list archived-only topics', () => {
      const $ = loadPage(archivesPath);
      const allPosts = getAllPosts();
      const archivedOnlyTopics = new Set(
        allPosts
          .filter((p) => p.frontmatter.archivedStatus && Array.isArray(p.frontmatter.topics))
          .flatMap((p) => p.frontmatter.topics)
          .filter(
            (topic) =>
              !allPosts.some(
                (p) =>
                  !p.frontmatter.draftStatus &&
                  !p.frontmatter.archivedStatus &&
                  Array.isArray(p.frontmatter.topics) &&
                  p.frontmatter.topics.includes(topic),
              ),
          ),
      );

      for (const topic of archivedOnlyTopics) {
        expect($(`.topic-chip[href="/topics/${slugify(topic)}/"]`).length, `Archived-only topic listed: ${topic}`).toBe(
          0,
        );
      }
    });
  });

  describe('Topic categories (topicCategories.js) stay in sync with content', () => {
    const categoryTopics = topicCategories.flatMap((cat) => cat.topics);
    const publishedTopics = getPublishedTopicCounts();

    it('every topic used by a published post is listed in a category', () => {
      const missing = [...publishedTopics.keys()].filter((topic) => !categoryTopics.includes(topic));
      expect(missing, `Add these topics to src/_data/topicCategories.js: ${missing.join(', ')}`).toEqual([]);
    });

    it('every category topic has at least one published post (catches typos and dead entries)', () => {
      const dead = categoryTopics.filter((topic) => !publishedTopics.has(topic));
      expect(dead, `Category topics without any published post: ${dead.join(', ')}`).toEqual([]);
    });

    it('no topic is listed in more than one category', () => {
      const duplicates = categoryTopics.filter((topic, i) => categoryTopics.indexOf(topic) !== i);
      expect(duplicates).toEqual([]);
    });

    it('no category uses the reserved fallback name', () => {
      expect(topicCategories.map((cat) => cat.name)).not.toContain(UNCATEGORIZED_CATEGORY_NAME);
    });

    it('/topics/ page lists a chip for every published topic and never shows the fallback category', () => {
      const $ = loadPage('/topics/');
      const chipHrefs = $('.topic-chip')
        .map((i, el) => $(el).attr('href'))
        .get();

      for (const topic of publishedTopics.keys()) {
        expect(chipHrefs, `Topic missing on /topics/: ${topic}`).toContain(`/topics/${slugify(topic)}/`);
      }
      expect(chipHrefs.length).toBe(publishedTopics.size);

      const headings = $('.topic-category-heading')
        .map((i, el) => $(el).text().trim())
        .get();
      expect(headings).not.toContain(UNCATEGORIZED_CATEGORY_NAME);
    });

    it('/topics/ page-meta topic count matches the number of listed chips', () => {
      const $ = loadPage('/topics/');
      const metaCount = parseInt(
        $('.page-meta')
          .text()
          .match(/(\d+)\s+topics/)[1],
        10,
      );
      expect($('.topic-chip').length).toBe(metaCount);
    });
  });

  describe('categoriesWithStats filter', () => {
    const categoriesWithStats = getRegisteredFilter(registerTopicsFilters, 'categoriesWithStats');
    const categories = [
      { name: 'Backend', topics: ['Java', 'Spring', 'Maven'] },
      { name: 'Frontend', topics: ['CSS'] },
    ];
    const stats = [
      { name: 'Java', count: 10 },
      { name: 'Spring', count: 4 },
      { name: 'Maven', count: 1 },
      { name: 'CSS', count: 2 },
      { name: 'Rust', count: 5 },
      { name: 'Go', count: 3 },
      { name: 'Kotlin', count: 1 },
    ];

    it('splits category topics into major (>= 3 posts) and minor ones, sorted by count', () => {
      const result = categoriesWithStats(categories, stats);
      const backend = result.categories.find((cat) => cat.name === 'Backend');

      expect(backend.topics.map((t) => t.name)).toEqual(['Java', 'Spring']);
      expect(backend.topics[0]).toEqual({ name: 'Java', count: 10, slug: 'java' });
      expect(result.minor.map((t) => t.name)).toContain('Maven');
      expect(result.minor.map((t) => t.name)).toContain('CSS');
    });

    it('drops categories that have no major topics', () => {
      const result = categoriesWithStats(categories, stats);
      expect(result.categories.map((cat) => cat.name)).not.toContain('Frontend');
    });

    it('drops category topics with no published posts', () => {
      const result = categoriesWithStats([{ name: 'Backend', topics: ['Java', 'Typo'] }], stats);
      const names = [...result.categories.flatMap((cat) => cat.topics), ...result.minor].map((t) => t.name);
      expect(names).not.toContain('Typo');
    });

    it('puts uncategorized major topics into a trailing fallback category', () => {
      const result = categoriesWithStats(categories, stats);
      const fallback = result.categories.at(-1);

      expect(fallback.name).toBe(UNCATEGORIZED_CATEGORY_NAME);
      expect(fallback.topics.map((t) => t.name)).toEqual(['Rust', 'Go']);
      expect(fallback.topics[1]).toEqual({ name: 'Go', count: 3, slug: 'go' });
    });

    it('puts uncategorized minor topics into the flat minor list', () => {
      const result = categoriesWithStats(categories, stats);
      expect(result.minor.map((t) => t.name)).toContain('Kotlin');
    });

    it('never loses a topic from topicStats', () => {
      const result = categoriesWithStats(categories, stats);
      const listed = [...result.categories.flatMap((cat) => cat.topics), ...result.minor].map((t) => t.name).sort();
      expect(listed).toEqual(stats.map((s) => s.name).sort());
    });

    it('adds no fallback category when every topic is categorized', () => {
      const result = categoriesWithStats(categories, stats.slice(0, 4));
      expect(result.categories.map((cat) => cat.name)).toEqual(['Backend']);
    });

    it('handles missing categories and stats gracefully', () => {
      expect(categoriesWithStats(undefined, undefined)).toEqual({ categories: [], minor: [] });
      expect(categoriesWithStats([], stats).categories.map((cat) => cat.name)).toEqual([UNCATEGORIZED_CATEGORY_NAME]);
    });
  });

  describe('Topic collection source data', () => {
    const items = [
      { data: { topics: ['Public Topic', 'Shared Topic'] } },
      { data: { draftStatus: 'draft', topics: ['Draft Topic'] } },
      { data: { archivedStatus: 'archived', topics: ['Archived Topic', 'Shared Topic'] } },
    ];

    it('topicList should exclude topics that only come from archived posts', () => {
      const topics = getRegisteredCollection(registerTopicListCollection, 'topicList', items);

      expect(topics).toContain('Public Topic');
      expect(topics).toContain('Shared Topic');
      expect(topics).not.toContain('Draft Topic');
      expect(topics).not.toContain('Archived Topic');
    });

    it('topicStats should count only public non-archived posts', () => {
      const stats = getRegisteredCollection(registerTopicStatsCollection, 'topicStats', items);

      expect(stats).toContainEqual({ name: 'Public Topic', count: 1 });
      expect(stats).toContainEqual({ name: 'Shared Topic', count: 1 });
      expect(stats).not.toContainEqual({ name: 'Draft Topic', count: 1 });
      expect(stats).not.toContainEqual({ name: 'Archived Topic', count: 1 });
      expect(stats).not.toContainEqual({ name: 'Shared Topic', count: 2 });
    });
  });

  describe('Post topic links - all posts', () => {
    const posts = getAllPosts().filter((post) => !post.frontmatter.draftStatus && !post.frontmatter.archivedStatus);

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
