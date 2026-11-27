import { basename, dirname, extname, join, relative } from 'node:path';
import { readdir } from 'node:fs/promises';
import { Report } from './report.js';
import { validateData } from './schema.js';
import { loadYaml } from '../loaders/yaml.js';
import { parseMarkdownFile, markdownToPlainText } from '../loaders/markdown.js';
import { parseBibSources } from '../loaders/bibtex.js';
import {
  PATHS, exists, fileExists, isCalendarDate, readText, relativeToRoot,
  suggestField, toPosix, walkFiles, compareOrderThenId
} from './util.js';

const ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;
const NEWS_FILE_PATTERN = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/;

const HOME_DEFAULTS = {
  research: { enabled: true },
  selected_publications: { enabled: true, count: 2 },
  moments: { enabled: true, count: 3 }
};

const PERSON_FIELDS = [
  'name', 'role', 'status', 'title', 'affiliation', 'start_year', 'graduation_year',
  'degree', 'position', 'destination', 'location', 'source', 'photo', 'interests',
  'email', 'website', 'website_label', 'google_scholar', 'orcid', 'github', 'order', 'draft'
];
const PUBLICATION_METADATA_FIELDS = [
  'selected', 'order', 'members', 'research', 'projects', 'links', 'status'
];
const RESEARCH_FIELDS = ['title', 'order', 'icon', 'demo', 'summary', 'question', 'image', 'draft'];
const NEWS_FIELDS = [
  'date', 'display_date', 'title', 'summary', 'order', 'image', 'featured', 'draft',
  'url', 'related_publications'
];
const HONOR_FIELDS = [
  'date', 'display_date', 'title', 'recipients', 'recipient_text', 'organization',
  'description', 'image', 'related_publication', 'link', 'order', 'draft'
];
const GALLERY_FIELDS = ['date', 'display_date', 'title', 'description', 'cover', 'order', 'draft', 'photos'];
const GALLERY_PHOTO_FIELDS = ['file', 'alt', 'credit'];
const SITE_FIELDS = ['name', 'full_name', 'url', 'default_language', 'university', 'contact', 'social'];
const CONTACT_FIELDS = ['name', 'email', 'school', 'office', 'address', 'profile', 'center'];
const ADDRESS_FIELDS = ['street', 'city', 'postal_code', 'country'];

const ROLE_LABELS = {
  faculty: { en: 'Faculty', zh: '教师' },
  postdoc: { en: 'Postdoctoral researcher', zh: '博士后研究员' },
  phd: { en: 'Doctoral student', zh: '博士研究生' },
  master: { en: 'Master’s student', zh: '硕士研究生' },
  undergraduate: { en: 'Undergraduate researcher', zh: '本科生' },
  staff: { en: 'Staff', zh: '行政人员' },
  visitor: { en: 'Visiting scholar', zh: '访问学者' }
};

const DEGREE_LABELS = {
  phd: { en: 'PhD', zh: '博士' },
  master: { en: 'Master’s', zh: '硕士' },
  undergraduate: { en: 'Bachelor’s', zh: '本科' }
};

export async function loadContent({ report = new Report(), today = new Date() } = {}) {
  const dateToday = localDate(today);
  const site = await loadSite(report);
  const presentation = await loadPresentation(report);
  const home = await loadHome(report);

  const people = await loadPeople(report);
  const publications = await loadPublications(report);
  const research = await loadResearch(report);
  const news = await loadNews(report, dateToday);
  const honors = await loadHonors(report);
  const gallery = await loadGallery(report);
  const recruitment = await loadRecruitment(report);

  const model = {
    site,
    presentation,
    home,
    people,
    publications,
    research,
    news,
    honors,
    gallery,
    recruitment,
    indexes: {
      publicationsByMember: new Map(),
      publicationsByResearch: new Map(),
      honorsByMember: new Map()
    }
  };

  const draftPeople = new Set(people.filter(item => item.draft).map(item => item.id));
  const peopleById = new Map(people.map(item => [item.id, item]));
  const researchById = new Map(research.map(item => [item.id, item]));
  const publicationsByKey = new Map(publications.map(item => [item.key, item]));
  const researchDraft = new Set(research.filter(item => item.draft).map(item => item.id));

  validatePublicationRefs(publications, peopleById, researchById, draftPeople, researchDraft, report);
  validateNewsRefs(news, publicationsByKey, report);
  validateHonorRefs(honors, peopleById, publicationsByKey, draftPeople, report);

  const publicPeople = people.filter(item => !item.draft);
  const publicResearch = research.filter(item => !item.draft);
  const publicNews = news.filter(item => !item.draft && !item.future);
  const publicHonors = honors.filter(item => !item.draft);
  const publicGallery = gallery.filter(item => !item.draft);

  sortPeople(publicPeople);
  sortPublications(publications);
  sortResearch(publicResearch);
  sortNews(publicNews);
  sortHonors(publicHonors);
  sortGallery(publicGallery);

  model.public = {
    people: publicPeople,
    publications,
    research: publicResearch,
    news: publicNews,
    honors: publicHonors,
    gallery: publicGallery,
    recruitment: recruitment && !recruitment.draft ? recruitment : null
  };

  buildIndexes(model, peopleById, report);
  return model;
}

function localDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function loadYamlRecord(file, schemaId, report, { unknownFields, label } = {}) {
  if (!(await fileExists(file))) {
    report.error(`找不到内容文件：${relativeToRoot(file)}`, { file: relativeToRoot(file) });
    return null;
  }
  const data = loadYaml(await readText(file), relativeToRoot(file), report);
  if (data === null) return null;
  if (typeof data !== 'object' || Array.isArray(data)) {
    report.error('文件顶层必须是键值对（YAML 对象）', { file: relativeToRoot(file) });
    return null;
  }
  const result = await validateData(schemaId, data);
  if (!result.valid) {
    for (const message of result.errors) {
      report.error(`字段不符合要求：${message}`, { file: relativeToRoot(file), record: label || '' });
    }
  }
  if (unknownFields) checkUnknownFields(data, unknownFields, file, report, label);
  return data;
}

function checkUnknownFields(data, allowed, file, report, record = '', extra = {}) {
  for (const key of Object.keys(data)) {
    if (allowed.includes(key)) continue;
    if (extra[key]) {
      report.warn(extra[key], { file: relativeToRoot(file), record, field: key });
      continue;
    }
    const suggestion = suggestField(key, allowed);
    report.warn(
      `未知字段 “${key}”${suggestion ? `，是否想写 “${suggestion}”？` : '，该字段会被忽略'}`,
      {
        file: relativeToRoot(file),
        record,
        field: key,
        fix: suggestion ? `把 “${key}” 改成 “${suggestion}”` : '删除该字段，或查阅 content/README.md 中的字段清单'
      }
    );
  }
}

function checkBilingual(value, file, field, report, record = '', { optional = false } = {}) {
  if (value == null) {
    if (!optional) report.warn(`${field} 缺失，中文页面将显示为空`, { file: relativeToRoot(file), record, field });
    return;
  }
  if (typeof value !== 'object' || Array.isArray(value)) return;
  if (typeof value.en !== 'string' || !value.en.trim()) {
    report.error(`${field}.en 不能为空（英文为必填）`, {
      file: relativeToRoot(file),
      record,
      field: `${field}.en`,
      fix: '为英文字段补上内容'
    });
    return;
  }
  if (typeof value.zh !== 'string' || !value.zh.trim()) {
    report.warn(`${field} 缺少中文；中文页面将回退显示英文`, {
      file: relativeToRoot(file),
      record,
      field: `${field}.zh`,
      fix: '补充 zh 字段，或确认暂时使用英文回退'
    });
  }
}

function checkBilingualList(value, file, field, report, record = '') {
  if (value == null) return;
  if (!Array.isArray(value)) return;
  value.forEach((item, index) => checkBilingual(item, file, `${field}[${index}]`, report, record));
}

function checkUrl(value, file, field, report, record = '', { optional = true } = {}) {
  if (!value) {
    if (!optional) report.error(`${field} 不能为空`, { file: relativeToRoot(file), record, field });
    return;
  }
  if (!/^(https?:\/\/|mailto:)/i.test(value)) {
    report.error(`${field} 必须是 http(s):// 或 mailto: 链接，当前为“${value}”`, {
      file: relativeToRoot(file),
      record,
      field,
      fix: '补全协议头，例如 https://...'
    });
  }
}

async function loadSite(report) {
  const file = join(PATHS.content, 'site.yaml');
  const data = await loadYamlRecord(file, 'site.schema.json', report, {
    unknownFields: SITE_FIELDS,
    label: 'site'
  });
  if (!data) return null;
  checkBilingual(data.full_name, file, 'full_name', report, 'site');
  checkBilingual(data.university, file, 'university', report, 'site');
  if (data.contact) {
    const contactFile = file;
    checkUnknownFields(data.contact, CONTACT_FIELDS, contactFile, report, 'site.contact');
    checkBilingual(data.contact.school, contactFile, 'contact.school', report, 'site');
    checkBilingual(data.contact.office, contactFile, 'contact.office', report, 'site');
    checkUrl(data.contact.email ? `mailto:${data.contact.email}` : '', contactFile, 'contact.email', report, 'site', { optional: false });
    checkUrl(data.contact.profile, contactFile, 'contact.profile', report, 'site');
    checkUrl(data.contact.center, contactFile, 'contact.center', report, 'site');
    if (data.contact.address) {
      checkUnknownFields(data.contact.address, ADDRESS_FIELDS, contactFile, report, 'site.contact.address');
      for (const field of ['street', 'city']) {
        checkBilingual(data.contact.address[field], contactFile, `contact.address.${field}`, report, 'site');
      }
      if (!data.contact.address.postal_code) {
        report.warn('contact.address.postal_code 缺失；结构化数据中的邮编将为空', {
          file: relativeToRoot(contactFile), record: 'site', field: 'contact.address.postal_code'
        });
      }
    }
  }
  return data;
}

