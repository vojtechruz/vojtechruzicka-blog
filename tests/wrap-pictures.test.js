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

  describe('captions (markdown `![alt](x.png "Caption")`)', () => {
    const captioned = (alt, title) =>
      `<picture><source type="image/avif" srcset="${alt}.avif"><img src="${alt}.png" alt="${alt}" title="${title}"></picture>`;

    it('turns an image title into a figure with a figcaption, and drops the title', async () => {
      const $ = await transform(`<p>before</p><p>${captioned('a', 'Where to click')}</p><p>after</p>`);

      const $figure = $('body > figure.image-figure');
      expect(
        $figure
          .children()
          .toArray()
          .map((el) => el.tagName + '.' + el.attribs.class),
      ).toEqual(['div.image-wrapper', 'figcaption.image-caption']);
      expect($figure.find('figcaption').text()).toBe('Where to click');
      expect($figure.find('div.image-wrapper > picture > img').attr('alt')).toBe('a');
      expect($('img[title]').length).toBe(0);
      expect(
        $('body > *')
          .toArray()
          .map((el) => el.tagName),
      ).toEqual(['p', 'figure', 'p']);
    });

    it('captions only the images that have a title, keeping source order', async () => {
      const $ = await transform(`<p>Look: ${pic('first')} ${captioned('second', 'Second')}</p>`);

      expect(wrappedAlts($)).toEqual(['first', 'second']);
      expect(
        $('body > *')
          .toArray()
          .map((el) => el.tagName),
      ).toEqual(['p', 'div', 'figure']);
      expect($('figure img').attr('alt')).toBe('second');
    });

    it('captions a picture outside a paragraph in place', async () => {
      const $ = await transform(`<ul><li>${captioned('a', 'In a list')}</li></ul>`);
      expect($('li > figure.image-figure > div.image-wrapper > picture').length).toBe(1);
      expect($('li figcaption').text()).toBe('In a list');
    });

    it('keeps the caption text as text', async () => {
      const $ = await transform(`<p>${captioned('a', 'a &lt;b&gt; &amp; c')}</p>`);
      expect($('figcaption').text()).toBe('a <b> & c');
      expect($('figcaption b').length).toBe(0);
    });

    it('ignores a blank title', async () => {
      const $ = await transform(`<p>${captioned('a', '  ')}</p>`);
      expect($('figure').length).toBe(0);
      expect(wrappedAlts($)).toEqual(['a']);
    });

    it('is idempotent', async () => {
      const once = await wrapPicturesTransform(pageWith(`<p>${captioned('a', 'Cap')}</p>`), 'page/index.html');
      const $ = cheerio.load(await wrapPicturesTransform(once, 'page/index.html'));
      expect($('figure').length).toBe(1);
      expect($('figcaption').text()).toBe('Cap');
    });
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
