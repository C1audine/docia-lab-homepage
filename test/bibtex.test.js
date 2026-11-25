import test from 'node:test';
import assert from 'node:assert/strict';
import { parseBibSources, formatAuthors } from '../scripts/loaders/bibtex.js';
import { Report } from '../scripts/lib/report.js';

test('作者格式化为 Oxford 风格', () => {
  assert.equal(formatAuthors([{ name: 'A' }]), 'A');
  assert.equal(formatAuthors([{ name: 'A' }, { name: 'B' }]), 'A and B');
  assert.equal(formatAuthors([{ name: 'A' }, { name: 'B' }, { name: 'C' }]), 'A, B, and C');
  assert.equal(formatAuthors([{ name: 'A' }, { name: 'others' }]), 'A et al.');
});

test('解析 @string、# 拼接、保护大小写与 LaTeX 重音', () => {
  const report = new Report();
  const source = String.raw`
@string{venue = "DOCIA Lab Journal"}
@article{muller2024,
  title = {A {GPU}-Accelerated M{\"u}ller Method},
  author = {M{\"u}ller, Alice and Doe, Bob and Smith, Carol},
  journal = venue # " (Special Issue)",
  year = {2024},
  doi = {10.1000/example}
}`;
  const entries = parseBibSources([{ file: 'test.bib', text: source }], report);
  assert.equal(report.errors.length, 0, report.format());
  assert.equal(entries.length, 1);
  assert.equal(entries[0].key, 'muller2024');
  assert.equal(entries[0].title, 'A GPU-Accelerated Müller Method');
  assert.equal(entries[0].authors, 'Alice Müller, Bob Doe, and Carol Smith');
  assert.equal(entries[0].venue, 'DOCIA Lab Journal (Special Issue)');
  assert.equal(entries[0].year, 2024);
});

test('重复 citation key 报错而不静默丢弃', () => {
  const report = new Report();
  const source = `@misc{dup, title={One}, author={A}, year={2024}}\n@misc{dup, title={Two}, author={B}, year={2025}}`;
  const entries = parseBibSources([{ file: 'dup.bib', text: source }], report);
  assert.equal(entries.length, 1);
  assert.ok(report.errors.some(item => item.message.includes('citation key 重复')));
});

test('缺少 title/author/year 产生可读错误', () => {
  const report = new Report();
  parseBibSources([{ file: 'bad.bib', text: '@misc{bad, howpublished={Web}}' }], report);
  const messages = report.errors.map(item => item.message).join('\n');
  assert.match(messages, /title 缺失/);
  assert.match(messages, /author 缺失/);
  assert.match(messages, /year 必须是四位年份/);
});
