import { describe, it, expect } from 'vitest';
import { loadPage } from './helpers.js';
import { getCanonicalUrl, getPageTitle, getOgType } from './queries/seo.js';
import siteConfig from '../src/_data/site.js';

// The About page (src/pages/about.njk): content sections, outbound links with their
// analytics hooks, and the AboutPage / Person structured data.

const ABOUT = '/about/';

function jsonLdBlocks($) {
  return $('script[type="application/ld+json"]')
    .map((_, el) => JSON.parse($(el).text()))
    .get();
}

describe('About page', () => {
  const $ = loadPage(ABOUT);
  const siteUrl = siteConfig.url.replace(/\/$/, '');

  it('is titled "About me" and canonicalised at /about/', () => {
    expect($('main#content h1').text().trim()).toBe('About me');
    expect(getPageTitle($)).toContain('About me');
    expect(getCanonicalUrl($)).toBe(`${siteUrl}${ABOUT}`);
    expect(getOgType($)).toBe('website');
  });

  it('introduces the author with the name and job title from site config', () => {
    const intro = $('.about-page p').first().text();
    expect(intro).toContain(siteConfig.author);
    expect(intro).toContain(siteConfig.person.jobTitle);
  });

  it('keeps the expected sections in order', () => {
    const headings = $('.about-page h2')
      .map((_, el) => $(el).text().trim())
      .get();
    expect(headings).toEqual(['Stay informed', 'Contact me', 'Additional links', 'Found any issues?', 'License']);
  });

  it('offers the RSS feed and the email newsletter under "Stay informed"', () => {
    const links = $('.about-page h2').first().nextAll('ul.about-links').first().find('a');
    const hrefs = links.map((_, el) => $(el).attr('href')).get();

    expect(hrefs).toContain('/feed.xml');
    expect(hrefs.some((href) => href.startsWith('https://eepurl.com/'))).toBe(true);
  });

  it('links the profiles that site config lists under sameAs', () => {
    const hrefs = $('.about-page a')
      .map((_, el) => $(el).attr('href'))
      .get();

    for (const profile of siteConfig.sameAs) {
      const normalise = (url) => url.replace(/\/$/, '');
      expect(hrefs.map(normalise), `missing profile link ${profile}`).toContain(normalise(profile));
    }
  });

  it('tags every social link for analytics', () => {
    const social = $('.about-page a[data-social-name]');
    expect(social.length).toBeGreaterThanOrEqual(6);

    social.each((_, el) => {
      const href = $(el).attr('href');
      if (href.startsWith('http')) {
        expect($(el).attr('data-location'), `${href} needs data-location`).toBe('About Page');
      }
    });
    expect($('.about-page a[data-about-name]').length).toBeGreaterThanOrEqual(3);
  });

  it('uses absolute https URLs for every outbound link', () => {
    $('.about-page a').each((_, el) => {
      const href = $(el).attr('href');
      if (!href.startsWith('/') && !href.startsWith('mailto:')) {
        expect(href, `insecure or relative outbound link: ${href}`).toMatch(/^https:\/\//);
      }
    });
  });

  it('states the dual license and links both texts', () => {
    const license = $('.about-page h2')
      .filter((_, el) => $(el).text().trim() === 'License')
      .nextAll('p');
    const text = license.text();
    const hrefs = license
      .find('a')
      .map((_, el) => $(el).attr('href'))
      .get();

    expect(text).toContain('CC BY 4.0');
    expect(text).toContain('MIT License');
    expect(hrefs).toContain('https://creativecommons.org/licenses/by/4.0/');
    // Must point at a branch that exists — it used to reference the deleted eleventy-migration branch.
    expect(hrefs).toContain('https://github.com/vojtechruz/vojtechruzicka-blog/blob/master/LICENSE.md');
  });

  it('exposes an AboutPage with the author as Person in JSON-LD', () => {
    const blocks = jsonLdBlocks($);
    const about = blocks.find((block) => block['@type'] === 'AboutPage');

    expect(about).toBeDefined();
    expect(about.url).toBe(`${siteUrl}${ABOUT}`);
    expect(about.mainEntity['@type']).toBe('Person');
    expect(about.mainEntity.name).toBe(siteConfig.author);
    expect(about.mainEntity.url).toBe(siteConfig.person.url);
    expect(about.mainEntity.jobTitle).toBe(siteConfig.person.jobTitle);
    expect(about.mainEntity.image).toBe(`${siteConfig.person.image}`);
    expect(about.mainEntity.sameAs).toEqual(siteConfig.sameAs);
    expect(blocks.some((block) => block['@type'] === 'BreadcrumbList')).toBe(true);
  });
});
