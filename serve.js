const http = require('http');
const fs = require('fs');
const path = require('path');
const root = __dirname;
const port = 8934;
const dataDir = path.join(root, 'data');
const rankingsFile = path.join(dataDir, 'rankings.json');
const writeToken = process.env.WRITE_TOKEN || '';

const MAX_BODY_BYTES = 5 * 1024 * 1024; // 5MB - rankings CSVs are text, this is generous headroom
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 120; // per IP per window, across all routes
const hits = new Map();

try { fs.mkdirSync(dataDir, { recursive: true }); } catch (e) {}

function securityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
}

function rateLimited(ip) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT_WINDOW_MS) {
    hits.set(ip, { start: now, count: 1 });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

http.createServer((req, res) => {
  securityHeaders(res);

  const ip = req.socket.remoteAddress || 'unknown';
  if (rateLimited(ip)) { res.writeHead(429, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: false, error: 'rate limited' })); return; }

  if (req.url === '/api/rankings' && req.method === 'GET') {
    fs.readFile(rankingsFile, 'utf8', (err, data) => {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(err ? '[]' : data);
    });
    return;
  }

  if (req.url === '/api/rankings' && req.method === 'POST') {
    if (writeToken && req.headers['x-api-token'] !== writeToken) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'unauthorized' }));
      return;
    }
    let body = '';
    let tooBig = false;
    req.on('data', chunk => {
      if (tooBig) return;
      body += chunk;
      if (body.length > MAX_BODY_BYTES) {
        tooBig = true;
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'payload too large' }));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (tooBig) return;
      let parsed;
      try {
        parsed = JSON.parse(body);
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'invalid json' }));
        return;
      }
      if (!Array.isArray(parsed)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'expected an array' }));
        return;
      }
      fs.writeFile(rankingsFile, JSON.stringify(parsed), err => {
        res.writeHead(err ? 500 : 200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: !err }));
      });
    });
    return;
  }

  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/war-room.html';
  const p = path.join(root, reqPath);
  const rel = path.relative(root, p);
  if (rel.startsWith('..') || path.isAbsolute(rel)) { res.writeHead(403); res.end(); return; }
  fs.readFile(p, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    const ext = path.extname(p);
    const type = ext === '.html' ? 'text/html; charset=utf-8' : ext === '.js' ? 'text/javascript; charset=utf-8' : 'text/plain; charset=utf-8';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache, no-store, must-revalidate' });
    res.end(data);
  });
}).listen(port, () => console.log(`War Room running at http://localhost:${port}/war-room.html`));
