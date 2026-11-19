// Tiny static file server for the Leonida Legend II guide.
// Serves this directory's app/ folder on 127.0.0.1:8080 by default.
// Usage: node serve.ts [--port 8080]
// Node 22, standard library only — no dependencies.

import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const appDir = resolve(join(here, 'app'));

const args = process.argv.slice(2);
let port = 8080;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' && args[i + 1]) port = Number(args[i + 1]);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = createServer((req, res) => {
  const rawPath = decodeURIComponent(new URL(req.url || '/', 'http://127.0.0.1').pathname);
  const cleaned = normalize(rawPath).replace(/^(\.\.[/\\])+/, '');
  const target = join(appDir, cleaned === '/' ? 'index.html' : cleaned);
  // Guard against path traversal: the resolved target must stay inside app/.
  if (!target.startsWith(appDir)) {
    res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }
  if (!existsSync(target) || !statSync(target).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }
  const body = readFileSync(target);
  res.writeHead(200, { 'content-type': MIME[extname(target)] || 'application/octet-stream' });
  res.end(body);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Leonida Legend II guide at http://127.0.0.1:${port}/`);
});