async function loadPresentation(report) {
  const file = join(PATHS.config, 'presentation.yaml');
  const data = await loadYamlRecord(file, 'presentation.schema.json', report, { label: 'presentation' });
  if (!data) return null;
  for (const item of data.navigation || []) {
    checkBilingual(item.label, file, 'navigation.label', report, item.id || 'navigation');
  }
  for (const [key, page] of Object.entries(data.pages || {})) {
    checkBilingual(page.title, file, `pages.${key}.title`, report, key);
    checkBilingual(page.desc, file, `pages.${key}.desc`, report, key);
  }
  checkBilingual(data.hero?.description, file, 'hero.description', report, 'hero');
  if (!data.hero?.lines?.zh) {
    report.warn('hero.lines 缺少中文，中文页面将回退英文', {
      file: relativeToRoot(file), record: 'hero', field: 'hero.lines.zh'
    });
  }
  return data;
}

async function loadHome(report) {
  const file = join(PATHS.content, 'home.yaml');
  let data = {};
  if (await fileExists(file)) {
    data = loadYaml(await readText(file), relativeToRoot(file), report);
    if (data === null) return HOME_DEFAULTS;
  } else {
    report.info('没有 content/home.yaml，首页使用默认显示设置', { file: relativeToRoot(file) });
  }
  const result = await validateData('home.schema.json', data);
  if (!result.valid) {
    for (const message of result.errors) {
      report.error(`字段不符合要求：${message}`, { file: relativeToRoot(file), record: 'home' });
    }
  }
  checkUnknownFields(data, Object.keys(HOME_DEFAULTS), file, report, 'home', {
    latest_news: 'latest_news 属于 P1（首页复用新闻），P0 暂不生效，已忽略',
    people: 'people 属于 P1（首页复用成员），P0 暂不生效，已忽略',
    join_us: 'join_us 属于 P1（首页复用招生信息），P0 暂不生效，已忽略'
  });
  return {
    research: { ...HOME_DEFAULTS.research, ...(data.research || {}) },
    selected_publications: { ...HOME_DEFAULTS.selected_publications, ...(data.selected_publications || {}) },
    moments: { ...HOME_DEFAULTS.moments, ...(data.moments || {}) }
  };
}

async function loadPeople(report) {
  const dir = join(PATHS.content, 'people');
  const files = await walkFiles(dir, file => file.endsWith('.yaml') && !basename(file).startsWith('.'));
  if (!files.length) report.warn('content/people/ 下没有成员 YAML 文件', { file: 'content/people/' });
  const records = [];
  const seen = new Map();
  for (const file of files) {
    const rel = relative(dir, file);
    if (rel.includes('/') || rel.includes('\\')) {
      report.error('成员文件必须直接放在 content/people/ 下，不能使用子目录', {
        file: relativeToRoot(file),
        fix: '把文件移动到 content/people/ 并保持文件名为成员 ID'
      });
      continue;
    }
    const id = basename(file, '.yaml');
    if (id === 'README' || id === 'readme') continue;
    if (!ID_PATTERN.test(id)) {
      report.error(`成员 ID “${id}” 只能使用小写英文字母、数字和连字符`, {
        file: relativeToRoot(file),
        record: id,
        fix: '重命名文件，例如 jie-lu.yaml'
      });
      continue;
    }
    if (seen.has(id)) {
      report.error(`成员 ID 重复：“${id}”`, { file: relativeToRoot(file), record: id });
      continue;
    }
    seen.set(id, file);
    const data = await loadYamlRecord(file, 'person.schema.json', report, {
      unknownFields: PERSON_FIELDS,
      label: id
    });
    if (!data) continue;
    const record = { ...data, id, file: relativeToRoot(file), draft: data.draft === true };
    checkBilingual(data.name, file, 'name', report, id);
    checkBilingual(data.title, file, 'title', report, id, { optional: true });
    checkBilingual(data.affiliation, file, 'affiliation', report, id, { optional: true });
    checkBilingual(data.degree, file, 'degree', report, id, { optional: true });
    checkBilingual(data.position, file, 'position', report, id, { optional: true });
    checkBilingual(data.destination, file, 'destination', report, id, { optional: true });
    checkBilingual(data.location, file, 'location', report, id, { optional: true });
    checkBilingual(data.website_label, file, 'website_label', report, id, { optional: true });
    checkBilingualList(data.interests, file, 'interests', report, id);
    checkUrl(data.website, file, 'website', report, id);
    checkUrl(data.source, file, 'source', report, id);
    checkUrl(data.google_scholar, file, 'google_scholar', report, id);
    checkUrl(data.github, file, 'github', report, id);
    if (data.start_year && data.graduation_year && data.graduation_year < data.start_year) {
      report.error(`毕业年份 ${data.graduation_year} 早于入学年份 ${data.start_year}`, {
        file: relativeToRoot(file), record: id, field: 'graduation_year',
        fix: '核对 start_year 与 graduation_year'
      });
    }
    if (data.status === 'alumni' && !data.graduation_year) {
      report.warn('校友缺少 graduation_year，校友页面年份会显示为空', {
        file: relativeToRoot(file), record: id, field: 'graduation_year'
      });
    }
    record.photo = await resolvePersonPhoto(record, file, report);
    records.push(record);
  }
  return records;
}

