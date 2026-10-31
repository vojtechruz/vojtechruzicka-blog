import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { globSync } from 'glob';
import { getAllPosts, loadPage, loadPageHtml, SITE_DIR } from './helpers.js';
import badge from '../config/shortcodes/badge.js';
import info from '../config/shortcodes/info.js';
import warning from '../config/shortcodes/warning.js';
import error from '../config/shortcodes/error.js';
import success from '../config/shortcodes/success.js';
import youtube from '../config/shortcodes/youtube.js';
import video from '../config/shortcodes/video.js';
import linkedPost from '../config/shortcodes/linked-post.js';

describe('Badge Shortcode', () => {
  it.each([
    ['new', 'New'],
    ['up', '↑ Up'],
    ['down', '↓ Down'],
    ['merged', 'Merged'],
    ['removed', 'Removed'],
    ['renamed', 'Renamed'],
  ])('renders default label for variant "%s"', (variant, expectedLabel) => {
    const result = badge(variant);
    expect(result).toContain(`class="badge badge--${variant}"`);
    expect(result).toContain(expectedLabel);
  });

  it('renders custom label when provided', () => {
    const result = badge('up', '↑ 3');
    expect(result).toContain('badge--up');
    expect(result).toContain('↑ 3');
    expect(result).not.toContain('↑ Up');
  });

  it('falls back to variant name as label for unknown variants', () => {
    const result = badge('custom-type');
    expect(result).toContain('badge--custom-type');
    expect(result).toContain('custom-type');
  });

  it('renders a span element', () => {
    const result = badge('new');
    expect(result).toMatch(/^<span /);
    expect(result).toMatch(/<\/span>$/);
  });
});

describe('Message Shortcodes', () => {
  it('should render info message with markdown', async () => {
    const result = await info('**Bold text**');
    expect(result).toContain('msg msg-info');
    expect(result).toContain('<strong>Bold text</strong>');
  });

  it('should render warning message with markdown', async () => {
    const result = await warning('*Italic text*');
    expect(result).toContain('msg msg-warn');
    expect(result).toContain('<em>Italic text</em>');
  });

  it('should render error message with markdown', async () => {
    const result = await error('[Link](http://example.com)');
    expect(result).toContain('msg msg-error');
    expect(result).toContain('<a href="http://example.com">Link</a>');
  });

  it('should render success message with markdown', async () => {
    const result = await success('**Done**');
    expect(result).toContain('msg msg-success');
    expect(result).toContain('<strong>Done</strong>');
  });

  it.each([
    ['info', info],
    ['warning', warning],
    ['error', error],
    ['success', success],
  ])('renders a decorative variant icon for %s', async (_, shortcode) => {
    const result = await shortcode('Text');
    expect(result).toContain('<svg aria-hidden="true"');
    expect(result).toContain('class="msg-content"');
  });

  it('should handle multi-line markdown', async () => {
    const content = `* Item 1\n* Item 2`;
    const result = await info(content);
    expect(result).toContain('<li>Item 1</li>');
    expect(result).toContain('<li>Item 2</li>');
  });

  it('should render headings inside shortcodes', async () => {
    const content = `### Heading inside`;
    const result = await info(content);
    expect(result).toContain('<h3 id="heading-inside">Heading inside ');
    expect(result).toContain('href="#heading-inside"');
  });
});

