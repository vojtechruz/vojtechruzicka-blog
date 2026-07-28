// Shared clipboard-copy with transient feedback.
//
// Used by the code-block copy button, the social-share copy button and the
// heading permalink anchors so all three behave identically: write to the
// clipboard, flag the trigger with `.copied` for `duration` ms (swapping its
// aria-label to announce success, then restoring it), debounced so rapid
// clicks don't leave the element stuck in the copied state.
//
// `onShow(fresh)` runs right after `.copied` is added (fresh === not already
// copied — use it to capture original state once); `onReset` runs when the
// state clears; `onError(err)` runs if the copy fails (nothing else happens).
export async function copyWithFeedback(el, text, opts = {}) {
  const { copiedAriaLabel = 'Copied!', duration = 2000, onShow, onReset, onError } = opts;

  try {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      throw new Error('Clipboard API not available');
    }
    await navigator.clipboard.writeText(text);
  } catch (err) {
    if (onError) {
      onError(err);
    }
    return;
  }

  const fresh = !el.classList.contains('copied');
  if (fresh) {
    el.dataset.originalAriaLabel = el.getAttribute('aria-label') || '';
  }
  el.classList.add('copied');
  el.setAttribute('aria-label', copiedAriaLabel);
  if (onShow) {
    onShow(fresh);
  }

  if (el._copyTimeout) {
    clearTimeout(el._copyTimeout);
  }
  el._copyTimeout = setTimeout(() => {
    el.classList.remove('copied');
    el.setAttribute('aria-label', el.dataset.originalAriaLabel);
    if (onReset) {
      onReset();
    }
    delete el._copyTimeout;
  }, duration);
}
