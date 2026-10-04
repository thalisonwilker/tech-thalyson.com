import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};
const pages = new Set(['/index.html', '/styles.css', '/robots.txt', '/sitemap.xml']);

export function createSiteServer({ root = 'dist', allowedHost } = {}) {
  const directory = resolve(root);
  return createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'self' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'");
    const respond = (code, message) => {
      res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(req.method === 'HEAD' ? undefined : message);
    };
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.setHeader('Allow', 'GET, HEAD');
      return respond(405, 'Método não permitido');
    }
    let pathname;
    try { pathname = decodeURIComponent(req.url.split('?')[0]); }
    catch { return respond(400, 'Requisição inválida'); }

    // Fly health checks do not carry the public domain. Only this endpoint is exempt.
    if (pathname === '/healthz') return respond(200, 'ok');
    const hostname = (req.headers.host || '').toLowerCase().split(':')[0];
    if (allowedHost && hostname !== allowedHost) return respond(404, 'Não encontrado');
    if (allowedHost) res.setHeader('Strict-Transport-Security', 'max-age=31536000');

    if (pathname === '/') pathname = '/index.html';
    const file = resolve(directory, '.' + pathname);
    if ((!pages.has(pathname) && !pathname.startsWith('/assets/') && !pathname.startsWith('/data/')) ||
        !file.startsWith(directory + sep) || !types[extname(file)] || pathname.includes('..')) {
      return respond(404, 'Não encontrado');
    }
    try {
      const content = await readFile(file);
      res.writeHead(200, {
        'Content-Type': types[extname(file)],
        'Content-Length': content.length,
        'Cache-Control': pathname.startsWith('/assets/') ? 'public, max-age=86400' : 'no-cache',
      });
      res.end(req.method === 'HEAD' ? undefined : content);
    } catch (error) {
      respond(['ENOENT', 'EISDIR', 'ENOTDIR'].includes(error.code) ? 404 : 500, 'Não encontrado');
    }
  });
}
