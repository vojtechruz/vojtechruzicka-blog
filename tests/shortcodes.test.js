import { describe, it, expect } from 'vitest';
import info from '../config/shortcodes/info.js';
import warning from '../config/shortcodes/warning.js';
import error from '../config/shortcodes/error.js';
import youtube from '../config/shortcodes/youtube.js';
import video from '../config/shortcodes/video.js';
import linkedPost from '../config/shortcodes/linked-post.js';

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

  it('should handle multi-line markdown', async () => {
    const content = `* Item 1\n* Item 2`;
    const result = await info(content);
    expect(result).toContain('<li>Item 1</li>');
    expect(result).toContain('<li>Item 2</li>');
  });

  it('should render headings inside shortcodes', async () => {
    const content = `### Heading inside`;
    const result = await info(content);
    expect(result).toContain('<h3');
    expect(result).toContain('Heading inside</h3>');
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
});

describe('Video Shortcode', () => {
  it('should generate multiple sources for extensionless input', async () => {
    const result = await video('/videos/my-video');
    expect(result).toContain('src="/videos/my-video.webm" type="video/webm"');
    expect(result).toContain('src="/videos/my-video.mp4" type="video/mp4"');
  });

  it('should handle mp4 input and add webm', async () => {
    const result = await video('/videos/test.mp4');
    expect(result).toContain('src="/videos/test.mp4" type="video/mp4"');
    expect(result).toContain('src="/videos/test.webm" type="video/webm"');
  });

  it('should include poster and dimensions if available', async () => {
    const result = await video('/videos/test', 'Title', '/posters/test.jpg');
    expect(result).toContain('poster="/posters/test.jpg"');
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
          tags: ['java', 'spring'],
          excerpt: 'This is a test post excerpt.',
          draftStatus: 'ready',
        },
      },
    ],
  };

  it('should render a linked post card', () => {
    const result = linkedPost('/posts/test-post/', mockCollections);
    expect(result).toContain('class="linked-post  linked-post-draft linked-post-ready"');
    expect(result).toContain('href="/posts/test-post/"');
    expect(result).toContain('Test Post');
    expect(result).toContain('This is a test post excerpt.');
    expect(result).toContain('java');
    expect(result).toContain('spring');
    expect(result).toContain('Ready');
  });

  it('should throw error if post not found', () => {
    expect(() => linkedPost('/non-existent/', mockCollections)).toThrow(
      'Article not found for permalink: /non-existent/',
    );
  });
});
