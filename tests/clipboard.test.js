import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { copyWithFeedback } from '../src/scripts/clipboard.js';

/**
 * @vitest-environment jsdom
 */

// Unit tests for src/scripts/clipboard.js, the copy-with-feedback helper shared by the code-block copy
// button, the social-share copy button and the heading permalinks. The callers' own tests cover their
// wiring; these pin the shared behaviour: the transient copied state, the aria-label swap and restore,
// the debounce of repeated copies and the failure paths.

let writeText;

function setClipboard(value) {
  Object.defineProperty(navigator, 'clipboard', { value, configurable: true });
}

function makeButton(label = 'Copy code to clipboard') {
  const button = document.createElement('button');
  if (label !== null) {
    button.setAttribute('aria-label', label);
  }
  document.body.appendChild(button);
  return button;
}

beforeEach(() => {
  vi.useFakeTimers();
  writeText = vi.fn().mockResolvedValue(undefined);
  setClipboard({ writeText });
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('copyWithFeedback', () => {
  it('writes the text and shows the copied state with its own aria-label', async () => {
    const button = makeButton();
    await copyWithFeedback(button, 'npm test', { copiedAriaLabel: 'Link copied' });

    expect(writeText).toHaveBeenCalledWith('npm test');
    expect(button.classList.contains('copied')).toBe(true);
    expect(button.getAttribute('aria-label')).toBe('Link copied');
  });

  it('defaults to "Copied!" for 2 seconds, then restores the original label', async () => {
    const button = makeButton();
    await copyWithFeedback(button, 'x');
    expect(button.getAttribute('aria-label')).toBe('Copied!');

    vi.advanceTimersByTime(1999);
    expect(button.classList.contains('copied')).toBe(true);

    vi.advanceTimersByTime(1);
    expect(button.classList.contains('copied')).toBe(false);
    expect(button.getAttribute('aria-label')).toBe('Copy code to clipboard');
  });

  it('honours a custom duration and calls onShow and onReset', async () => {
    const button = makeButton();
    const onShow = vi.fn();
    const onReset = vi.fn();
    await copyWithFeedback(button, 'x', { duration: 500, onShow, onReset });

    expect(onShow).toHaveBeenCalledWith(true);
    expect(onReset).not.toHaveBeenCalled();
    vi.advanceTimersByTime(500);
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(button.classList.contains('copied')).toBe(false);
  });

  it('a repeated copy restarts the timer and still restores the original label, not "Copied!"', async () => {
    const button = makeButton();
    const onShow = vi.fn();
    const onReset = vi.fn();
    await copyWithFeedback(button, 'x', { onShow, onReset });
    vi.advanceTimersByTime(1500);
    await copyWithFeedback(button, 'x', { onShow, onReset });

    // The second copy happened while copied: not fresh, so callers keep their first captured state
    expect(onShow.mock.calls).toEqual([[true], [false]]);

    // The first timer is cancelled: 2 s after the first copy the state is still shown
    vi.advanceTimersByTime(500);
    expect(button.classList.contains('copied')).toBe(true);
    expect(onReset).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1500);
    expect(button.classList.contains('copied')).toBe(false);
    expect(button.getAttribute('aria-label')).toBe('Copy code to clipboard');
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('restores an empty label on an element that had none', async () => {
    const button = makeButton(null);
    await copyWithFeedback(button, 'x');
    vi.advanceTimersByTime(2000);

    expect(button.getAttribute('aria-label')).toBe('');
  });

  it('reports a rejected write through onError and shows no copied state', async () => {
    const button = makeButton();
    const error = new Error('denied');
    writeText.mockRejectedValue(error);
    const onError = vi.fn();
    const onShow = vi.fn();
    await copyWithFeedback(button, 'x', { onError, onShow });

    expect(onError).toHaveBeenCalledWith(error);
    expect(onShow).not.toHaveBeenCalled();
    expect(button.classList.contains('copied')).toBe(false);
    expect(button.getAttribute('aria-label')).toBe('Copy code to clipboard');
  });

  it.each([
    ['no clipboard API at all', undefined],
    ['a clipboard without writeText', {}],
  ])('treats %s as a failure', async (_, clipboard) => {
    setClipboard(clipboard);
    const button = makeButton();
    const onError = vi.fn();
    await copyWithFeedback(button, 'x', { onError });

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'Clipboard API not available' }));
    expect(button.classList.contains('copied')).toBe(false);
  });

  it('fails quietly without an onError callback', async () => {
    writeText.mockRejectedValue(new Error('denied'));
    const button = makeButton();

    await expect(copyWithFeedback(button, 'x')).resolves.toBeUndefined();
    expect(button.classList.contains('copied')).toBe(false);
  });
});
