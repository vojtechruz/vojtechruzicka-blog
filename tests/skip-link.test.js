import { describe, it, expect } from 'vitest';
import { loadPage } from './helpers.js';

// "Skip to content" link (src/_includes/layouts/base.njk). It only helps if it is
// the very first tab stop on every page kind and its target really exists.

const PAGES = ['/', '/pages/2/', '/about/', '/topics/', '/topics/java/', '/css-flexbox/', '/search/', '/archive/'];

describe('Skip to content link', () => {
  it.each(PAGES)('%s renders it as the first element in <body>, pointing at #content', (url) => {
    const $ = loadPage(url);
    const first = $('body').children().first();

    expect(first.is('a.skip-link'), `first body child on ${url} is <${first.prop('tagName')}>`).toBe(true);
    expect(first.attr('href')).toBe('#content');
    expect(first.text().trim()).toBe('Skip to content');
    expect($('a.skip-link').length, 'exactly one skip link').toBe(1);
  });

  it.each(PAGES)('%s has exactly one #content target and it is the <main> landmark', (url) => {
    const $ = loadPage(url);
    const target = $('#content');

    expect(target.length).toBe(1);
    expect(target.is('main')).toBe(true);
  });

  it.each(PAGES)('%s keeps the skip link outside the header navigation', (url) => {
    const $ = loadPage(url);
    expect($('header a.skip-link, nav a.skip-link').length).toBe(0);
  });
});
