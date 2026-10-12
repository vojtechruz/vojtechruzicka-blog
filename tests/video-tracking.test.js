/**
 * @vitest-environment jsdom
 *
 * `Video Playback` (src/scripts/analytics.js) counts plays a reader started. Clips that stand in for
 * GIFs start on their own when scrolled into view; video-autoplay.js marks those plays
 * `data-autoplaying`, and they must not be reported.
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { SITE_DIR } from './helpers.js';

const bundle = readFileSync(`${SITE_DIR}/scripts/analytics.js`, 'utf-8');

/** Events handed to Plausible, as [name, props] pairs. */
const queued = () => window.plausible.q.map(([name, options]) => [name, options.props]);

describe('video playback tracking', () => {
  let video;

  beforeAll(() => {
    window.plausible = (...args) => window.plausible.q.push(args);
    window.plausible.q = [];
    window.cspViolations = [];
    // The play listener lives on document (capture), so one run of the bundle serves every test
    new Function(bundle)();
  });

  beforeEach(() => {
    window.plausible.q = [];
    window.history.replaceState(null, '', '/idea-analyzing-dependencies/');
    document.body.innerHTML = `
      <video class="video-embed" title="Finding a dependency" data-video-title="Finding a dependency" data-autoplay>
        <source src="/videos/idea/find.webm" type="video/webm">
        <source src="/videos/idea/find.mp4" type="video/mp4">
      </video>`;
    video = document.querySelector('video');
  });

  it('reports a play the reader started', () => {
    video.dispatchEvent(new Event('play'));

    expect(queued()).toEqual([
      [
        'Video Playback',
        {
          type: 'Play',
          title: 'Finding a dependency',
          src: '/videos/idea/find.webm',
          url: '/idea-analyzing-dependencies/',
        },
      ],
    ]);
  });

  it('skips a play the autoplay script started', () => {
    video.dataset.autoplaying = '';
    video.dispatchEvent(new Event('play'));

    expect(queued()).toEqual([]);
  });
});