async function resolvePersonPhoto(record, file, report) {
  const dir = join(PATHS.assets, 'people');
  if (record.photo) {
    const resolved = await imagePath(dir, record.photo);
    if (!resolved) {
      report.error(`成员照片不存在：assets/people/${record.photo}`, {
        file: relativeToRoot(file),
        record: record.id,
        field: 'photo',
        fix: '上传照片到 assets/people/，或修正 photo 文件名；留空则显示默认头像'
      });
      return '';
    }
    return record.photo;
  }
  const extensions = ['webp', 'jpg', 'jpeg', 'png', 'avif'];
  const candidates = [];
  for (const extension of extensions) {
    const candidate = `${record.id}.${extension}`;
    if (await fileExists(join(dir, candidate))) candidates.push(candidate);
  }
  if (candidates.length === 1) return candidates[0];
  if (candidates.length > 1) {
    report.warn(`找到多张可能的成员照片：${candidates.join('、')}；请在 YAML 中用 photo 指定一张`, {
      file: relativeToRoot(file),
      record: record.id,
      field: 'photo',
      fix: `添加 photo: ${candidates[0]}`
    });
  }
  return '';
}

async function loadPublications(report) {
  const dir = join(PATHS.content, 'publications');
  const bibFiles = await walkFiles(dir, file => file.endsWith('.bib'));
  if (!bibFiles.length) {
    report.error('content/publications/ 下没有 .bib 文件；BibTeX 是论文的唯一数据源', {
      file: 'content/publications/',
      fix: '创建 publications.bib 并粘贴 BibTeX 条目'
    });
    return [];
  }
  const sources = [];
  for (const file of bibFiles) {
    sources.push({ file: relativeToRoot(file), text: await readText(file) });
  }
  const entries = parseBibSources(sources, report);
  const byKey = new Map(entries.map(entry => [entry.key, entry]));
  for (const entry of entries) {
    entry.metadata = { selected: false };
    entry.metadataFile = '';
    checkUrl(entry.url, entry.file, 'url', report, entry.key);
  }

  const metadataDir = join(dir, 'metadata');
  const metadataFiles = await walkFiles(metadataDir, file => file.endsWith('.yaml') && !basename(file).startsWith('.'));
  for (const file of metadataFiles) {
    const key = basename(file, '.yaml');
    if (key === 'README' || key === 'readme') continue;
    const entry = byKey.get(key);
    if (!entry) {
      report.error(`论文元数据 “${key}.yaml” 找不到对应的 citation key`, {
        file: relativeToRoot(file),
        record: key,
        fix: '文件名必须与 .bib 中的 citation key 完全一致；删除多余文件或修正 key'
      });
      continue;
    }
    const data = await loadYamlRecord(file, 'publication-metadata.schema.json', report, {
      unknownFields: PUBLICATION_METADATA_FIELDS,
      label: key
    });
    if (!data) continue;
    entry.metadata = data;
    entry.metadataFile = relativeToRoot(file);
    for (const field of ['members', 'research', 'projects']) {
      if (Array.isArray(data[field]) && new Set(data[field]).size !== data[field].length) {
        report.warn(`${field} 中有重复 ID，重复项会被忽略`, {
          file: relativeToRoot(file), record: key, field
        });
      }
    }
    if (Array.isArray(data.projects) && data.projects.length) {
      report.warn('projects 属于 P2 预留功能，P0 不会生成项目页面或关联展示', {
        file: relativeToRoot(file), record: key, field: 'projects'
      });
    }
  }

  for (const entry of entries) {
    const metadata = entry.metadata || {};
    entry.selected = metadata.selected === true;
    entry.order = metadata.order;
    entry.members = Array.isArray(metadata.members) ? metadata.members : [];
    entry.researchIds = Array.isArray(metadata.research) ? metadata.research : [];
    entry.metadataFile = entry.metadataFile || '';
  }
  return entries;
}

