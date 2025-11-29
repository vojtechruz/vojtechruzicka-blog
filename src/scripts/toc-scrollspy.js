// Lightweight scrollspy for the TOC with active-item visibility and safe click handling
(() => {
  const toc = document.querySelector("nav.toc");
  if (!toc) return;

  // How much vertical slack space around the active item (fractions of TOC height)
  const TOC_TOP_BUFFER = 0.10;     // 10% above active item
  const TOC_BOTTOM_BUFFER = 0.25;  // 25% below active item

  // When true, scroll-spy logic is suspended (e.g. during TOC-click initiated scrolling)
  let suppressAutoSpy = false;

  // Detect actual scrollable container (might be nav.toc or a parent with overflow-y)
  let scrollEl = toc;
  while (scrollEl && scrollEl !== document.body) {
    const s = getComputedStyle(scrollEl);
    if (/(auto|scroll)/.test(s.overflowY)) break;
    scrollEl = scrollEl.parentElement;
  }
  if (!scrollEl) scrollEl = toc;

  const links = Array.from(toc.querySelectorAll(".toc-list a[href^='#']"));
  if (!links.length) return;

  const idToLink = new Map();
  const headings = [];
  for (const a of links) {
    try {
      const id = decodeURIComponent(a.getAttribute("href") || "").slice(1);
      if (!id) continue;
      const h = document.getElementById(id);
      if (h) {
        idToLink.set(id, a);
        headings.push(h);
      }
    } catch {
      // ignore malformed hrefs
    }
  }
  if (!headings.length) return;

  // Resolve CSS variable to px (supports calc(), rem, etc.)
  function getCssVarPx(name, fallback = 0) {
    try {
      const val = getComputedStyle(document.documentElement).getPropertyValue(name);
      if (!val) return fallback;
      if (/^\s*\d+(\.\d+)?px\s*$/.test(val)) return parseFloat(val);

      const div = document.createElement("div");
      div.style.position = "absolute";
      div.style.visibility = "hidden";
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
    offset = getCssVarPx("--offset-anchor-post", getCssVarPx("--offset-anchor", 0));
  }
  updateOffset();

  let activeId = null;

  // Keep the active TOC item within an asymmetric visible band inside the TOC
  function ensureActiveVisible() {
    if (!activeId || !scrollEl) return;
    if (suppressAutoSpy) return; // don't auto-scroll TOC while we are in click-mode

    const link = idToLink.get(activeId);
    if (!link) return;

    if (scrollEl.scrollHeight <= scrollEl.clientHeight + 1) return; // no overflow

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
      if (target < 0) target = 0;
      if (target > maxScroll) target = maxScroll;

      scrollEl.scrollTo({
        top: target,
        behavior: "auto"
      });
    }
  }

  function setActive(id) {
    if (id === activeId) return;
    activeId = id;

    for (const a of links) {
      const isActive = a.hash === "#" + id;
      a.classList.toggle("is-active", isActive);
      if (isActive) {
        a.setAttribute("aria-current", "true");
      } else {
        a.removeAttribute("aria-current");
      }
    }

    ensureActiveVisible();
  }

  let ticking = false;
  function onScroll() {
    if (suppressAutoSpy) return; // completely ignore scroll events while locked by click
    if (ticking) return;

    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;

      // 1) Near bottom: always highlight last heading
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10) {
        const last = headings[headings.length - 1];
        if (last) setActive(last.id);
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

      if (current) setActive(current);
    });
  }

  // Initial highlight
  onScroll();

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    updateOffset();
    onScroll();
  });

  // Helper: resume scroll-spy after a real user scroll interaction
  function resumeSpyFromUserInteraction() {
    if (!suppressAutoSpy) return;
    suppressAutoSpy = false;
    onScroll();
  }

  // Mouse wheel, touch scroll, and keyboard navigation all re-enable scroll-spy
  window.addEventListener("wheel", resumeSpyFromUserInteraction, { passive: true });
  window.addEventListener("touchstart", resumeSpyFromUserInteraction, { passive: true });
  window.addEventListener("keydown", (e) => {
    const keys = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " ", "Spacebar"];
    if (keys.includes(e.key)) {
      resumeSpyFromUserInteraction();
    }
  });

  // Clicks in the TOC: lock scroll-spy, highlight clicked item, scroll page with correct offset
  toc.addEventListener("click", (e) => {
    const a = e.target.closest("a[href^='#']");
    if (!a) return;

    const rawHref = a.getAttribute("href") || "";
    const id = decodeURIComponent(rawHref).slice(1);
    if (!id || !idToLink.has(id)) return;

    // Take over scrolling so browser default doesn't fight with our offset logic
    e.preventDefault();

    suppressAutoSpy = true;
    setActive(id); // immediately highlight clicked item and do NOT let scroll-spy override it

    const targetHeading = document.getElementById(id);
    if (targetHeading) {
      const rect = targetHeading.getBoundingClientRect();
      const absoluteY = window.scrollY + rect.top - offset;

      window.scrollTo({
        top: absoluteY,
        behavior: "smooth"
      });
    }
    // scroll-spy will be re-enabled only when user scrolls (wheel/touch/keys),
    // not on the programmatic scroll we just triggered.
  });
})();