describe('YouTube Shortcode', () => {
  it('should extract ID from full URL', () => {
    const result = youtube('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(result).toContain('src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1"');
  });

  it('should extract ID from youtu.be URL', () => {
    const result = youtube('https://youtu.be/dQw4w9WgXcQ');
    expect(result).toContain('embed/dQw4w9WgXcQ');
  });

  it('should handle plain ID', () => {
    const result = youtube('dQw4w9WgXcQ');
    expect(result).toContain('embed/dQw4w9WgXcQ');
  });

  it('should handle start time', () => {
    const result = youtube('dQw4w9WgXcQ', 'Title', 30);
    expect(result).toContain('start=30');
  });

  it('should handle start time as second argument', () => {
    const result = youtube('dQw4w9WgXcQ', 45);
    expect(result).toContain('start=45');
    expect(result).toContain('title="YouTube video"');
  });

  it('should escape title', () => {
    const result = youtube('dQw4w9WgXcQ', 'Dangerous <script>');
    expect(result).toContain('title="Dangerous &lt;script&gt;"');
  });

  it('should expose the watch URL (with start time) for print styles', () => {
    expect(youtube('dQw4w9WgXcQ')).toContain(
      'data-print-label="YouTube" data-print-url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"',
    );
    expect(youtube('dQw4w9WgXcQ', 45)).toContain(
      'data-print-url="https://www.youtube.com/watch?v=dQw4w9WgXcQ&amp;t=45s"',
    );
  });
});

describe('Video Shortcode', () => {
  // A real video in the repo, so ffprobe reads actual dimensions
  const REAL_VIDEO =
    '/videos/documenting-angular-apps-with-typedoc-compodoc-and-angulardoc/documentation-angulardoc-extension';

  const sources = (html) => [...html.matchAll(/<source src="([^"]*)"(?: type="([^"]*)")?>/g)].map((m) => [m[1], m[2]]);

  it('should generate multiple sources for extensionless input', async () => {
    const result = await video('/videos/my-video');
    expect(sources(result)).toEqual([
      ['/videos/my-video.webm', 'video/webm'],
      ['/videos/my-video.mp4', 'video/mp4'],
    ]);
  });

  it('should handle mp4 input and add webm', async () => {
    expect(sources(await video('/videos/test.mp4'))).toEqual([
      ['/videos/test.mp4', 'video/mp4'],
      ['/videos/test.webm', 'video/webm'],
    ]);
  });

  it('should handle webm input and add mp4, each source once', async () => {
    expect(sources(await video('/videos/test.webm'))).toEqual([
      ['/videos/test.webm', 'video/webm'],
      ['/videos/test.mp4', 'video/mp4'],
    ]);
  });

  it('should pass an unknown extension through as a single untyped source', async () => {
    expect(sources(await video('/videos/test.mov'))).toEqual([['/videos/test.mov', undefined]]);
  });

  it('should expose the mp4 URL for print styles', async () => {
    expect(await video('/videos/test.webm')).toContain('data-print-label="Video" data-print-url="/videos/test.mp4"');
  });

  it('should link the fallback text to the mp4, even when the webm is listed first', async () => {
    for (const input of ['/videos/test', '/videos/test.webm', '/videos/test.mp4']) {
      expect(await video(input)).toContain('You can <a href="/videos/test.mp4">download the video</a>');
    }
    // No mp4 to offer: the only source
    expect(await video('/videos/test.mov')).toContain('<a href="/videos/test.mov">');
  });

  it('should behave like an animated GIF by default: muted, looped, marked for autoplay', async () => {
    const result = await video('/videos/test', 'Clip');
    for (const attribute of ['muted', 'loop', 'data-autoplay', 'controls', 'playsinline']) {
      expect(result, attribute).toMatch(new RegExp(`\\s${attribute}\\s`));
    }
    // Never the autoplay attribute itself: the script starts clips in view and honours reduced motion
    expect(result).not.toMatch(/\sautoplay[\s=>]/);
  });

  it('should render a plain film player with animated=false', async () => {
    const result = await video('/videos/talk', 'Talk', '', false, false);
    for (const attribute of ['muted', 'loop', 'data-autoplay']) {
      expect(result, attribute).not.toMatch(new RegExp(`\\s${attribute}\\s`));
    }
    expect(result).toMatch(/\scontrols\s/);
  });

  it('should include the poster only when given', async () => {
    expect(await video('/videos/test', 'Title', '/posters/test.jpg')).toContain('poster="/posters/test.jpg"');
    expect(await video('/videos/test', 'Title')).not.toContain('poster=');
  });

  it('should read width and height of a local file with ffprobe', async () => {
    expect(await video(REAL_VIDEO)).toMatch(/\swidth="900" height="474"/);
  });

  it('should omit width and height when the file does not exist', async () => {
    const result = await video('/videos/does-not-exist');
    expect(result).not.toMatch(/\swidth=/);
    expect(result).not.toMatch(/\sheight=/);
  });

  it('should name the video by its title attribute without a caption', async () => {
    const result = await video('/videos/test', 'Finding a dependency');
    expect(result).toContain('title="Finding a dependency"');
    expect(result).toContain('data-video-title="Finding a dependency"');
    expect(result).not.toContain('<figcaption');
    expect(result).not.toContain('aria-labelledby');
  });

  it('should default the title to "Video"', async () => {
    expect(await video('/videos/test')).toContain('title="Video"');
  });

  it('should name the video by its visible caption with showCaption', async () => {
    const result = await video('/videos/test', 'Finding a dependency', '', true);
    const captionId = result.match(
      /<figcaption id="([^"]+)" class="video-caption">Finding a dependency<\/figcaption>/,
    )?.[1];

    expect(captionId, 'figcaption with an id').toBeDefined();
    expect(result).toContain(`aria-labelledby="${captionId}"`);
    expect(result).not.toMatch(/<video[^>]*\stitle=/);
  });

  it('should give each captioned video its own stable caption id', async () => {
    const id = async (...args) => (await video(...args)).match(/<figcaption id="([^"]+)"/)[1];

    expect(await id('/videos/a', 'Same', '', true)).toBe(await id('/videos/a', 'Same', '', true));
    expect(await id('/videos/a', 'Same', '', true)).not.toBe(await id('/videos/b', 'Same', '', true));
    expect(await id('/videos/a', 'One', '', true)).not.toBe(await id('/videos/a', 'Two', '', true));
  });

  it('should escape the title, caption, poster and source URLs', async () => {
    const nasty = '<b>"Tom & Jerry"</b>';
    const plain = await video('/videos/a"b', nasty, '/p"x.jpg');
    const captioned = await video('/videos/test', nasty, '', true);

    expect(plain).not.toContain(nasty);
    expect(plain).toContain('title="&lt;b&gt;&quot;Tom &amp; Jerry&quot;&lt;/b&gt;"');
    expect(plain).toContain('data-video-title="&lt;b&gt;&quot;Tom &amp; Jerry&quot;&lt;/b&gt;"');
    expect(plain).toContain('poster="/p&quot;x.jpg"');
    expect(plain).toContain('src="/videos/a&quot;b.webm"');
    expect(captioned).toContain('>&lt;b&gt;&quot;Tom &amp; Jerry&quot;&lt;/b&gt;</figcaption>');
  });
});

