import { describe, it, expect } from 'vitest';
import { getSeriesPart } from '../config/filters/series.js';

// Unit tests for the `seriesPart` filter (config/filters/series.js): the post header badge and the
// JSON-LD `position` count only published parts, in seriesMetadata order.

const seriesMetadata = [
  { slug: 'a', name: 'Series A', posts: ['/a1/', '/a2/', '/a3/'] },
  { slug: 'b', name: 'Series B', posts: ['/b1/'] },
];
const posts = (...urls) => urls.map((url) => ({ url }));

describe('getSeriesPart', () => {
  it('returns the series, the 1-based position and the part count', () => {
    expect(getSeriesPart('a', '/a2/', seriesMetadata, posts('/a1/', '/a2/', '/a3/', '/b1/'))).toEqual({
      series: seriesMetadata[0],
      position: 2,
      total: 3,
    });
  });

  it('skips unpublished parts in both the position and the count', () => {
    expect(getSeriesPart('a', '/a3/', seriesMetadata, posts('/a3/', '/a2/'))).toMatchObject({ position: 2, total: 2 });
  });

  it('returns null for an unknown series, a post not in it, or an unpublished post', () => {
    const all = posts('/a1/', '/a2/', '/a3/');
    expect(getSeriesPart('x', '/a1/', seriesMetadata, all)).toBeNull();
    expect(getSeriesPart('b', '/a1/', seriesMetadata, all)).toBeNull();
    expect(getSeriesPart('a', '/a1/', seriesMetadata, posts('/a2/'))).toBeNull();
    expect(getSeriesPart('a', '/a1/', undefined, undefined)).toBeNull();
  });
});
