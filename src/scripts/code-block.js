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
      const originalText = status ? status.innerText : 'Copy';
      const originalAriaLabel = button.getAttribute('aria-label');

      button.classList.add('copied');
      if (status) {
        status.innerText = 'Copied!';
      }
      button.setAttribute('aria-label', 'Copied!');

      setTimeout(() => {
        button.classList.remove('copied');
        if (status) {
          status.innerText = originalText;
        }
        button.setAttribute('aria-label', originalAriaLabel);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
      // Optional: show error state in UI
    }
  });
})();