describe('Video files used by posts', () => {
  const calls = getAllPosts().flatMap(({ filePath }) =>
    [...readFileSync(filePath, 'utf8').matchAll(/{%-?\s*video\s+["']([^"']+)["']/g)].map((m) => [m[1], filePath]),
  );

  it('posts embed videos', () => {
    expect(calls.length).toBeGreaterThan(0);
  });

  it.each(calls)('%s has both a .webm and an .mp4 file', (src) => {
    const base = src.replace(/\.(webm|mp4)$/, '');
    for (const ext of ['.webm', '.mp4']) {
      expect(existsSync(join('src/static', base + ext)), base + ext).toBe(true);
    }
  });

  // The title is the clip's accessible name (and its analytics label); these are silent screen
  // recordings, so it is their only text alternative (WCAG 1.2.1), and the default "Video" says nothing.
  it.each(calls)('%s has a descriptive title', (src, filePath) => {
    const escaped = src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const call = readFileSync(filePath, 'utf8').match(
      new RegExp(`{%-?\\s*video\\s+["']${escaped}["']\\s*,\\s*["']([^"']*)["']`),
    );
    expect(call?.[1] ?? '', 'missing title').toMatch(/\S+\s+\S+/);
  });

  it('only posts with an animated clip load the autoplay script, and each of them does', () => {
    const SCRIPT = /<script src="\/scripts\/video-autoplay\.js(?:\?v=[^"]*)?" defer(?:="")?><\/script>/;
    const built = getAllPosts()
      .map(({ frontmatter }) => frontmatter.path)
      .filter((url) => url && existsSync(join(SITE_DIR, url, 'index.html')));
    const withClips = built.filter((url) => loadPageHtml(url).includes('data-autoplay'));

    expect(withClips.length).toBeGreaterThan(0);
    for (const url of built) {
      expect(SCRIPT.test(loadPageHtml(url)), url).toBe(withClips.includes(url));
    }
  });
});

