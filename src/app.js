import {site} from './site.config.js';
import {icon,escapeHtml as e,initials,mediaUrl,targetId} from './ui.js';
import {terrain,trackDescent} from './terrain.js';
import {experiment,mountExperiment} from './experiment.js';
import {renderDistributedDemo,mountDistributedDemo} from './experiment-distributed.js';
import {renderOptimizerDemo,mountOptimizerDemo} from './experiment-optimizer.js';
import {renderPublicationStats} from './publication-stats.js';
import {LANGS,LABEL,S,pick,currentLang,useLang,initialLang,rememberLang,fill} from './i18n.js';
import {mountSearch,syncSearchChrome} from './search.js';
import {authorValue,buildPublicationFacets,emptyFilters,filterPublications,hasActiveFilters,memberValue} from './publication-filters.js';

const main=document.querySelector('main'), nav=document.querySelector('nav'), headerLang=document.querySelector('#header-lang'), brandschool=document.querySelector('#brandschool'), skip=document.querySelector('.skip');
const external=(url,label,cls='text-link')=>`<a class="${cls}" href="${e(url)}" target="_blank" rel="noopener noreferrer">${e(label)}</a>`;
const primary=(url,label,symbol,kind='primary')=>`<a class="btn ${kind}" href="${e(url)}">${icon(symbol,17)}${e(label)}</a>`;
const other=s=>`<div class="container page-body"><div class="empty-state"><h2>${e(s.title)}</h2><p>${e(s.text)}</p></div></div>`;
let cleanups=[], active='', lang=useLang(initialLang()), pubFilters=emptyFilters(), publicationDetail='';

const menu=document.querySelector('#menu-toggle');
function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label',S().openNav);menu.innerHTML=icon('menu',23);nav.classList.remove('open');}
menu.onclick=()=>{if(nav.classList.contains('open')){closeMenu();return;}nav.classList.add('open');menu.setAttribute('aria-expanded','true');menu.setAttribute('aria-label',S().closeNav);menu.innerHTML=icon('close',23);};
document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});
document.addEventListener('click',ev=>{if(!ev.composedPath().includes(menu)&&!ev.composedPath().includes(nav))closeMenu();});
skip.onclick=ev=>{ev.preventDefault();main.focus();main.scrollIntoView();};
// A soft shadow under the sticky header once the page has scrolled.
const topbar=document.querySelector('.topbar');
const syncTopbar=()=>topbar.classList.toggle('is-scrolled',window.scrollY>4);
window.addEventListener('scroll',syncTopbar,{passive:true});syncTopbar();
for(const [key,value] of Object.entries(site.palette))document.documentElement.style.setProperty('--'+key,value);
document.querySelector('#brandname').textContent=site.brand;
brandschool.textContent=pick(site.university);