function validatePublicationRefs(publications, peopleById, researchById, draftPeople, researchDraft, report) {
  for (const entry of publications) {
    for (const memberId of entry.members) {
      const member = peopleById.get(memberId);
      if (!member) {
        report.error(`论文 ${entry.key} 的 members 引用了不存在的成员 ID：“${memberId}”`, {
          file: entry.metadataFile || entry.file,
          record: entry.key,
          field: 'members',
          fix: '检查 content/people/ 中是否存在该 ID；成员 ID 就是文件名（不含 .yaml）'
        });
      } else if (draftPeople.has(memberId)) {
        report.error(`论文 ${entry.key} 引用了草稿成员：“${memberId}”；公开论文不能关联草稿记录`, {
          file: entry.metadataFile || entry.file,
          record: entry.key,
          field: 'members'
        });
      }
    }
    for (const researchId of entry.researchIds) {
      const research = researchById.get(researchId);
      if (!research) {
        report.error(`论文 ${entry.key} 的 research 引用了不存在的研究方向 ID：“${researchId}”`, {
          file: entry.metadataFile || entry.file,
          record: entry.key,
          field: 'research',
          fix: '检查 content/research/ 中是否存在该文件（文件名即 ID）'
        });
      } else if (researchDraft.has(researchId)) {
        report.error(`论文 ${entry.key} 引用了草稿研究方向：“${researchId}”；公开论文不能关联草稿记录`, {
          file: entry.metadataFile || entry.file,
          record: entry.key,
          field: 'research'
        });
      }
    }
  }
}

async function loadResearch(report) {
  const dir = join(PATHS.content, 'research');
  const files = await walkFiles(dir, file => file.endsWith('.md') && !basename(file).startsWith('.'));
  const records = [];
  const seen = new Set();
  for (const file of files) {
    const rel = relative(dir, file);
    if (rel.includes('/') || rel.includes('\\')) {
      report.error('研究方向文件必须直接放在 content/research/ 下', { file: relativeToRoot(file) });
      continue;
    }
    const id = basename(file, '.md');
    if (id === 'README' || id === 'readme') continue;
    if (!ID_PATTERN.test(id)) {
      report.error(`研究方向 ID “${id}” 只能使用小写英文字母、数字和连字符`, {
        file: relativeToRoot(file), record: id
      });
      continue;
    }
    if (seen.has(id)) {
      report.error(`研究方向 ID 重复：“${id}”`, { file: relativeToRoot(file), record: id });
      continue;
    }
    seen.add(id);
    const parsed = await loadMarkdownRecord(file, 'research.schema.json', report, RESEARCH_FIELDS, id);
    if (!parsed) continue;
    const { data, sections } = parsed;
    checkBilingual(data.title, file, 'title', report, id);
    checkBilingual(data.summary, file, 'summary', report, id);
    checkBilingual(data.question, file, 'question', report, id, { optional: true });
    const en = markdownToPlainText(sections.en, relativeToRoot(file), report);
    const zh = markdownToPlainText(sections.zh, relativeToRoot(file), report);
    if (!en.trim()) {
      report.error('研究方向英文正文为空', { file: relativeToRoot(file), record: id });
    }
    if (data.image) {
      if (!(await imagePath(join(PATHS.assets, 'research'), data.image))) {
        report.error(`研究方向图片不存在：assets/research/${data.image}`, {
          file: relativeToRoot(file), record: id, field: 'image',
          fix: '上传图片到 assets/research/，或删除 image 字段'
        });
      }
    }
    records.push({
      ...data,
      id,
      file: relativeToRoot(file),
      draft: data.draft === true,
      detail: { en, zh },
      paper: ''
    });
  }
  return records;
}

async function loadMarkdownRecord(file, schemaId, report, unknownFields, label) {
  if (!(await fileExists(file))) {
    report.error(`找不到内容文件：${relativeToRoot(file)}`, { file: relativeToRoot(file) });
    return null;
  }
  const parsed = parseMarkdownFile(await readText(file), relativeToRoot(file), report);
  if (!parsed) return null;
  const result = await validateData(schemaId, parsed.data);
  if (!result.valid) {
    for (const message of result.errors) {
      report.error(`字段不符合要求：${message}`, { file: relativeToRoot(file), record: label });
    }
  }
  checkUnknownFields(parsed.data, unknownFields, file, report, label);
  return parsed;
}

