// Videos that stand in for animated GIFs (the `video` shortcode's default, marked `data-autoplay`):
// muted and looped, they play while at least half visible and pause once scrolled away, so a page
// with several clips only ever runs the ones the reader can see. Readers who prefer reduced motion
// get the plain player, and a clip the reader paused stays paused until they play it again.
// Without this script (no JS) the clips are ordinary players with controls.
(() => {
  const videos = document.querySelectorAll('video[data-autoplay]');
  if (!videos.length || !('IntersectionObserver' in window)) {
    return;
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const visible = new Set();
  const pausedByReader = new WeakSet();
  // Pauses this script makes itself, so the `pause` listener can tell them from the reader's
  const pausingHere = new WeakSet();

  function start(video) {
    if (reducedMotion.matches || pausedByReader.has(video) || !video.paused) {
      return;
    }
    // Marks the play as automatic for the duration of its `play` event: analytics.js only
    // reports plays the reader started.
    video.dataset.autoplaying = '';
    const clear = () => delete video.dataset.autoplaying;
    video.addEventListener('play', clear, { once: true });
    const playing = video.play();
    // Autoplay can still be refused (data saver, a browser setting); the controls remain.
    playing?.catch?.(() => {
      video.removeEventListener('play', clear);
      clear();
    });
  }

  function stop(video) {
    if (video.paused) {
      return;
    }
    pausingHere.add(video);
    video.pause();
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const { target, isIntersecting } of entries) {
        if (isIntersecting) {
          visible.add(target);
          start(target);
        } else {
          visible.delete(target);
          stop(target);
        }
      }
    },
    { threshold: 0.5 },
  );

  for (const video of videos) {
    video.addEventListener('pause', () => {
      if (pausingHere.has(video)) {
        pausingHere.delete(video);
      } else {
        pausedByReader.add(video);
      }
    });
    video.addEventListener('play', () => pausedByReader.delete(video));
    observer.observe(video);
  }

  reducedMotion.addEventListener?.('change', () => {
    for (const video of visible) {
      if (reducedMotion.matches) {
        stop(video);
      } else {
        start(video);
      }
    }
  });
})();
