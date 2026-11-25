import { mkdir, readFile, rename, rm, writeFile, copyFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { PATHS, exists, walkFiles, escapeHtml, escapeXml, toPosix } from './util.js';
import { collectMedia } from './content.js';
import { renderSiteConfig } from '../adapters/legacy-config.js';

const SOURCE_STATIC_FILES = new Set([
  'index.html', 'robots.txt', 'sitemap.xml', 'site.webmanifest'
]);

const BASE_ASSETS = {
  mark: './assets/mark.svg',
  logo: 'assets/logo-512.png',
  apple: './assets/apple-touch-icon.png',
  og: 'assets/og-docia.jpg',
  landscape: './assets/landscape.webp'
};

export async function buildSite(model, { dataOnly = false, staging = join(PATHS.build, 'dist') } = {}) {
  const config = renderSiteConfig(model);
  if (dataOnly) {
    await mkdir(PATHS.dist, { recursive: true });
    await atomicWrite(join(PATHS.dist, 'site.config.js'), config);
    return { files: 1 };
  }

  await rm(PATHS.build, { recursive: true, force: true });
  await mkdir(staging, { recursive: true });
  const files = [];

  for (const file of await walkFiles(PATHS.src)) {
    const name = relative(PATHS.src, file);
    if (SOURCE_STATIC_FILES.has(toPosix(name))) continue;
    const target = join(staging, name);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(file, target);
    files.push(toPosix(name));
  }

  for (const media of collectMedia(model)) {
    const source = join(PATHS.assets, media.type, media.file);
    const target = join(staging, 'assets', media.type, media.file);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(source, target);
    files.push(`assets/${media.type}/${media.file}`);
  }

  const indexTemplate = await readFile(join(PATHS.src, 'index.html'), 'utf8');
  const generated = {
    'index.html': renderFromTemplate(indexTemplate, model),
    'site.config.js': config,
    'site.webmanifest': renderManifest(model),
    'robots.txt': renderRobots(model),
    'sitemap.xml': renderSitemap(model)
  };
  for (const [name, content] of Object.entries(generated)) {
    await writeFile(join(staging, name), content, 'utf8');
    files.push(name);
  }

  await swapDist(staging);
  return { files: files.length };
}

async function atomicWrite(file, content) {
  const temp = `${file}.tmp`;
  await writeFile(temp, content, 'utf8');
  await rename(temp, file);
}

async function swapDist(staging) {
  const previous = join(PATHS.build, 'previous-dist');
  let backedUp = false;
  try {
    if (await exists(PATHS.dist)) {
      await rename(PATHS.dist, previous);
      backedUp = true;
    }
    await rename(staging, PATHS.dist);
  } catch (error) {
    if (backedUp && !(await exists(PATHS.dist)) && await exists(previous)) {
      await rename(previous, PATHS.dist);
    }
    throw error;
  }
  await rm(previous, { recursive: true, force: true });
}

function renderFromTemplate(template, model) {
  const { site } = model;
  if (!template) {
    throw new Error('缺少 src/index.html 模板');
  }
  const values = {
    LANG: site.default_language,
    BRAND: escapeHtml(site.name),
    BRAND_ARIA: escapeHtml(`${site.name} · ${site.university.en}`),
    UNIVERSITY: escapeHtml(site.university.en)
  };
  let html = template;
  for (const [token, value] of Object.entries(values)) {
    html = html.split(`{{${token}}}`).join(value);
  }
  html = html.replace('<!-- BUILD:HEAD -->', renderHead(model));
  html = html.replace('<!-- BUILD:NOSCRIPT -->', renderNoscript(model));
  return html;
}

export function renderHead(model) {
  const { site, presentation } = model;
  const base = siteUrl(site.url);
  const seo = presentation.seo;
  const defaultZh = site.default_language === 'zh';
  const canonical = defaultZh ? `${base}?lang=zh` : base;
  const locale = defaultZh ? 'zh_CN' : 'en_US';
  const altLocale = defaultZh ? 'en_US' : 'zh_CN';
  const theme = String(presentation.palette.paper || '#eef7f2').toLowerCase();
  const title = escapeHtml(seo.title);
  const description = escapeHtml(seo.description);
  const ogImage = `${base}${BASE_ASSETS.og}`;
  return `  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="keywords" content="${escapeHtml(seo.keywords)}">
  <meta name="author" content="${escapeHtml(seo.author)}">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <meta name="theme-color" content="${theme}">
  <link rel="canonical" id="canonical" href="${escapeHtml(canonical)}">
  <link rel="alternate" hreflang="en" href="${escapeHtml(base)}">
  <link rel="alternate" hreflang="zh" href="${escapeHtml(`${base}?lang=zh`)}">
  <link rel="alternate" hreflang="x-default" href="${escapeHtml(base)}">
  <link rel="icon" href="${BASE_ASSETS.mark}" type="image/svg+xml">
  <link rel="apple-touch-icon" href="${BASE_ASSETS.apple}">
  <link rel="manifest" href="./site.webmanifest">
  <link rel="preload" href="${BASE_ASSETS.landscape}" as="image" type="image/webp">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${escapeHtml(site.name)}">
  <meta property="og:title" content="${escapeHtml(seo.og_title)}">
  <meta property="og:description" content="${escapeHtml(seo.og_description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:image" content="${escapeHtml(ogImage)}">
  <meta property="og:image:secure_url" content="${escapeHtml(ogImage)}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(seo.og_image_alt)}">
  <meta property="og:locale" content="${locale}">
  <meta property="og:locale:alternate" content="${altLocale}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(seo.og_title)}">
  <meta name="twitter:description" content="${escapeHtml(seo.og_description)}">
  <meta name="twitter:image" content="${escapeHtml(ogImage)}">
  <meta name="twitter:image:alt" content="${escapeHtml(seo.og_image_alt)}">

  <script type="application/ld+json">
${renderJsonLd(model)}
  </script>

  <link rel="stylesheet" href="./style.css">
  <noscript><style>.header-tools{display:none}</style></noscript>`;
}

export function renderJsonLd(model) {
  const { site, presentation } = model;
  const base = siteUrl(site.url);
  const seo = presentation.seo;
  const contact = site.contact || {};
  const address = contact.address || {};
  const faculty = model.public.people.filter(person => person.role === 'faculty' && person.status === 'current');
  const organization = {
    '@type': 'ResearchOrganization',
    '@id': `${base}#organization`,
    name: site.name,
    alternateName: [site.full_name.en, site.full_name.zh].filter(Boolean),
    url: base,
    logo: {
      '@type': 'ImageObject',
      url: `${base}${BASE_ASSETS.logo}`,
      width: 512,
      height: 512
    },
    image: `${base}${BASE_ASSETS.og}`,
    description: seo.organization_description,
    email: contact.email || '',
    address: {
      '@type': 'PostalAddress',
      streetAddress: address.street?.en || '',
      addressLocality: address.city?.en || '',
      postalCode: address.postal_code || '',
      addressCountry: address.country || ''
    },
    parentOrganization: {
      '@type': 'CollegeOrUniversity',
      name: site.university.en,
      url: seo.parent_organization_url
    },
    knowsAbout: seo.knows_about || [],
    member: (() => {
      const members = faculty.map(person => ({
        '@type': 'Person',
        name: person.name.en,
        jobTitle: person.title?.en || '',
        email: person.email || '',
        url: contact.profile || person.website || '',
        affiliation: { '@id': `${base}#organization` }
      }));
      return members.length === 1 ? members[0] : members;
    })()
  };
  const website = {
    '@type': 'WebSite',
    '@id': `${base}#website`,
    name: site.name,
    alternateName: site.full_name.zh || site.full_name.en,
    url: base,
    description: seo.website_description,
    inLanguage: ['en', 'zh-CN'],
    publisher: { '@id': `${base}#organization` }
  };
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': [organization, website] }, null, 2);
}

export function renderNoscript(model) {
  const { site, presentation } = model;
  const base = siteUrl(site.url);
  const contact = site.contact || {};
  const address = contact.address || {};
  const people = model.public.people.filter(person => person.status === 'current');
  const lead = people.find(person => person.role === 'faculty');
  const research = presentation.seo?.noscript_research
    || model.public.research.map(item => item.title.en.toLowerCase()).join(', ');
  const titleEn = lead?.title?.en?.replace(/\s*·\s*/g, ' and ') || '';
  const affiliationEn = lead?.affiliation?.en || '';
  const addressEn = [
    contact.office?.en,
    address.street?.en,
    [address.city?.en, address.postal_code].filter(Boolean).join(' '),
    address.country === 'CN' ? 'China' : address.country
  ].filter(Boolean).join(', ');
  const host = new URL(base).host;
  return `    <noscript>
    <!-- Static summary for no-JavaScript visitors and simple crawlers. The live site uses app.js. -->
    <section class="seo-fallback" aria-labelledby="seo-fallback-title">
      <h1 id="seo-fallback-title">${escapeHtml(presentation.seo?.noscript_title || `${site.name} — ${site.full_name.en}`)}</h1>
      ${site.full_name.zh ? `<p class="seo-cn">${escapeHtml(site.full_name.zh)} · ${escapeHtml(site.university.zh)}</p>` : ''}
      <p>${escapeHtml(presentation.hero.description.en)}</p>
      <p><strong>Research:</strong> ${escapeHtml(research)}. <a href="#/research">Explore research</a>.</p>
      ${lead ? `<p><strong>People:</strong> ${escapeHtml(lead.name.en)}${titleEn ? `, ${escapeHtml(titleEn)}` : ''}${affiliationEn ? `, ${escapeHtml(affiliationEn)}` : ''}. <a href="#/people">Meet the lab</a>.</p>` : ''}
      <p><strong>Publications and news:</strong> <a href="#/publications">selected publications</a> and <a href="#/news">lab news</a>.</p>
      <p><strong>Contact:</strong> <a href="mailto:${escapeHtml(contact.email || '')}">${escapeHtml(contact.email || '')}</a>${addressEn ? ` · ${escapeHtml(addressEn)}` : ''}.</p>
      <p>This site works best with JavaScript enabled. Address: <a href="${escapeHtml(base)}">${escapeHtml(host)}</a>.</p>
    </section>
  </noscript>`;
}

export function renderManifest(model) {
  const { site, presentation } = model;
  const manifest = {
    name: `${site.name} · ${site.university.en}`,
    short_name: site.name,
    description: presentation.seo.manifest_description || presentation.seo.description,
    lang: site.default_language,
    start_url: './',
    scope: './',
    display: 'standalone',
    background_color: String(presentation.palette.paper).toLowerCase(),
    theme_color: String(presentation.palette.paper).toLowerCase(),
    icons: [
      { src: 'assets/logo-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: 'assets/logo-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: 'assets/apple-touch-icon.png', sizes: '180x180', type: 'image/png', purpose: 'any' }
    ]
  };
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

export function renderRobots(model) {
  const { site } = model;
  return `# ${site.name} · ${site.university.en}
# All public pages and assets may be crawled. The sitemap also lists the
# English and Chinese entry points; section content is rendered by app.js.

User-agent: *
Allow: /

Sitemap: ${siteUrl(site.url)}sitemap.xml
`;
}

export function renderSitemap(model) {
  const { site } = model;
  const base = siteUrl(site.url);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${escapeXml(base)}</loc>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(base)}"/>
    <xhtml:link rel="alternate" hreflang="zh" href="${escapeXml(`${base}?lang=zh`)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(base)}"/>
  </url>
  <url>
    <loc>${escapeXml(`${base}?lang=zh`)}</loc>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(base)}"/>
    <xhtml:link rel="alternate" hreflang="zh" href="${escapeXml(`${base}?lang=zh`)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(base)}"/>
  </url>
</urlset>
`;
}

function siteUrl(value) {
  return String(value || '').endsWith('/') ? String(value) : `${value}/`;
}