describe('linkedPost shortcode', () => {
  const mockCollections = {
    posts: [
      {
        url: '/posts/test-post/',
        date: new Date('2023-01-01'),
        data: {
          title: 'Test Post',
          topics: ['Java', 'Spring'],
          excerpt: 'This is a test post excerpt.',
          draftStatus: 'ready',
        },
      },
    ],
  };

  it('should render a linked post card', () => {
    const result = linkedPost('/posts/test-post/', mockCollections);
    expect(result).toContain('class="linked-post linked-post-draft linked-post-ready"');
    expect(result).toContain('href="/posts/test-post/"');
    expect(result).toContain('Test Post');
    expect(result).toContain('This is a test post excerpt.');
    expect(result).toContain('/topics/java/');
    expect(result).toContain('/topics/spring/');
    expect(result).toContain('Java');
    expect(result).toContain('Spring');
    expect(result).toContain('Ready');
  });

  it('should render archived post details when the post is archived', () => {
    const result = linkedPost('/archive/test-post/', {
      all: [
        {
          url: '/archive/test-post/',
          date: new Date('2023-01-01'),
          data: {
            title: 'Archived Test Post',
            topics: ['Java'],
            excerpt: 'Archived excerpt.',
            archivedStatus: 'archived',
            archivedDate: '2020-01-01',
            supersededBy: '/posts/test-post/',
          },
        },
      ],
    });

    expect(result).toContain('archived-linked-post');
    expect(result).toContain('Archived January 1, 2020');
    expect(result).toContain('datetime="2020-01-01"');
    expect(result).toContain('Read the current version');
    expect(result).toContain('href="/posts/test-post/"');
  });

  it('should resolve archived posts from the archivedPosts collection', () => {
    const result = linkedPost('/archive/test-post/', {
      archivedPosts: [
        {
          url: '/archive/test-post/',
          date: new Date('2023-01-01'),
          data: {
            title: 'Archived Test Post',
            topics: [],
            excerpt: 'Archived excerpt.',
            archivedStatus: 'archived',
            archivedDate: '2020-01-01',
          },
        },
      ],
    });

    expect(result).toContain('Archived Test Post');
    expect(result).toContain('Archived January 1, 2020');
  });

  it('keeps the card out of the search index, in a post body as well as in a listing', () => {
    const inPost = linkedPost.call({ ctx: { postDir: 'src/posts/host' } }, '/posts/test-post/', mockCollections);
    const inListing = linkedPost('/posts/test-post/', mockCollections);

    expect(inPost).toMatch(/^<div class="[^"]*" data-pagefind-ignore>/);
    expect(inListing).toMatch(/^<div class="[^"]*" data-pagefind-ignore>/);
  });

  it('labels a card inside a post body with a "Related article" eyebrow, listings stay plain', () => {
    const inPost = linkedPost.call({ ctx: { postDir: 'src/posts/host' } }, '/posts/test-post/', mockCollections);
    const inListing = linkedPost('/posts/test-post/', mockCollections);

    expect(inPost).toContain('<span class="linked-post-eyebrow">Related article</span>');
    expect(inListing).not.toContain('linked-post-eyebrow');
  });

  it('renders the draft label through the badge shortcode', () => {
    expect(linkedPost('/posts/test-post/', mockCollections)).toContain('<span class="badge badge--ready">Ready</span>');
  });

  it('emits no blank lines, which would end the HTML block inside markdown', () => {
    // No series, no archive link and no featured image: every optional slot is empty.
    const result = linkedPost.call({ ctx: { postDir: 'src/posts/host' } }, '/posts/test-post/', mockCollections);

    expect(result).not.toMatch(/\n\s*\n/);
  });

  it('should throw error if post not found', () => {
    expect(() => linkedPost('/non-existent/', mockCollections)).toThrow(
      'Article not found for permalink: /non-existent/',
    );
  });
});

