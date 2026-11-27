import { DEGREE_LABELS, ROLE_LABELS } from '../lib/content.js';
import { formatAuthorName } from '../loaders/bibtex.js';

const DEFAULT_WEBSITE_LABEL = { en: 'Personal website', zh: '个人主页' };

// 把内部内容模型转换成旧前端直接使用的 site.config.js 结构。
// 页面、样式、交互实验都不改；这里只替换数据来源。
export function toLegacySite(model) {
  const { site, presentation, home, public: content } = model;
  const contact = buildContact(site.contact);
  const memberIndex = buildMemberIndex(content.people);

  return {
    brand: site.name,
    name: site.full_name,
    university: site.university,
    url: site.url,
    palette: presentation.palette,
    navigation: presentation.navigation,
    pages: presentation.pages,
    media: presentation.media,
    hero: presentation.hero,
    research: content.research.map(item => ({
      id: item.id,
      icon: item.icon || 'network',
      demo: item.demo || '',
      title: item.title,
      short: item.summary,
      question: item.question || { en: '', zh: '' },
      detail: item.detail,
      paper: item.paper || ''
    })),
    publications: content.publications.map(entry => toLegacyPublication(entry, memberIndex)),
    people: content.people
      .filter(person => person.status === 'current')
      .map(person => toLegacyPerson(person, site)),
    alumni: content.people
      .filter(person => person.status === 'alumni')
      .map(person => toLegacyAlumni(person)),
    gallery: content.gallery.flatMap(album => toLegacyGallery(album)),
    news: content.news.map(item => {
      const url = newsUrl(item, content.publications);
      return {
        date: item.display_date || item.date,
        text: item.text,
        ...(url ? { url } : {})
      };
    }),
    honors: content.honors.map(item => toLegacyHonor(item, content.people)),
    contact,
    experiment: presentation.experiment,
    home: {
      research: { enabled: home.research.enabled !== false },
      selected_publications: {
        enabled: home.selected_publications.enabled !== false,
        count: home.selected_publications.count
      },
      moments: {
        enabled: home.moments.enabled !== false,
        count: home.moments.count
      }
    }
  };
}

function toLegacyPublication(entry, memberIndex) {
  const authorList = (entry.authorNames || []).map(name => {
    const author = { name: formatAuthorName(name) };
    const member = matchMember(name, memberIndex);
    if (member) author.member = member;
    return author;
  });
  const heuristicMembers = authorList.map(author => author.member).filter(Boolean);
  const explicitMembers = Array.isArray(entry.members) ? entry.members : [];
  return {
    id: entry.key,
    year: entry.year,
    title: entry.title,
    authors: entry.authors,
    venue: entry.venue,
    url: entry.url || (entry.doi ? `https://doi.org/${entry.doi}` : ''),
    selected: entry.selected === true,
    kind: entry.type,
    research: Array.isArray(entry.researchIds) ? entry.researchIds : [],
    members: [...new Set([...explicitMembers, ...heuristicMembers])],
    authorList
  };
}

// 按英文名建立“首字母 + 姓氏”索引，覆盖全部公开成员（含校友）。
// 同一键对应多个成员时视为歧义，存 null，宁可漏配也不猜测。
function buildMemberIndex(people) {
  const index = new Map();
  for (const person of people) {
    const key = personNameKey(person.name?.en);
    if (!key) continue;
    index.set(key, index.has(key) ? null : person.id);
  }
  return index;
}

function matchMember(name, memberIndex) {
  const key = authorNameKey(name);
  return key ? memberIndex.get(key) || '' : '';
}

function personNameKey(englishName) {
  const tokens = normalizeNameTokens(englishName);
  if (!tokens.length) return '';
  return `${tokens[0][0]}-${tokens[tokens.length - 1]}`;
}

function authorNameKey(name) {
  if (!name || typeof name !== 'object') return '';
  const firstTokens = normalizeNameTokens(name.firstName);
  const lastTokens = normalizeNameTokens(name.lastName);
  if (!firstTokens.length || !lastTokens.length) return '';
  return `${firstTokens[0][0]}-${lastTokens[lastTokens.length - 1]}`;
}

