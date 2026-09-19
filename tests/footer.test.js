import { describe, it, expect } from 'vitest';
import { loadPage } from './helpers.js';
import siteConfig from '../src/_data/site.js';
import {
  getFooter,
  getFooterContainer,
  getSocialNav,
  getSocialLinks,
  getSocialLinkHrefs,
  getSocialLinkByHref,
  getFooterMeta,
} from './queries/footer.js';

// The footer (src/_includes/components/footer.njk) is included by base.njk, so every
// layout gets it: homepage, post, plain page, search page and the 404 page.
const PAGES = ['/', '/css-flexbox/', '/about/', '/search/', '/404.html'];

describe('Footer', () => {
  describe.each(PAGES)('on %s', (url) => {
    const $ = loadPage(url);

    it('has exactly one footer with a container', () => {
      expect(getFooter($).length).toBe(1);
      expect(getFooterContainer($).length).toBe(1);
    });

    it('has social navigation with accessible label', () => {
      const socialNav = getSocialNav($);

      expect(socialNav.length).toBe(1);
      expect(socialNav.attr('aria-label')).toBe('Social links');
    });

    it('renders every entry of site.social in order', () => {
      expect(getSocialLinks($).length).toBe(siteConfig.social.length);
      expect(getSocialLinkHrefs($)).toEqual(siteConfig.social.map((item) => item.url));
    });

    it('mirrors site.social on every link (label, analytics tags, rel)', () => {
      for (const item of siteConfig.social) {
        const link = getSocialLinkByHref($, item.url);

        expect(link.length, `missing footer link for ${item.name}`).toBe(1);
        expect(link.attr('title')).toBe(item.title);
        expect(link.attr('aria-label')).toBe(item.title);
        expect(link.attr('data-social-name')).toBe(item.name);
        expect(link.attr('data-location')).toBe('Footer');
        expect(link.attr('rel')).toBe(item.rel);
      }
    });

    it('wraps exactly one decorative svg icon per link', () => {
      getSocialLinks($).each((_, el) => {
        const svg = $(el).find('svg');

        expect(svg.length).toBe(1);
        expect(svg.attr('aria-hidden')).toBe('true');
        expect(svg.attr('focusable')).toBe('false');
      });
    });

    it('shows the copyright and license line', () => {
      const meta = getFooterMeta($);

      expect(meta.length).toBe(1);
      expect(meta.text()).toContain(`© ${siteConfig.author}`);

      const license = meta.find('a[href="https://creativecommons.org/licenses/by/4.0/"]');
      expect(license.length).toBe(1);
      expect(license.attr('rel')).toBe('license');
      expect(license.text().trim()).toBe('CC BY 4.0');
      // About is already in the main navigation; the footer line must not duplicate it
      expect(meta.find('a').length).toBe(1);
    });
  });

  describe('site.social config', () => {
    it('has non-empty name, url and title on every entry', () => {
      for (const item of siteConfig.social) {
        expect(item.name?.trim()).toBeTruthy();
        expect(item.url?.trim()).toBeTruthy();
        expect(item.title?.trim()).toBeTruthy();
      }
    });

    it('keeps RSS relative so preview deploys link to the preview feed', () => {
      const rss = siteConfig.social.find((item) => item.name === 'RSS');

      expect(rss.url).toBe('/feed.xml');
      expect(rss.title).toBe('Subscribe to RSS feed');
    });

    it('marks Mastodon with rel="me" for profile verification', () => {
      expect(siteConfig.social.find((item) => item.name === 'Mastodon').rel).toBe('me');
    });

    it('uses the same profile URLs as sameAs', () => {
      // sameAs feeds JSON-LD and the About page; footer links must not drift from it
      const external = siteConfig.social.filter((item) => item.url.startsWith('http'));
      const normalise = (url) => url.replace(/\/$/, '');

      for (const profile of siteConfig.sameAs) {
        expect(
          external.map((item) => normalise(item.url)),
          `footer is missing ${profile}`,
        ).toContain(normalise(profile));
      }
    });
  });
});
