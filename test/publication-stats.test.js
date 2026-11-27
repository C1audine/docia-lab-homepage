import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPublicationStats, renderPublicationStats } from '../src/publication-stats.js';
import { S } from '../src/i18n.js';

// Eight papers over four years: two journal/conference halves overall, with an
// uneven spread so peak and per-year counts are meaningful.
const publications = [
  { id: 'p1', year: 2022, kind: 'article' },
  { id: 'p2', year: 2022, kind: 'inproceedings' },
  { id: 'p3', year: 2023, kind: 'article' },
  { id: 'p4', year: 2023, kind: 'article' },
  { id: 'p5', year: 2024, kind: 'article' },
  { id: 'p6', year: 2024, kind: 'inproceedings' },
  { id: 'p7', year: 2024, kind: 'inproceedings' },
  { id: 'p8', year: 2025, kind: 'inproceedings' }
];

test('counts each year and each kind correctly', () => {
  const stats = buildPublicationStats(publications);

  assert.deepEqual(stats.years, [
    { year: '2022', total: 2, article: 1, inproceedings: 1, other: 0 },
    { year: '2023', total: 2, article: 2, inproceedings: 0, other: 0 },
    { year: '2024', total: 3, article: 1, inproceedings: 2, other: 0 },
    { year: '2025', total: 1, article: 0, inproceedings: 1, other: 0 }
  ]);
});

test('years ascend numerically and years without papers are omitted', () => {
  const stats = buildPublicationStats([
    { year: '2024', kind: 'article' },
    { year: 2020, kind: 'inproceedings' },
    { year: 2022, kind: 'article' }
  ]);

  assert.deepEqual(stats.years.map((row) => row.year), ['2020', '2022', '2024']);
  assert.equal(stats.yearCount, 3);
  assert.equal(stats.firstYear, '2020');
  assert.equal(stats.lastYear, '2024');
});

test('kind counters and year rows add up to the total', () => {
  const stats = buildPublicationStats(publications);
  const yearTotal = stats.years.reduce((sum, row) => sum + row.total, 0);

  assert.equal(stats.articles, 4);
  assert.equal(stats.inproceedings, 4);
  assert.equal(stats.others, 0);
  assert.equal(stats.total, 8);
  assert.equal(stats.articles + stats.inproceedings + stats.others, stats.total);
  assert.equal(yearTotal, stats.total);
});

test('unknown kinds land in other and still count toward totals and peak', () => {
  const stats = buildPublicationStats([
    ...publications,
    { id: 'p9', year: 2024, kind: 'workshop' }
  ]);

  const row2024 = stats.years.find((row) => row.year === '2024');
  assert.equal(row2024.other, 1);
  assert.equal(row2024.total, 4);
  assert.equal(stats.others, 1);
  assert.equal(stats.total, 9);
  assert.equal(stats.articles + stats.inproceedings + stats.others, stats.total);
  assert.deepEqual(stats.peak, { year: '2024', total: 4 });
  assert.equal(stats.averagePerYear, 9 / 4);
});

test('papers without a usable year are ignored', () => {
  const stats = buildPublicationStats([
    ...publications,
    { id: 'no-year', kind: 'article' },
    { id: 'empty-year', year: '', kind: 'article' },
    { id: 'bad-year', year: 'soon', kind: 'article' },
    null
  ]);

  assert.equal(stats.total, publications.length);
  assert.equal(stats.articles, 4);
});

test('first/last year, peak and average per year are correct', () => {
  const stats = buildPublicationStats(publications);

  assert.equal(stats.firstYear, '2022');
  assert.equal(stats.lastYear, '2025');
  assert.equal(stats.yearCount, 4);
  assert.deepEqual(stats.peak, { year: '2024', total: 3 });
  assert.equal(stats.averagePerYear, 2);
});

test('empty and non-array input return the zeroed shape', () => {
  const empty = {
    years: [],
    total: 0,
    firstYear: null,
    lastYear: null,
    articles: 0,
    inproceedings: 0,
    others: 0,
    peak: null,
    averagePerYear: 0,
    yearCount: 0
  };

  assert.deepEqual(buildPublicationStats([]), empty);
  assert.deepEqual(buildPublicationStats(null), empty);
  assert.deepEqual(buildPublicationStats(undefined), empty);
});

test('HTML exposes the figure, accessible SVG, legend and summary chips', () => {
  const html = renderPublicationStats(publications);
  const L = S().publicationStats;

  assert.match(html, /<figure class="pub-stats" id="publication-stats">/);
  assert.match(html, /<figcaption class="pub-stats-head">/);
  assert.match(html, /<svg class="pub-stats-svg" viewBox="0 0 720 170" role="img"/);
  assert.ok(html.includes(`preserveAspectRatio="none"`));
  assert.ok(html.includes(`aria-label="${L.aria}"`));
  assert.match(html, /<div class="pub-stats-chart">/);
  assert.equal(html.includes(`<h2>${L.title}</h2>`), true);
  assert.equal(html.includes(L.average.replace('{value}', '2.0')), true);
  assert.equal(html.includes(L.total.replace('{count}', '8')), true);
  assert.match(html, /<i class="swatch journal"><\/i>/);
  assert.match(html, /<i class="swatch conference"><\/i>/);
});

test('SVG has journal/conference rects, per-bar titles and value labels', () => {
  const html = renderPublicationStats(publications);

  assert.equal((html.match(/class="bar-journal"/g) || []).length, 3);
  assert.equal((html.match(/class="bar-conference"/g) || []).length, 3);
  assert.equal((html.match(/<g><title>/g) || []).length, 4);
  assert.ok(
    html.includes('<title>2024: 3 publications, 1 journal articles and 2 conference papers.</title>')
  );
  assert.match(html, /<text class="bar-total"[^>]*>3<\/text>/);
  assert.match(html, /<text class="bar-year"[^>]*>2022<\/text>/);
});

test('visually hidden table mirrors every year', () => {
  const html = renderPublicationStats(publications);
  const L = S().publicationStats;

  assert.match(html, /<table class="sr-only">/);
  assert.equal(html.includes(`<caption>${L.tableCaption}</caption>`), true);
  assert.equal((html.match(/<th scope="col">/g) || []).length, 4);
  assert.match(html, /<tr><th scope="row">2024<\/th><td>1<\/td><td>2<\/td><td>3<\/td><\/tr>/);
});

test('empty data renders safely without a range or broken chart', () => {
  const html = renderPublicationStats([]);

  assert.match(html, /<figure class="pub-stats" id="publication-stats">/);
  assert.match(html, /<table class="sr-only">/);
  assert.match(html, /<p>Peer-reviewed papers\.<\/p>/);
  assert.equal(html.includes('null'), false);
  assert.equal(html.includes('undefined'), false);
  assert.equal(html.includes('NaN'), false);
  assert.equal(html.includes('<rect'), false);
  assert.equal(html.includes('<g><title>'), false);
});
