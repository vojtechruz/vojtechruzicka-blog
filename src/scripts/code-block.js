(() => {
  document.addEventListener('click', async (e) => {
    const button = e.target.closest('.copy-code-button');
    if (!button) {
      return;
    }

    const container = button.closest('.code-block-container');
    if (!container) {
      return;
    }

    const pre = container.querySelector('pre');
    if (!pre) {
      return;
    }

    // Use innerText to get the text content while preserving newlines
    // and ignoring HTML tags (Shiki tokens).
    const code = pre.innerText;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        throw new Error('Clipboard API not available');
      }

      // Visual and accessibility feedback
      const status = button.querySelector('.copy-status');

      // Capture original state only if not already showing copied status
      if (!button.classList.contains('copied')) {
        button.dataset.originalText = status ? status.innerText : 'Copy';
        button.dataset.originalAriaLabel = button.getAttribute('aria-label') || '';
      }

      button.classList.add('copied');
      if (status) {
        status.innerText = 'Copied!';
      }
      button.setAttribute('aria-label', 'Copied!');

      // Clear existing timeout if any to prevent overlapping resets
      if (button._copyTimeout) {
        clearTimeout(button._copyTimeout);
      }

      button._copyTimeout = setTimeout(() => {
        button.classList.remove('copied');
        if (status) {
          status.innerText = button.dataset.originalText;
        }
        button.setAttribute('aria-label', button.dataset.originalAriaLabel);
        delete button._copyTimeout;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  });
})();