function researchArt(type){
  let shapes='';
  if(type==='network'){
    const points=[[16,81],[61,40],[91,92],[130,27],[153,67],[190,104],[221,35],[255,69],[301,21],[314,96]];
    const edges=[[0,1],[0,2],[1,2],[1,3],[1,4],[2,4],[2,5],[3,4],[3,6],[4,5],[4,6],[4,7],[5,7],[5,9],[6,7],[6,8],[7,8],[7,9],[8,9]];
    shapes=edges.map(([a,b])=>`<path d="M${points[a]} L${points[b]}"/>`).join('')+points.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4" fill="#b7deca"/>`).join('');
  }else if(type==='agents'){
    for(let row=0;row<7;row++){const pts=[];for(let x=0;x<=340;x+=4){const y=58+(row-3)*14*Math.exp(-x/110)+20*Math.sin(x/55+row*.38)*Math.exp(-x/225);pts.push([x,y]);}shapes+=`<polyline points="${pts.join(' ')}"/>`;}
  }else{
    for(let r=2;r<=18;r++){const pts=[];for(let i=0;i<=140;i++){let a=2*Math.PI*i/140;pts.push([160+Math.cos(a)*r*(8.7+1.5*Math.sin(3*a)),60+Math.sin(a)*r*(4.7+1.1*Math.cos(2*a))]);}shapes+=`<polyline points="${pts.join(' ')}"/>`;}
  }
  return `<svg class="research-art art-${type}" viewBox="0 0 335 118" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.15">${shapes}</g></svg>`;
}
const portraitAlt=person=>fill(S().labels.portraitAlt,{name:pick(person.name)});
// A research direction opts into a demo with `demo:` in its Markdown front
// matter. The load-balancing experiment moved here from the home page.
const researchDemos={
  network:{render:experiment,mount:()=>mountExperiment()},
  distributed:{render:renderDistributedDemo,mount:root=>mountDistributedDemo(root)},
  optimizer:{render:renderOptimizerDemo,mount:root=>mountOptimizerDemo(root)}
};
function cards(){return `<div class="research-grid">${site.research.map(r=>`<a href="#/research/${e(r.id)}" class="research-card">${researchArt(r.icon)}<div><h3>${e(pick(r.title))}</h3><p>${e(pick(r.short))}</p></div></a>`).join('')}</div>`;}
function paper(p){return `<article class="paper-row" id="paper-${e(p.id)}"><span class="paper-year">${e(p.year)}</span><div><p class="venue">${e(p.venue)}</p><h3>${external(p.url,p.title,'paper-title')}</h3><p class="authors">${e(p.authors)}</p></div>${external(p.url,S().link.viewPaper,'paper-link')}</article>`;}
function portrait(person){
  const src=mediaUrl(person.photo,site.media?.people);
  return `<div class="profile-art${src?' has-photo':''}"${src?'':' aria-hidden="true"'}>${researchArt('contour')}<span aria-hidden="true">${e(initials(pick(person.name)))}</span>${src?`<img src="${e(src)}" alt="${e(portraitAlt(person))}" loading="lazy" decoding="async">`:''}</div>`;
}
function avatar(person){
  const src=mediaUrl(person.photo,site.media?.alumni||site.media?.people);
  return `<span class="avatar-sm${src?' has-photo':''}"${src?'':' aria-hidden="true"'}><span aria-hidden="true">${e(initials(pick(person.name)))}</span>${src?`<img src="${e(src)}" alt="${e(portraitAlt(person))}" loading="lazy" decoding="async">`:''}</span>`;
}
function recordLinks(person){
  const links=[];
  if(person.url)links.push(external(person.url,pick(person.urlLabel)||S().link.homepage));
  if(person.email)links.push(`<a class="text-link" href="mailto:${e(person.email)}">${e(person.email)}</a>`);
  return links.length?`<div class="record-links">${links.join('')}</div>`:'';
}
function galleryCard(g,index){
  const src=mediaUrl(g.photo,site.media?.gallery), L=S();
  return `<figure class="gallery-card"${index===undefined?'':` id="${e(targetId('gallery',index))}"`}><div class="gallery-frame">${src?`<img src="${e(src)}" alt="${e(pick(g.alt)||pick(g.title)||L.labels.labMoment)}" loading="lazy" decoding="async">`:''}</div><figcaption>${pick(g.date)?`<p class="gallery-meta">${e(pick(g.date))}</p>`:''}<h3>${e(pick(g.title)||L.labels.labMoment)}</h3>${pick(g.caption)?`<p class="gallery-caption">${e(pick(g.caption))}</p>`:''}${pick(g.credit)?`<p class="gallery-credit">${e(L.labels.photoCredit)}${e(pick(g.credit))}</p>`:''}</figcaption></figure>`;
}
function pageHead(id,title){return `<div class="subhead"><div class="container"><h1>${e(title||pick(site.pages[id].title))}</h1><p>${e(pick(site.pages[id].desc))}</p></div></div>`;}
function home(){
  const L=S(), lines=pick(site.hero.lines), options=site.home||{};
  const enabled=(key)=>!options[key]||options[key].enabled!==false;
  const selected=site.publications.filter(p=>p.selected===true);
  const hasSelection=site.publications.some(p=>'selected' in p);
  const homePapers=(hasSelection?selected:site.publications).slice(0,(options.selected_publications&&options.selected_publications.count!=null)?options.selected_publications.count:2);
  const researchBlock=enabled('research')?`<section class="research-section"><div class="container"><div class="section-head"><div><h2>${e(L.heading.whatWeStudy)}</h2></div><a href="#/research" class="text-link">${e(L.link.exploreAll)}</a></div>${cards()}</div></section>`:'';
  const papersBlock=(enabled('selected_publications')&&homePapers.length)?`<section class="container home-pubs"><div class="section-head"><div><h2>${e(L.heading.selectedPublications)}</h2></div><a href="#/publications" class="text-link">${e(L.link.allPublications)}</a></div>${homePapers.map(paper).join('')}</section>`:'';
  return `<section class="hero"><div class="container hero-inner"><div class="hero-copy"><h1>${lines.map((l,i)=>i===lines.length-1?`<em>${e(l)}</em>`:`<span>${e(l)}</span>`).join('')}</h1><p>${e(pick(site.hero.description))}</p><div class="hero-actions">${primary('#/research/multi-agent-control',L.link.trySimulation,'network','outline')}${primary('#/research',L.link.exploreResearch,'book')}</div></div>${terrain()}</div></section>
    ${researchBlock}
    ${papersBlock}${homeMoments()}`;
}
function homeMoments(){
  const L=S(), options=site.home||{}, count=(options.moments&&options.moments.count!=null)?options.moments.count:3;
  const items=(site.gallery||[]).slice(0,count);
  if(!items.length||(options.moments&&options.moments.enabled===false))return '';
  return `<section class="container home-moments"><div class="section-head"><div><h2>${e(L.heading.lifeAtDocia)}</h2></div><a href="#/gallery" class="text-link">${e(L.link.viewAllMoments)}</a></div><div class="gallery-grid">${items.map((item,index)=>galleryCard(item,index)).join('')}</div></section>`;
}
function gallery(){
  const L=S(), items=site.gallery||[];
  return pageHead('gallery')+(items.length?`<div class="container page-body"><div class="gallery-grid">${items.map((item,index)=>galleryCard(item,index)).join('')}</div></div>`:other({title:L.empty.photosTitle,text:L.empty.photosText}));
}
function news(){
  const L=S(), items=site.news||[];
  if(!items.length)return pageHead('news')+other({title:L.empty.newsTitle,text:L.empty.newsText});
  return pageHead('news')+`<div class="container page-body"><ol class="news-list">${items.map((n,index)=>`<li class="news-item" id="${e(targetId('news',index))}"><span class="news-date">${e(pick(n.date))}</span><p class="news-text">${n.url?external(n.url,pick(n.text)+' ↗','news-link'):e(pick(n.text))}</p></li>`).join('')}</ol></div>`;
}
function honors(){
  const L=S(), items=site.honors||[];
  if(!items.length)return pageHead('honors')+other({title:L.empty.honorsTitle,text:L.empty.honorsText});
  return pageHead('honors')+`<div class="container page-body"><ol class="honors-list">${items.map((h,index)=>`<li class="honor-item" id="${e(targetId('honor',index))}"><span class="honor-year">${e(h.year)}</span><div class="honor-body"><h3>${e(pick(h.title))}</h3>${pick(h.recipient)?`<p>${e(pick(h.recipient))}</p>`:''}${pick(h.note)?`<p class="honor-note">${e(pick(h.note))}</p>`:''}</div></li>`).join('')}</ol></div>`;
}
function research(detail){
  const L=S(), item=site.research.find(r=>r.id===detail);
  if(item){
    const demo=researchDemos[item.demo];
    const jump=demo?`<button type="button" class="jump-link" data-scroll-to="demo">${e(L.researchDemo.jump)}${icon('arrow',14)}</button>`:'';
    return `<div class="subhead"><div class="container subhead-inner"><div><h1>${e(pick(item.title))}</h1><p>${e(pick(item.short))}</p></div>${jump}</div></div><div class="container page-body"><div class="reading"><a href="#/research" class="text-link">${e(L.link.allDirections)}</a><div class="reading-art">${researchArt(item.icon)}</div><h2>${e(pick(item.question))}</h2><p>${e(pick(item.detail))}</p><h3 class="minor-title">${e(L.heading.relatedPublication)}</h3>${site.publications.filter(p=>p.id===item.paper).map(paper).join('')}</div>${demo?`<div class="research-demo-band" id="demo">${demo.render()}</div>`:''}</div>`;
  }
  return pageHead('research')+`<div class="container page-body">${cards()}<div class="feature-band"><div><h2>${e(L.heading.localUpdates)}</h2><p>${e(L.text.localUpdates)}</p></div>${primary('#/research/multi-agent-control',L.link.openPlayground,'network')}</div></div>`;
}
function filterOptions(items,valueOf,labelOf,current){
  return items.map(item=>{const value=valueOf(item);return `<option value="${e(value)}"${current===value?' selected':''}>${e(labelOf(item))}</option>`;}).join('');
}
// Options come from the publications in site.config.js, so new BibTeX entries
// and newly linked lab members show up without touching the interface code.
function publicationFilterPanel(){
  const L=S(),F=L.filters,f=buildPublicationFacets(site.publications,site.people,site.alumni,site.research);
  const years=filterOptions(f.years,y=>String(y),y=>String(y),pubFilters.year);
  const members=filterOptions(f.members,p=>memberValue(p.id),p=>pick(p.name),pubFilters.person);
  const authors=filterOptions(f.authors,n=>authorValue(n),n=>n,pubFilters.person);
  const areas=filterOptions(f.research,r=>r.id,r=>pick(r.title),pubFilters.research);
  const kinds=filterOptions(f.kinds,k=>k,k=>pick(F.types[k])||k,pubFilters.kind);
  const count=filterPublications(site.publications,pubFilters).length;
  return `<div class="publication-filters" role="group" aria-label="${e(F.label)}"><div class="filter-field"><label for="pub-filter-year">${e(F.year)}</label><select id="pub-filter-year" data-pub-filter="year"><option value="">${e(F.allYears)}</option>${years}</select></div><div class="filter-field"><label for="pub-filter-person">${e(F.person)}</label><select id="pub-filter-person" data-pub-filter="person"><option value="">${e(F.allPeople)}</option>${members?`<optgroup label="${e(F.members)}">${members}</optgroup>`:''}${authors?`<optgroup label="${e(F.coauthors)}">${authors}</optgroup>`:''}</select></div><div class="filter-field"><label for="pub-filter-research">${e(F.research)}</label><select id="pub-filter-research" data-pub-filter="research"><option value="">${e(F.allResearch)}</option>${areas}</select></div><div class="filter-field"><label for="pub-filter-kind">${e(F.type)}</label><select id="pub-filter-kind" data-pub-filter="kind"><option value="">${e(F.allTypes)}</option>${kinds}</select></div><div class="filter-meta"><p class="filter-count" id="publication-count" role="status" aria-live="polite">${e(fill(F.showing,{shown:count,total:site.publications.length}))}</p><button type="button" class="filter-reset" data-pub-reset${hasActiveFilters(pubFilters)?'':' hidden'}>${e(F.reset)}</button></div></div>`;
}
function syncPublicationList(){
  const list=document.querySelector('#publication-list');
  if(!list)return;
  const L=S(),items=filterPublications(site.publications,pubFilters);
  list.innerHTML=items.map(paper).join('');
  const empty=document.querySelector('#publication-empty');
  if(empty)empty.hidden=items.length>0;
  const count=document.querySelector('#publication-count');
  if(count)count.textContent=fill(L.filters.showing,{shown:items.length,total:site.publications.length});
  const reset=document.querySelector('[data-pub-reset]');
  if(reset)reset.hidden=!hasActiveFilters(pubFilters);
}
function resetPublicationFilters(){
  pubFilters=emptyFilters();
  for(const select of main.querySelectorAll('[data-pub-filter]'))select.value='';
}
function publications(){
  const L=S(),items=filterPublications(site.publications,pubFilters);
  return pageHead('publications')+`<div class="container page-body"><div class="source-line source-line-end">${external(site.contact.profile,L.link.facultyPublications)}</div>${renderPublicationStats(site.publications)}${publicationFilterPanel()}<div class="publication-list" id="publication-list">${items.map(paper).join('')}</div><div class="empty-state publication-empty" id="publication-empty"${items.length?' hidden':''}><h2>${e(L.filters.emptyTitle)}</h2><p>${e(L.filters.emptyText)}</p></div></div>`;
}
function people(){
  const L=S();
  const groups=[['pi',L.heading.principalInvestigators],['students',L.heading.students]];
  const directory=groups.map(([group,label])=>{
    const members=site.people.map((person,index)=>({person,index})).filter(({person})=>(person.group||'pi')===group);
    if(!members.length)return '';
    return `<section class="people-group"><h2>${e(label)}</h2>${members.map(({person:p,index})=>`<article class="person-record" id="${e(targetId('person',index))}">${portrait(p)}<div><p class="venue">${e(pick(p.role))}</p><h3>${e(pick(p.name))}</h3><p>${e(pick(p.affiliation))} · ${e(pick(site.university))}</p><p>${e(pick(p.description))}</p>${recordLinks(p)}</div></article>`).join('')}</section>`;
  }).join('');
  return pageHead('people')+`<div class="container page-body">${directory}<div class="feature-band people-alumni"><div><h2>${e(L.heading.alumni)}</h2><p>${e(L.text.formerMembers)}</p></div>${primary('#/alumni',L.link.alumniDestinations,'agents','outline')}</div></div>`;
}
// Alumni rows tolerate unknown fields: a record without a graduation year,
// destination or location simply leaves that part out instead of printing "undefined".
function alumniRow(a,index){
  const L=S(), place=[pick(a.position),pick(a.location)].filter(Boolean).join(' · ');
  const degree=a.year?fill(L.labels.degreeLine,{degree:pick(a.degree)}):pick(a.degree);
  return `<article class="alumni-row" id="${e(targetId('alumni',index))}"><div class="grad-year">${a.year?`${e(a.year)}<small>${e(L.labels.graduation)}</small>`:'<span class="grad-year-unknown" aria-hidden="true">—</span>'}</div><div class="alumni-person">${avatar(a)}<div>${degree?`<p class="venue">${e(degree)}</p>`:''}<h3>${e(pick(a.name))}</h3>${recordLinks(a)}</div></div><div class="placement">${pick(a.destination)?`<strong>${e(pick(a.destination))}</strong>`:''}${place?`<p>${e(place)}</p>`:''}${a.source?external(a.source,L.link.yearbook):''}</div></article>`;
}
function alumni(){const L=S();return pageHead('alumni')+`<div class="container page-body"><div class="directory-heading"><h2>${e(L.heading.afterDocia)}</h2></div>${site.alumni.map(alumniRow).join('')}</div>`;}
function contact(){const c=site.contact,L=S();return pageHead('contact')+`<div class="container page-body contact-grid"><article><span class="contact-icon">${icon('mail',23)}</span><h2>${e(L.heading.writeToLab)}</h2><p>${e(c.name)} · ${e(L.labels.labDirector)}</p><a class="contact-mail" href="mailto:${e(c.email)}">${e(c.email)}</a><p>${external(c.profile,L.link.facultyHomepage)}</p></article><article><span class="contact-icon">${icon('location',23)}</span><h2>${e(L.heading.findUs)}</h2><address>${[c.school,pick(site.university),c.office,c.street,c.city].map(v=>e(pick(v))).join('<br>')}</address>${external(c.center,L.link.starCenter)}</article></div>`;}
function footer(){const L=S();return `<div class="container footer-content"><div class="footer-brand"><img alt="" src="./assets/mark.svg"><strong>${e(site.brand)}</strong></div><p>${e(pick(site.name))}<br>${e(pick(site.university))}</p><div><a href="#/people">${e(L.footer.people)}</a><a href="#/alumni">${e(L.footer.alumni)}</a><a href="#/gallery">${e(L.footer.moments)}</a><a href="#/contact">${e(L.footer.contact)}</a></div></div>`;}
document.querySelector('footer').innerHTML=footer();

