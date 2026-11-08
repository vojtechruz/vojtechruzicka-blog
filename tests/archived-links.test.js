import { describe, it, expect } from 'vitest';
import * as cheerio from 'cheerio';
import { getMarkdownParser } from '../config/utils/markdown-parser.js';
import { waybackSnapshotDate } from '../config/markdown-transform/archived-links.js';
import { feedContent } from '../config/filters/urls.js';
import { loadPage } from './helpers.js';

const WAYBACK = 'https://web.archive.org/web/20170308124216/http://getbem.com/';

describe('waybackSnapshotDate', () => {
  it('reads the month and year from the snapshot timestamp', () => {
    expect(waybackSnapshotDate(WAYBACK)).toBe('March 2017');
    expect(waybackSnapshotDate('http://web.archive.org/web/20201008193205id_/https://example.com/')).toBe(
      'October 2020',
    );
  });

  it('falls back to the year when the timestamp has no month', () => {
    expect(waybackSnapshotDate('https://web.archive.org/web/2017/https://example.com/')).toBe('2017');
  });

  it('ignores links that are not a Wayback snapshot', () => {
    expect(waybackSnapshotDate('https://getbem.com/')).toBeNull();
    expect(waybackSnapshotDate('https://web.archive.org/')).toBeNull();
    expect(waybackSnapshotDate(undefined)).toBeNull();
  });
});

describe('archived link cue', () => {
  it('marks a Wayback link with a tooltip and a cue inside the link', async () => {
    const md = await getMarkdownParser();
    const $ = cheerio.load(md.render(`See the [BEM site](${WAYBACK}) and [MDN](https://developer.mozilla.org/).`));

    const $archived = $('a.archived-link');
    expect($archived).toHaveLength(1);
    expect($archived.attr('href')).toBe(WAYBACK);
    expect($archived.attr('title')).toContain('archived copy from March 2017');
    // The cue's text is part of the link's accessible name
    expect($archived.find('.archived-link-cue .visually-hidden').text()).toBe(' (archived copy, March 2017)');
    // A word joiner keeps the icon on the line of the last word
    expect($archived.html()).toMatch(/BEM site⁠<span class="archived-link-cue">/);

    expect($('a[href^="https://developer.mozilla.org"]').hasClass('archived-link')).toBe(false);
  });

  it('keeps an author-written title', async () => {
    const md = await getMarkdownParser();
    const $ = cheerio.load(md.render(`[BEM](${WAYBACK} "Custom")`));
    expect($('a.archived-link').attr('title')).toBe('Custom');
  });

  it('marks every Wayback link in a paragraph', async () => {
    const md = await getMarkdownParser();
    const $ = cheerio.load(md.render(`[one](${WAYBACK}), **[two](${WAYBACK})** and [three](${WAYBACK})`));
    expect($('a.archived-link')).toHaveLength(3);
    expect($('.archived-link-cue')).toHaveLength(3);
  });

  it('leaves the "(archived copy, date)" text readable in feeds, which have no site CSS', async () => {
    const md = await getMarkdownParser();
    const $ = cheerio.load(feedContent(md.render(`[BEM site](${WAYBACK})`)));
    expect($('a').text()).toBe('BEM site⁠ (archived copy, March 2017)');
  });

  it('is rendered on the built post that links an archived site', () => {
    const $ = loadPage('/bem-writing-css-using-block-element-modifier-methodology/');
    const $link = $(`main a[href="${WAYBACK}"]`);
    expect($link.hasClass('archived-link')).toBe(true);
    expect($link.find('.archived-link-cue')).toHaveLength(1);
  });
});
