import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { loadPage, SITE_DIR } from './helpers.js';
import siteConfig from '../src/_data/site.js';

// Giscus comments (src/_includes/components/comments.njk): the embed is a single
// <script> whose data-* attributes are the whole configuration, so a typo there
// silently breaks comments on every post without any build error.

const POSTS = ['/css-flexbox/', '/java-records/', '/angular/01-getting-started/'];
const NON_POSTS = ['/', '/about/', '/topics/java/', '/search/'];

function giscusScript($) {
  return $('script[src="https://giscus.app/client.js"]');
}

describe('Giscus comments', () => {
  it.each(POSTS)('%s renders the comments section with the embed script', (url) => {
    const $ = loadPage(url);
    const section = $('section#comments');

    expect(section.length).toBe(1);
    expect(section.find('h2').first().text().trim()).toBe('Comments');
    expect(section.find('div.giscus').length).toBe(1);
    expect(section.find('noscript').text()).toContain('JavaScript');
    expect(section.find('script[src="https://giscus.app/client.js"]').length).toBe(1);
    // The Gatsby-era Disqus hook must not linger
    expect($('#disqus_thread').length).toBe(0);
  });

  it.each(POSTS)('%s configures the embed from site config', (url) => {
    const script = giscusScript(loadPage(url));

    expect(script.attr('data-repo')).toBe(siteConfig.giscus.repo);
    expect(script.attr('data-repo-id')).toBe(siteConfig.giscus.repoId);
    expect(script.attr('data-category')).toBe(siteConfig.giscus.category);
    expect(script.attr('data-category-id')).toBe(siteConfig.giscus.categoryId);
    expect(script.attr('data-lang')).toBe(siteConfig.lang);

    // Discussions are matched by pathname, strictly, so a renamed post does not
    // silently pick up another post's thread.
    expect(script.attr('data-mapping')).toBe('pathname');
    expect(script.attr('data-strict')).toBe('1');
    expect(script.attr('data-reactions-enabled')).toBe('0');
    expect(script.attr('data-emit-metadata')).toBe('0');
    expect(script.attr('data-input-position')).toBe('top');
    expect(script.attr('data-loading')).toBe('lazy');
    expect(script.attr('crossorigin')).toBe('anonymous');
    expect(script.attr('async')).toBeDefined();
  });

  it('points the theme at the versioned site stylesheet that exists in the build', () => {
    const theme = giscusScript(loadPage(POSTS[0])).attr('data-theme');
    const url = new URL(theme);

    // Absolute URL: giscus loads it from inside its own iframe on giscus.app.
    expect(url.protocol).toBe('https:');
    expect(url.pathname).toBe('/styles/giscus-theme.css');
    // /styles/* is cached as immutable, so the reference must carry the content hash.
    expect(url.searchParams.get('v')).toMatch(/^[0-9a-f]{6,}$/);
    expect(existsSync(`${SITE_DIR}${url.pathname}`)).toBe(true);
  });

  it('serves the theme stylesheet with the CORS header giscus needs', () => {
    // The theme is fetched cross-origin from the giscus.app iframe.
    const headers = readFileSync(`${SITE_DIR}/_headers`, 'utf-8');
    const block = headers.split(/\n(?=\S)/).find((rule) => rule.startsWith('/styles/giscus-theme.css'));

    expect(block, 'a /styles/giscus-theme.css rule in _headers').toBeDefined();
    expect(block).toContain('Access-Control-Allow-Origin: https://giscus.app');
  });

  it.each(NON_POSTS)('%s has no comments section', (url) => {
    const $ = loadPage(url);
    expect($('section#comments').length).toBe(0);
    expect(giscusScript($).length).toBe(0);
  });
});
