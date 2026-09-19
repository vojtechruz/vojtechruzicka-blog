import { describe, it, expect } from 'vitest';
import { loadPage, getAllPosts } from './helpers.js';
import { getCanonicalUrl, getMetaDescriptionContent, getOgType } from './queries/seo.js';
import siteConfig from '../src/_data/site.js';

// The homepage (src/pages/index.njk): a paginated list of the latest published
// posts rendered as linkedPost cards. Pagination controls, the WebSite JSON-LD and
// the social tags have their own test files; this pins down the page itself.

const PAGE_SIZE = 10;

function cardUrls($) {
  return $('ul.post-list .linked-post .front-post-title a')
    .map((_, el) => $(el).attr('href'))
    .get();
}

describe('Homepage', () => {
  const $ = loadPage('/');
  const siteUrl = siteConfig.url.replace(/\/$/, '');

  const published = getAllPosts().filter(
    ({ filePath, frontmatter }) =>
      frontmatter.path &&
      !filePath.includes('_drafts') &&
      !filePath.includes('archives') &&
      !frontmatter.archivedStatus,
  );
  const publishedUrls = new Set(published.map(({ frontmatter }) => frontmatter.path));
  const newestDate = published
    .map(({ frontmatter }) => String(frontmatter.date))
    .sort()
    .at(-1);

  it('has a visually hidden "Latest posts" heading so the card list can carry the page', () => {
    const h1 = $('main#content h1');
    expect(h1.length).toBe(1);
    expect(h1.text().trim()).toBe('Latest posts');
    expect(h1.hasClass('visually-hidden')).toBe(true);
  });

  it('falls back to the site-wide description and canonicalises to the root', () => {
    expect(getMetaDescriptionContent($)).toBe(siteConfig.description);
    expect(getCanonicalUrl($)).toBe(`${siteUrl}/`);
    expect(getOgType($)).toBe('website');
  });

  it('lists exactly one page of post cards, each a distinct published post', () => {
    const urls = cardUrls($);

    expect(urls).toHaveLength(PAGE_SIZE);
    expect(new Set(urls).size).toBe(PAGE_SIZE);
    for (const url of urls) {
      expect(publishedUrls.has(url), `${url} is not a published post`).toBe(true);
    }
  });

  it('starts with the most recently published post', () => {
    const firstDate = $('ul.post-list .linked-post time').first().attr('datetime');
    expect(firstDate).toBe(newestDate);
  });

  it('renders every card with a date, topics and an excerpt', () => {
    $('ul.post-list .linked-post').each((_, el) => {
      const card = $(el);
      expect(card.find('time[datetime]').length, 'date').toBe(1);
      expect(card.find('.post-topics a').length, 'topics').toBeGreaterThan(0);
      expect(card.find('.front-post-excerpt').text().trim().length, 'excerpt').toBeGreaterThan(0);
    });
  });

  it('shows pagination only at the bottom of the first page', () => {
    expect($('nav.pagination').length).toBe(1);
    expect($('nav.pagination').prevAll('ul.post-list').length).toBe(1);
  });

  it('continues on page 2 without repeating page 1', () => {
    const page2 = cardUrls(loadPage('/pages/2/'));
    const page1 = cardUrls($);

    expect(page2.length).toBeGreaterThan(0);
    expect(page2.filter((url) => page1.includes(url))).toEqual([]);
    expect(loadPage('/pages/2/')('main#content h1').text().trim()).toBe('Page 2 – Latest posts');
  });
});
