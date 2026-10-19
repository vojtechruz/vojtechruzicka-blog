import { describe, it, expect, beforeEach, afterEach } from 'vitest';

/**
 * @vitest-environment jsdom
 */

// Unit tests for src/scripts/lightbox.js: which in-post images get the zoom button, and what the
// dialog shows. jsdom has neither layout nor a modal <dialog>, so each image gets a settable
// clientWidth and the dialog's showModal/close are stubbed; the real-browser behaviour (focus trap,
// Escape, the downloaded candidate) is in tests/lightbox-browser.test.js.

let observerCallback;

function stubDialog() {
  window.HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  window.HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}

function viewport(width, height) {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: height, configurable: true });
}

/** An in-post image as the build emits it, rendered `rendered` px wide in the column. */
function inPostImage({ width = 2000, height = 1000, rendered = 615, alt = 'IDE settings' } = {}) {
  let article = document.querySelector('main.post > article');
  if (!article) {
    document.body.innerHTML = '<main class="post"><article></article></main>';
    article = document.querySelector('main.post > article');
  }
  const wrapper = document.createElement('div');
  wrapper.className = 'image-wrapper';
  wrapper.innerHTML = `<picture>
      <source type="image/avif" srcset="/p/x-800.avif 800w, /p/x-${width}.avif ${width}w" sizes="auto, 760px">
      <img class="lqip" style="background-image: url(data:x)" onload="this.dataset.loaded=1;" loading="lazy"
        decoding="async" src="/p/x-${width}.png" alt="${alt}" width="${width}" height="${height}"
        srcset="/p/x-800.png 800w, /p/x-${width}.png ${width}w" sizes="auto, 760px">
    </picture>`;
  article.appendChild(wrapper);
  const img = wrapper.querySelector('img');
  const size = { rendered };
  Object.defineProperty(img, 'clientWidth', { get: () => size.rendered, configurable: true });
  img.resize = (now) => {
    size.rendered = now;
  };
  return img;
}

async function loadScript() {
  await import('../src/scripts/lightbox.js?t=' + Date.now() + Math.random());
}

const trigger = (img) => img.closest('.lightbox-trigger');
const dialog = () => document.querySelector('dialog.lightbox');

beforeEach(() => {
  document.body.innerHTML = '';
  document.body.className = '';
  delete window.ResizeObserver;
  stubDialog();
  viewport(1280, 800);
});

describe('lightbox.js: which images get the zoom button', () => {
  it('wraps an image the column shrinks in a named button that opens a dialog', async () => {
    const img = inPostImage();
    await loadScript();

    const button = trigger(img);
    expect(button?.tagName).toBe('BUTTON');
    expect(button.getAttribute('type')).toBe('button');
    expect(button.getAttribute('aria-haspopup')).toBe('dialog');
    expect(button.getAttribute('aria-label')).toBe('Enlarge image: IDE settings');
    // The picture moved inside, still in its wrapper
    expect(button.parentElement.classList.contains('image-wrapper')).toBe(true);
  });

  it('names the button generically when the image has no alt text', async () => {
    const img = inPostImage({ alt: '' });
    await loadScript();
    expect(trigger(img).getAttribute('aria-label')).toBe('Enlarge image');
  });

  it('leaves images that would show at most slightly larger alone', async () => {
    const small = inPostImage({ width: 700, height: 400 }); // its original size is barely above 615
    const tall = inPostImage({ width: 1200, height: 1600 }); // the viewport height caps it at ~576 px
    await loadScript();
    expect(trigger(small)).toBeNull();
    expect(trigger(tall)).toBeNull();
  });

  it('offers no zoom on a phone, where the image already spans the screen', async () => {
    viewport(390, 844);
    const img = inPostImage({ rendered: 358 });
    await loadScript();
    expect(trigger(img)).toBeNull();
  });

  it('ignores images outside the article body (cards, featured image)', async () => {
    document.body.innerHTML =
      '<main class="post"><article><header><div class="image-wrapper"><picture>' +
      '<img src="/f.png" width="2000" height="1000" alt=""></picture></div></header></article></main>';
    await loadScript();
    expect(document.querySelector('.lightbox-trigger')).toBeNull();
  });

  it('re-evaluates on resize: unwraps when no longer zoomable, wraps again when it is', async () => {
    const img = inPostImage();
    await loadScript();
    expect(trigger(img)).not.toBeNull();

    viewport(700, 800);
    img.resize(668);
    window.dispatchEvent(new Event('resize'));
    expect(trigger(img)).toBeNull();
    expect(img.closest('.image-wrapper > picture')).not.toBeNull();

    viewport(1280, 800);
    img.resize(615);
    window.dispatchEvent(new Event('resize'));
    expect(trigger(img)).not.toBeNull();
  });

  it('uses ResizeObserver when available, starting with the pass it fires on observe()', async () => {
    window.ResizeObserver = class {
      constructor(callback) {
        observerCallback = callback;
      }
      observe() {}
    };
    const img = inPostImage();
    await loadScript();
    expect(trigger(img)).toBeNull();

    observerCallback([{ target: img }]);
    expect(trigger(img)).not.toBeNull();
  });
});

