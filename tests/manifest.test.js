import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { SITE_DIR } from './helpers.js';

// Guards the web app manifest: it must stay valid JSON, keep the fields browsers
// need for installability, and reference icons that actually ship. `npm run
// validate` covers HTML/CSS/JS/MD/XML/links but not this JSON, so nothing else
// would catch a broken manifest.
describe('Web app manifest (site.webmanifest)', () => {
  const manifestPath = `${SITE_DIR}/site.webmanifest`;

  it('exists in the build output', () => {
    expect(existsSync(manifestPath), 'site.webmanifest missing. Run "npm run build" first.').toBe(true);
  });

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

  it('declares the fields required for installability', () => {
    for (const field of ['name', 'short_name', 'start_url', 'icons', 'display', 'theme_color', 'background_color']) {
      expect(manifest[field], `manifest is missing "${field}"`).toBeTruthy();
    }
    expect(manifest.start_url).toBe('/');
  });

  it('provides both "any" and "maskable" icons at 192 and 512', () => {
    const byPurpose = (purpose) =>
      manifest.icons.filter((i) => i.purpose.split(/\s+/).includes(purpose)).map((i) => i.sizes);

    for (const purpose of ['any', 'maskable']) {
      const sizes = byPurpose(purpose);
      expect(sizes, `no "${purpose}" icon declared`).toContain('192x192');
      expect(sizes, `no "${purpose}" icon declared`).toContain('512x512');
    }
  });

  it('references icons that exist on disk', () => {
    for (const icon of manifest.icons) {
      expect(icon.src.startsWith('/'), `icon src should be root-relative: ${icon.src}`).toBe(true);
      const file = `${SITE_DIR}${icon.src}`;
      expect(existsSync(file), `icon file missing in build output: ${icon.src}`).toBe(true);
    }
  });
});
