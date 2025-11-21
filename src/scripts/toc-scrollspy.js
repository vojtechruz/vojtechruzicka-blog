// Lightweight scrollspy for the TOC
(function () {
    const toc = document.querySelector('nav.toc');
    if (!toc) return;
    const links = Array.from(toc.querySelectorAll('.toc-list a[href^="#"]'));
    if (!links.length) return;

    // Map href -> heading element
    const idToLink = new Map();
    const headings = [];
    for (const a of links) {
        try {
            const id = decodeURIComponent(a.getAttribute('href') || '').slice(1);
            if (!id) continue;
            const h = document.getElementById(id);
            if (h) {
                idToLink.set(id, a);
                headings.push(h);
            }
        } catch { /* ignore malformed */ }
    }
    if (!headings.length) return;

    // Utils: Robustly resolve CSS variable to pixels (handles calc, rem, etc.)
    function getCssVarPx(name, fallback = 0) {
        try {
            const val = getComputedStyle(document.documentElement).getPropertyValue(name);
            if (!val) return fallback;
            // Optimization: simple px values don't need DOM manipulation
            if (/^\s*\d+(\.\d+)?px\s*$/.test(val)) return parseFloat(val);

            // Create a temporary element to resolve complex values like calc()
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
    updateOffset(); // Initial calculation

    let activeId = null;
    function setActive(id) {
        if (id === activeId) return;
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
    }

    let ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            ticking = false;

            // 1. Check if we are at the bottom of the page (highlight last item)
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
                const last = headings[headings.length - 1];
                if (last) setActive(last.id);
                return;
            }

            // 2. Find the last heading above the offset
            let current = null;
            for (const h of headings) {
                const rect = h.getBoundingClientRect();
                // If the heading is above the offset (with a small buffer)
                if ((rect.top - offset) <= 4) {
                    current = h.id;
                } else {
                    // Since headings are in order, once we find one below the offset, we can stop
                    break;
                }
            }

            // 3. Fallback: If no heading is "above" the offset (e.g. at top of page),
            // check if the first heading is visible and close to top
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

    // Highlight immediately and on events
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Update offset on resize in case media queries change the header height
    window.addEventListener('resize', () => {
        updateOffset();
        onScroll();
    });

    // When clicking a TOC link, update active immediately
    toc.addEventListener('click', (e) => {
        const a = e.target.closest('a[href^="#"]');
        if (!a) return;
        const id = decodeURIComponent(a.getAttribute('href')).slice(1);
        if (id && idToLink.has(id)) setActive(id);
    });
})();