async function loadNews(report, today) {
  const dir = join(PATHS.content, 'news');
  const files = await walkFiles(dir, file => file.endsWith('.md') && !basename(file).startsWith('.'));
  const records = [];
  const seen = new Set();
  for (const file of files) {
    const rel = relative(dir, file);
    if (rel.includes('/') || rel.includes('\\')) {
      report.error('新闻文件必须直接放在 content/news/ 下', { file: relativeToRoot(file) });
      continue;
    }
    const name = basename(file);
    if (/^README\.md$/i.test(name)) continue;
    const match = name.match(NEWS_FILE_PATTERN);
    if (!match) {
      report.error(`新闻文件名必须以 “YYYY-MM-DD-slug.md” 命名，当前为“${name}”`, {
        file: relativeToRoot(file),
        fix: '例如 2024-09-01-new-paper.md'
      });
      continue;
    }
    const dateInName = match[1];
    const id = name.replace(/\.md$/, '');
    if (seen.has(id)) {
      report.error(`新闻 ID 重复：“${id}”`, { file: relativeToRoot(file), record: id });
      continue;
    }
    seen.add(id);
    const parsed = await loadMarkdownRecord(file, 'news.schema.json', report, NEWS_FIELDS, id);
    if (!parsed) continue;
    const { data, sections } = parsed;
    if (!isCalendarDate(data.date)) {
      report.error(`新闻 date 不是有效日期：“${data.date}”`, {
        file: relativeToRoot(file), record: id, field: 'date', fix: '写成 "2024-09-01"'
      });
    }
    if (data.date !== dateInName) {
      report.error(`新闻 date（${data.date}）与文件名日期（${dateInName}）不一致`, {
        file: relativeToRoot(file), record: id, field: 'date',
        fix: `把 date 改成 "${dateInName}"，或重命名文件`
      });
    }
    checkBilingual(data.title, file, 'title', report, id);
    checkBilingual(data.display_date, file, 'display_date', report, id, { optional: true });
    checkBilingual(data.summary, file, 'summary', report, id, { optional: true });
    const en = markdownToPlainText(sections.en, relativeToRoot(file), report);
    const zh = markdownToPlainText(sections.zh, relativeToRoot(file), report);
    if (data.image) checkNewsImage(data.image, id, file, report);
    const future = data.date > today;
    if (future) {
      report.warn(`新闻日期 ${data.date} 晚于今天，P0 不会自动安排发布时间；该条暂不展示`, {
        file: relativeToRoot(file), record: id, field: 'date',
        fix: '把日期改成实际发布日期，等待正式发布后再合并'
      });
    }
    records.push({
      ...data,
      id,
      file: relativeToRoot(file),
      draft: data.draft === true,
      future,
      text: { en, zh },
      related_publications: Array.isArray(data.related_publications) ? data.related_publications : []
    });
  }
  return records;
}

function checkNewsImage(image, id, file, report) {
  const resolved = join(PATHS.assets, 'news', image);
  if (!exists(resolved)) {
    report.error(`新闻图片不存在：assets/news/${image}`, {
      file: relativeToRoot(file), record: id, field: 'image',
      fix: `上传图片到 assets/news/${id}/，或删除 image 字段`
    });
    return;
  }
  if (!toPosix(image).startsWith(`${id}/`)) {
    report.error(`新闻图片必须放在 assets/news/${id}/ 目录内，当前为 assets/news/${image}`, {
      file: relativeToRoot(file), record: id, field: 'image',
      fix: `把图片移动到 assets/news/${id}/ 并更新 image 字段`
    });
  }
}

function validateNewsRefs(news, publicationsByKey, report) {
  for (const item of news) {
    for (const key of item.related_publications) {
      if (!publicationsByKey.has(key)) {
        report.error(`新闻 ${item.id} 的 related_publications 引用了不存在的 citation key：“${key}”`, {
          file: item.file, record: item.id, field: 'related_publications',
          fix: '检查 content/publications/*.bib 中的 citation key'
        });
      }
    }
  }
}

async function loadHonors(report) {
  const dir = join(PATHS.content, 'honors');
  const files = await walkFiles(dir, file => file.endsWith('.yaml') && !basename(file).startsWith('.'));
  const records = [];
  const seen = new Set();
  for (const file of files) {
    const rel = relative(dir, file);
    if (rel.includes('/') || rel.includes('\\')) {
      report.error('荣誉文件必须直接放在 content/honors/ 下', { file: relativeToRoot(file) });
      continue;
    }
    const id = basename(file, '.yaml');
    if (id === 'README' || id === 'readme') continue;
    if (!ID_PATTERN.test(id)) {
      report.error(`荣誉 ID “${id}” 只能使用小写英文字母、数字和连字符`, {
        file: relativeToRoot(file), record: id
      });
      continue;
    }
    if (seen.has(id)) {
      report.error(`荣誉 ID 重复：“${id}”`, { file: relativeToRoot(file), record: id });
      continue;
    }
    seen.add(id);
    const data = await loadYamlRecord(file, 'honor.schema.json', report, {
      unknownFields: HONOR_FIELDS, label: id
    });
    if (!data) continue;
    if (!isCalendarDate(data.date)) {
      report.error(`荣誉 date 不是有效日期：“${data.date}”`, {
        file: relativeToRoot(file), record: id, field: 'date'
      });
    }
    checkBilingual(data.title, file, 'title', report, id);
    checkBilingual(data.display_date, file, 'display_date', report, id, { optional: true });
    checkBilingual(data.recipient_text, file, 'recipient_text', report, id, { optional: true });
    checkBilingual(data.organization, file, 'organization', report, id, { optional: true });
    checkBilingual(data.description, file, 'description', report, id, { optional: true });
    checkUrl(data.link, file, 'link', report, id);
    if (!data.recipients?.length && !data.recipient_text) {
      report.warn('荣誉没有 recipients 或 recipient_text，获奖人一栏会为空', {
        file: relativeToRoot(file), record: id, field: 'recipients'
      });
    }
    if (data.image) {
      if (!(await imagePath(join(PATHS.assets, 'honors'), data.image))) {
        report.error(`荣誉图片不存在：assets/honors/${data.image}`, {
          file: relativeToRoot(file), record: id, field: 'image'
        });
      } else if (!toPosix(data.image).startsWith(`${id}/`)) {
        report.error(`荣誉图片必须放在 assets/honors/${id}/ 目录内，当前为 assets/honors/${data.image}`, {
          file: relativeToRoot(file), record: id, field: 'image',
          fix: `把图片移动到 assets/honors/${id}/ 并更新 image 字段`
        });
      }
    }
    records.push({ ...data, id, file: relativeToRoot(file), draft: data.draft === true });
  }
  return records;
}

