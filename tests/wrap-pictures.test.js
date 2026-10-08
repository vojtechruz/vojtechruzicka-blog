import { describe, it, expect } from 'vitest';
import * as cheerio from 'cheerio';
import { wrapPicturesTransform } from '../config/html-transform/wrap-pictures-transform.js';

function pageWith(body) {
  return `<html><head></head><body>${body}</body></html>`;
}

const pic = (alt) =>
  `<picture><source type="image/avif" srcset="${alt}.avif"><img src="${alt}.png" alt="${alt}"></picture>`;

async function transform(body) {
  return cheerio.load(await wrapPicturesTransform(pageWith(body), 'page/index.html'));
}

/** Alt texts of the wrapped pictures, in document order */
const wrappedAlts = ($) =>
  $('div.image-wrapper > picture > img')
    .toArray()
    .map((img) => $(img).attr('alt'));

describe('wrapPicturesTransform', () => {
  it('replaces a paragraph holding only a picture with the wrapper', async () => {
    const $ = await transform(`<p>before</p><p>${pic('a')}</p><p>after</p>`);

    expect(wrappedAlts($)).toEqual(['a']);
    expect($('p picture').length).toBe(0);
    expect(
      $('body')
        .children()
        .toArray()
        .map((el) => $(el).text() || el.attribs.class),
    ).toEqual(['before', 'image-wrapper', 'after']);
  });

  // Regression: `![a](a.png) ![b](b.png)` used to come out as b, a
  it('keeps two pictures of one paragraph in source order', async () => {
    const $ = await transform(`<p>${pic('first')} ${pic('second')}</p>`);

    expect(wrappedAlts($)).toEqual(['first', 'second']);
    expect($('p').length).toBe(0);
  });

  it('moves pictures out of a paragraph with text, after it and in source order', async () => {
    const $ = await transform(`<p>Look: ${pic('first')} and ${pic('second')}</p><p>next</p>`);

    expect(wrappedAlts($)).toEqual(['first', 'second']);
    expect($('p').first().text()).toBe('Look:  and ');
    expect($('p picture').length).toBe(0);
    expect(
      $('body > *')
        .toArray()
        .map((el) => el.tagName),
    ).toEqual(['p', 'div', 'div', 'p']);
  });

  it('wraps a picture outside a paragraph in place', async () => {
    const $ = await transform(`<ul><li>${pic('a')}</li></ul>`);

    expect($('li > div.image-wrapper > picture').length).toBe(1);
  });

  it('is idempotent - does not double-wrap', async () => {
    const once = await wrapPicturesTransform(pageWith(`<p>${pic('a')} ${pic('b')}</p>`), 'page/index.html');
    const $ = cheerio.load(await wrapPicturesTransform(once, 'page/index.html'));

    expect(wrappedAlts($)).toEqual(['a', 'b']);
    expect($('div.image-wrapper div.image-wrapper').length).toBe(0);
  });

  it('leaves non-HTML output and pages without pictures untouched', async () => {
    const content = pageWith(`<p>${pic('a')}</p>`);
    expect(await wrapPicturesTransform(content, 'feed.xml')).toBe(content);
    expect(await wrapPicturesTransform(pageWith('<p>text</p>'), 'page/index.html')).toBe(pageWith('<p>text</p>'));
  });
});