function normalizeNameTokens(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

function toLegacyPerson(person, site) {
  return {
    id: person.id,
    name: person.name,
    group: person.role === 'faculty' ? 'pi' : 'students',
    role: person.title || ROLE_LABELS[person.role] || person.role,
    affiliation: person.affiliation || site.university,
    description: person.description || deriveDescription(person.interests),
    url: person.website || person.google_scholar || person.orcid || person.github || '',
    urlLabel: person.website_label || DEFAULT_WEBSITE_LABEL,
    email: person.email || '',
    photo: person.photo || ''
  };
}

function toLegacyAlumni(person) {
  return {
    id: person.id,
    name: person.name,
    degree: person.degree || DEGREE_LABELS[person.role] || { en: 'Alumni', zh: '校友' },
    year: person.graduation_year,
    position: person.position,
    destination: person.destination,
    location: person.location,
    source: person.source || '',
    url: person.website || person.google_scholar || person.orcid || person.github || '',
    email: person.email || '',
    photo: person.photo || ''
  };
}

function deriveDescription(interests) {
  const items = (interests || []).filter(item => item && typeof item === 'object');
  if (!items.length) return undefined;
  const en = joinEnglish(items.map(item => item.en).filter(Boolean));
  const zh = joinChinese(items.map(item => item.zh || item.en).filter(Boolean));
  return {
    en: en ? `Research interests include ${en}.` : '',
    zh: zh ? `研究兴趣包括${zh}。` : ''
  };
}

function joinEnglish(items) {
  if (!items.length) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function joinChinese(items) {
  if (!items.length) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]}与${items[1]}`;
  return `${items.slice(0, -1).join('、')}与${items[items.length - 1]}`;
}

function toLegacyGallery(album) {
  return (album.photos || []).map((photo, index) => ({
    id: `${album.id}-${index + 1}`,
    photo: photo.file,
    date: album.display_date || album.date,
    title: album.title,
    caption: album.description,
    credit: photo.credit || '',
    alt: photo.alt || album.title
  }));
}

function newsUrl(item, publications) {
  if (item.url) return item.url;
  const first = (item.related_publications || [])
    .map(key => publications.find(entry => entry.key === key))
    .find(Boolean);
  if (!first) return '';
  return first.url || (first.doi ? `https://doi.org/${first.doi}` : '');
}

function toLegacyHonor(item, people) {
  const record = {
    year: Number(String(item.date).slice(0, 4)),
    title: item.title
  };
  if (item.recipient_text) {
    record.recipient = item.recipient_text;
  } else if (Array.isArray(item.recipients) && item.recipients.length) {
    const names = item.recipients
      .map(id => people.find(person => person.id === id))
      .filter(Boolean)
      .map(person => person.name);
    if (names.length === 1) record.recipient = names[0];
    else if (names.length > 1) {
      record.recipient = {
        en: names.map(name => name.en).join(', '),
        zh: names.map(name => name.zh || name.en).join('、')
      };
    }
  }
  if (item.description) record.note = item.description;
  else if (item.organization) record.note = item.organization;
  return record;
}

function buildContact(contact) {
  if (!contact) return {};
  const address = contact.address || {};
  const postal = address.postal_code || '';
  const country = String(address.country || '').toUpperCase();
  const countryEn = country === 'CN' ? 'China' : (address.country || '');
  const countryZh = country === 'CN' ? '中国' : (address.country || '');
  const street = address.street;
  const city = address.city;
  const enPlace = [city?.en, postal].filter(Boolean).join(' ');
  const enCity = [enPlace, countryEn].filter(Boolean).join(', ');
  const zhCity = [countryZh, city?.zh, postal].filter(Boolean).join(' ');
  return {
    name: contact.name || '',
    email: contact.email || '',
    school: contact.school,
    office: contact.office,
    street,
    city: { en: enCity, zh: zhCity },
    profile: contact.profile || '',
    center: contact.center || ''
  };
}

export function renderSiteConfig(model, { headerComment = true } = {}) {
  const legacy = toLegacySite(model);
  const banner = headerComment
    ? [
        '// AUTO-GENERATED — DO NOT EDIT.',
        '// 此文件由 npm run build:content 根据 content/ 与 config/presentation.yaml 生成。',
        '// 请修改 content/ 下的内容文件，然后重新构建；直接编辑本文件会在下次构建时被覆盖。',
        ''
      ].join('\n')
    : '';
  return `${banner}export const site = ${JSON.stringify(legacy, null, 2)};\n`;
}
