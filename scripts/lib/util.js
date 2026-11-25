import { existsSync } from 'node:fs';
import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../..', import.meta.url));
export const PATHS = {
  root: ROOT,
  content: join(ROOT, 'content'),
  config: join(ROOT, 'config'),
  src: join(ROOT, 'src'),
  assets: join(ROOT, 'assets'),
  schemas: join(ROOT, 'schemas'),
  dist: join(ROOT, 'dist'),
  build: join(ROOT, '.build-tmp')
};

export const toPosix = path => path.split(sep).join('/');

export async function readText(file) {
  return readFile(file, 'utf8');
}

export async function fileExists(file) {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}

export function exists(file) {
  return existsSync(file);
}

export async function walkFiles(dir, predicate = () => true) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return out;
    throw error;
  }
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      out.push(...await walkFiles(full, predicate));
    } else if (entry.isFile() && predicate(full, entry.name)) {
      out.push(full);
    }
  }
  return out;
}

export async function walkDirectories(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return out;
    throw error;
  }
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith('.')) out.push(join(dir, entry.name));
  }
  return out;
}

export function relativeToRoot(file) {
  return isAbsolute(file) ? toPosix(relative(ROOT, file)) : toPosix(file);
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function escapeXml(value) {
  return escapeHtml(value);
}

export function isCalendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
}

export function compareIds(a, b) {
  return String(a).localeCompare(String(b), 'en');
}

// 显式 order 小的在前；没有 order 的排在显式排序之后；再按稳定 ID。
export function compareOrderThenId(a, b) {
  const aOrder = Number.isInteger(a.order) ? a.order : null;
  const bOrder = Number.isInteger(b.order) ? b.order : null;
  if (aOrder !== null && bOrder !== null) {
    if (aOrder !== bOrder) return aOrder - bOrder;
  } else if (aOrder !== null) {
    return -1;
  } else if (bOrder !== null) {
    return 1;
  }
  return compareIds(a.id, b.id);
}

export function levenshtein(a, b) {
  const left = String(a);
  const right = String(b);
  const rows = Array.from({ length: left.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= right.length; j += 1) rows[0][j] = j;
  for (let i = 1; i <= left.length; i += 1) {
    for (let j = 1; j <= right.length; j += 1) {
      rows[i][j] = Math.min(
        rows[i - 1][j] + 1,
        rows[i][j - 1] + 1,
        rows[i - 1][j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1)
      );
    }
  }
  return rows[left.length][right.length];
}

export function suggestField(unknown, allowed) {
  let best = '';
  let bestDistance = Infinity;
  for (const candidate of allowed) {
    const distance = levenshtein(unknown, candidate);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }
  return bestDistance <= 2 ? best : '';
}

export function safeResolve(base, relativePath) {
  if (!relativePath || typeof relativePath !== 'string') return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(relativePath)) return null;
  if (relativePath.startsWith('/') || relativePath.startsWith('\\')) return null;
  const resolved = resolve(base, relativePath);
  const baseWithSep = base.endsWith(sep) ? base : base + sep;
  if (resolved !== base && !resolved.startsWith(baseWithSep)) return null;
  return resolved;
}

export function stableStringify(value, indent = 2) {
  return JSON.stringify(sortDeep(value), null, indent);
}

function sortDeep(value) {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, sortDeep(value[key])]));
  }
  return value;
}

export function dirOf(file) {
  return dirname(file);
}

// 供构建脚本使用：删除目录内容但不删除目录本身（用于临时构建目录）。
export async function emptyDirectory(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    const full = join(dir, entry.name);
    await (await import('node:fs/promises')).rm(full, { recursive: true, force: true });
  }
}
