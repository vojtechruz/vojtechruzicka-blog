import { describe, it, expect, vi, afterEach } from 'vitest';
import registerImagePlugin, {
  DEFAULT_IMAGE_FORMATS,
  DEFAULT_IMAGE_WIDTHS,
  imageFilename,
  resolveImageFormats,
  resolveImageWidths,
} from '../config/plugins/image.js';

// Unit tests of the image plugin configuration (config/plugins/image.js). What the build emits with it
// is covered by tests/images.test.js.

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('imageFilename (filenameFormat)', () => {
  it('builds <name>-<hash>-<width>.<format> from the source basename', () => {
    expect(imageFilename('a1B2c3', './src/posts/java/records/featured.jpg', 800, 'avif')).toBe(
      'featured-a1B2c3-800.avif',
    );
  });

  it('keeps an already clean name as it is, without a warning', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    expect(imageFilename('h', 'src/posts/x/idea-settings-2.png', 400, 'webp')).toBe('idea-settings-2-h-400.webp');
    expect(log).not.toHaveBeenCalled();
  });

  it.each([
    ['Screenshot.PNG', 'screenshot'],
    ['my image  name.png', 'my-image-name'],
    ['under_score.png', 'underscore'],
    ['photo.min.png', 'photomin'],
    ['obrázek (1).jpg', 'obrzek-1'],
  ])('sanitizes %s to %s and warns', (file, name) => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    expect(imageFilename('h', `src/posts/x/${file}`, 400, 'jpeg')).toBe(`${name}-h-400.jpeg`);
    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0].join(' ')).toContain(`sanitized to "${name}"`);
  });

  it('ignores the directory, so equal basenames differ only by the content hash', () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});

    expect(imageFilename('aaa', 'src/posts/a/featured.jpg', 400, 'webp')).not.toBe(
      imageFilename('bbb', 'src/posts/b/featured.jpg', 400, 'webp'),
    );
    expect(imageFilename('aaa', 'src/posts/a/featured.jpg', 400, 'webp')).toBe(
      imageFilename('aaa', 'src/posts/b/featured.jpg', 400, 'webp'),
    );
  });

  it('puts the width in the name, which the srcset tests rely on', () => {
    const names = [400, 800, 1200].map((width) => imageFilename('h', 'a.png', width, 'png'));
    expect(names).toEqual(['a-h-400.png', 'a-h-800.png', 'a-h-1200.png']);
  });
});

describe('resolveImageWidths / resolveImageFormats', () => {
  it('fall back to the production defaults without an env override', () => {
    vi.stubEnv('ELEVENTY_IMAGE_WIDTHS', '');
    vi.stubEnv('ELEVENTY_IMAGE_FORMATS', '');

    expect(resolveImageWidths()).toEqual([400, 800, 1200, 1600, 'auto']);
    expect(resolveImageFormats()).toEqual(['avif', 'webp', 'auto']);
    expect(resolveImageWidths()).toEqual(DEFAULT_IMAGE_WIDTHS);
    expect(resolveImageFormats()).toEqual(DEFAULT_IMAGE_FORMATS);
  });

  it('parse the lean CI override: numbers as numbers, keywords as strings', () => {
    vi.stubEnv('ELEVENTY_IMAGE_WIDTHS', '800,auto');
    vi.stubEnv('ELEVENTY_IMAGE_FORMATS', 'webp,auto');

    expect(resolveImageWidths()).toEqual([800, 'auto']);
    expect(resolveImageFormats()).toEqual(['webp', 'auto']);
  });

  it('trim whitespace around the items', () => {
    vi.stubEnv('ELEVENTY_IMAGE_WIDTHS', ' 400 , 1200 ,auto ');

    expect(resolveImageWidths()).toEqual([400, 1200, 'auto']);
  });

  it('read the env on every call, not once at import', () => {
    vi.stubEnv('ELEVENTY_IMAGE_WIDTHS', '400');
    expect(resolveImageWidths()).toEqual([400]);

    vi.stubEnv('ELEVENTY_IMAGE_WIDTHS', '1600');
    expect(resolveImageWidths()).toEqual([1600]);
  });
});

describe('registerImagePlugin', () => {
  function registeredOptions() {
    const addPlugin = vi.fn();
    registerImagePlugin({ addPlugin });
    expect(addPlugin).toHaveBeenCalledTimes(1);
    return addPlugin.mock.calls[0][1];
  }

  it('passes the resolved formats and widths, so the env override reaches the build', () => {
    vi.stubEnv('ELEVENTY_IMAGE_WIDTHS', '800,auto');
    vi.stubEnv('ELEVENTY_IMAGE_FORMATS', 'webp,auto');

    const options = registeredOptions();
    expect(options.widths).toEqual([800, 'auto']);
    expect(options.formats).toEqual(['webp', 'auto']);
  });

  it('names output files with imageFilename and lazy-loads by default', () => {
    const options = registeredOptions();

    expect(options.filenameFormat).toBe(imageFilename);
    expect(options.defaultAttributes).toEqual({
      loading: 'lazy',
      decoding: 'async',
      sizes: '(min-width: 768px) 760px, 100vw',
    });
  });
});
