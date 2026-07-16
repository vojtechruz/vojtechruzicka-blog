import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { getAllPosts, SITE_DIR } from './helpers.js';
import { feedContent, htmlToAbsoluteUrls } from '../config/filters/urls.js';

// Load feed config
import feedsConfig from '../src/_data/feeds.js';

const minDate = new Date(feedsConfig.minDate);

// Post bodies in <content:encoded>/<content> may legitimately link to other (old or draft) posts,
// so membership checks must look at item URLs (<guid> in RSS, entry <id> in Atom), not the raw XML.
function getFeedItemUrls(feedContent) {
  const urls = [];
  for (const match of feedContent.matchAll(/<guid[^>]*>([^<]+)<\/guid>/g)) {
    urls.push(match[1]);
  }
  for (const match of feedContent.matchAll(/<id>([^<]+)<\/id>/g)) {
    urls.push(match[1]);
  }
  return urls;
}

function feedHasItem(feedContent, postPath) {
  return getFeedItemUrls(feedContent).some((url) => url.includes(postPath));
}

describe('Feeds (RSS and Atom)', () => {
  const rssPath = `${SITE_DIR}/feed.xml`;
  const atomPath = `${SITE_DIR}/atom.xml`;

  it('RSS feed (feed.xml) should exist', () => {
    expect(existsSync(rssPath), 'feed.xml does not exist. Run "npm run build" first.').toBe(true);
  });

  it('Atom feed (atom.xml) should exist', () => {
    expect(existsSync(atomPath), 'atom.xml does not exist. Run "npm run build" first.').toBe(true);
  });

  describe('minDate cutoff logic', () => {
    const rssContent = existsSync(rssPath) ? readFileSync(rssPath, 'utf-8') : '';
    const atomContent = existsSync(atomPath) ? readFileSync(atomPath, 'utf-8') : '';

    const allPosts = getAllPosts();
    const olderPosts = allPosts.filter((p) => p.frontmatter.date && new Date(p.frontmatter.date) < minDate);

    // Note: skipIf must test .length - arrays are always truthy, so skipIf(!olderPosts) never skips
    it.skipIf(olderPosts.length === 0)('should not contain posts older than minDate', () => {
      for (const post of olderPosts) {
        const postPath = post.frontmatter.path;
        if (postPath) {
          expect(feedHasItem(rssContent, postPath), `RSS feed should not contain old post: ${postPath}`).toBe(false);
          expect(feedHasItem(atomContent, postPath), `Atom feed should not contain old post: ${postPath}`).toBe(false);
        }
      }
    });

    // NOTE: as of 2026-07 the feeds are intentionally empty - minDate (2026-01-01) is newer than
    // every published post, so nothing qualifies yet. This skip makes that state visible in the
    // test report instead of passing vacuously; the test activates once a post publishes past minDate.
    const newerPublishedPosts = allPosts.filter(
      (p) => new Date(p.frontmatter.date) >= minDate && !p.frontmatter.draftStatus,
    );

    it.skipIf(newerPublishedPosts.length === 0)('should contain published posts newer than or equal to minDate', () => {
      for (const post of newerPublishedPosts) {
        const postPath = post.frontmatter.path;
        if (postPath) {
          expect(feedHasItem(rssContent, postPath), `RSS feed should contain newer published post: ${postPath}`).toBe(
            true,
          );
          expect(feedHasItem(atomContent, postPath), `Atom feed should contain newer published post: ${postPath}`).toBe(
            true,
          );
        }
      }
    });
  });

  describe('Draft exclusion from feeds', () => {
    const rssContent = existsSync(rssPath) ? readFileSync(rssPath, 'utf-8') : '';
    const atomContent = existsSync(atomPath) ? readFileSync(atomPath, 'utf-8') : '';

    const allPosts = getAllPosts();
    const draftPosts = allPosts.filter((p) => p.frontmatter.draftStatus);

    it.skipIf(draftPosts.length === 0)('should not contain any draft posts, regardless of date', () => {
      for (const post of draftPosts) {
        const postPath = post.frontmatter.path;
        if (postPath) {
          expect(feedHasItem(rssContent, postPath), `RSS feed should not contain draft post: ${postPath}`).toBe(false);
          expect(feedHasItem(atomContent, postPath), `Atom feed should not contain draft post: ${postPath}`).toBe(
            false,
          );
        }
      }
    });
  });

  describe('Feed content processing', () => {
    const rssContent = existsSync(rssPath) ? readFileSync(rssPath, 'utf-8') : '';
    const atomContent = existsSync(atomPath) ? readFileSync(atomPath, 'utf-8') : '';

    it('replaces a mermaid placeholder with the accessible summary', () => {
      const html =
        '<p>Before</p><pre class="mermaid">flowchart TD\n    accTitle: My title\n    accDescr: My description.\n    A --> B</pre><p>After</p>';
      const result = feedContent(html);

      expect(result).not.toContain('mermaid');
      expect(result).not.toContain('flowchart');
      expect(result).toContain('<em>Diagram: My title. My description.</em>');
      expect(result).toContain('<p>Before</p>');
      expect(result).toContain('<p>After</p>');
    });

    it('uses a generic fallback when accTitle/accDescr are missing', () => {
      const result = feedContent('<pre class="mermaid">flowchart TD\n    A --> B</pre>');
      expect(result).toContain('Diagram available in the original article.');
    });

    it('replaces images with their alt text', () => {
      const result = feedContent('<p>Text</p><img src="/../src/posts/x/pic.png" alt="Architecture overview">');
      expect(result).not.toContain('<img');
      expect(result).toContain('<em>Image: Architecture overview</em>');
    });

    it('drops images without alt text entirely', () => {
      const result = feedContent('<p>Text</p><img src="/../src/posts/x/pic.png" alt="">');
      expect(result).not.toContain('<img');
      expect(result).not.toContain('Image:');
    });

    it('reduces a linkedPost card to a plain related-article link', () => {
      const card =
        '<div class="linked-post"><h2 class="front-post-title"><a href="/owasp-top-ten-2017/">OWASP Top Ten 2017</a></h2>' +
        '<div class="front-post-info"><time datetime="2018-01-01">January 1, 2018</time><ul class="post-topics"><li>Security</li></ul></div>' +
        '<div><a class="front-post-image" href="/owasp-top-ten-2017/"><img src="/x.jpg" alt=""></a><p class="front-post-excerpt">Excerpt text</p></div></div>';
      const result = feedContent(`<p>Before</p>${card}<p>After</p>`);

      expect(result).not.toContain('linked-post');
      expect(result).not.toContain('front-post-title');
      expect(result).not.toContain('January 1, 2018');
      expect(result).not.toContain('Excerpt text');
      expect(result).toContain('<em>Related article: </em><a href="/owasp-top-ten-2017/">OWASP Top Ten 2017</a>');
    });

    it('strips decorative callout/msg icons but keeps the title text', () => {
      const callout =
        '<aside class="callout callout--success"><p class="callout-title">' +
        '<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24"><path d="M1 1"/></svg>How to prevent it</p>' +
        '<div class="callout-body"><ul><li>Least privilege</li></ul></div></aside>';
      const result = feedContent(callout);

      expect(result).not.toContain('<svg');
      expect(result).toContain('How to prevent it');
      expect(result).toContain('<li>Least privilege</li>');
    });

    it('leaves plain content untouched', () => {
      const html = '<p>No diagrams or images here</p>';
      expect(feedContent(html)).toBe(html);
    });

    it('absolutizes root-relative URLs and keeps quotes balanced', () => {
      const result = htmlToAbsoluteUrls('<a href="/some-post/">link</a>', 'https://example.com');
      expect(result).toBe('<a href="https://example.com/some-post/">link</a>');
    });

    it('built feeds contain no raw mermaid source, images, or malformed attributes', () => {
      for (const [name, content] of [
        ['RSS', rssContent],
        ['Atom', atomContent],
      ]) {
        expect(content, `${name} feed should not contain a mermaid placeholder`).not.toContain('class="mermaid"');
        expect(content, `${name} feed should not contain raw mermaid source`).not.toContain('flowchart TD');
        // trailing space matches real <img …> tags without matching the RSS <image> channel logo
        expect(content, `${name} feed should not contain img tags`).not.toContain('<img ');
        expect(content, `${name} feed should not leak source paths`).not.toContain('/src/posts/');
        expect(content, `${name} feed should not contain linkedPost card markup`).not.toContain('front-post-title');
        expect(content, `${name} feed should not contain decorative svg icons`).not.toContain('<svg');
      }
    });
  });

  describe('Feed Metadata', () => {
    it('RSS feed should have basic required tags', () => {
      const rssContent = readFileSync(rssPath, 'utf-8');
      expect(rssContent).toContain('<rss version="2.0"');
      expect(rssContent).toContain('<channel>');
      expect(rssContent).toContain('<title>');
      expect(rssContent).toContain('<link>');
      expect(rssContent).toContain('<description>');
      expect(rssContent).toContain('<lastBuildDate>');
    });

    it('Atom feed should have basic required tags', () => {
      const atomContent = readFileSync(atomPath, 'utf-8');
      expect(atomContent).toContain('<feed xmlns="http://www.w3.org/2005/Atom">');
      expect(atomContent).toContain('<title>');
      expect(atomContent).toContain('<link');
      expect(atomContent).toContain('<updated>');
      expect(atomContent).toContain('<id>');
      if (atomContent.includes('<entry>')) {
        expect(atomContent).toContain('<entry>');
      }
    });

    it('RSS feed exposes author, self-link, generator and branding', () => {
      const rssContent = readFileSync(rssPath, 'utf-8');
      expect(rssContent).toContain('xmlns:dc="http://purl.org/dc/elements/1.1/"');
      expect(rssContent).toContain('<dc:creator>Vojtech Ruzicka</dc:creator>');
      expect(rssContent).toContain('rel="self"');
      expect(rssContent).toContain('<generator>Eleventy</generator>');
      expect(rssContent).toContain('<webfeeds:accentColor>f59e0b</webfeeds:accentColor>');
      expect(rssContent).toContain('apple-touch-icon.png');
    });

    it('Atom feed exposes a feed-level author, self-link, generator and icon', () => {
      const atomContent = readFileSync(atomPath, 'utf-8');
      expect(atomContent).toContain('<author>');
      expect(atomContent).toContain('<name>Vojtech Ruzicka</name>');
      expect(atomContent).toContain('rel="self"');
      expect(atomContent).toContain('<generator>Eleventy</generator>');
      expect(atomContent).toContain('<icon>');
    });

    it('feeds tag each post with its topics as categories', () => {
      const rssContent = readFileSync(rssPath, 'utf-8');
      const atomContent = readFileSync(atomPath, 'utf-8');
      // OWASP post has topics: ['Security']
      expect(rssContent).toContain('<category>Security</category>');
      expect(atomContent).toContain('<category term="Security" />');
    });

    it('feeds do not leak the author email address', () => {
      // dc:creator / atom author use name + URI only, no email to scrape
      expect(readFileSync(rssPath, 'utf-8')).not.toContain('vojtech.ruz@gmail.com');
      expect(readFileSync(atomPath, 'utf-8')).not.toContain('vojtech.ruz@gmail.com');
    });
  });
});
