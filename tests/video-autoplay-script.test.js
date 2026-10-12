import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * @vitest-environment jsdom
 */

// Unit tests for src/scripts/video-autoplay.js: clips that stand in for GIFs play while in view,
// honour reduced motion and a reader's own pause. jsdom has neither IntersectionObserver nor media
// playback, so both are stubbed: `play()`/`pause()` flip `paused` and fire the real events.

let observerCallback;
let observerOptions;
let observed;
let motion;

function stubIntersectionObserver() {
  observed = [];
  window.IntersectionObserver = class {
    constructor(callback, options) {
      observerCallback = callback;
      observerOptions = options;
    }
    observe(el) {
      observed.push(el);
    }
  };
}

function stubReducedMotion(matches) {
  const listeners = [];
  motion = {
    matches,
    addEventListener: (_, fn) => listeners.push(fn),
    set(value) {
      this.matches = value;
      listeners.forEach((fn) => fn({ matches: value }));
    },
  };
  window.matchMedia = vi.fn(() => motion);
}

/** A <video> whose play()/pause() behave like a browser's, with play() resolving or rejecting. */
function makeVideo({ autoplay = true, refuse = false } = {}) {
  const video = document.createElement('video');
  if (autoplay) {
    video.setAttribute('data-autoplay', '');
  }
  let paused = true;
  Object.defineProperty(video, 'paused', { get: () => paused });
  video.play = vi.fn(() => {
    if (refuse) {
      return Promise.reject(new DOMException('Autoplay refused', 'NotAllowedError'));
    }
    paused = false;
    video.dispatchEvent(new Event('play'));
    return Promise.resolve();
  });
  video.pause = vi.fn(() => {
    paused = true;
    video.dispatchEvent(new Event('pause'));
  });
  document.body.appendChild(video);
  return video;
}

/** The reader using the controls: same events, not started by the script. */
const readerPauses = (video) => video.pause();
const readerPlays = (video) => video.play();

const scroll = (video, isIntersecting) => observerCallback([{ target: video, isIntersecting }]);

async function loadScript() {
  await import('../src/scripts/video-autoplay.js?t=' + Date.now() + Math.random());
}

describe('video-autoplay.js', () => {
  beforeEach(() => {
    observerCallback = undefined;
    stubIntersectionObserver();
    stubReducedMotion(false);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('observes only the clips marked data-autoplay, at half visibility', async () => {
    const clip = makeVideo();
    makeVideo({ autoplay: false });
    await loadScript();

    expect(observed).toEqual([clip]);
    expect(observerOptions).toEqual({ threshold: 0.5 });
  });

  it('does nothing on a page without such clips', async () => {
    makeVideo({ autoplay: false });
    await loadScript();

    expect(observerCallback).toBeUndefined();
  });

  it('plays a clip scrolled into view and pauses it once it leaves', async () => {
    const clip = makeVideo();
    await loadScript();

    scroll(clip, true);
    expect(clip.play).toHaveBeenCalledTimes(1);
    expect(clip.paused).toBe(false);

    scroll(clip, false);
    expect(clip.pause).toHaveBeenCalledTimes(1);
    expect(clip.paused).toBe(true);

    scroll(clip, true);
    expect(clip.play).toHaveBeenCalledTimes(2);
  });

  it('keeps a clip the reader paused paused, until they play it again', async () => {
    const clip = makeVideo();
    await loadScript();

    scroll(clip, true);
    readerPauses(clip);
    scroll(clip, false);
    scroll(clip, true);
    expect(clip.play).toHaveBeenCalledTimes(1);

    readerPlays(clip);
    scroll(clip, false);
    scroll(clip, true);
    expect(clip.play).toHaveBeenCalledTimes(3); // the reader's play, then the script's again
  });

  it('does not treat its own pause on scrolling away as the reader pausing', async () => {
    const clip = makeVideo();
    await loadScript();

    scroll(clip, true);
    scroll(clip, false);
    scroll(clip, true);

    expect(clip.play).toHaveBeenCalledTimes(2);
  });

  it('never autoplays when the reader prefers reduced motion', async () => {
    stubReducedMotion(true);
    const clip = makeVideo();
    await loadScript();

    scroll(clip, true);
    expect(clip.play).not.toHaveBeenCalled();
  });

  it('stops visible clips when reduced motion is switched on, and resumes them when it is off', async () => {
    const clip = makeVideo();
    const offscreen = makeVideo();
    await loadScript();
    scroll(clip, true);

    motion.set(true);
    expect(clip.paused).toBe(true);

    motion.set(false);
    expect(clip.paused).toBe(false);
    expect(offscreen.play).not.toHaveBeenCalled();
  });

  it('marks its own plays as automatic only for the play event, for analytics.js', async () => {
    const clip = makeVideo();
    let markedDuringPlay;
    clip.addEventListener('play', () => (markedDuringPlay = 'autoplaying' in clip.dataset), { capture: true });
    await loadScript();

    scroll(clip, true);
    expect(markedDuringPlay).toBe(true);
    expect('autoplaying' in clip.dataset).toBe(false);

    scroll(clip, false);
    readerPlays(clip);
    expect(markedDuringPlay).toBe(false);
  });

  it('tolerates a refused autoplay and leaves no mark behind', async () => {
    const clip = makeVideo({ refuse: true });
    await loadScript();

    scroll(clip, true);
    await Promise.resolve();
    await Promise.resolve();

    expect(clip.paused).toBe(true);
    expect('autoplaying' in clip.dataset).toBe(false);
  });

  it('leaves the clips alone in a browser without IntersectionObserver', async () => {
    delete window.IntersectionObserver;
    const clip = makeVideo();
    await loadScript();

    expect(clip.play).not.toHaveBeenCalled();
  });
});
