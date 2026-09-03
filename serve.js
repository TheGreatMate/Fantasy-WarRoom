const http = require('http');
const fs = require('fs');
const path = require('path');
const root = __dirname;
const port = 8934;

http.createServer((req, res) => {
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
