(() => {
  // Global click listener for multiple trackers
  document.addEventListener('click', (e) => {
    // 1. Social Footer Links
    const socialLink = e.target.closest('.footer-social [data-social-name]');
    if (socialLink) {
      window.plausible('Social Link Click', {
        props: {
          name: socialLink.dataset.socialName,
          url: socialLink.getAttribute('href'),
        },
      });
      return; // Avoid double tracking as outbound link
    }

    // 2. Share Buttons
    const shareCopyBtn = e.target.closest('.share-copy');
    if (shareCopyBtn) {
      window.plausible('Share Click', { props: { type: 'Copy Post Link' } });
      return;
    }

    const nativeShareBtn = e.target.closest('#native-share-button');
    if (nativeShareBtn) {
      window.plausible('Share Post Click', { props: { type: 'Native Share' } });
      return;
    }

    // 3. Code Block Copy
    const codeCopyBtn = e.target.closest('.copy-code-button');
    if (codeCopyBtn) {
      window.plausible('Code Block Copy Click');
      return;
    }

    // 4. Outbound Links
    const link = e.target.closest('a');
    if (link && link.hostname && link.hostname !== window.location.hostname) {
      // Ignore internal links (some links might be relative or full URLs to the same site)
      // and anchor links on the same page
      if (!link.href.startsWith('mailto:') && !link.href.startsWith('tel:')) {
        window.plausible('Outbound Link Click', { props: { url: link.href } });
      }
      return;
    }

    // 5. Tag Clicks
    const tagLink = e.target.closest('.tag-name');
    if (tagLink) {
      window.plausible('Tag Click', { props: { tag: tagLink.innerText.trim() } });
      return;
    }
  });
})();
