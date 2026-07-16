import { describe, it, expect } from 'vitest';
import * as cheerio from 'cheerio';
import { wrapTablesTransform } from '../config/html-transform/wrap-tables-transform.js';

function pageWith(body) {
  return `<html><head></head><body>${body}</body></html>`;
}

const TABLE = '<table><thead><tr><th>A</th></tr></thead><tbody><tr><td>1</td></tr></tbody></table>';

describe('wrapTablesTransform', () => {
  it('wraps a bare table in div.table-wrapper', () => {
    const output = wrapTablesTransform(pageWith(TABLE), 'page/index.html');
    const $ = cheerio.load(output);

    expect($('div.table-wrapper > table').length).toBe(1);
    expect($('table td').text()).toBe('1');
  });

  it('wraps multiple tables independently', () => {
    const output = wrapTablesTransform(pageWith(TABLE + '<p>between</p>' + TABLE), 'page/index.html');
    const $ = cheerio.load(output);

    expect($('div.table-wrapper').length).toBe(2);
    expect($('div.table-wrapper > table').length).toBe(2);
  });

  it('is idempotent - does not double-wrap an already wrapped table', () => {
    const once = wrapTablesTransform(pageWith(TABLE), 'page/index.html');
    const twice = wrapTablesTransform(once, 'page/index.html');
    const $ = cheerio.load(twice);

    expect($('div.table-wrapper').length).toBe(1);
    expect($('div.table-wrapper div.table-wrapper').length).toBe(0);
  });

  it('leaves non-HTML output untouched', () => {
    const content = pageWith(TABLE);
    expect(wrapTablesTransform(content, 'feed/feed.xml')).toBe(content);
    expect(wrapTablesTransform(content, undefined)).toBe(content);
  });

  it('leaves HTML without tables untouched (early exit, no re-serialization)', () => {
    const content = pageWith('<p>No tables here</p>');
    expect(wrapTablesTransform(content, 'page/index.html')).toBe(content);
  });
});
