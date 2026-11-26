import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { initSync, parse } from '@retorquere/bibtex-parser';

// Node 环境下 wasm 不能用 fetch 加载，必须显式初始化。
const wasmPath = fileURLToPath(import.meta.resolve('@retorquere/bibtex-parser/bibtex_parser_bg.wasm'));
const wasm = await readFile(wasmPath);
initSync({ module: wasm });

const LITERAL_FIELDS = [
  'title', 'journal', 'booktitle', 'publisher', 'institution', 'school',
  'series', 'address', 'howpublished', 'note'
];

const ALLOWED_TYPES = new Set(['article', 'inproceedings', 'misc', 'techreport']);

function text(value) {
  if (value == null) return '';
  if (Array.isArray(value)) return value.map(text).join(' ');
  if (typeof value === 'object') return String(value.name || value.value || '');
  return String(value).trim().normalize('NFC');
}

function lineOfKey(source, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = source.match(new RegExp(`@[a-zA-Z]+\\s*[{(]\\s*${escaped}\\s*,`));
  return match ? source.slice(0, match.index).split('\n').length : 0;
}

export function formatAuthorName(name) {
  if (typeof name === 'string') return name.trim();
  if (!name || typeof name !== 'object') return '';
  if (name.name) return String(name.name).trim();
  const first = name.firstName ? `${name.firstName} ` : '';
  const prefix = name.prefix ? `${name.prefix} ` : '';
  const last = name.lastName || name.name || '';
  const suffix = name.suffix ? `, ${name.suffix}` : '';
  return `${first}${prefix}${last}${suffix}`.trim().normalize('NFC');
}

export function formatAuthors(names) {
  const list = (names || []).map(formatAuthorName).filter(Boolean);
  const hasOthers = list.some(name => /^others$/i.test(name));
  const people = list.filter(name => !/^others$/i.test(name));
  if (!people.length) return '';
  let joined;
  if (people.length === 1) joined = people[0];
  else if (people.length === 2) joined = `${people[0]} and ${people[1]}`;
  else joined = `${people.slice(0, -1).join(', ')}, and ${people[people.length - 1]}`;
  return hasOthers ? `${joined} et al.` : joined;
}

export function parseBibSources(sources, report) {
  const entries = [];
  const byKey = new Map();
  const byDoi = new Map();

  for (const source of sources) {
    const { file, text: sourceText } = source;
    let parsed;
    try {
      parsed = parse(sourceText, {
        unsupported: 'throw',
        fieldMode: Object.fromEntries(LITERAL_FIELDS.map(field => [field, 'literal'])),
        duplicateFields: 'last'
      });
    } catch (error) {
      report.error(`BibTeX 解析失败：${error.message}`, {
        file,
        fix: '检查括号、逗号、引号是否配对；复杂写法可先单独测试'
      });
      continue;
    }
    for (const parserError of parsed.errors || []) {
      const message = parserError.message || parserError.error || String(parserError);
      report.error(`BibTeX 语法错误：${message}`, { file });
    }
    for (const entry of parsed.entries || []) {
      const key = text(entry.key);
      const line = lineOfKey(sourceText, key);
      if (!key) {
        report.error('BibTeX 条目缺少 citation key', { file, line });
        continue;
      }
      if (byKey.has(key)) {
        report.error(`citation key 重复：“${key}” 已在 ${byKey.get(key).file} 中使用`, {
          file,
          line,
          record: key,
          fix: 'citation key 必须全局唯一；保留原 key 或修改重复项'
        });
        continue;
      }
      const normalized = normalizeEntry(entry, key, file, line, report);
      if (!normalized) continue;
      byKey.set(key, normalized);
      entries.push(normalized);
      if (normalized.doi) {
        const doi = normalized.doi.toLowerCase();
        if (!byDoi.has(doi)) byDoi.set(doi, []);
        byDoi.get(doi).push(normalized);
      }
    }
  }

  for (const [doi, list] of byDoi) {
    if (list.length < 2) continue;
    for (const entry of list.slice(1)) {
      report.warn(`同一 DOI 对应多个 citation key：${list.map(item => item.key).join(' / ')}`, {
        file: entry.file,
        record: entry.key,
        field: 'doi',
        fix: '确认是否为重复条目；如不是可保留，但请人工核对'
      });
    }
  }

  return entries;
}

function normalizeEntry(entry, key, file, line, report) {
  const type = text(entry.type).toLowerCase();
  const fields = entry.fields || {};
  const where = { file, line, record: key };

  if (!ALLOWED_TYPES.has(type)) {
    report.warn(`暂未专门支持的 BibTeX 类型 @${type}，将按通用规则处理`, {
      ...where,
      fix: 'P0 支持 @article/@inproceedings/@misc/@techreport；其他类型建议确认字段是否完整'
    });
  }

  const title = text(fields.title);
  if (!title) {
    report.error('必填字段 title 缺失', { ...where, field: 'title', fix: '在 BibTeX 条目中添加 title = {...}' });
  }

  const authorField = fields.author;
  const authorNames = Array.isArray(authorField) ? authorField : (authorField ? [authorField] : []);
  if (!authorNames.length || !authorNames.some(name => formatAuthorName(name))) {
    report.error('必填字段 author 缺失', { ...where, field: 'author', fix: '在 BibTeX 条目中添加 author = {姓, 名 and ...}' });
  }
  const authors = formatAuthors(authorNames);

  const year = text(fields.year);
  if (!/^\d{4}$/.test(year)) {
    report.error(`必填字段 year 必须是四位年份，当前为“${year || '空'}”`, {
      ...where,
      field: 'year',
      fix: '写成 year = {2024}'
    });
  }

  let venue = '';
  if (type === 'article') {
    venue = text(fields.journal);
    if (!venue) report.error('@article 必填字段 journal 缺失', { ...where, field: 'journal', fix: '添加 journal = {期刊名}' });
  } else if (type === 'inproceedings') {
    venue = text(fields.booktitle);
    if (!venue) report.error('@inproceedings 必填字段 booktitle 缺失', { ...where, field: 'booktitle', fix: '添加 booktitle = {会议名}' });
  } else if (type === 'techreport') {
    venue = text(fields.institution);
    if (!venue) report.error('@techreport 必填字段 institution 缺失', { ...where, field: 'institution', fix: '添加 institution = {机构名}' });
  } else {
    venue = text(fields.howpublished) || text(fields.publisher) || text(fields.journal) || text(fields.booktitle) || '';
  }

  return {
    key,
    type,
    title,
    authors,
    authorNames,
    year: /^\d{4}$/.test(year) ? Number(year) : null,
    venue,
    doi: text(fields.doi),
    url: text(fields.url),
    eprint: text(fields.eprint),
    volume: text(fields.volume),
    number: text(fields.number),
    pages: text(fields.pages),
    publisher: text(fields.publisher),
    note: text(fields.note),
    file,
    line,
    fields
  };
}