function langSwitch(extraClass=''){
  const L=S();
  return `<span class="lang-switch${extraClass?' '+extraClass:''}" role="group" aria-label="${e(L.language)}">${LANGS.map(code=>`<button type="button" data-lang="${code}" aria-pressed="${code===lang}" aria-label="${e(code==='en'?L.english:L.chinese)}">${e(LABEL[code])}</button>`).join('')}</span>`;
}
function syncUrl(){
  const url=new URL(location.href);
  if(lang==='en')url.searchParams.delete('lang');else url.searchParams.set('lang',lang);
  history.replaceState(null,'',url);
}
function setLang(code){
  if(code===lang)return;
  rememberLang(code);useLang(code);lang=code;syncUrl();
  document.querySelector('footer').innerHTML=footer();
  render();
}
document.querySelector('.header-inner').addEventListener('click',ev=>{const button=ev.target.closest('[data-lang]');if(button)setLang(button.dataset.lang);});

// Scrolls to a record opened through a deep link (for example a search result)
// and flashes it briefly so the visitor can see what matched.
let flashTimer=0;
function revealTarget(detail){
  const target=detail?document.getElementById(detail):null;
  if(!target)return;
  target.setAttribute('tabindex','-1');
  target.classList.remove('is-search-target');
  void target.offsetWidth;
  target.classList.add('is-search-target');
  target.focus({preventScroll:true});
  target.scrollIntoView({block:'start',behavior:'instant'});
  clearTimeout(flashTimer);
  flashTimer=setTimeout(()=>target.classList.remove('is-search-target'),2600);
}

