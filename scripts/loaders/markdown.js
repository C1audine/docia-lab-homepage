import { marked } from 'marked';
import { loadYaml } from './yaml.js';

const SAFE_LINK = /^(https?:\/\/|mailto:|#|\/|\.\.?\/)/i;

export function parseMarkdownFile(text, file, report) {
  const source = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  if (!/^---\s*\n/.test(source)) {
    report.error('缺少 YAML front matter（文件必须以 --- 开头）', { file });
    return null;
  }
  const end = source.indexOf('\n---', 3);
  if (end < 0) {
    report.error('front matter 没有结束分隔线 ---', { file });
    return null;
  }
  const front = source.slice(4, end);
  const body = source.slice(end + 4).replace(/^\s*\n/, '');
  const data = loadYaml(front, file, report);
  if (data === null) return null;
  const sections = splitBilingualSections(body, file, report);
  if (!sections) return null;
  return { data, body, sections };
}

export function splitBilingualSections(body, file, report) {
  const lines = body.split('\n');
  const result = { en: '', zh: '' };
  const seen = new Set();
  let current = null;
  let buffer = [];
  let fenced = false;
  let outside = [];

  const flush = () => {
    if (!current) return;
    result[current] = buffer.join('\n').trim();
  };

  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    const match = !fenced && line.match(/^\s*##\s+(English|中文)\s*$/i);
    if (match) {
      flush();
      const key = match[1].toLowerCase() === 'english' ? 'en' : 'zh';
      if (seen.has(key)) {
        report.error(`正文中重复出现 “## ${match[1]}” 分段`, { file });
      }
      seen.add(key);
      current = key;
      buffer = [];
      continue;
    }
    if (current) buffer.push(line);
    else outside.push(line);
  }
  flush();

  if (outside.join('\n').trim()) {
    report.error('正文必须放在 “## English” / “## 中文” 分段内，分段之外发现文字', { file });
    return null;
  }
  if (!seen.has('en') || !result.en.trim()) {
    report.error('缺少 “## English” 分段或该分段为空（英文正文必填）', { file });
    return null;
  }
  if (!seen.has('zh') || !result.zh.trim()) {
    report.warn('缺少中文正文，中文页面将回退显示英文', { file, fix: '在正文末尾添加 “## 中文” 分段并补上中文翻译' });
    result.zh = result.en;
  }
  return result;
}

export function markdownToPlainText(markdown, file, report) {
  const tokens = marked.lexer(markdown, { gfm: true });
  return blockTokens(tokens, file, report).replace(/\s+\n/g, '\n').trim();
}

function blockTokens(tokens, file, report) {
  return tokens.map(token => {
    switch (token.type) {
      case 'space':
        return ' ';
      case 'paragraph':
      case 'heading':
      case 'text':
        return inlineTokens(token.tokens || [], file, report);
      case 'blockquote':
        return blockTokens(token.tokens || [], file, report);
      case 'list':
        return token.items.map(item => blockTokens(item.tokens || [], file, report)).join(' ');
      case 'code':
        return token.text;
      case 'table':
        return [token.header, ...(token.rows || [])]
          .map(row => row.map(cell => inlineTokens(cell.tokens || [], file, report)).join(' · '))
          .join(' ');
      case 'html':
        report.warn('正文中的原始 HTML 已被忽略；请使用 Markdown 语法', { file });
        return '';
      case 'hr':
        return '';
      default:
        return inlineTokens(token.tokens || [], file, report);
    }
  }).join('\n');
}

function inlineTokens(tokens, file, report) {
  return tokens.map(token => {
    switch (token.type) {
      case 'text':
      case 'escape':
      case 'codespan':
        return token.text;
      case 'strong':
      case 'em':
      case 'del':
        return inlineTokens(token.tokens || [], file, report);
      case 'link': {
        if (!SAFE_LINK.test(token.href || '')) {
          report.warn(`忽略不安全的链接地址：${token.href}`, { file });
          return inlineTokens(token.tokens || [], file, report);
        }
        return inlineTokens(token.tokens || [], file, report);
      }
      case 'image':
        report.warn('正文中的内嵌图片不会被渲染；请把图片放到 assets/ 并在 front matter 中引用', { file });
        return token.text || '';
      case 'br':
        return '\n';
      case 'html':
        report.warn('正文中的原始 HTML 已被忽略；请使用 Markdown 语法', { file });
        return '';
      default:
        return token.text || inlineTokens(token.tokens || [], file, report);
    }
  }).join('').replace(/[ \t]+\n/g, '\n');
}
