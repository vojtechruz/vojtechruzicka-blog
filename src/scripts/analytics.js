/**
 * Plausible Analytics wrapper for easy local debugging and safe execution.
 * @param {string} event - event name
 * @param {object} props - event properties
 */
function trackAnalyticsEvent(event, props = {}) {
  if (typeof window.plausible === 'function') {
    window.plausible(event, { props });
  } else {
    // only in dev mode
    if (location.hostname === 'localhost') {
      console.info('[analytics]', event, props);
    }
  }
}

window.trackAnalyticsEvent = trackAnalyticsEvent;

(() => {
  // Global click listener for multiple trackers
  document.addEventListener('click', (e) => {
    // 1. Social Links (Unified)
    const socialLink = e.target.closest('[data-social-name]');
    if (socialLink) {
      trackAnalyticsEvent('Social Link Click', {
        name: socialLink.dataset.socialName,
        url: socialLink.getAttribute('href'),
        location: socialLink.dataset.location || 'Unknown',
      });
      return; // Avoid double tracking as outbound link
    }

    // 2. Share Buttons
    const shareCopyBtn = e.target.closest('.share-copy');
    if (shareCopyBtn) {
      trackAnalyticsEvent('Share Click', { type: 'Copy Post Link', shareCopyUrl: location.pathname });
      return;
    }

    const nativeShareBtn = e.target.closest('#native-share-button');
    if (nativeShareBtn) {
      trackAnalyticsEvent('Share Post Click', { type: 'Native Share', shareCopyUrl: location.pathname });
      return;
    }

    // 3. Code Block Copy
    const codeCopyBtn = e.target.closest('.copy-code-button');
    if (codeCopyBtn) {
      trackAnalyticsEvent('Code Block Copy Click', { codeBlockUrl: location.pathname });
      return;
    }

    // 6. About Page Links
    const aboutLink = e.target.closest('[data-about-name]');
    if (aboutLink) {
      trackAnalyticsEvent('About Link Click', {
        name: aboutLink.dataset.aboutName,
        url: aboutLink.getAttribute('href'),
      });
      return;
    }

    // 4. Outbound Links
    const link = e.target.closest('a');
    if (link && link.hostname && link.hostname !== window.location.hostname) {
      // Ignore internal links (some links might be relative or full URLs to the same site)
      // and anchor links on the same page
      if (!link.href.startsWith('mailto:') && !link.href.startsWith('tel:')) {
        trackAnalyticsEvent('Outbound Link Click', { url: link.href });
      }
      return;
    }

    // 5. Topic Clicks
    const topicLink = e.target.closest('.topic-name');
    if (topicLink) {
      trackAnalyticsEvent('Topic Click', { topic: topicLink.innerText.trim() });
      return;
    }
  });

  // 7. Video Playback Tracking
  const trackVideoEvent = (video, type) => {
    const title = video.dataset.videoTitle || video.getAttribute('title') || 'Untitled Video';
    const src = video.currentSrc || video.querySelector('source')?.getAttribute('src') || 'Unknown Source';

    trackAnalyticsEvent('Video Playback', {
      type,
      title,
      src,
      url: location.pathname,
    });
  };

  document.addEventListener(
    'play',
    (e) => {
      if (e.target.tagName === 'VIDEO') {
        trackVideoEvent(e.target, 'Play');
      }
    },
    { capture: true },
  );
})();
