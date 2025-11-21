// Lightweight reading progress bar for post pages
(function () {
    const bar = document.getElementById('reading-progress');
    if (!bar) return;
    const barInner = bar.querySelector('.reading-progress__bar');
    const article = document.querySelector('main.post article');
    if (!article || !barInner) { bar?.setAttribute('hidden', ''); return; }

    // Resolve a CSS variable (including calc()) to pixels
    function getCssVarPx(name, fallback = 0) {
        try {
            const val = getComputedStyle(document.documentElement).getPropertyValue(name);
            if (!val) return fallback;
            if (/^\s*\d+(\.\d+)?px\s*$/.test(val)) return parseFloat(val);
            const div = document.createElement('div');
            div.style.position = 'absolute';
            div.style.visibility = 'hidden';
            div.style.height = `var(${name})`;
            document.body.appendChild(div);
            const px = div.offsetHeight;
            div.remove();
            return px || fallback;
        } catch { return fallback; }
    }

    let headerOffset = 0;
    function updateHeaderOffset() {
        headerOffset = getCssVarPx('--offset-anchor-post', getCssVarPx('--offset-anchor', 0));
    }
    updateHeaderOffset();

    let start = 0, end = 0, total = 0;
    function measure() {
        const rectTop = article.getBoundingClientRect().top + window.scrollY;
        start = rectTop;
        end = rectTop + article.offsetHeight;
        total = (end - start) - (window.innerHeight - headerOffset);
        // Hide if there is nothing to scroll within the article
        if (total <= 0) {
            bar.setAttribute('hidden', '');
        } else {
            bar.removeAttribute('hidden');
        }
        update();
    }

    let ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => { ticking = false; update(); });
    }

    function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

    function update() {
        if (total <= 0) return;
        const scrolledInside = window.scrollY - (start - headerOffset);
        const ratio = clamp(scrolledInside / total, 0, 1);
        const percent = Math.round(ratio * 100);
        bar.style.transform = 'translateZ(0)';
        barInner.style.transform = `scaleX(${ratio})`;
        bar.setAttribute('aria-valuenow', String(percent));
    }

    // Recalculate on resize and when images load (content height changes)
    window.addEventListener('resize', () => { updateHeaderOffset(); measure(); });
    window.addEventListener('orientationchange', () => { updateHeaderOffset(); measure(); });
    window.addEventListener('scroll', onScroll, { passive: true });

    // If the post contains images that load later, re-measure when they load
    const imgs = article.querySelectorAll('img');
    imgs.forEach(img => {
        if (img.complete) return; // already loaded
        img.addEventListener('load', measure, { once: true });
        img.addEventListener('error', measure, { once: true });
    });

    // Initial measure + paint
    measure();
    onScroll();
})();
