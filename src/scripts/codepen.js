// Click-to-load CodePen embeds (the `codepen` shortcode): each pen shows a screenshot of its result
// under a title bar with a "Run demo" button that swaps in the real iframe, so nothing loads from
// codepen.io - its editor JavaScript and third-party cookies - until the reader asks for that one demo.
// Without this script the button stays hidden and a link opens the pen on CodePen instead. The bar's
// "Enlarge" button belongs to src/scripts/lightbox.js.
(() => {
  document.querySelectorAll('.codepen-embed-figure').forEach((figure) => {
    const facade = figure.querySelector('.codepen-facade');
    const button = figure.querySelector('button.codepen-run');
    if (!facade || !button) {
      return;
    }
    figure.querySelector('a.codepen-open')?.remove();
    button.hidden = false;

    button.addEventListener('click', () => {
      const { codepenSrc, codepenTitle, codepenHeight, codepenLabelledby } = facade.dataset;
      const iframe = document.createElement('iframe');
      iframe.className = 'codepen-embed';
      iframe.src = codepenSrc;
      iframe.title = codepenTitle;
      iframe.height = codepenHeight;
      iframe.allowFullscreen = true;
      if (codepenLabelledby) {
        iframe.setAttribute('aria-labelledby', codepenLabelledby);
      }
      facade.replaceWith(iframe);
      // The screenshot is gone, and so is what the bar offered for it. Hidden (visibility, in CSS), not
      // removed: a long caption wrapped beside the buttons would reflow into fewer lines and move the demo
      figure.classList.add('codepen-running');
      // The button is gone: keep keyboard and screen reader users where the demo now is
      iframe.focus();
    });
  });
})();
