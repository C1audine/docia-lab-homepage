import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AUTHOR_PREFIX,
  MEMBER_PREFIX,
  authorValue,
  buildPublicationFacets,
  emptyFilters,
  filterPublications,
  hasActiveFilters,
  memberValue
} from '../src/publication-filters.js';

const people = [
  { id: 'jie-lu', name: { en: 'Jie Lu', zh: '陆疌' } },
  { id: 'xuyang-wu', name: { en: 'Xuyang Wu', zh: '吴旭阳' } }
];
const alumni = [
  { id: 'alum-one', name: { en: 'Alum One', zh: '校友一' } }
];
const research = [
  { id: 'optimization-algorithms', title: { en: 'Optimization algorithms', zh: '优化算法' } },
  { id: 'game-theory', title: { en: 'Game theory', zh: '博弈论' } },
  { id: 'unused-area', title: { en: 'Unused area', zh: '未使用方向' } }
];

const publications = [
  {
    id: 'a',
    year: 2025,
    kind: 'article',
    research: ['optimization-algorithms'],
    members: ['jie-lu'],
    authorList: [{ name: 'J. Lu', member: 'jie-lu' }, { name: 'K. C. Sou' }]
  },
  {
    id: 'b',
    year: 2024,
    kind: 'inproceedings',
    research: ['optimization-algorithms', 'game-theory'],
    members: ['xuyang-wu', 'jie-lu'],
    authorList: [{ name: 'X. Wu', member: 'xuyang-wu' }, { name: 'J. Lu', member: 'jie-lu' }, { name: 'A. Author' }]
  },
  {
    id: 'c',
    year: 2025,
    kind: 'article',
    research: [],
    members: ['alum-one'],
    authorList: [{ name: 'Alum One', member: 'alum-one' }, { name: 'B. Writer' }]
  }
];

test('筛选选项完全由论文数据生成', () => {
  const facets = buildPublicationFacets(publications, people, alumni, research);

  assert.deepEqual(facets.years, [2025, 2024]);
  assert.deepEqual(facets.members.map((person) => person.id), ['jie-lu', 'xuyang-wu', 'alum-one']);
  assert.deepEqual(facets.authors, ['A. Author', 'B. Writer', 'K. C. Sou']);
  assert.deepEqual(facets.research.map((area) => area.id), ['optimization-algorithms', 'game-theory']);
  assert.deepEqual(facets.kinds, ['article', 'inproceedings']);
});

test('空数据生成空选项', () => {
  const facets = buildPublicationFacets([], people, alumni, research);
  assert.deepEqual(facets, { years: [], members: [], authors: [], research: [], kinds: [] });
});

test('年份、成员、合作者、研究方向与类型筛选', () => {
  assert.deepEqual(filterPublications(publications, { year: '2025' }).map((paper) => paper.id), ['a', 'c']);
  assert.deepEqual(filterPublications(publications, { person: memberValue('jie-lu') }).map((paper) => paper.id), ['a', 'b']);
  assert.deepEqual(filterPublications(publications, { person: authorValue('A. Author') }).map((paper) => paper.id), ['b']);
  assert.deepEqual(filterPublications(publications, { research: 'game-theory' }).map((paper) => paper.id), ['b']);
  assert.deepEqual(filterPublications(publications, { kind: 'article' }).map((paper) => paper.id), ['a', 'c']);
});

test('多个条件同时生效且未知值不会误匹配', () => {
  const filtered = filterPublications(publications, {
    year: '2025',
    person: memberValue('alum-one'),
    kind: 'article'
  });
  assert.deepEqual(filtered.map((paper) => paper.id), ['c']);

  assert.deepEqual(filterPublications(publications, { year: '1999' }), []);
  assert.deepEqual(filterPublications(publications, { person: memberValue('nobody') }), []);
  assert.deepEqual(filterPublications(publications, { person: 'plain-name' }), []);
});

test('空筛选返回全部论文，状态辅助函数正确', () => {
  assert.equal(filterPublications(publications, emptyFilters()).length, publications.length);
  assert.equal(filterPublications(publications).length, publications.length);
  assert.equal(hasActiveFilters(emptyFilters()), false);
  assert.equal(hasActiveFilters({ ...emptyFilters(), year: '2025' }), true);
  assert.equal(MEMBER_PREFIX, 'member:');
  assert.equal(AUTHOR_PREFIX, 'author:');
});
