import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMarkdownFile, splitBilingualSections, markdownToPlainText } from '../scripts/loaders/markdown.js';
import { Report } from '../scripts/lib/report.js';

test('拆分中英文正文', () => {
  const report = new Report();
  const sections = splitBilingualSections('## English\n\nHello.\n\n## 中文\n\n你好。\n', 'x.md', report);
  assert.equal(report.errors.length, 0);
  assert.equal(sections.en, 'Hello.');
  assert.equal(sections.zh, '你好。');
});

test('中文缺失时回退英文并给警告', () => {
  const report = new Report();
  const sections = splitBilingualSections('## English\n\nHello.\n', 'x.md', report);
  assert.equal(sections.zh, 'Hello.');
  assert.ok(report.warnings.some(item => item.message.includes('缺少中文正文')));
});

test('代码块里的 ## 标题不算分段', () => {
  const report = new Report();
  const sections = splitBilingualSections('## English\n\n```md\n## 中文\n```\n\n## 中文\n\n你好。\n', 'x.md', report);
  assert.equal(report.errors.length, 0);
  assert.equal(sections.zh, '你好。');
});

test('front matter 与 Markdown 摘要', () => {
  const report = new Report();
  const parsed = parseMarkdownFile('---\ntitle:\n  en: Hello\n---\n## English\n\nA **bold** [link](https://example.com).\n\n## 中文\n\n你好。\n', 'x.md', report);
  assert.equal(report.errors.length, 0);
  assert.equal(parsed.data.title.en, 'Hello');
  assert.equal(markdownToPlainText(parsed.sections.en, 'x.md', report), 'A bold link.');
});
