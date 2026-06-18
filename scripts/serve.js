import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'site');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const PORT = 5050;

createServer(async (req, res) => {
  try {
    const path = req.url === '/' ? '/index.html' : decodeURIComponent(req.url.split('?')[0]);
    const target = resolve(SITE, '.' + path);
    // site 디렉터리 밖으로 나가는 경로(../ 등) 차단
    if (target !== SITE && !target.startsWith(SITE + sep)) {
      res.writeHead(403); res.end('Forbidden'); return;
    }
    const file = await readFile(target);
    res.writeHead(200, { 'Content-Type': TYPES[extname(target)] ?? 'application/octet-stream' });
    res.end(file);
  } catch {
    res.writeHead(404); res.end('Not found');
  }
}).listen(PORT, () => console.log(`http://localhost:${PORT} 에서 서빙 중 (Ctrl+C 종료)`));
