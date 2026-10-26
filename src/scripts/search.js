(() => {
  // Ensures Pagefind assets are loaded only once
  let bootAssetsPromise = null;

  // Tab stops inside an open search overlay (focus trap)
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

  // Element that had focus when a keyboard shortcut opened a container; Escape returns there
  const shortcutOrigins = new WeakMap();

  // The shortcuts below, as the header input announces them: in its tooltip and in aria-keyshortcuts
  const isMac = /mac|iphone|ipad/i.test(navigator.userAgentData?.platform || navigator.platform || '');
  const SHORTCUT_HINT = `Shortcut: / or ${isMac ? '⌘K' : 'Ctrl+K'}`;
  const KEY_SHORTCUTS = `/ ${isMac ? 'Meta' : 'Control'}+K`;

  // Distinct landmark names: /search/ and 404 have a second search form besides the header one.
  // The label comes from renderSearch (data-search-label); /search/ renders its own markup.
  const searchLabel = (container) =>
    container.dataset.searchLabel ||
    (container.hasAttribute('data-search-inline') ? 'Search posts' : 'Search the site');

  // Name an input after its search form. Pagefind names its input only by a title copied from the
  // placeholder ("Search…"); here the title instead tells the shortcut, on the input the shortcut opens.
  function labelInput(container, input, opensOnShortcut) {
    if (!input) {
      return;
    }
    input.setAttribute('aria-label', searchLabel(container));
    if (opensOnShortcut) {
      input.setAttribute('title', SHORTCUT_HINT);
      input.setAttribute('aria-keyshortcuts', KEY_SHORTCUTS);
    } else {
      input.removeAttribute('title');
    }
  }

  function loadJS(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script'); // classic script, NOT type="module"
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error('Failed to load ' + src));
      document.head.appendChild(s);
    });
  }

  function ensureAssets() {
    // Already available (preloaded, or a stub in unit tests): nothing to fetch.
    if (window.PagefindUI) {
      return Promise.resolve();
    }
    if (!bootAssetsPromise) {
      bootAssetsPromise = loadJS('/pagefind/pagefind-ui.js').catch((err) => {
        console.error(err);
        bootAssetsPromise = null;
      });
    }
    return bootAssetsPromise;
  }

  async function initContainer(container) {
    if (!container || container.dataset.pagefindInited === '1') {
      return;
    }

    // Set the guard synchronously, BEFORE any await. Multiple lazy triggers
    // (pointerdown + click + focusin) can fire for a single user gesture; if the
    // guard were set only after the async asset load, each of them would pass the
    // check above and create a duplicate PagefindUI instance.
    container.dataset.pagefindInited = '1';

    try {
      // Load assets first (only once)
      await ensureAssets();

      if (!window.PagefindUI) {
        throw new Error('window.PagefindUI not available');
      }
    } catch (err) {
      // Allow a later trigger to retry after a failed asset load
      delete container.dataset.pagefindInited;
      throw err;
    }

    // Inline containers (the dedicated /search/ page) render results in the page
    // flow instead of the header overlay: no backdrop, no body lock, and the query
    // is read from / written to the URL so a search can be linked to.
    const inline = container.hasAttribute('data-search-inline');

    // Clear any placeholder content
    container.innerHTML = '';

    // Create UI instance scoped to this container
    const ui = new window.PagefindUI({
      element: container,
      showSubResults: false,
      showImages: false,
      resetStyles: false,
      translations: {
        placeholder: 'Search…',
        one_result: "Found 1 result for '[SEARCH_TERM]'.",
        many_results: "Found [COUNT] results for '[SEARCH_TERM]'.",
        zero_results: "No results found for '[SEARCH_TERM]'.",
        search_label: searchLabel(container),
        clear_search: '×',
        load_more: 'Load more',
      },
    });

    // Defer DOM queries until Pagefind has rendered into the container
    queueMicrotask(() => {
      const drawer = container.querySelector('.pagefind-ui__drawer');
      const input = container.querySelector('.pagefind-ui__search-input');
      labelInput(container, input, container === containers[0]);

      if (inline) {
        // Run the query carried in the URL (`/search/?q=term`, the SearchAction target)
        const params = new URLSearchParams(window.location.search);
        const initialQuery = (params.get('q') || '').trim();
        if (initialQuery) {
          ui.triggerSearch(initialQuery);
        }

        // Keep the URL shareable while typing, without polluting history
        input?.addEventListener('input', () => {
          const query = input.value.trim();
          const url = query ? `?q=${encodeURIComponent(query)}` : window.location.pathname;
          window.history.replaceState(null, '', url);
        });
      } else {
        // Shared backdrop (one per page)
        let backdrop = document.querySelector('.backdrop-search');
        if (!backdrop) {
          backdrop = document.createElement('div');
          backdrop.className = 'backdrop-search';
          document.body.appendChild(backdrop);
        }

        const hideBackdrop = () => {
          document.body.classList.remove('search-open');
          backdrop.classList.remove('is-visible');
        };

        const isOpen = () => drawer && !drawer.classList.contains('pagefind-ui__hidden');

        // Close the open instance. `restoreFocus` (keyboard close) sends focus back to where a
        // shortcut was pressed, or keeps it in the now empty input; a backdrop click just blurs.
        const closeCurrent = (restoreFocus = false, origin = shortcutOrigins.get(container)) => {
          if (input) {
            input.value = '';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            if (!restoreFocus) {
              input.blur();
            } else if (origin?.isConnected) {
              origin.focus();
            } else if (input.checkVisibility?.() ?? true) {
              // Not when Escape also closed the collapsed menu around it: nav.js has focused the toggle
              input.focus({ preventScroll: true });
            }
          }
          hideBackdrop();
        };
        backdrop.addEventListener('click', () => closeCurrent());

        // A shortcut origin only counts while focus stays in the search; leaving it forgets it
        container.addEventListener('focusout', (e) => {
          if (!container.contains(e.relatedTarget)) {
            shortcutOrigins.delete(container);
          }
        });

        // Focus trap: while the results cover the page, Tab cycles through the input, the clear
        // button, the results and "Load more" instead of wandering into the page behind the backdrop
        container.addEventListener('keydown', (e) => {
          if (e.key !== 'Tab' || !isOpen()) {
            return;
          }
          const focusables = Array.from(container.querySelectorAll(FOCUSABLE)).filter(
            (el) => !el.closest('[hidden], .pagefind-ui__hidden'),
          );
          if (!focusables.length) {
            return;
          }
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        });

        // Observe open/close state for this instance
        const mo = new MutationObserver(() => {
          const open = isOpen();
          document.body.classList.toggle('search-open', open);
          backdrop.classList.toggle('is-visible', open);

          if (open) {
            input?.focus();
          }
        });

        if (drawer) {
          mo.observe(drawer, { attributes: true, attributeFilter: ['class'] });
        }

        // ESC closes this instance if open; in its input it also applies with no results (nothing typed).
        // Pagefind's own Escape handler on the input runs first: it clears the query and blurs the input,
        // which drops the shortcut origin (focusout) and can hide the drawer, leaving focus on <body>. So
        // read the state in the capture phase, before Pagefind, and restore focus once the event has
        // bubbled past it.
        let escape = null;
        window.addEventListener(
          'keydown',
          (e) => {
            const applies = e.key === 'Escape' && (isOpen() || (input && document.activeElement === input));
            escape = applies ? { origin: shortcutOrigins.get(container) } : null;
          },
          true,
        );
        window.addEventListener('keydown', () => {
          if (escape) {
            closeCurrent(true, escape.origin);
            escape = null;
          }
        });
      }

      const visible = (el) => !el.closest('[hidden], .pagefind-ui__hidden');

      // Arrow keys between the input, the result links and "Load more" (Tab still works): ArrowDown
      // from the input goes to the first result, ArrowUp from the first result back to the input.
      // Enter on a focused result follows the link natively. Modified arrows (text selection) are
      // left alone.
      container.addEventListener('keydown', (e) => {
        if ((e.key !== 'ArrowDown' && e.key !== 'ArrowUp') || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
          return;
        }
        const items = Array.from(container.querySelectorAll('.pagefind-ui__result-link, .pagefind-ui__button')).filter(
          visible,
        );
        const down = e.key === 'ArrowDown';
        let next;
        if (e.target === input) {
          next = down ? items.find((el) => el.matches('.pagefind-ui__result-link')) : null;
        } else {
          const index = items.indexOf(e.target);
          if (index < 0) {
            return;
          }
          next = down ? items[index + 1] : items[index - 1] || input;
        }
        if (next) {
          e.preventDefault();
          next.focus();
        } else if (e.target !== input) {
          // Past the end: stay put instead of scrolling the page behind the overlay
          e.preventDefault();
        }
      });

      // "Load more" keeps focus on itself while it moves below the new results; send focus to the
      // first newly added result instead, so the reader continues where the list grew. Pagefind adds
      // the result items first and fills in each link once its data has loaded. Capture phase: the
      // count must be taken before Pagefind's own click handler on the button renders the new items.
      container.addEventListener(
        'click',
        (e) => {
          if (!e.target.closest('.pagefind-ui__button')) {
            return;
          }
          const firstNew = container.querySelectorAll('.pagefind-ui__result').length;
          const focusFirstNew = () => {
            const item = container.querySelectorAll('.pagefind-ui__result')[firstNew];
            const link = item?.querySelector('.pagefind-ui__result-link');
            if (link) {
              link.focus();
            }
            return Boolean(link);
          };
          const observer = new MutationObserver(() => focusFirstNew() && observer.disconnect());
          observer.observe(container, { childList: true, subtree: true });
          setTimeout(() => observer.disconnect(), 5000);
        },
        true,
      );

      // Initial focus
      input?.focus({ preventScroll: true });

      // Plausible search tracking
      input?.addEventListener('blur', (e) => {
        const query = e.target.value.trim();
        if (query.length > 3 && typeof window.trackAnalyticsEvent === 'function') {
          window.trackAnalyticsEvent('Search Query', { searchQuery: query });
        }
      });

      // Track click on search result
      container.addEventListener('click', (e) => {
        const resultLink = e.target.closest('.pagefind-ui__result-link');
        if (resultLink && typeof window.trackAnalyticsEvent === 'function') {
          const url = resultLink.getAttribute('href');
          window.trackAnalyticsEvent('Search Result Click', {
            searchResultUrl: url,
            searchResultQuery: input?.value.trim(),
          });
        }
      });
    });
  }

  // Find all potential search containers: support both legacy #search and new .js-pagefind
  const containers = Array.from(document.querySelectorAll('.js-pagefind, #search'));

  // Attach lazy-init triggers per container (include pointerdown for better touch support)
  containers.forEach((container, i) => {
    // The shortcuts open the first container
    labelInput(container, container.querySelector('.pagefind-ui__search-input'), i === 0);

    // The dedicated search page is the whole point of the visit: initialise it
    // right away so a `?q=` query from the URL runs without any interaction.
    if (container.hasAttribute('data-search-inline')) {
      initContainer(container).catch(console.error);
      return;
    }

    const triggerEvents = ['pointerdown', 'click', 'focusin', 'mouseenter'];
    const onTrigger = () => initContainer(container).catch(console.error);
    triggerEvents.forEach((ev) => container.addEventListener(ev, onTrigger, { once: true }));
  });

  // Open a container on demand: initialise it on first use, and on every later
  // use (repeat shortcut, reopening after Escape) put the caret back in its input,
  // which initContainer alone does not do once its guard is set.
  async function openContainer(container) {
    await initContainer(container);
    container.querySelector('.pagefind-ui__search-input')?.focus({ preventScroll: true });
  }

  // Backwards-compat: explicit opener if present
  const explicitOpen = document.getElementById('open-search');
  if (explicitOpen) {
    ['click', 'focus', 'mouseenter'].forEach((ev) =>
      explicitOpen.addEventListener(
        ev,
        () => {
          // prefer the first container (header) if available
          const target = containers[0];

          if (target) {
            openContainer(target).catch(console.error);
          }
        },
        { once: true },
      ),
    );
  }

  // Keyboard shortcuts (optional): open the first available container
  document.addEventListener('keydown', (e) => {
    const inField = /^(input|textarea|select)$/i.test(e.target.tagName) || e.target.isContentEditable;

    if (inField) {
      return;
    }
    const slash = e.key === '/';
    const modK = e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey);
    if (slash || modK) {
      e.preventDefault();
      const target = containers[0];

      // isConnected: a container removed from the page must not claim the shortcut (or its origin)
      if (target?.isConnected) {
        const origin = document.activeElement;
        const hasOrigin = origin && origin !== document.body && !target.contains(origin);
        if (hasOrigin) {
          shortcutOrigins.set(target, origin);
        }
        if (revealInMenu(target)) {
          menuShortcutOrigin = hasOrigin ? origin : null;
        }
        openContainer(target).catch(console.error);
      }
    }
  });

  // On narrow screens the header search sits in the collapsed menu (display: none), where its input
  // cannot take focus and a shortcut would do nothing: open the menu first, through its own toggle
  // (nav.js is a separate bundle). Returns whether it did.
  function revealInMenu(container) {
    const nav = container.closest('.main-navigation');
    const menu = container.closest('.menu-container');
    const toggle = nav?.querySelector('.nav-toggle');
    if (!menu || !toggle || getComputedStyle(menu).display !== 'none') {
      return false;
    }
    toggle.click();
    return true;
  }

  // Where a shortcut was pressed when it had to open the menu. On Escape nav.js closes the menu and
  // focuses its toggle; focus then goes back here instead, as it does when no menu was involved.
  let menuShortcutOrigin = null;

  const header = containers[0]?.closest('.main-navigation');
  if (header) {
    const toggle = header.querySelector('.nav-toggle');

    // Opening or closing the menu by hand ends the shortcut's claim on it. (The shortcut's own toggle
    // click lands here too, before the shortcut records its origin.)
    toggle?.addEventListener('click', () => {
      menuShortcutOrigin = null;
    });

    // Capture, before nav.js: does this Escape close the menu the shortcut opened, from inside it?
    // Checked now, not tracked through focusout: hiding the menu blurs its input with no relatedTarget.
    let escapeOrigin = null;
    window.addEventListener(
      'keydown',
      (e) => {
        const closesMenu =
          e.key === 'Escape' &&
          toggle?.getAttribute('aria-expanded') === 'true' &&
          header.contains(document.activeElement);
        escapeOrigin = closesMenu ? menuShortcutOrigin : null;
      },
      true,
    );

    // Bubbling, after nav.js has closed the menu and focused its toggle
    window.addEventListener('keydown', () => {
      const origin = escapeOrigin;
      escapeOrigin = null;
      if (!origin || document.activeElement !== toggle) {
        return;
      }
      menuShortcutOrigin = null;
      if (origin.isConnected) {
        origin.focus();
      }
    });
  }
})();