function setMeta(selector,value){
  const el=document.querySelector(selector);
  if(el)el.setAttribute('content',value);
}

// Keep the canonical link, language alternates, and social cards in sync with
// the active language. Hash routes all share one crawlable URL; see README §14.
function syncSeo(title,description){
  const base=(site.url||'').replace(/\/+$/,'');
  const canonical=document.querySelector('#canonical');
  if(!base||!canonical)return;
  const home=base+'/', isZh=lang==='zh';
  // Canonical tracks the URL, not just the detected UI language: the bare root
  // stays canonical for auto-detected Chinese, while an explicit ?lang=zh is a
  // separate crawlable URL referenced by hreflang and sitemap.xml.
  const url=new URLSearchParams(location.search).get('lang')==='zh'?home+'?lang=zh':home;
  canonical.href=url;
  for(const link of document.querySelectorAll('link[rel="alternate"][hreflang]')){
    link.href=link.getAttribute('hreflang')==='zh'?home+'?lang=zh':home;
  }
  setMeta('meta[property="og:url"]',url);
  setMeta('meta[property="og:title"]',title);
  setMeta('meta[property="og:description"]',description);
  setMeta('meta[property="og:locale"]',isZh?'zh_CN':'en_US');
  setMeta('meta[property="og:locale:alternate"]',isZh?'en_US':'zh_CN');
  setMeta('meta[name="twitter:title"]',title);
  setMeta('meta[name="twitter:description"]',description);
  const image=home+'assets/og-docia.jpg';
  setMeta('meta[property="og:image"]',image);
  setMeta('meta[property="og:image:secure_url"]',image);
  setMeta('meta[name="twitter:image"]',image);
}

