// Ends the LQIP placeholder of each image (blur and inline background, set by
// config/html-transform/lqip-transform.js and styled in _image-wrapper.scss): data-loaded once the
// image has loaded, data-failed when it could not, so its alt text shows instead of a blurred smudge.
// An inline onload attribute did the first part before, but needed 'unsafe-hashes' in the CSP.
// Without JavaScript the <noscript> style in base.njk drops the placeholder up front.

const mark = (img, loaded) => {
  if (loaded) {
    img.dataset.loaded = '1';
    // A later srcset candidate (after a resize) can still load
    delete img.dataset.failed;
  } else if (!img.dataset.loaded) {
    img.dataset.failed = '1';
  }
};

// load and error do not bubble, so listen in the capture phase for every image, lazy ones included
for (const type of ['load', 'error']) {
  document.addEventListener(
    type,
    (event) => {
      if (event.target instanceof HTMLImageElement && event.target.classList.contains('lqip')) {
        mark(event.target, type === 'load');
      }
    },
    true,
  );
}

// Images that finished before this deferred script ran (cached ones, typically). A lazy image not
// yet requested is not complete, so it waits for its event.
document.querySelectorAll('img.lqip').forEach((img) => {
  if (img.complete) {
    mark(img, img.naturalWidth > 0);
  }
});