describe('linkedPost cards in built pages', () => {
  const pages = globSync('**/index.html', { cwd: SITE_DIR, posix: true })
    .map((file) => `/${file.replace(/index\.html$/, '')}`)
    .map((urlPath) => ({ urlPath, $: loadPage(urlPath) }));
  const postPages = pages.filter(({ $ }) => $('main.post article .linked-post').length > 0);
  const listingPages = pages.filter(({ $ }) => $('main:not(.post) .linked-post').length > 0);

  it('finds posts with in-body cards to check', () => {
    expect(postPages.length).toBeGreaterThan(0);
  });

  it('render without stray empty paragraphs', () => {
    for (const { urlPath, $ } of postPages) {
      expect($('main.post article .linked-post p:empty').length, urlPath).toBe(0);
    }
  });

  it('keep the linked post excerpt out of the host post search index', () => {
    for (const { urlPath, $ } of postPages) {
      $('main.post article .linked-post').each((_, card) => {
        expect($(card).attr('data-pagefind-ignore'), urlPath).toBeDefined();
      });
    }
  });

  it('keep listing cards out of the search index, so listings do not duplicate article results', () => {
    expect(listingPages.length).toBeGreaterThan(0);
    for (const { urlPath, $ } of listingPages) {
      $('.linked-post').each((_, card) => {
        expect($(card).attr('data-pagefind-ignore'), urlPath).toBeDefined();
      });
    }
  });

  it('size card images for the 160px (90px on medium screens) image box', () => {
    for (const { urlPath, $ } of [...postPages, ...listingPages]) {
      $('.front-post-image img').each((_, img) => {
        expect($(img).attr('sizes'), urlPath).toBe('(max-width: 768px) 90px, 160px');
        const widths = ($(img).attr('srcset') || '').match(/\d+(?=w)/g)?.map(Number) || [];
        expect(Math.max(...widths), `${urlPath} offers a candidate wider than 320px`).toBeLessThanOrEqual(320);
      });
    }
  });
});

describe('linkedPost targets in published posts', () => {
  const posts = getAllPosts();
  const isDraft = ({ filePath, frontmatter }) =>
    Boolean(frontmatter.draftStatus) || filePath.replaceAll('\\', '/').includes('/_drafts/');
  const draftUrls = new Set(posts.filter(isDraft).map(({ frontmatter }) => frontmatter.path));

  // Drafts are built only locally and on preview deploys, and linkedPost fails the build for a
  // missing target - so a published post linking a draft would pass the preview and CI, then
  // break the production build.
  it('never point at a draft', () => {
    for (const { filePath } of posts.filter((post) => !isDraft(post))) {
      const body = readFileSync(filePath, 'utf-8');
      for (const [, target] of body.matchAll(/\{%-?\s*linkedPost\s+["']([^"']+)["']/g)) {
        expect(draftUrls.has(target), `${filePath} links the draft ${target}`).toBe(false);
      }
    }
  });
});
