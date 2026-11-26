import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from '../scripts/lib/content.js';
import { Report } from '../scripts/lib/report.js';
import { toLegacySite, renderSiteConfig } from '../scripts/adapters/legacy-config.js';

const report = new Report();
const model = await loadContent({ report });

test('真实内容通过校验', () => {
  assert.equal(report.errors.length, 0, report.format());
});

test('公开记录数量与内容目录一致', () => {
  assert.equal(model.public.people.length, 12);
  assert.equal(model.public.publications.length, 34);
  assert.equal(model.public.research.length, 3);
  assert.equal(model.public.news.length, 8);
  assert.equal(model.public.honors.length, 2);
  assert.equal(model.public.gallery.length, 0);
});

test('草稿招生页被标记且不进入公开数据', () => {
  assert.equal(model.recruitment.draft, true);
  assert.equal(model.public.recruitment, null);
});

test('论文按年份降序并保留精选与关联', () => {
  const years = model.public.publications.map(item => item.year);
  assert.deepEqual(years, [...years].sort((a, b) => b - a));
  const legacyKeys = model.public.publications.map(item => item.key).filter(key => ['stochastic', 'constraints', 'proximal'].includes(key));
  assert.deepEqual(legacyKeys, ['stochastic', 'constraints', 'proximal']);
  assert.deepEqual(model.public.publications.filter(item => item.selected).map(item => item.key), ['stochastic', 'constraints']);
  assert.deepEqual(model.indexes.publicationsByResearch.get('optimization-algorithms'), ['stochastic']);
  assert.deepEqual(model.indexes.publicationsByMember.get('jie-lu'), ['stochastic', 'constraints', 'proximal']);
});

test('成员中英文姓名按来源填写', () => {
  const jie = model.public.people.find(person => person.id === 'jie-lu');
  assert.equal(jie.name.en, 'Jie Lu');
  assert.equal(jie.name.zh, '陆疌');
  const xuyang = model.public.people.find(person => person.id === 'xuyang-wu');
  assert.equal(xuyang.name.zh, '吴旭阳');
  assert.equal(xuyang.status, 'alumni');
});

test('旧前端兼容数据保留全部页面字段', () => {
  const legacy = toLegacySite(model);
  assert.equal(legacy.brand, 'DOCIA Lab');
  assert.equal(legacy.name.zh, '决策、优化与控制实验室');
  assert.equal(legacy.navigation.length, 9);
  assert.equal(legacy.research.length, 3);
  assert.equal(legacy.research[0].short, legacy.research[0].short);
  assert.equal(legacy.people[0].name.en, 'Jie Lu');
  assert.equal(legacy.people[0].group, 'pi');
  assert.equal(legacy.alumni[0].name.zh, '吴旭阳');
  assert.equal(legacy.alumni[0].year, 2020);
  assert.equal(legacy.contact.street.zh, '华夏中路 393 号');
  assert.equal(legacy.contact.city.zh, '中国 上海 201210');
  assert.equal(legacy.contact.city.en, 'Shanghai 201210, China');
  assert.equal(legacy.home.selected_publications.enabled, true);
  assert.equal(legacy.home.selected_publications.count, 2);
  assert.equal(legacy.experiment.topology, 'Mesh');
});

test('生成配置带只读警示且可重复', () => {
  const a = renderSiteConfig(model);
  const b = renderSiteConfig(model);
  assert.equal(a, b);
  assert.match(a, /AUTO-GENERATED/);
  assert.match(a, /DO NOT EDIT/);
  assert.match(a, /export const site = \{/);
});
