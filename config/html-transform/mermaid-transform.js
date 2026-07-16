// config/html-transform/mermaid-transform.js
// Build-time Mermaid rendering.
//
// Markdown ```mermaid fences are emitted as <pre class="mermaid">…</pre> placeholders
// by the fence renderer in config/utils/markdown-parser.js. This transform finds those
// placeholders and replaces them with inline SVG rendered by mermaid-isomorphic
// (Mermaid running in headless Chromium via Playwright).
//
// Rendered SVGs are cached in-memory by diagram source, so identical diagrams and
// incremental rebuilds in --serve mode do not re-launch the renderer.

import { load } from 'cheerio';
// mermaid-isomorphic (and through it Playwright) is imported lazily in renderDiagrams:
// Playwright snapshots PLAYWRIGHT_BROWSERS_PATH when its module loads, and a static
// import here would load it during eleventy.config.mjs import resolution - BEFORE
// configurePlaywrightBrowserPath() (config/env-utils.js) can point it at .cache on
// Cloudflare Pages. Verified: changing the env var after the module loads has no effect.

/**
 * Mermaid theme derived from the blog's dark palette in src/styles/_variables.scss.
 * SVG output has these baked in as inline styles, so the values must be kept in sync
 * with the CSS custom properties manually.
 */
const BLOG_FONT_STACK = "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

export const MERMAID_CONFIG = {
  theme: 'base',
  // Pure SVG <text> labels instead of <foreignObject> HTML - keeps the diagrams
  // independent of page CSS and safe for contexts that strip embedded HTML (e.g. feed readers).
  // Mermaid 11 requires the root-level htmlLabels; the flowchart-scoped one alone is ignored.
  htmlLabels: false,
  flowchart: { htmlLabels: false },
  fontFamily: BLOG_FONT_STACK,
  // Diagrams sit on a surface-1 card (.mermaid-diagram in _mermaid.scss), so fills
  // are one step darker (surface-0) to read as wells against the card background.
  themeVariables: {
    darkMode: true,
    background: '#111827', // --color-surface-1 (card background)
    primaryColor: '#0b1220', // --color-surface-0 (node fill)
    primaryTextColor: '#e5e7eb', // --color-text-heading
    primaryBorderColor: '#475569', // --color-bg-highlight (node outline)
    secondaryColor: '#0b1220', // --color-surface-0
    tertiaryColor: '#0b1220', // --color-surface-0
    lineColor: '#94a3b8', // --color-text-muted (edges)
    textColor: '#c7d2da', // --color-text
    clusterBkg: '#0b1220', // --color-surface-0 (subgraph fill)
    clusterBorder: '#233046', // --color-border-muted
    edgeLabelBackground: '#111827', // --color-surface-1 (must match card background)
    noteBkgColor: '#233046',
    noteTextColor: '#e5e7eb',
    noteBorderColor: '#2a3a54',
    titleColor: '#e5e7eb',
    fontFamily: BLOG_FONT_STACK,
    fontSize: '16px',
  },
};

/** ~ --radius-xs (0.2rem) - matches the subtle rounding used across the blog. */
const NODE_CORNER_RADIUS = 3;

/**
 * Mermaid has no theme option for flowchart node corner radius, so round the
 * rects in the rendered SVG directly. Baked into the markup (not page CSS),
 * so the diagrams stay self-contained for feed readers. Rects that already
 * declare a radius (e.g. the rounded `(text)` node shape) are left alone.
 */
function roundNodeCorners(svg) {
  const $ = load(svg, { xmlMode: true });
  $('g.node rect, g.cluster rect').each((_, el) => {
    const $el = $(el);
    if (!$el.attr('rx')) {
      $el.attr('rx', String(NODE_CORNER_RADIUS));
    }
  });
  return $.xml();
}

let renderer;

/** Cache of rendered results ({ svg, title }) keyed by diagram source. Persists across pages and serve-mode rebuilds. */
const svgCache = new Map();

/** Each render batch gets a unique id prefix, so cached SVGs from different batches never collide. */
let batchCounter = 0;

async function renderDiagrams(sources) {
  if (!renderer) {
    const { createMermaidRenderer } = await import('mermaid-isomorphic');
    renderer = createMermaidRenderer();
  }

  const results = await renderer(sources, { mermaidConfig: MERMAID_CONFIG, prefix: `mermaid-${batchCounter++}` });

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      // title carries the diagram's accTitle (if declared) - used for the optional <figcaption>
      svgCache.set(sources[i], { svg: roundNodeCorners(result.value.svg), title: result.value.title });
    } else {
      console.error(`Mermaid rendering failed for diagram starting with "${sources[i].slice(0, 60)}":`, result.reason);
    }
  });
}

/**
 * Eleventy transform: replaces <pre class="mermaid"> placeholders with inline SVG.
 * On rendering failure the placeholder is kept, so the raw diagram source stays
 * visible on the page instead of silently disappearing.
 */
export async function mermaidTransform(content, outputPath) {
  if (!outputPath || !outputPath.endsWith('.html') || !content.includes('class="mermaid"')) {
    return content;
  }

  const $ = load(content);
  const $placeholders = $('pre.mermaid');

  if ($placeholders.length === 0) {
    return content;
  }

  // Collect unique, not-yet-cached diagram sources and render them in one batch.
  const sources = new Set();
  $placeholders.each((_, el) => {
    const source = $(el).text().trim();
    if (source && !svgCache.has(source)) {
      sources.add(source);
    }
  });

  if (sources.size > 0) {
    await renderDiagrams([...sources]);
  }

  $placeholders.each((_, el) => {
    const $el = $(el);
    const rendered = svgCache.get($el.text().trim());
    if (!rendered) {
      return;
    }

    const diagram = `<div class="mermaid-diagram">${rendered.svg}</div>`;

    // ```mermaid caption renders the diagram's accTitle as a visible caption,
    // following the <figure>/<figcaption> pattern of the video and codepen shortcodes.
    if ($el.attr('data-caption') !== undefined && rendered.title) {
      const $figure = $('<figure class="mermaid-figure"></figure>');
      $figure.append(diagram);
      const $caption = $('<figcaption class="mermaid-caption"></figcaption>');
      $caption.text(rendered.title);
      $figure.append($caption);
      $el.replaceWith($figure);
    } else {
      $el.replaceWith(diagram);
    }
  });

  return $.html();
}
