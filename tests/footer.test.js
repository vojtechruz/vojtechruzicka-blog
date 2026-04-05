import { describe, it, expect } from 'vitest';
import { loadPage } from './helpers.js';

describe('Footer', () => {
  it('has exactly one footer element', () => {
    const $ = loadPage('/');
    expect($('footer.footer').length).toBe(1);
  });

  it('has footer container', () => {
    const $ = loadPage('/');
    const footer = $('footer.footer');
    expect(footer.find('.footer-container').length).toBe(1);
  });

  it('has social navigation with accessible label', () => {
    const $ = loadPage('/');
    const socialNav = $('footer.footer nav.footer-social');

    expect(socialNav.length).toBe(1);
    expect(socialNav.attr('aria-label')).toBe('Social links');
  });

  it('contains exactly 4 social links', () => {
    const $ = loadPage('/');
    const links = $('footer.footer nav.footer-social a.footer-icon');

    expect(links.length).toBe(4);
  });

  it('all footer social links have href', () => {
    const $ = loadPage('/');
    const links = $('footer.footer nav.footer-social a.footer-icon');

    links.each((_, el) => {
      expect($(el).attr('href')).toBeTruthy();
    });
  });

  it('all footer social links have aria-label', () => {
    const $ = loadPage('/');
    const links = $('footer.footer nav.footer-social a.footer-icon');

    links.each((_, el) => {
      expect($(el).attr('aria-label')).toBeTruthy();
    });
  });

  it('all footer social links have title', () => {
    const $ = loadPage('/');
    const links = $('footer.footer nav.footer-social a.footer-icon');

    links.each((_, el) => {
      expect($(el).attr('title')).toBeTruthy();
    });
  });

  it('all footer social links have matching title and aria-label', () => {
    const $ = loadPage('/');
    const links = $('footer.footer nav.footer-social a.footer-icon');

    links.each((_, el) => {
      expect($(el).attr('title')).toBe($(el).attr('aria-label'));
    });
  });

  it('all footer social links contain an svg icon', () => {
    const $ = loadPage('/');
    const links = $('footer.footer nav.footer-social a.footer-icon');

    links.each((_, el) => {
      expect($(el).find('svg').length).toBe(1);
    });
  });

  it('all svg icons inside footer links are hidden from assistive tech', () => {
    const $ = loadPage('/');
    const svgs = $('footer.footer nav.footer-social a.footer-icon svg');

    svgs.each((_, el) => {
      expect($(el).attr('aria-hidden')).toBe('true');
      expect($(el).attr('focusable')).toBe('false');
    });
  });

  it('contains expected social/profile links', () => {
    const $ = loadPage('/');
    const hrefs = $('footer.footer nav.footer-social a.footer-icon')
      .map((_, el) => $(el).attr('href'))
      .get();

    expect(hrefs).toContain('https://www.vojtechruzicka.com/feed/');
    expect(hrefs).toContain('https://mastodon.social/@vojtechruzicka');
    expect(hrefs).toContain('https://www.linkedin.com/in/vojtechruzicka');
    expect(hrefs).toContain('https://github.com/vojtechruz');
  });

  it('rss link has correct accessible label', () => {
    const $ = loadPage('/');
    const rssLink = $('footer.footer a[href="https://www.vojtechruzicka.com/feed/"]');

    expect(rssLink.length).toBe(1);
    expect(rssLink.attr('aria-label')).toBe('Subscribe to RSS feed');
  });

  it('mastodon link uses rel="me"', () => {
    const $ = loadPage('/');
    const mastodonLink = $('footer.footer a[href="https://mastodon.social/@vojtechruzicka"]');

    expect(mastodonLink.length).toBe(1);
    expect(mastodonLink.attr('rel')).toBe('me');
  });

  it('does not contain empty social link labels', () => {
    const $ = loadPage('/');
    const links = $('footer.footer nav.footer-social a.footer-icon');

    links.each((_, el) => {
      expect($(el).attr('aria-label')?.trim()).not.toBe('');
      expect($(el).attr('title')?.trim()).not.toBe('');
      expect($(el).attr('href')?.trim()).not.toBe('');
    });
  });
});