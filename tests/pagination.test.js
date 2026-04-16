import { describe, it, expect } from 'vitest';
import { generatePaginationLinks } from '../config/filters/pagination.js';
import { loadPage, SITE_DIR } from './helpers.js';
import { existsSync } from 'fs';

// Check built pages to skip integration tests if they don't exist
const hasPage2 = existsSync(`${SITE_DIR}/pages/2/index.html`);
const hasPage4 = existsSync(`${SITE_DIR}/pages/4/index.html`);
const hasPage5 = existsSync(`${SITE_DIR}/pages/5/index.html`);

describe('generatePaginationLinks', () => {
  const createPagination = (total, current0) => ({
    hrefs: Array.from({ length: total }, (_, i) => `/page/${i + 1}/`),
    pageNumber: current0,
  });

  it('shows all pages when total is small', () => {
    const pagination = createPagination(3, 1); // Page 2 of 3
    const result = generatePaginationLinks(pagination, 2);
    expect(result).toEqual([
      { number: 1, url: '/page/1/', current: false },
      { number: 2, url: '/page/2/', current: true },
      { number: 3, url: '/page/3/', current: false },
    ]);
  });

  it('shows ellipsis when there is a gap at the end', () => {
    const pagination = createPagination(10, 0); // Page 1 of 10
    const result = generatePaginationLinks(pagination, 2);
    // Page 1 (current), 2, 3, ellipsis, 10
    expect(result).toEqual([
      { number: 1, url: '/page/1/', current: true },
      { number: 2, url: '/page/2/', current: false },
      { number: 3, url: '/page/3/', current: false },
      { ellipsis: true },
      { number: 10, url: '/page/10/', current: false },
    ]);
  });

  it('shows ellipsis when there is a gap at the beginning', () => {
    const pagination = createPagination(10, 9); // Page 10 of 10
    const result = generatePaginationLinks(pagination, 2);
    // 1, ellipsis, 8, 9, 10 (current)
    expect(result).toEqual([
      { number: 1, url: '/page/1/', current: false },
      { ellipsis: true },
      { number: 8, url: '/page/8/', current: false },
      { number: 9, url: '/page/9/', current: false },
      { number: 10, url: '/page/10/', current: true },
    ]);
  });

  it('shows both ellipses when in the middle', () => {
    const pagination = createPagination(10, 4); // Page 5 of 10
    const result = generatePaginationLinks(pagination, 1);
    // Window size 1: 1, ellipsis, 4, 5 (current), 6, ellipsis, 10
    expect(result).toEqual([
      { number: 1, url: '/page/1/', current: false },
      { ellipsis: true },
      { number: 4, url: '/page/4/', current: false },
      { number: 5, url: '/page/5/', current: true },
      { number: 6, url: '/page/6/', current: false },
      { ellipsis: true },
      { number: 10, url: '/page/10/', current: false },
    ]);
  });

  it('respects configurable window size', () => {
    const pagination = createPagination(10, 4); // Page 5 of 10
    const result = generatePaginationLinks(pagination, 2);
    // Window size 2: 1, ellipsis, 3, 4, 5 (current), 6, 7, ellipsis, 10
    expect(result).toEqual([
      { number: 1, url: '/page/1/', current: false },
      { ellipsis: true },
      { number: 3, url: '/page/3/', current: false },
      { number: 4, url: '/page/4/', current: false },
      { number: 5, url: '/page/5/', current: true },
      { number: 6, url: '/page/6/', current: false },
      { number: 7, url: '/page/7/', current: false },
      { ellipsis: true },
      { number: 10, url: '/page/10/', current: false },
    ]);
  });

  it('handles edge case: 1 page', () => {
    const pagination = createPagination(1, 0);
    const result = generatePaginationLinks(pagination, 2);
    expect(result).toEqual([{ number: 1, url: '/page/1/', current: true }]);
  });

  it('handles edge case: 2 pages', () => {
    const pagination = createPagination(2, 0);
    const result = generatePaginationLinks(pagination, 2);
    expect(result).toEqual([
      { number: 1, url: '/page/1/', current: true },
      { number: 2, url: '/page/2/', current: false },
    ]);
  });
});

describe('Pagination integration tests', () => {
  it.skipIf(!hasPage2)('renders pagination in index.html', () => {
    const $ = loadPage('/');
    const pagination = $('nav.pagination');
    // On page 1, only the bottom pagination is shown
    expect(pagination.length).toBe(1);

    // Current page 1 should be span.current
    const current = pagination.find('.current');
    expect(current.text()).toBe('1');
    expect(current.attr('aria-current')).toBe('page');

    // Should have links to other pages
    const links = pagination.find('a').not('.pagination-prev').not('.pagination-next');
    expect(links.length).toBeGreaterThan(0);

    // Check last page link
    const lastLink = links.last();
    expect(lastLink.text()).toMatch(/\d+/); // Should be a number

    // Should have a "Next" link
    const nextLink = pagination.find('.pagination-next');
    expect(nextLink.length).toBe(1);
    expect(nextLink.attr('href')).toBe('/pages/2/');
  });

  it.skipIf(!hasPage5)('renders ellipses when there are many pages', () => {
    const $ = loadPage('/');
    const ellipsis = $('.pagination-ellipsis');
    expect(ellipsis.length).toBeGreaterThan(0);
    expect(ellipsis.first().text()).toBe('…');
  });

  it.skipIf(!hasPage4)('renders both Previous and Next on middle pages', () => {
    // Page 3 is at /pages/3/
    const $ = loadPage('/pages/3/');
    // There are 2 pagination blocks (top and bottom)
    const prevLinks = $('.pagination-prev');
    const nextLinks = $('.pagination-next');
    expect(prevLinks.length).toBe(2);
    expect(nextLinks.length).toBe(2);
    expect(prevLinks.first().attr('href')).toBe('/pages/2/');
    expect(nextLinks.first().attr('href')).toBe('/pages/4/');
  });
});