function render(){
  const L=S();
  let [part='home',detail]=location.hash.replace(/^#\/?/,'').split('/');
  // The old #/simulation URL pointed at the home-page experiment. Keep old
  // bookmarks working by forwarding them to the demo's new research page.
  if(part==='simulation'&&!detail){
    history.replaceState(null,'','#/research/multi-agent-control');
    part='research';detail='multi-agent-control';
  }
  const inHome=['home',''].includes(part), id=inHome?'home':(part in site.pages?part:'home');
  closeMenu();
  skip.textContent=L.skip;
  nav.setAttribute('aria-label',L.navLabel);
  nav.innerHTML=site.navigation.map(n=>`<a class="${n.id==='contact'?'nav-contact':''}" href="#/${e(n.id)}" ${id===n.id?'aria-current="page"':''}>${n.id==='contact'?icon('mail',16):''}${e(pick(n.label))}</a>`).join('')+langSwitch('nav-lang');
  headerLang.innerHTML=langSwitch('header-lang-switch');
  brandschool.textContent=pick(site.university);
  document.querySelector('.brand').setAttribute('aria-label',`${site.brand} · ${pick(site.university)}`);
  const view=id+'/'+(detail||'')+'/'+lang;
  if(view!==active){
    for(const cleanup of cleanups)cleanup();cleanups=[];
    // A specific paper opened from search must be visible: clear any filters
    // that could hide it. Language switches keep the current selections.
    if(id==='publications'&&detail&&detail!==publicationDetail)pubFilters=emptyFilters();
    publicationDetail=id==='publications'?(detail||''):'';
    const pages={home,research:()=>research(detail),publications,people,alumni,gallery,news,honors,contact};
    main.innerHTML=pages[id]();
    if(id==='home')cleanups=[trackDescent()];
    else if(id==='research'){
      const direction=site.research.find(r=>r.id===detail);
      const demo=direction&&researchDemos[direction.demo];
      if(demo)cleanups=[demo.mount(main)];
    }
    if(active)main.focus({preventScroll:true});active=view;
  }
  const item=id==='research'?site.research.find(r=>r.id===detail):null;
  document.title=id==='home'
    ? (lang==='zh'?'DOCIA Lab · 分布式优化与控制 | 上海科技大学':'DOCIA Lab · Distributed Optimization & Control | ShanghaiTech')
    : pick(item?item.title:site.pages[id].title)+' · '+site.brand+' · '+pick(site.university);
  const desc=id==='home'?pick(site.hero.description):pick(item?item.short:site.pages[id].desc);
  const description=document.querySelector('meta[name="description"]');
  if(description)description.setAttribute('content',desc);
  syncSeo(document.title,desc);
  syncSearchChrome();
  if(detail&&['publications','people','alumni','gallery','news','honors'].includes(id))requestAnimationFrame(()=>revealTarget(detail));
  else window.scrollTo({top:0,behavior:'instant'});
}
window.addEventListener('hashchange',render);
document.addEventListener('click',ev=>{
  const a=ev.target.closest('a[href^="#/"]');
  if(a&&location.hash===a.hash){ev.preventDefault();render();}
});
main.addEventListener('error',event=>{
  const img=event.target;
  if(!(img instanceof HTMLImageElement))return;
  const frame=img.closest('.gallery-frame');
  if(frame){img.remove();frame.classList.add('is-missing');return;}
  const box=img.closest('.profile-art.has-photo,.avatar-sm');
  if(!box)return;
  box.classList.remove('has-photo');
  img.remove();
},true);
main.addEventListener('change',ev=>{
  const select=ev.target.closest('[data-pub-filter]');
  if(!select)return;
  pubFilters[select.dataset.pubFilter]=select.value;
  syncPublicationList();
});
main.addEventListener('click',ev=>{
  if(!ev.target.closest('[data-pub-reset]'))return;
  resetPublicationFilters();
  syncPublicationList();
  const first=main.querySelector('[data-pub-filter]');
  if(first)first.focus();
});
// Research pages put their experiment at the bottom. The jump button scrolls
// there without touching location.hash, which is reserved for the router.
main.addEventListener('click',ev=>{
  const jump=ev.target.closest('[data-scroll-to]');
  if(!jump)return;
  const target=document.getElementById(jump.dataset.scrollTo);
  if(!target)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
  const heading=target.querySelector('h2');
  if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}
});
mountSearch();
render();
