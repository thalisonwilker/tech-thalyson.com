import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { request } from 'node:http';
import { createSiteServer } from '../scripts/server.mjs';

const server = createSiteServer({ root: 'dist', allowedHost: 'tech.thalyson.com' });
before(async () => { await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); });
after(async () => { await new Promise(resolve => server.close(resolve)); });
function get(path, { host = 'tech.thalyson.com', method = 'GET' } = {}) {
  return new Promise((resolve, reject) => {
    const req = request({ hostname: '127.0.0.1', port: server.address().port, path, method, headers: { host } }, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.end();
  });
}
test('serves the built site on the official domain', async () => {
  const response = await get('/');
  assert.equal(response.status, 200);
  assert.match(response.body, /<title>tw.tech/);
  assert.match(response.headers['content-security-policy'], /frame-ancestors 'none'/);
});
test('rejects default Fly hostname and arbitrary hosts', async () => {
  for (const host of ['tech-thalyson-com.fly.dev', 'example.com']) {
    assert.equal((await get('/', { host })).status, 404);
    assert.equal((await get('/assets/favicon.svg', { host })).status, 404);
  }
});
test('health checks work without the public host', async () => {
  const response = await get('/healthz', { host: 'internal' });
  assert.equal(response.status, 200);
  assert.equal(response.body, 'ok');
});
test('serves assets and HEAD with correct metadata', async () => {
  assert.equal((await get('/assets/favicon.svg')).headers['content-type'], 'image/svg+xml');
  assert.equal((await get('/styles.css')).status, 200);
  const response = await get('/', { method: 'HEAD' });
  assert.equal(response.status, 200);
  assert.equal(response.body, '');
  assert.ok(Number(response.headers['content-length']) > 0);
});
test('does not expose source files, missing pages, or traversal paths', async () => {
  for (const path of ['/package.json', '/.git/config', '/scripts/server.mjs', '/missing', '/assets/%2e%2e/index.html', '/assets/%2e%2e/%2e%2e/index.html']) {
    assert.equal((await get(path)).status, 404, path);
  }
});
test('rejects unsupported methods and malformed URLs', async () => {
  assert.equal((await get('/', { method: 'POST' })).status, 405);
  assert.equal((await get('/%E0%A4%A')).status, 400);
});
test('serves canonical sitemap and robots', async () => {
  assert.match((await get('/sitemap.xml')).body, /https:\/\/tech.thalyson.com\//);
  assert.match((await get('/robots.txt')).body, /Sitemap:/);
});
