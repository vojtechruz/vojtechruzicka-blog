// Click (or Enter/Space) on an in-post image shows it enlarged in a modal <dialog>. Screenshots are
// often 1500-2700 px wide but render at ~615 px in the text column, where small IDE text is hard to
// read. Only images the dialog would show noticeably larger get the zoom; the set is re-evaluated when
// an image changes size (rotation, window resize). The enlarged image is a new <img> with the in-page
// picture's srcsets and a `sizes` for the size it will show at, so the large candidate downloads only
// on demand. The native modal dialog provides the focus trap, Escape and focus return; a click
// anywhere closes it. Without JS the images stay as they are.
(() => {
  // In-post images, captioned (figure.image-figure) or not; not the featured image or post cards
  const images = Array.from(
    document.querySelectorAll(
      ':is(main.post > article, main.post > article > .image-figure) > .image-wrapper > picture > img',
    ),
  );
  if (!images.length || typeof HTMLDialogElement !== 'function') {
    return;
  }

  // Zoom only when it shows noticeably more: at least this much wider than rendered in the column
  const MIN_GAIN = 1.25;
  // Room the dialog keeps around the enlarged image (CSS padding of .lightbox), per side
  const MARGIN = 16;

  let dialog;
  let opener;

  function buildDialog() {
    dialog = document.createElement('dialog');
    dialog.className = 'lightbox';
    dialog.innerHTML = '<button type="button" class="lightbox-close" aria-label="Close">×</button>';
    // A click anywhere (image, backdrop, the close button) closes; Escape is native
    dialog.addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      document.body.classList.remove('lightbox-open');
      dialog.querySelector('picture')?.remove();
      // Native focus return can miss when the dialog was opened by a pointer: put it back explicitly
      opener?.focus({ preventScroll: true });
    });
    document.body.appendChild(dialog);
  }

  /** The width the enlarged image will show at: the viewport, the original size and its height bound. */
  function displayWidth(img) {
    const width = Number(img.getAttribute('width')) || img.naturalWidth;
    const height = Number(img.getAttribute('height')) || img.naturalHeight;
    const maxWidth = window.innerWidth - 2 * MARGIN;
    const maxHeight = window.innerHeight - 2 * MARGIN;
    return Math.max(1, Math.round(Math.min(width, maxWidth, height ? (maxHeight * width) / height : Infinity)));
  }

  function open(img) {
    if (!dialog) {
      buildDialog();
    }
    opener = img.closest('.lightbox-trigger');
    const sizes = `${displayWidth(img)}px`;
    const picture = img.closest('picture').cloneNode(true);
    picture.querySelectorAll('source').forEach((source) => source.setAttribute('sizes', sizes));
    const large = picture.querySelector('img');
    // A fresh image: eager, no LQIP mosaic or blur, the in-page rendition shown until the large one loads
    large.removeAttribute('class');
    large.removeAttribute('style');
    large.removeAttribute('loading');
    large.setAttribute('sizes', sizes);
    // Sized up front (height from the width/height aspect ratio), so the placeholder shows at once
    large.style.width = sizes;
    large.style.backgroundImage = `url("${img.currentSrc || img.src}")`;
    dialog.setAttribute('aria-label', img.alt || 'Image');
    dialog.prepend(picture);
    document.body.classList.add('lightbox-open');
    dialog.showModal();
    dialog.querySelector('.lightbox-close').focus();
  }

  // Only when the dialog would show it noticeably larger: on a phone a wide screenshot already spans
  // the screen (pinch-zoom is the way there), a tall one may still gain
  function zoomable(img) {
    return img.clientWidth > 0 && displayWidth(img) >= img.clientWidth * MIN_GAIN;
  }

  function update(img) {
    // Printing lays the page out anew; the button stays as it was (print styles show it as the image)
    if (window.matchMedia?.('print').matches) {
      return;
    }
    const picture = img.parentElement;
    const trigger = picture.parentElement.classList.contains('lightbox-trigger') ? picture.parentElement : null;
    if (zoomable(img) === Boolean(trigger)) {
      return;
    }
    if (trigger) {
      trigger.replaceWith(picture);
      return;
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'lightbox-trigger';
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-label', img.alt ? `Enlarge image: ${img.alt}` : 'Enlarge image');
    button.addEventListener('click', () => open(img));
    picture.replaceWith(button);
    button.appendChild(picture);
  }

  // The image's own size (the column) and the viewport (the dialog) both decide
  const updateAll = () => images.forEach(update);
  window.addEventListener('resize', updateAll);
  if ('ResizeObserver' in window) {
    // Also fires once per image right after observe(), which does the initial pass
    const observer = new ResizeObserver((entries) => entries.forEach(({ target }) => update(target)));
    images.forEach((img) => observer.observe(img));
  } else {
    updateAll();
  }
})();
