// Pure helpers for the compact publication statistics chart shown above the
// Publications filter bar. Building the numbers and the markup without touching
// the DOM keeps both unit-testable and lets app.js decide where to mount it.
import { S, fill } from "./i18n.js";

const VIEW_W = 720;
const VIEW_H = 170;
const PAD_X = 36;
const PAD_TOP = 22;
const PAD_BOTTOM = 28;
const PLOT_W = VIEW_W - PAD_X * 2;
const PLOT_H = VIEW_H - PAD_TOP - PAD_BOTTOM;
const Y_ZERO = VIEW_H - PAD_BOTTOM;

const round = (value) => Math.round(value * 100) / 100;

// Captions end in the "{first}–{last}" range. With no publications there is no
// range to show, so drop that clause instead of printing a dangling dash.
const RANGE_CLAUSE = /\s*[,，]\s*\{first\}–\{last\}\s*年?/;

function captionFor(stats) {
  const { publicationStats: L } = S();
  if (!stats.yearCount) return L.caption.replace(RANGE_CLAUSE, "");
  return fill(L.caption, { first: stats.firstYear, last: stats.lastYear });
}

// Summarises papers by year. Papers without a usable year are ignored so the
// year rows and the global counters always add up to the same total.
export function buildPublicationStats(publications) {
  const papers = Array.isArray(publications) ? publications : [];
  const byYear = new Map();
  let total = 0;
  let articles = 0;
  let inproceedings = 0;
  let others = 0;

  for (const paper of papers) {
    if (paper?.year == null || paper.year === "") continue;
    const yearNumber = Number(paper.year);
    if (!Number.isFinite(yearNumber)) continue;

    const year = String(yearNumber);
    if (!byYear.has(year)) {
      byYear.set(year, { year, total: 0, article: 0, inproceedings: 0, other: 0 });
    }
    const row = byYear.get(year);

    row.total += 1;
    total += 1;
    if (paper.kind === "article") {
      row.article += 1;
      articles += 1;
    } else if (paper.kind === "inproceedings") {
      row.inproceedings += 1;
      inproceedings += 1;
    } else {
      row.other += 1;
      others += 1;
    }
  }

  const years = [...byYear.values()].sort((a, b) => Number(a.year) - Number(b.year));
  let peak = null;
  for (const row of years) {
    if (!peak || row.total > peak.total) peak = { year: row.year, total: row.total };
  }

  const yearCount = years.length;
  return {
    years,
    total,
    firstYear: yearCount ? years[0].year : null,
    lastYear: yearCount ? years[yearCount - 1].year : null,
    articles,
    inproceedings,
    others,
    peak,
    averagePerYear: yearCount ? total / yearCount : 0,
    yearCount
  };
}

function chartMarkup(stats, L) {
  const maxTotal = stats.peak ? stats.peak.total : 0;
  const scale = maxTotal > 0 ? PLOT_H / maxTotal : 0;
  const yFor = (value) => round(Y_ZERO - value * scale);

  const gridValues = maxTotal > 0 ? [maxTotal, maxTotal / 2, 0] : [0];
  const gridlines = gridValues
    .map(
      (value) =>
        `<line class="gridline" x1="${PAD_X}" y1="${yFor(value)}" x2="${VIEW_W - PAD_X}" y2="${yFor(value)}" stroke="currentColor" stroke-opacity="0.15"></line>`
    )
    .join("");

  const slot = stats.yearCount ? PLOT_W / stats.yearCount : PLOT_W;
  // Roughly 42–54px bars for the usual handful of years; they shrink gracefully
  // when the archive spans many years.
  const barWidth = stats.yearCount ? Math.min(54, slot * 0.62) : 0;

  const bars = stats.years
    .map((row, index) => {
      const center = PAD_X + slot * (index + 0.5);
      const x = round(center - barWidth / 2);
      const width = round(barWidth);
      const journalHeight = round(row.article * scale);
      const conferenceHeight = round(row.inproceedings * scale);
      const top = round(Y_ZERO - row.total * scale);

      const journal = row.article
        ? `<rect class="bar-journal" x="${x}" y="${round(Y_ZERO - journalHeight)}" width="${width}" height="${journalHeight}"></rect>`
        : "";
      const conference = row.inproceedings
        ? `<rect class="bar-conference" x="${x}" y="${round(Y_ZERO - journalHeight - conferenceHeight)}" width="${width}" height="${conferenceHeight}"></rect>`
        : "";
      const label = row.total
        ? `<text class="bar-total" x="${round(center)}" y="${round(top - 6)}" text-anchor="middle" font-size="11">${row.total}</text>`
        : "";
      const yearLabel = `<text class="bar-year" x="${round(center)}" y="${Y_ZERO + 18}" text-anchor="middle" font-size="11">${row.year}</text>`;
      const barAria = fill(L.barAria, {
        year: row.year,
        total: row.total,
        journal: row.article,
        conference: row.inproceedings
      });

      return `<g><title>${barAria}</title>${journal}${conference}${label}${yearLabel}</g>`;
    })
    .join("");

  return gridlines + bars;
}

// Renders the whole figure: heading, summary chips, stacked bar chart, legend
// and a screen-reader-only table mirroring the same data.
export function renderPublicationStats(publications) {
  const stats = buildPublicationStats(publications);
  const { publicationStats: L } = S();

  const average = stats.averagePerYear.toFixed(1);
  const chips = [
    `<span class="pub-stats-chip">${fill(L.total, { count: stats.total })}</span>`,
    `<span class="pub-stats-chip">${fill(L.average, { value: average })}</span>`,
    `<span class="pub-stats-chip">${L.journalShort} ${stats.articles} · ${L.conferenceShort} ${stats.inproceedings}</span>`
  ].join("");

  const tableRows = stats.years
    .map(
      (row) =>
        `<tr><th scope="row">${row.year}</th><td>${row.article}</td><td>${row.inproceedings}</td><td>${row.total}</td></tr>`
    )
    .join("");

  return `<figure class="pub-stats" id="publication-stats">
<figcaption class="pub-stats-head">
<div>
<h2>${L.title}</h2>
<p>${captionFor(stats)}</p>
</div>
<div class="pub-stats-totals">${chips}</div>
</figcaption>
<div class="pub-stats-chart">
<svg class="pub-stats-svg" viewBox="0 0 ${VIEW_W} ${VIEW_H}" role="img" aria-label="${L.aria}" preserveAspectRatio="none">${chartMarkup(stats, L)}</svg>
</div>
<div class="pub-stats-legend">
<span class="pub-stats-legend-item"><i class="swatch journal"></i>${L.journal}</span>
<span class="pub-stats-legend-item"><i class="swatch conference"></i>${L.conference}</span>
</div>
<table class="sr-only">
<caption>${L.tableCaption}</caption>
<thead><tr><th scope="col">${L.year}</th><th scope="col">${L.journalShort}</th><th scope="col">${L.conferenceShort}</th><th scope="col">${L.totalShort}</th></tr></thead>
<tbody>${tableRows}</tbody>
</table>
</figure>`;
}
