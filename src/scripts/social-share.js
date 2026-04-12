(() => {
    const nativeBtn = document.getElementById('native-share-button');
    // The URL is now passed via data attribute on the button itself or a parent container
    // But to match previous logic, we can look for it on the copy button or just use location.href as fallback
    // However, the previous template injected {{ absoluteUrl }} into the script.
    // We will expect the native button to have a data-url attribute if present.

    const shareUrl = nativeBtn?.dataset.url || location.href;

    // Enable native share if supported
    if (nativeBtn && navigator.share) {
        nativeBtn.hidden = false;

        nativeBtn.addEventListener('click', async () => {
            try {
                await navigator.share({
                    title: document.title,
                    text: document.querySelector('meta[name="description"]')
                        ? document.querySelector('meta[name="description"]').content
                        : '',
                    url: shareUrl
                });
            } catch {
                // user cancelled or share failed — ignore
            }
        });
    }

    // Copy-to-clipboard feedback
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.share-copy');

        if (!btn) {
            return;
        }

        const url = btn.dataset.url || location.href;

        (async () => {
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(url);
                } else {
                    window.prompt('Copy URL of this page:', url);
                    return;
                }

                // Capture original state only if not already showing copied status
                if (!btn.classList.contains('copied')) {
                    btn.dataset.originalAriaLabel = btn.getAttribute('aria-label') || 'Copy link to clipboard';
                }

                btn.classList.add('copied');
                btn.setAttribute('aria-label', 'Link copied');

                // Clear existing timeout if any to prevent overlapping resets
                if (btn._copyTimeout) {
                    clearTimeout(btn._copyTimeout);
                }

                btn._copyTimeout = setTimeout(() => {
                    btn.classList.remove('copied');
                    btn.setAttribute('aria-label', btn.dataset.originalAriaLabel);
                    delete btn._copyTimeout;
                }, 2000);
            } catch {
                window.prompt('Copy this URL:', url);
            }
        })();
    });
})();
