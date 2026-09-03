const http = require('http');
const fs = require('fs');
const path = require('path');
const root = __dirname;
const port = 8934;
const dataDir = path.join(root, 'data');
const rankingsFile = path.join(dataDir, 'rankings.json');

try { fs.mkdirSync(dataDir, { recursive: true }); } catch (e) {}

http.createServer((req, res) => {
  if (req.url === '/api/rankings' && req.method === 'GET') {
    fs.readFile(rankingsFile, 'utf8', (err, data) => {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(err ? '[]' : data);
    });
    return;
  }

  if (req.url === '/api/rankings' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        JSON.parse(body); // validate before writing
        fs.writeFile(rankingsFile, body, err => {
          res.writeHead(err ? 500 : 200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: !err }));
        });
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'invalid json' }));
      }
    });
    return;
  }

  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/war-room.html';
  let p = path.join(root, reqPath);
  if (!p.startsWith(root)) { res.writeHead(403); res.end(); return; }
  fs.readFile(p, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    const ext = path.extname(p);
    const type = ext === '.html' ? 'text/html; charset=utf-8' : ext === '.js' ? 'text/javascript; charset=utf-8' : 'text/plain; charset=utf-8';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache, no-store, must-revalidate' });
    res.end(data);
  });
}).listen(port, () => console.log(`War Room running at http://localhost:${port}/war-room.html`));
