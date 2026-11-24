// Site-wide search over the content in site.config.js.
//
// The index is assembled in the browser, so adding a news item, person,
// publication, research direction, moment, or honor to site.config.js makes it
// searchable without touching this module. Results live on the ordinary pages:
// a link like #/people/person-0 opens the People page, scrolls to that record,
// and flashes it briefly so the visitor can see what matched.
import {site} from './site.config.js';
import {S,pick,currentLang,fill} from './i18n.js';
import {icon,escapeHtml as e,targetId} from './ui.js';

const MAX_RESULTS = 30;
const TYPE_ORDER = ['people','research','publications','news','alumni','gallery','honors','page'];
const TYPE_ICON = {page:'file',people:'agents',research:'network',publications:'book',news:'news',alumni:'agents',gallery:'camera',honors:'award'};
const MAC = /Mac|iPhone|iPad/i.test(navigator.platform || '');
const SHORTCUT = MAC ? '⌘K' : 'Ctrl K';

let dialog = null;
let input = null;
let statusEl = null;
let resultsEl = null;
let closeButton = null;
let toggle = null;
let cache = null;
let lastFocus = null;

const normalise = value => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/\s+/g, ' ')
  .trim();
const escapeRegExp = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const flatten = value => {
  if (value == null) return [];
  if (typeof value === 'string' || typeof value === 'number') return [String(value)];
  if (Array.isArray(value)) return value.flatMap(flatten);
  if (typeof value === 'object') return Object.values(value).flatMap(flatten);
  return [];
};
const isEditable = element => Boolean(element && (element.isContentEditable || /^(input|textarea|select)$/i.test(element.tagName || '')));

function entry({type, title, subtitle = '', body = '', href, extra = []}) {
  return {
    type,
    title: pick(title),
    subtitle: pick(subtitle),
    body: pick(body),
    href,
    raw: flatten([body, subtitle, title, extra]).map(value => String(value).trim()).filter(Boolean),
    search: normalise(flatten([title, subtitle, body, extra]).join(' '))
  };
}

function buildIndex() {
  const L = S();
  const list = [];
  const page = (id, title, subtitle, body = '', extra = []) =>
    list.push(entry({type:'page', title, subtitle, body, href:'#/' + id, extra}));

  for (const item of site.navigation || []) {
    if (item.id === 'home') {
      page('home', item.label, site.hero?.description,
        [pick(site.name), pick(site.university)].join(' · '), ['home', site.hero?.lines]);
      continue;
    }
    const meta = site.pages?.[item.id];
    if (!meta) continue;
    let body = '';
    const extra = [item.id];
    if (item.id === 'contact' && site.contact) {
      const c = site.contact;
      body = [c.name, c.email, pick(c.school), pick(c.office), pick(c.street), pick(c.city)].filter(Boolean).join(' · ');
      extra.push(c.profile, c.center);
    }
    page(item.id, meta.title, meta.desc, body, extra);
  }
  // The playground lives on the home page but is not a navigation item.
  page('simulation', L.experiment.title, L.experiment.intro, '', ['simulation']);

  for (const item of site.research || []) {
    const related = (site.publications || []).find(paper => paper.id === item.paper);
    list.push(entry({
      type: 'research',
      title: item.title,
      subtitle: item.short,
      body: item.question,
      href: '#/research/' + item.id,
      extra: [item.id, item.detail, related?.title]
    }));
  }

  for (const paper of site.publications || []) {
    list.push(entry({
      type: 'publications',
      title: paper.title,
      subtitle: [paper.year, paper.venue].filter(Boolean).join(' · '),
      body: paper.authors,
      href: '#/publications/' + targetId('paper', paper.id),
      extra: [paper.id]
    }));
  }

  (site.people || []).forEach((person, index) => {
    list.push(entry({
      type: 'people',
      title: person.name,
      subtitle: [pick(person.role), pick(person.affiliation)].filter(Boolean).join(' · '),
      body: person.description,
      href: '#/people/' + targetId('person', index),
      extra: [person.email, person.url, person.urlLabel]
    }));
  });

  (site.alumni || []).forEach((person, index) => {
    const degree = [pick(person.degree), person.year].filter(Boolean).join(' ');
    list.push(entry({
      type: 'alumni',
      title: person.name,
      subtitle: [degree, pick(person.position)].filter(Boolean).join(' · '),
      body: [pick(person.destination), pick(person.location)].filter(Boolean).join(' · '),
      href: '#/alumni/' + targetId('alumni', index),
      extra: [person.email, person.url, person.source]
    }));
  });

  (site.gallery || []).forEach((item, index) => {
    list.push(entry({
      type: 'gallery',
      title: item.title || L.labels.labMoment,
      subtitle: item.date,
      body: [pick(item.caption), pick(item.credit)].filter(Boolean).join(' · '),
      href: '#/gallery/' + targetId('gallery', index),
      extra: [item.alt, item.caption, item.credit]
    }));
  });

  (site.news || []).forEach((item, index) => {
    list.push(entry({
      type: 'news',
      title: item.text,
      subtitle: item.date,
      href: '#/news/' + targetId('news', index),
      extra: [item.text, item.url]
    }));
  });

  (site.honors || []).forEach((item, index) => {
    list.push(entry({
      type: 'honors',
      title: item.title,
      subtitle: [item.year, pick(item.recipient)].filter(Boolean).join(' · '),
      body: item.note,
      href: '#/honors/' + targetId('honor', index),
      extra: [item.title, item.recipient]
    }));
  });

  return list;
}