function validateHonorRefs(honors, peopleById, publicationsByKey, draftPeople, report) {
  for (const item of honors) {
    for (const recipient of item.recipients || []) {
      const person = peopleById.get(recipient);
      if (!person) {
        report.error(`荣誉 ${item.id} 的 recipients 引用了不存在的成员 ID：“${recipient}”`, {
          file: item.file, record: item.id, field: 'recipients',
          fix: '检查 content/people/ 中的文件名'
        });
      } else if (draftPeople.has(recipient)) {
        report.error(`荣誉 ${item.id} 引用了草稿成员：“${recipient}”`, {
          file: item.file, record: item.id, field: 'recipients'
        });
      }
    }
    if (item.related_publication && !publicationsByKey.has(item.related_publication)) {
      report.error(`荣誉 ${item.id} 的 related_publication 引用了不存在的 citation key：“${item.related_publication}”`, {
        file: item.file, record: item.id, field: 'related_publication'
      });
    }
  }
}

async function loadGallery(report) {
  const dir = join(PATHS.content, 'gallery');
  const files = await walkFiles(dir, file => file.endsWith('.yaml') && !basename(file).startsWith('.'));
  const records = [];
  const seen = new Set();
  for (const file of files) {
    const rel = relative(dir, file);
    if (rel.includes('/') || rel.includes('\\')) {
      report.error('相册文件必须直接放在 content/gallery/ 下', { file: relativeToRoot(file) });
      continue;
    }
    const id = basename(file, '.yaml');
    if (id === 'README' || id === 'readme') continue;
    if (!ID_PATTERN.test(id)) {
      report.error(`相册 ID “${id}” 只能使用小写英文字母、数字和连字符`, {
        file: relativeToRoot(file), record: id
      });
      continue;
    }
    if (seen.has(id)) {
      report.error(`相册 ID 重复：“${id}”`, { file: relativeToRoot(file), record: id });
      continue;
    }
    seen.add(id);
    const data = await loadYamlRecord(file, 'gallery.schema.json', report, {
      unknownFields: GALLERY_FIELDS, label: id
    });
    if (!data) continue;
    if (!isCalendarDate(data.date)) {
      report.error(`相册 date 不是有效日期：“${data.date}”`, {
        file: relativeToRoot(file), record: id, field: 'date'
      });
    }
    checkBilingual(data.title, file, 'title', report, id);
    checkBilingual(data.display_date, file, 'display_date', report, id, { optional: true });
    checkBilingual(data.description, file, 'description', report, id, { optional: true });
    for (const [index, photo] of (data.photos || []).entries()) {
      checkUnknownFields(photo, GALLERY_PHOTO_FIELDS, file, report, `${id}.photos[${index}]`);
      const resolved = await imagePath(join(PATHS.assets, 'gallery'), photo.file);
      if (!resolved) {
        report.error(`相册照片不存在：assets/gallery/${photo.file}`, {
          file: relativeToRoot(file), record: id, field: `photos[${index}].file`,
          fix: `上传照片到 assets/gallery/${id}/ 并填写相对路径`
        });
      } else if (!toPosix(photo.file).startsWith(`${id}/`)) {
        report.error(`相册照片必须放在 assets/gallery/${id}/ 目录内，当前为 assets/gallery/${photo.file}`, {
          file: relativeToRoot(file), record: id, field: `photos[${index}].file`,
          fix: `把照片移动到 assets/gallery/${id}/ 并更新 file 字段`
        });
      }
      checkBilingual(photo.alt, file, `photos[${index}].alt`, report, id, { optional: true });
      if (!photo.alt) {
        report.warn('相册照片缺少 alt，页面将回退使用相册标题作为替代文本', {
          file: relativeToRoot(file), record: id, field: `photos[${index}].alt`,
          fix: '补充 alt: { en: "...", zh: "..." }'
        });
      }
    }
    const cover = data.cover || data.photos?.[0]?.file;
    if (cover && !(data.photos || []).some(photo => photo.file === cover)) {
      report.error(`相册封面 “${cover}” 不在 photos 列表中`, {
        file: relativeToRoot(file), record: id, field: 'cover',
        fix: 'cover 必须是 photos 中某一张的 file；留空则使用第一张'
      });
    }
    records.push({ ...data, id, file: relativeToRoot(file), draft: data.draft === true, cover: cover || '' });
  }
  return records;
}

