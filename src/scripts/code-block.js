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

    // Shiki renders one <span class="line"> per line, so join their text. innerText would depend on layout:
    // in the grid of _code.scss an empty line is visible (min-height) yet innerText drops it, so blank lines
    // inside the code went missing from the copy. A block without Shiki lines falls back to innerText.
    const lines = pre.querySelectorAll('.line');
    const code = lines.length ? Array.from(lines, (line) => line.textContent).join('\n') : pre.innerText;
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