describe('lightbox.js: the dialog', () => {
  afterEach(() => {
    dialog()?.close();
  });

  it('shows a fresh copy of the picture sized for the viewport, with the page rendition as placeholder', async () => {
    const img = inPostImage({ width: 2000, height: 1000 });
    await loadScript();
    trigger(img).click();

    expect(dialog().hasAttribute('open')).toBe(true);
    expect(dialog().getAttribute('aria-label')).toBe('IDE settings');
    expect(document.body.classList.contains('lightbox-open')).toBe(true);

    const large = dialog().querySelector('picture img');
    // 1280 - 2 × 16 px margin = 1248 px wide; the 800 - 32 px height allows 1536, the original 2000
    expect(large.getAttribute('sizes')).toBe('1248px');
    expect(large.style.width).toBe('1248px');
    dialog()
      .querySelectorAll('source')
      .forEach((source) => expect(source.getAttribute('sizes')).toBe('1248px'));
    expect(large.getAttribute('srcset')).toBe(img.getAttribute('srcset'));
    expect(large.style.backgroundImage).toContain('/p/x-2000.png');
    // Not lazy (it is meant to load now), no LQIP blur, mosaic or onload
    for (const attribute of ['loading', 'class', 'onload']) {
      expect(large.hasAttribute(attribute), attribute).toBe(false);
    }
    // The page image itself is untouched
    expect(img.getAttribute('sizes')).toBe('auto, 760px');
    expect(img.classList.contains('lqip')).toBe(true);
  });

  it('bounds the size by the viewport height and by the original width', async () => {
    const wide = inPostImage({ width: 3000, height: 2000 });
    const narrow = inPostImage({ width: 900, height: 300 });
    await loadScript();

    trigger(wide).click();
    expect(dialog().querySelector('img').getAttribute('sizes')).toBe('1152px'); // 800 - 32 = 768 px tall at 3:2
    dialog().close();

    trigger(narrow).click();
    expect(dialog().querySelector('img').getAttribute('sizes')).toBe('900px'); // never above the original
  });

  it('closes on a click anywhere, and returns focus to the image button', async () => {
    const img = inPostImage();
    await loadScript();
    trigger(img).click();
    expect(document.activeElement.className).toBe('lightbox-close');

    dialog().querySelector('img').click();

    expect(dialog().hasAttribute('open')).toBe(false);
    expect(dialog().querySelector('picture')).toBeNull();
    expect(document.body.classList.contains('lightbox-open')).toBe(false);
    expect(document.activeElement).toBe(trigger(img));
  });

  it('reuses one dialog for every image', async () => {
    const first = inPostImage({ alt: 'First' });
    const second = inPostImage({ alt: 'Second' });
    await loadScript();

    trigger(first).click();
    dialog().close();
    trigger(second).click();

    expect(document.querySelectorAll('dialog.lightbox')).toHaveLength(1);
    expect(dialog().querySelectorAll('picture')).toHaveLength(1);
    expect(dialog().getAttribute('aria-label')).toBe('Second');
  });
});
