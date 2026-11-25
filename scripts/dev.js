import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat, readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { watch } from 'node:fs';
import { loadContent } from './lib/content.js';
import { buildSite } from './lib/builder.js';
import { Report } from './lib/report.js';
import { PATHS, fileExists } from './lib/util.js';

const port = Number(process.env.PORT || process.argv[2] || 8000);
const host = process.env.HOST || '127.0.0.1';
const distDir = resolve(PATHS.dist);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

let building = false;
let pending = false;

async function rebuild(reason = '') {
  if (building) {
    pending = true;
    return;
  }
  building = true;
  try {
    if (reason) console.log(`↻ 检测到变化，重新构建（${reason}）`);
    const report = new Report();
    const model = await loadContent({ report });
    for (const warning of report.warnings) console.warn(`⚠ ${warning.message}`);
    if (report.hasErrors) {
      console.error(report.format());
      console.error('构建失败；继续提供上一次成功的 dist/。');
      return;
    }
    const result = await buildSite(model);
    console.log(`✓ 已重新构建（${result.files} 个文件）`);
  } catch (error) {
    console.error(`构建失败：${error.message}`);
    console.error('继续提供上一次成功的 dist/。');
  } finally {
    building = false;
    if (pending) {
      pending = false;
      await rebuild('合并后的改动');
    }
  }
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || host}`);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';
    const target = normalize(join(distDir, pathname));
    if (target !== distDir && !target.startsWith(distDir + sep)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    let file = target;
    if (!(await fileExists(file))) {
      if (!extname(pathname)) file = join(distDir, 'index.html');
      else {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Not found');
        return;
      }
    }
    const info = await stat(file);
    if (info.isDirectory()) file = join(file, 'index.html');
    res.writeHead(200, {
      'content-type': MIME[extname(file).toLowerCase()] || 'application/octet-stream',
      'content-length': (await stat(file)).size,
      'cache-control': 'no-store'
    });
    createReadStream(file).pipe(res);
  } catch (error) {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' }).end(String(error.message));
  }
});

await rebuild();

server.listen(port, host, () => {
  console.log(`DOCIA 本地预览：http://${host}:${port}`);
  console.log('监听 content/、config/、src/、assets/，修改后自动重建。按 Ctrl+C 停止。');
});

const watchers = [];
for (const dir of [PATHS.content, PATHS.config, PATHS.src, PATHS.assets]) {
  try {
    const watcher = watch(dir, { recursive: true }, (_event, filename) => {
      if (!filename) return;
      const name = String(filename);
      if (name.includes('.build-tmp') || name.startsWith('dist')) return;
      rebuild(name);
    });
    watchers.push(watcher);
  } catch (error) {
    console.warn(`无法监听 ${dir}：${error.message}`);
  }
}

function shutdown() {
  for (const watcher of watchers) watcher.close();
  server.close(() => process.exit(0));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
