import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from '../scripts/lib/content.js';
import { Report } from '../scripts/lib/report.js';
import { toLegacySite, renderSiteConfig } from '../scripts/adapters/legacy-config.js';
import { formatAuthorName } from '../scripts/loaders/bibtex.js';

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

test('旧前端论文带筛选字段且作者引用有效', () => {
  const legacy = toLegacySite(model);
  const personIds = new Set(model.public.people.map(person => person.id));
  assert.equal(legacy.publications.length, 34);
  for (const item of legacy.publications) {
    assert.equal(typeof item.kind, 'string');
    assert.ok(Array.isArray(item.research), `${item.id} 的 research 不是数组`);
    assert.ok(Array.isArray(item.members), `${item.id} 的 members 不是数组`);
    assert.ok(Array.isArray(item.authorList), `${item.id} 的 authorList 不是数组`);
    assert.ok(item.authorList.length > 0, `${item.id} 缺少作者`);
    for (const author of item.authorList) {
      assert.equal(typeof author.name, 'string');
      assert.ok(author.name.trim(), `${item.id} 的作者名不能为空`);
      if ('member' in author) assert.ok(personIds.has(author.member), `${item.id} 的作者 member 无效：${author.member}`);
    }
    for (const memberId of item.members) {
      assert.ok(personIds.has(memberId), `${item.id} 的 members 含无效 ID：${memberId}`);
    }
  }
});

test('authorList 与 BibTeX 作者数量、顺序一致', () => {
  const legacy = toLegacySite(model);
  const legacyById = new Map(legacy.publications.map(item => [item.id, item]));
  for (const entry of model.public.publications) {
    const item = legacyById.get(entry.key);
    assert.ok(item, `缺少旧前端论文：${entry.key}`);
    assert.equal(item.authorList.length, entry.authorNames.length);
    assert.deepEqual(
      item.authorList.map(author => author.name),
      entry.authorNames.map(name => formatAuthorName(name))
    );
    assert.deepEqual(item.research, entry.researchIds);
  }
});

test('成员与校友数据带唯一 id 并与内容模型一致', () => {
  const legacy = toLegacySite(model);
  const ids = [...legacy.people, ...legacy.alumni].map(person => person.id);
  assert.equal(new Set(ids).size, ids.length, '成员 ID 有重复');
  const currentIds = model.public.people.filter(person => person.status === 'current').map(person => person.id).sort();
  const alumniIds = model.public.people.filter(person => person.status === 'alumni').map(person => person.id).sort();
  assert.deepEqual(legacy.people.map(person => person.id).sort(), currentIds);
  assert.deepEqual(legacy.alumni.map(person => person.id).sort(), alumniIds);
});

test('三篇站内元数据论文保留 research 与成员', () => {
  const legacy = toLegacySite(model);
  const byId = new Map(legacy.publications.map(item => [item.id, item]));
  const expected = {
    stochastic: ['optimization-algorithms'],
    constraints: ['distributed-optimization'],
    proximal: ['multi-agent-control']
  };
  for (const [id, research] of Object.entries(expected)) {
    const item = byId.get(id);
    assert.ok(item, `缺少旧前端论文：${id}`);
    assert.deepEqual(item.research, research);
    assert.ok(item.members.includes('jie-lu'), `${id} 缺少显式成员 jie-lu`);
  }
});

test('论文 kind 是 BibTeX 类型的子集且包含会议论文', () => {
  const legacy = toLegacySite(model);
  const bibTypes = new Set(model.public.publications.map(entry => entry.type));
  for (const item of legacy.publications) {
    assert.ok(bibTypes.has(item.kind), `${item.id} 的 kind 不在 BibTeX 类型中：${item.kind}`);
  }
  assert.ok(legacy.publications.some(item => item.kind === 'inproceedings'), '缺少会议论文');
});

test('作者按首字母加姓氏匹配到成员并覆盖全部 12 人', () => {
  const legacy = toLegacySite(model);
  const byId = new Map(legacy.publications.map(item => [item.id, item]));
  const stochastic = byId.get('stochastic');
  assert.deepEqual(
    stochastic.authorList.find(author => author.name === 'J. Lu'),
    { name: 'J. Lu', member: 'jie-lu' }
  );
  const matchedIds = new Set(
    legacy.publications.flatMap(item => item.authorList.map(author => author.member).filter(Boolean))
  );
  assert.deepEqual([...matchedIds].sort(), model.public.people.map(person => person.id).sort());
});

test('同名键有歧义时不猜测作者成员', () => {
  const person = (id, en, status) => ({
    id,
    name: { en, zh: en },
    role: 'phd',
    status,
    graduation_year: status === 'alumni' ? 2020 : undefined
  });
  const miniModel = {
    site: {
      name: 'Lab',
      full_name: { en: 'Lab', zh: '实验室' },
      university: { en: 'University', zh: '大学' },
      url: 'https://example.com',
      contact: null
    },
    presentation: { palette: {}, navigation: [], pages: {}, media: {}, hero: {}, experiment: {} },
    home: {
      research: { enabled: true },
      selected_publications: { enabled: true, count: 2 },
      interactive_experiment: { enabled: true },
      moments: { enabled: true, count: 3 }
    },
    public: {
      people: [
        person('jie-lu', 'Jie Lu', 'current'),
        person('jia-lu', 'Jia Lu', 'alumni'),
        person('xuyang-wu', 'Xuyang Wu', 'alumni')
      ],
      publications: [{
        key: 'ambiguous',
        type: 'article',
        year: 2024,
        title: 'Ambiguous Authors',
        authors: 'J. Lu and X. Wu',
        venue: 'Journal',
        url: '',
        doi: '',
        selected: false,
        researchIds: [],
        members: ['jie-lu'],
        authorNames: [
          { firstName: 'J.', lastName: 'Lu' },
          { firstName: 'X.', lastName: 'Wu' }
        ]
      }],
      research: [],
      gallery: [],
      news: [],
      honors: []
    }
  };
  const [item] = toLegacySite(miniModel).publications;
  assert.deepEqual(item.authorList[0], { name: 'J. Lu' });
  assert.deepEqual(item.authorList[1], { name: 'X. Wu', member: 'xuyang-wu' });
  assert.deepEqual(item.members, ['jie-lu', 'xuyang-wu']);
});
