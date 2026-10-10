// Lightweight scrollspy for the TOC with active-item visibility and safe click handling
(() => {
  const toc = document.querySelector('nav.toc');
  if (!toc) {
    return;
  }

  // How much vertical slack space around the active item (fractions of TOC height)
  const TOC_TOP_BUFFER = 0.1; // 10% above active item
  const TOC_BOTTOM_BUFFER = 0.25; // 25% below active item

  // When true, scroll-spy logic is suspended (e.g. during TOC-click initiated scrolling)
  let suppressAutoSpy = false;

  // A TOC click locks the spy until the scroll it started has finished: unlocked on `scrollend`,
  // or once no scroll event arrived for SCROLL_IDLE_MS (browsers without `scrollend`), or after
  // UNLOCK_START_MS when the click caused no scroll at all (target already in place).
  const SCROLL_IDLE_MS = 150;
  const UNLOCK_START_MS = 500;
  let unlockTimer = null;

  function scheduleUnlock(ms) {
    clearTimeout(unlockTimer);
    unlockTimer = setTimeout(unlockSpy, ms);
  }

  // Release the lock without re-evaluating: the clicked item stays highlighted until the next
  // scroll of any kind (scrollbar drag, autoscroll, in-text link, back button...) moves the spy on.
  // Re-evaluating here would steal the highlight from a short section near the end of the page,
  // whose heading cannot scroll up to the anchor line.
  function unlockSpy() {
    clearTimeout(unlockTimer);
    suppressAutoSpy = false;
  }

  // Detect actual scrollable container (might be nav.toc or a parent with overflow-y)
  let scrollEl = toc;
  while (scrollEl && scrollEl !== document.body) {
    const s = getComputedStyle(scrollEl);

    if (/(auto|scroll)/.test(s.overflowY)) {
      break;
    }
    scrollEl = scrollEl.parentElement;
  }

  if (!scrollEl) {
    scrollEl = toc;
  }

  const links = Array.from(toc.querySelectorAll(".toc-list a[href^='#']"));
  if (!links.length) {
    return;
  }

  const idToLink = new Map();
  const headings = [];

  for (const a of links) {
    try {
      const href = a.getAttribute('href') || '';
      // Use the fragment exactly as in the DOM id (no decodeURIComponent),
      // so ids with encoded commas, parentheses, etc. still match.
      const id = href.startsWith('#') ? href.slice(1) : href;
      if (!id) {
        continue;
      }

      const h = document.getElementById(id);
      if (h) {
        idToLink.set(id, a);
        headings.push(h);
      }
    } catch {
      // ignore malformed hrefs
    }
  }
  if (!headings.length) {
    return;
  }

  // Resolve CSS variable to px (supports calc(), rem, etc.)
  function getCssVarPx(name, fallback = 0) {
    try {
      const val = getComputedStyle(document.documentElement).getPropertyValue(name);
      if (!val) {
        return fallback;
      }

      if (/^\s*\d+(\.\d+)?px\s*$/.test(val)) {
        return parseFloat(val);
      }

      const div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.visibility = 'hidden';
      div.style.height = `var(${name})`;
      document.body.appendChild(div);
      const px = div.offsetHeight;
      div.remove();
      return px;
    } catch {
      return fallback;
    }
  }

  let offset = 0;
  function updateOffset() {
    offset = getCssVarPx('--offset-anchor-post', getCssVarPx('--offset-anchor', 0));
  }
  updateOffset();

  let activeId = null;

  // Keep the active TOC item within an asymmetric visible band inside the TOC
  function ensureActiveVisible() {
    if (!activeId || !scrollEl) {
      return;
    }
    if (suppressAutoSpy) {
      // don't auto-scroll TOC while we are in click-mode
      return;
    }

    const link = idToLink.get(activeId);
    if (!link) {
      return;
    }

    if (scrollEl.scrollHeight <= scrollEl.clientHeight + 1) {
      // no overflow
      return;
    }

    const viewHeight = scrollEl.clientHeight;
    const scrollTop = scrollEl.scrollTop;

    const linkRect = link.getBoundingClientRect();
    const contRect = scrollEl.getBoundingClientRect();
    const linkTop = linkRect.top - contRect.top + scrollTop;
    const linkBottom = linkTop + link.offsetHeight;

    const minTop = scrollTop + viewHeight * TOC_TOP_BUFFER;
    const maxBottom = scrollTop + viewHeight * (1 - TOC_BOTTOM_BUFFER);

    if (linkTop < minTop || linkBottom > maxBottom) {
      let target = linkTop - viewHeight * TOC_TOP_BUFFER;

      const maxScroll = scrollEl.scrollHeight - viewHeight;
      if (target < 0) {
        target = 0;
      }

      if (target > maxScroll) {
        target = maxScroll;
      }

      scrollEl.scrollTo({
        top: target,
        behavior: 'auto',
      });
    }
  }

  function setActive(id) {
    if (id === activeId) {
      return;
    }

    activeId = id;

    for (const a of links) {
      const isActive = a.hash === '#' + id;
      a.classList.toggle('is-active', isActive);
      if (isActive) {
        a.setAttribute('aria-current', 'true');
      } else {
        a.removeAttribute('aria-current');
      }
    }

    ensureActiveVisible();
  }

  let ticking = false;
  function onScroll() {
    if (suppressAutoSpy) {
      // ignore the click-initiated scroll, but keep the lock only while it is still moving
      scheduleUnlock(SCROLL_IDLE_MS);
      return;
    }
    if (ticking) {
      return;
    }

    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;

      // 1) Near bottom: always highlight last heading
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10) {
        const last = headings[headings.length - 1];

        if (last) {
          setActive(last.id);
        }

        return;
      }

      // 2) Normal case: find last heading above the offset line
      let current = null;
      for (const h of headings) {
        const r = h.getBoundingClientRect();
        if (r.top - offset <= 4) {
          current = h.id;
        } else {
          break;
        }
      }

      // 3) Fallback near the very top: use the first heading if it's visible enough
      if (!current) {
        const first = headings[0];
        if (first) {
          const r = first.getBoundingClientRect();
          if (r.top >= 0 && r.top < window.innerHeight * 0.6) {
            current = first.id;
          }
        }
      }

      if (current) {
        setActive(current);
      }
    });
  }

  // Initial highlight
  onScroll();

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    updateOffset();
    onScroll();
  });

  // The click-initiated scroll has settled
  window.addEventListener('scrollend', () => {
    if (suppressAutoSpy) {
      unlockSpy();
    }
  });

  // Helper: resume scroll-spy after a real user scroll interaction
  function resumeSpyFromUserInteraction() {
    if (!suppressAutoSpy) {
      return;
    }

    unlockSpy();
    onScroll();
  }

  // Mouse wheel, touch scroll, and keyboard navigation interrupt the click scroll: resume at once
  window.addEventListener('wheel', resumeSpyFromUserInteraction, { passive: true });
  window.addEventListener('touchstart', resumeSpyFromUserInteraction, { passive: true });
  window.addEventListener('keydown', (e) => {
    const keys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ', 'Spacebar'];
    if (keys.includes(e.key)) {
      resumeSpyFromUserInteraction();
    }
  });

  // Clicks in the TOC: highlight the clicked item at once and lock the spy while the page scrolls.
  // The scrolling itself is the browser's ordinary fragment navigation: scroll-margin-top keeps the
  // heading clear of the header, `scroll-behavior` makes it smooth (instant with reduced motion),
  // the heading becomes :target and Back returns to where the reader was.
  toc.addEventListener('click', (e) => {
    // Ctrl/Cmd/Shift/Alt-click (new tab, new window, download) and non-primary buttons stay with
    // the browser untouched.
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
      return;
    }

    const a = e.target.closest("a[href^='#']");

    if (!a) {
      return;
    }

    const href = a.getAttribute('href') || '';
    const id = href.startsWith('#') ? href.slice(1) : href;

    if (!id || !idToLink.has(id)) {
      return;
    }

    suppressAutoSpy = true;
    scheduleUnlock(UNLOCK_START_MS);
    setActive(id);

    // Fragment navigation does not move focus; put it on the section so the next Tab continues in
    // the content rather than in the sidebar.
    const targetHeading = document.getElementById(id);
    if (!targetHeading.hasAttribute('tabindex')) {
      targetHeading.setAttribute('tabindex', '-1');
    }
    targetHeading.focus({ preventScroll: true });
  });
})();
