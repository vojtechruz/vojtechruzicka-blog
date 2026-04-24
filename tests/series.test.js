import { describe, it, expect } from 'vitest';
import { loadPage, getAllPosts, SITE_DIR } from './helpers.js';
import { existsSync } from 'fs';
import seriesMetadata from '../src/_data/seriesMetadata.js';

// ---------------------------------------------------------------------------
// Unit tests – seriesMetadata.js data integrity
// ---------------------------------------------------------------------------

describe('seriesMetadata – data integrity', () => {
  it('every series has required fields', () => {
    for (const series of seriesMetadata) {
      expect(series.slug, `slug missing on series: ${JSON.stringify(series)}`).toBeTruthy();
      expect(series.name, `name missing on "${series.slug}"`).toBeTruthy();
      expect(series.description, `description missing on "${series.slug}"`).toBeTruthy();
      expect(Array.isArray(series.posts), `posts must be array on "${series.slug}"`).toBe(true);
      expect(series.posts.length, `posts must be non-empty on "${series.slug}"`).toBeGreaterThan(0);
    }
  });

  it('slugs are lowercase kebab-case with no spaces', () => {
    for (const series of seriesMetadata) {
      expect(series.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('slugs are unique across all series', () => {
    const slugs = seriesMetadata.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('post URLs have trailing slashes', () => {
    for (const series of seriesMetadata) {
      for (const url of series.posts) {
        expect(url, `"${url}" in "${series.slug}" missing trailing slash`).toMatch(/\/$/);
      }
    }
  });

  it('no post URL appears in more than one series', () => {
    const seen = new Map();
    for (const series of seriesMetadata) {
      for (const url of series.posts) {
        expect(seen.has(url), `"${url}" appears in both "${seen.get(url)}" and "${series.slug}"`).toBe(false);
        seen.set(url, series.slug);
      }
    }
  });

  it('no duplicate URLs within a single series', () => {
    for (const series of seriesMetadata) {
      const unique = new Set(series.posts);
      expect(unique.size, `duplicate URLs in "${series.slug}"`).toBe(series.posts.length);
    }
  });
});

// ---------------------------------------------------------------------------
// Unit tests – post front matter consistency
// ---------------------------------------------------------------------------

describe('Post front matter – series fields', () => {
  const allPosts = getAllPosts();
  const seriesSlugs = new Set(seriesMetadata.map((s) => s.slug));
  const urlsInMetadata = new Set(seriesMetadata.flatMap((s) => s.posts));

  it('series field uses slug format (no spaces, lowercase)', () => {
    for (const { filePath, frontmatter } of allPosts) {
      if (!frontmatter.series) {
        continue;
      }
      expect(frontmatter.series, `${filePath}: series should be a slug`).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('series slug in front matter matches a known series in seriesMetadata', () => {
    for (const { filePath, frontmatter } of allPosts) {
      if (!frontmatter.series) {
        continue;
      }
      expect(seriesSlugs.has(frontmatter.series), `${filePath}: unknown series slug "${frontmatter.series}"`).toBe(
        true,
      );
    }
  });

  it('no post uses series-order (removed in favour of seriesMetadata.posts order)', () => {
    for (const { filePath, frontmatter } of allPosts) {
      expect(frontmatter['series-order'], `${filePath}: series-order should be removed`).toBeUndefined();
    }
  });

  it('every URL listed in seriesMetadata.posts maps to a post with matching series slug', () => {
    for (const series of seriesMetadata) {
      for (const postUrl of series.posts) {
        const match = allPosts.find((p) => p.frontmatter.path === postUrl);
        expect(match, `No post found with path "${postUrl}" (series "${series.slug}")`).toBeDefined();
        expect(match.frontmatter.series, `Post at "${postUrl}" has wrong series slug`).toBe(series.slug);
      }
    }
  });

  it('every series post is listed in seriesMetadata.posts', () => {
    for (const { filePath, frontmatter } of allPosts) {
      if (!frontmatter.series || !frontmatter.path) {
        continue;
      }
      expect(
        urlsInMetadata.has(frontmatter.path),
        `${filePath}: path "${frontmatter.path}" not found in seriesMetadata.posts`,
      ).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Integration tests – series TOC on post pages
// ---------------------------------------------------------------------------

describe('Series TOC in built post pages', () => {
  it('every series post renders a .series-toc nav', () => {
    for (const series of seriesMetadata) {
      for (const postUrl of series.posts) {
        const $ = loadPage(postUrl);
        expect($('nav.series-toc').length, `series-toc missing on ${postUrl}`).toBe(1);
      }
    }
  });

  it('TOC heading links to the series index page', () => {
    for (const series of seriesMetadata) {
      for (const postUrl of series.posts) {
        const $ = loadPage(postUrl);
        const headingLink = $('nav.series-toc .toc-heading a');
        expect(headingLink.attr('href'), `toc heading href wrong on ${postUrl}`).toBe(`/series/${series.slug}/`);
        expect(headingLink.text().trim(), `toc heading text wrong on ${postUrl}`).toBe(series.name);
      }
    }
  });

  it('TOC lists all posts in the series in the correct order', () => {
    for (const series of seriesMetadata) {
      for (const postUrl of series.posts) {
        const $ = loadPage(postUrl);
        const tocLinks = $('nav.series-toc ol.toc-list li a')
          .map((_, el) => $(el).attr('href'))
          .get();
        expect(tocLinks, `toc links wrong on ${postUrl}`).toEqual(series.posts);
      }
    }
  });

  it('current post link has aria-current="page" and class series-current', () => {
    for (const series of seriesMetadata) {
      for (const postUrl of series.posts) {
        const $ = loadPage(postUrl);
        const currentLink = $('nav.series-toc a[aria-current="page"]');
        expect(currentLink.length, `no aria-current link on ${postUrl}`).toBe(1);
        expect(currentLink.attr('href'), `aria-current href wrong on ${postUrl}`).toBe(postUrl);
        expect(currentLink.hasClass('series-current'), `series-current class missing on ${postUrl}`).toBe(true);
      }
    }
  });

  it('exactly one post in the TOC is marked as current', () => {
    for (const series of seriesMetadata) {
      for (const postUrl of series.posts) {
        const $ = loadPage(postUrl);
        const currentLinks = $('nav.series-toc a[aria-current="page"]');
        expect(currentLinks.length, `expected exactly one current link on ${postUrl}`).toBe(1);
      }
    }
  });

  it('non-series posts do not render a .series-toc', () => {
    const allPosts = getAllPosts();
    const nonSeriesPosts = allPosts.filter(
      (p) => !p.frontmatter.series && !p.frontmatter.draftStatus && p.frontmatter.path,
    );
    for (const { frontmatter } of nonSeriesPosts) {
      const $ = loadPage(frontmatter.path);
      expect($('nav.series-toc').length, `unexpected series-toc on ${frontmatter.path}`).toBe(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Integration tests – series index pages (/series/<slug>/)
// ---------------------------------------------------------------------------

describe('Series index pages in built output', () => {
  it('a page exists for every series slug', () => {
    for (const series of seriesMetadata) {
      const filePath = `${SITE_DIR}/series/${series.slug}/index.html`;
      expect(existsSync(filePath), `series page missing: ${filePath}`).toBe(true);
    }
  });

  it('series index page title contains the series name', () => {
    for (const series of seriesMetadata) {
      const $ = loadPage(`/series/${series.slug}/`);
      expect($('title').text()).toContain(series.name);
    }
  });

  it('series index page shows the correct article count', () => {
    for (const series of seriesMetadata) {
      const $ = loadPage(`/series/${series.slug}/`);
      const countText = $('.series-post-count').text();
      expect(countText).toContain(String(series.posts.length));
    }
  });

  it('series index page lists posts in the order defined by seriesMetadata', () => {
    for (const series of seriesMetadata) {
      const $ = loadPage(`/series/${series.slug}/`);
      const postLinks = $('.linked-post h2 a')
        .map((_, el) => $(el).attr('href'))
        .get();
      expect(postLinks, `post order wrong on /series/${series.slug}/`).toEqual(series.posts);
    }
  });

  it('all post links on series index page point to existing pages', () => {
    for (const series of seriesMetadata) {
      const $ = loadPage(`/series/${series.slug}/`);
      const postLinks = $('.linked-post h2 a')
        .map((_, el) => $(el).attr('href'))
        .get();
      for (const href of postLinks) {
        expect(() => loadPage(href), `broken link ${href} on /series/${series.slug}/`).not.toThrow();
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Integration tests – series listing page (/series/)
// ---------------------------------------------------------------------------

describe('Series listing page (/series/)', () => {
  it('page exists in the build output', () => {
    expect(existsSync(`${SITE_DIR}/series/index.html`)).toBe(true);
  });

  it('lists every series with a link to its index page', () => {
    const $ = loadPage('/series/');
    for (const series of seriesMetadata) {
      const link = $(`.linked-series h2 a[href="/series/${series.slug}/"]`);
      expect(link.length, `link to /series/${series.slug}/ missing`).toBe(1);
      expect(link.text().trim()).toBe(series.name);
    }
  });

  it('shows correct article count for each series', () => {
    const $ = loadPage('/series/');
    const cards = $('.linked-series');
    expect(cards.length).toBe(seriesMetadata.length);

    cards.each((i, el) => {
      const series = seriesMetadata[i];
      const countText = $(el).find('.series-article-count').text();
      expect(countText, `wrong count for "${series.slug}"`).toContain(String(series.posts.length));
    });
  });

  it('shows the description for each series', () => {
    const $ = loadPage('/series/');
    for (const series of seriesMetadata) {
      const card = $(`.linked-series:has(a[href="/series/${series.slug}/"])`);
      expect(card.find('.front-post-excerpt').text().trim()).toBe(series.description);
    }
  });
});