function getIndex() {
  const lang = currentLang();
  if (cache && cache.lang === lang) return cache.entries;
  const entries = buildIndex();
  cache = {lang, entries};
  return entries;
}

function browseEntries() {
  return (site.navigation || []).map(item => {
    const meta = site.pages?.[item.id];
    return {
      type: 'page',
      title: pick(item.label),
      subtitle: meta ? pick(meta.desc) : (item.id === 'home' ? pick(site.hero?.description) : ''),
      body: '',
      href: '#/' + item.id
    };
  });
}

function rank(rawQuery) {
  const query = normalise(rawQuery);
  if (!query) return {total: 0, items: []};
  const tokens = query.split(' ').filter(Boolean);
  const ranked = [];
  for (const item of getIndex()) {
    if (!tokens.every(token => item.search.includes(token))) continue;
    const title = normalise(item.title);
    const subtitle = normalise(item.subtitle);
    const body = normalise(item.body);
    let score = 0;
    for (const token of tokens) {
      if (title === query) score += 220;
      else if (title === token) score += 150;
      else if (title.startsWith(token)) score += 95;
      else if (new RegExp('(^|[^\\p{L}\\p{N}])' + escapeRegExp(token), 'u').test(title)) score += 70;
      else if (title.includes(token)) score += 50;
      else if (subtitle.includes(token)) score += 26;
      else if (body.includes(token)) score += 14;
      else score += 5;
    }
    if (title === query) score += 320;
    ranked.push({item, score});
  }
  ranked.sort((a, b) =>
    b.score - a.score ||
    TYPE_ORDER.indexOf(a.item.type) - TYPE_ORDER.indexOf(b.item.type) ||
    a.item.title.localeCompare(b.item.title));
  return {total: ranked.length, items: ranked.slice(0, MAX_RESULTS).map(hit => hit.item)};
}

function highlight(value, tokens) {
  const text = String(value ?? '');
  if (!tokens.length) return e(text);
  const pattern = tokens.slice().sort((a, b) => b.length - a.length).map(escapeRegExp).join('|');
  if (!pattern) return e(text);
  return text.split(new RegExp('(' + pattern + ')', 'gi'))
    .map((part, index) => index % 2 ? `<mark>${e(part)}</mark>` : e(part))
    .join('');
}

