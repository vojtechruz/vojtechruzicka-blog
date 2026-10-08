import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { SITE_DIR } from './helpers.js';

const SITE_ROOT = path.resolve(SITE_DIR);

const CONTENT_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};

/**
 * Serve the build output on a random local port for Playwright tests.
 * @returns {Promise<{ baseUrl: string, close: () => Promise<void> }>}
 */
export async function serveSite() {
  const server = http.createServer(async (req, res) => {
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    if (urlPath.endsWith('/')) {
      urlPath += 'index.html';
    }
    try {
      // Only serve files inside the build output (no ../ traversal)
      const filePath = path.resolve(SITE_ROOT, `.${urlPath}`);
      if (!filePath.startsWith(SITE_ROOT + path.sep)) {
        throw new Error('Outside of the site root');
      }
      const body = await readFile(filePath);
      res.writeHead(200, { 'content-type': CONTENT_TYPES[path.extname(urlPath)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  return {
    baseUrl: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}