async function loadRecruitment(report) {
  const file = join(PATHS.content, 'join-us', 'index.md');
  if (!(await fileExists(file))) {
    report.info('没有 content/join-us/index.md；P0 不生成招生页面（当前网站也没有该入口）', {
      file: 'content/join-us/index.md'
    });
    return null;
  }
  const parsed = await loadMarkdownRecord(file, 'recruitment.schema.json', report, ['title', 'updated', 'draft'], 'join-us');
  if (!parsed) return null;
  const { data, sections } = parsed;
  checkBilingual(data.title, file, 'title', report, 'join-us');
  if (!isCalendarDate(data.updated)) {
    report.error(`join-us updated 不是有效日期：“${data.updated}”`, {
      file: relativeToRoot(file), record: 'join-us', field: 'updated'
    });
  }
  return {
    ...data,
    id: 'join-us',
    file: relativeToRoot(file),
    draft: data.draft === true,
    body: { en: sections.en, zh: sections.zh }
  };
}

async function imagePath(baseDir, relativeFile) {
  if (!relativeFile || typeof relativeFile !== 'string') return null;
  const normalized = relativeFile.replace(/^\.\//, '');
  if (normalized.startsWith('/') || normalized.includes('..') || normalized.includes('\\')) return null;
  const full = join(baseDir, normalized);
  return (await fileExists(full)) ? full : null;
}

function sortPeople(items) {
  items.sort((a, b) => compareOrderThenId(
    { order: a.order, id: a.id },
    { order: b.order, id: b.id }
  ));
}

function sortPublications(items) {
  items.sort((a, b) =>
    (b.year || 0) - (a.year || 0) ||
    compareOrderThenId({ order: a.order, id: a.key }, { order: b.order, id: b.key })
  );
}

function sortResearch(items) {
  items.sort((a, b) => compareOrderThenId(a, b));
}

function sortNews(items) {
  items.sort((a, b) =>
    String(b.date).localeCompare(String(a.date)) ||
    compareOrderThenId(a, b)
  );
}

function sortHonors(items) {
  items.sort((a, b) =>
    String(b.date).localeCompare(String(a.date)) ||
    compareOrderThenId(a, b)
  );
}

function sortGallery(items) {
  items.sort((a, b) =>
    String(b.date).localeCompare(String(a.date)) ||
    compareOrderThenId(a, b)
  );
}

function buildIndexes(model, peopleById, report) {
  const { publications, research, honors, indexes } = model;
  for (const entry of publications) {
    for (const memberId of entry.members) {
      if (!peopleById.has(memberId)) continue;
      if (!indexes.publicationsByMember.has(memberId)) indexes.publicationsByMember.set(memberId, []);
      indexes.publicationsByMember.get(memberId).push(entry.key);
    }
    for (const researchId of entry.researchIds) {
      if (!research.some(item => item.id === researchId)) continue;
      if (!indexes.publicationsByResearch.has(researchId)) indexes.publicationsByResearch.set(researchId, []);
      indexes.publicationsByResearch.get(researchId).push(entry.key);
    }
  }
  for (const item of honors) {
    for (const memberId of item.recipients || []) {
      if (!peopleById.has(memberId)) continue;
      if (!indexes.honorsByMember.has(memberId)) indexes.honorsByMember.set(memberId, []);
      indexes.honorsByMember.get(memberId).push(item.id);
    }
  }
  // research.paper 保持与旧前端兼容：取该研究方向关联的第一篇公开论文。
  for (const item of research) {
    const keys = indexes.publicationsByResearch.get(item.id) || [];
    item.paper = keys[0] || '';
  }
}

export function collectMedia(model) {
  const files = [];
  const add = (type, file) => {
    if (!file) return;
    const normalized = String(file).replace(/^\.\//, '');
    if (!files.some(item => item.type === type && item.file === normalized)) {
      files.push({ type, file: normalized });
    }
  };
  for (const person of model.public.people) add('people', person.photo);
  for (const item of model.public.research) add('research', item.image);
  for (const item of model.public.news) add('news', item.image);
  for (const item of model.public.honors) add('honors', item.image);
  for (const album of model.public.gallery) {
    for (const photo of album.photos || []) add('gallery', photo.file);
  }
  return files;
}

export { ROLE_LABELS, DEGREE_LABELS, HOME_DEFAULTS };