function makeSnippet(item, tokens) {
  // When the visitor searches in the language that is not currently shown,
  // the visible fields contain no match; fall back to the bilingual record so
  // the snippet still shows what matched and why the result is here.
  const visible = [item.title, item.subtitle, item.body].join(' ');
  const matchesVisible = tokens.every(token => normalise(visible).includes(token));
  const fallback = matchesVisible ? null : (item.raw || [])
    .filter(value => tokens.every(token => normalise(value).includes(token)))
    .reduce((best, value) => (value.length > best.length ? value : best), '');
  const source = matchesVisible
    ? (item.body || item.subtitle || item.title)
    : (fallback || item.body || item.subtitle || item.title);
  const text = String(source || '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  const lower = text.toLowerCase();
  let hit = -1;
  for (const token of tokens) {
    const at = lower.indexOf(token);
    if (at >= 0 && (hit < 0 || at < hit)) hit = at;
  }
  const start = hit > 60 ? hit - 50 : 0;
  let slice = text.slice(start, start + 170);
  if (start + 170 < text.length) slice = slice.replace(/[，、；\s]+$/, '') + '…';
  if (start > 0) slice = '…' + slice;
  return slice;
}

function resultMarkup(item, index, tokens) {
  const L = S();
  const typeLabel = (L.search.types && L.search.types[item.type]) || item.type;
  const subtitle = item.subtitle
    ? `<span class="search-result-sub">${highlight(item.subtitle, tokens)}</span>`
    : '';
  const snippet = makeSnippet(item, tokens);
  const snippetHtml = snippet && snippet !== item.subtitle
    ? `<span class="search-result-snippet">${highlight(snippet, tokens)}</span>`
    : '';
  const label = `${typeLabel}: ${item.title}`;
  return `<li class="search-result-row"><a class="search-result" href="${e(item.href)}" id="search-option-${index}" aria-label="${e(label)}">
    <span class="search-result-icon" aria-hidden="true">${icon(TYPE_ICON[item.type] || 'file', 18)}</span>
    <span class="search-result-copy"><span class="search-result-head"><span class="search-result-title">${highlight(item.title, tokens)}</span><span class="search-result-type" aria-hidden="true">${e(typeLabel)}</span></span>${subtitle}${snippetHtml}</span>
    <span class="search-result-arrow" aria-hidden="true">${icon('arrow', 16)}</span>
  </a></li>`;
}

function renderResults(rawQuery) {
  const L = S();
  const query = String(rawQuery || '').trim();
  if (!query) {
    const items = browseEntries();
    statusEl.textContent = L.search.browse;
    resultsEl.innerHTML = `<ul class="search-results">${items.map((item, index) => resultMarkup(item, index, [])).join('')}</ul>`;
    return;
  }
  const tokens = normalise(query).split(' ').filter(Boolean);
  const {total, items} = rank(query);
  statusEl.textContent = total === 0
    ? fill(L.search.resultCount, {count: 0})
    : total === 1 ? L.search.resultCountOne : fill(L.search.resultCount, {count: total});
  if (!items.length) {
    resultsEl.innerHTML = `<div class="search-empty"><strong>${e(fill(L.search.noResults, {query}))}</strong><p>${e(L.search.noResultsHint)}</p></div>`;
    return;
  }
  resultsEl.innerHTML = `<ul class="search-results">${items.map((item, index) => resultMarkup(item, index, tokens)).join('')}</ul>`;
}

function refreshChrome() {
  const L = S();
  if (toggle) {
    toggle.setAttribute('aria-label', L.search.button);
    toggle.setAttribute('title', `${L.search.button} (${SHORTCUT})`);
  }
  if (!dialog) return;
  dialog.setAttribute('aria-label', L.search.dialog);
  input.setAttribute('aria-label', L.search.inputLabel);
  input.placeholder = L.search.placeholder;
  closeButton.setAttribute('aria-label', L.search.close);
  dialog.querySelector('.search-foot').innerHTML =
    `<span><kbd>↑</kbd><kbd>↓</kbd> ${e(L.search.keyNavigate)}</span>` +
    `<span><kbd>↵</kbd> ${e(L.search.keyOpen)}</span>` +
    `<span><kbd>esc</kbd> ${e(L.search.keyClose)}</span>`;
}

function ensureDialog() {
  if (dialog) return;
  dialog = document.createElement('dialog');
  dialog.className = 'search-dialog';
  dialog.id = 'search-dialog';
  dialog.innerHTML = `<div class="search-panel">
    <div class="search-bar">
      <span class="search-bar-icon" aria-hidden="true">${icon('search', 21)}</span>
      <input id="search-input" class="search-input" type="text" inputmode="search" autocomplete="off" autocapitalize="off" spellcheck="false" aria-controls="search-results">
      <button type="button" class="search-close" data-search-close>${icon('close', 17)}</button>
    </div>
    <p class="search-status" id="search-status" role="status" aria-live="polite"></p>
    <div class="search-body" id="search-results"></div>
    <div class="search-foot"></div>
  </div>`;
  document.body.appendChild(dialog);
  input = dialog.querySelector('.search-input');
  statusEl = dialog.querySelector('.search-status');
  resultsEl = dialog.querySelector('.search-body');
  closeButton = dialog.querySelector('.search-close');

  dialog.addEventListener('click', event => {
    if (event.target === dialog) closeSearch();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('search-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    const restore = lastFocus && document.contains(lastFocus) ? lastFocus : toggle;
    if (restore) restore.focus({preventScroll: true});
  });
  closeButton.addEventListener('click', closeSearch);
  input.addEventListener('input', () => renderResults(input.value));
  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const links = Array.from(resultsEl.querySelectorAll('a.search-result'));
      if (!links.length) return;
      event.preventDefault();
      (event.key === 'ArrowDown' ? links[0] : links[links.length - 1]).focus();
    } else if (event.key === 'Enter') {
      const first = resultsEl.querySelector('a.search-result');
      if (first) {
        event.preventDefault();
        first.click();
      }
    } else if (event.key === 'Escape') {
      closeSearch();
    }
  });
  resultsEl.addEventListener('keydown', event => {
    const link = event.target.closest('a.search-result');
    if (!link) return;
    const links = Array.from(resultsEl.querySelectorAll('a.search-result'));
    const index = links.indexOf(link);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      links[Math.min(index + 1, links.length - 1)].focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (index <= 0) input.focus();
      else links[index - 1].focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      links[0].focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      links[links.length - 1].focus();
    }
  });
  resultsEl.addEventListener('click', event => {
    if (event.target.closest('a.search-result')) closeSearch();
  });
  refreshChrome();
}

