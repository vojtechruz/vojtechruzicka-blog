import { describe, it, expect, beforeAll } from 'vitest';
import { loadPage } from './helpers.js';
import {
  getFooter,
  getFooterContainer,
  getSocialNav,
  getSocialLinks,
  getSocialLinkHrefs,
  getSocialLinkByHref,
} from './queries/footer.js';

describe('Footer', () => {
  let $;

  beforeAll(() => {
    $ = loadPage('/');
  });

  it('has exactly one footer element', () => {
    expect(getFooter($).length).toBe(1);
  });

  it('has footer container', () => {
    expect(getFooterContainer($).length).toBe(1);
  });

  it('has social navigation with accessible label', () => {
    const socialNav = getSocialNav($);

    expect(socialNav.length).toBe(1);
    expect(socialNav.attr('aria-label')).toBe('Social links');
  });

  it('contains exactly 4 social links', () => {
    expect(getSocialLinks($).length).toBe(4);
  });

  it('all footer social links have href', () => {
    getSocialLinks($).each((_, el) => {
      expect($(el).attr('href')).toBeTruthy();
    });
  });

  it('all footer social links have aria-label', () => {
    getSocialLinks($).each((_, el) => {
      expect($(el).attr('aria-label')).toBeTruthy();
    });
  });

  it('all footer social links have title', () => {
    getSocialLinks($).each((_, el) => {
      expect($(el).attr('title')).toBeTruthy();
    });
  });

  it('all footer social links have matching title and aria-label', () => {
    getSocialLinks($).each((_, el) => {
      expect($(el).attr('title')).toBe($(el).attr('aria-label'));
    });
  });

  it('all footer social links contain an svg icon', () => {
    getSocialLinks($).each((_, el) => {
      expect($(el).find('svg').length).toBe(1);
    });
  });

  it('all svg icons inside footer links are hidden from assistive tech', () => {
    getSocialLinks($)
      .find('svg')
      .each((_, el) => {
        expect($(el).attr('aria-hidden')).toBe('true');
        expect($(el).attr('focusable')).toBe('false');
      });
  });

  it('contains expected social/profile links', () => {
    const hrefs = getSocialLinkHrefs($);

    expect(hrefs).toContain('https://www.vojtechruzicka.com/feed.xml');
    expect(hrefs).toContain('https://mastodon.social/@vojtechruzicka');
    expect(hrefs).toContain('https://www.linkedin.com/in/vojtechruzicka');
    expect(hrefs).toContain('https://github.com/vojtechruz');
  });

  it('rss link has correct accessible label', () => {
    const rssLink = getSocialLinkByHref($, 'https://www.vojtechruzicka.com/feed.xml');

    expect(rssLink.length).toBe(1);
    expect(rssLink.attr('aria-label')).toBe('Subscribe to RSS feed');
  });

  it('mastodon link uses rel="me"', () => {
    const mastodonLink = getSocialLinkByHref($, 'https://mastodon.social/@vojtechruzicka');

    expect(mastodonLink.length).toBe(1);
    expect(mastodonLink.attr('rel')).toBe('me');
  });

  it('does not contain empty social link labels', () => {
    getSocialLinks($).each((_, el) => {
      expect($(el).attr('aria-label')?.trim()).not.toBe('');
      expect($(el).attr('title')?.trim()).not.toBe('');
      expect($(el).attr('href')?.trim()).not.toBe('');
    });
  });
});
