import { copyWithFeedback } from './clipboard.js';

(() => {
  document.addEventListener('click', (e) => {
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

    // innerText preserves newlines and ignores the Shiki token markup.
    const code = pre.innerText;
    const status = button.querySelector('.copy-status');

    copyWithFeedback(button, code, {
      copiedAriaLabel: 'Copied!',
      onShow: (fresh) => {
        if (fresh) {
          button.dataset.originalText = status ? status.innerText : 'Copy';
        }
        if (status) {
          status.innerText = 'Copied!';
        }
      },
      onReset: () => {
        if (status) {
          status.innerText = button.dataset.originalText;
        }
      },
      onError: (err) => console.error('Failed to copy code: ', err),
    });
  });
})();