function openSearch() {
  ensureDialog();
  refreshChrome();
  lastFocus = document.activeElement;
  if (!dialog.open) dialog.showModal();
  document.body.classList.add('search-open');
  if (toggle) toggle.setAttribute('aria-expanded', 'true');
  input.value = '';
  renderResults('');
  requestAnimationFrame(() => input.focus());
}

function closeSearch() {
  if (dialog && dialog.open) dialog.close();
}

function onGlobalKeydown(event) {
  const mod = event.metaKey || event.ctrlKey;
  if (mod && !event.altKey && !event.shiftKey && (event.key === 'k' || event.key === 'K')) {
    event.preventDefault();
    if (dialog && dialog.open) closeSearch();
    else openSearch();
    return;
  }
  if (event.key === '/' && !mod && !event.altKey && !isEditable(event.target)) {
    if (dialog && dialog.open) return;
    event.preventDefault();
    openSearch();
  }
}

// Called once from app.js. Builds the hidden dialog and binds the header button,
// the keyboard shortcut, and the dialog's own events.
export function mountSearch() {
  toggle = document.querySelector('#search-toggle');
  if (!toggle) return;
  ensureDialog();
  refreshChrome();
  toggle.setAttribute('aria-haspopup', 'dialog');
  toggle.setAttribute('aria-controls', 'search-dialog');
  toggle.setAttribute('aria-keyshortcuts', 'Meta+K Control+K');
  toggle.addEventListener('click', () => {
    if (dialog.open) closeSearch();
    else openSearch();
  });
  document.addEventListener('keydown', onGlobalKeydown);
}

// Keeps the trigger's label and the dialog's copy in the active language.
export function syncSearchChrome() {
  refreshChrome();
}
