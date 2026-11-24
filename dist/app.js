import {site} from './site.config.js';
import {icon,escapeHtml as e,eyebrow,initials,mediaUrl} from './ui.js';
import {terrain,trackDescent} from './terrain.js';
import {experiment,mountExperiment} from './experiment.js';
import {LANGS,LABEL,S,pick,currentLang,useLang,initialLang,rememberLang,fill} from './i18n.js';

const main=document.querySelector('main'), nav=document.querySelector('nav'), skip=document.querySelector('.skip');
const external=(url,label,cls='text-link')=>`<a class="${cls}" href="${e(url)}" target="_blank" rel="noopener noreferrer">${e(label)}</a>`;
const primary=(url,label,symbol,kind='primary')=>`<a class="btn ${kind}" href="${e(url)}">${icon(symbol,17)}${e(label)}</a>`;
const other=s=>`<div class="container page-body"><div class="empty-state"><h2>${e(s.title)}</h2><p>${e(s.text)}</p></div></div>`;
let cleanups=[], active='', lang=useLang(initialLang());

const menu=document.querySelector('#menu-toggle');
function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label',S().openNav);menu.innerHTML=icon('menu',23);nav.classList.remove('open');}
menu.onclick=()=>{if(nav.classList.contains('open')){closeMenu();return;}nav.classList.add('open');menu.setAttribute('aria-expanded','true');menu.setAttribute('aria-label',S().closeNav);menu.innerHTML=icon('close',23);};
document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});
document.addEventListener('click',ev=>{if(!ev.composedPath().includes(menu)&&!ev.composedPath().includes(nav))closeMenu();});
skip.onclick=ev=>{ev.preventDefault();main.focus();main.scrollIntoView();};
for(const [key,value] of Object.entries(site.palette))document.documentElement.style.setProperty('--'+key,value);
document.querySelector('#brandname').textContent=site.brand;

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
const portraitAlt=person=>fill(S().labels.portraitAlt,{name:person.name});
function cards(){return `<div class="research-grid">${site.research.map(r=>`<a href="#/research/${e(r.id)}" class="research-card">${researchArt(r.icon)}<div><h3>${e(pick(r.title))}</h3><p>${e(pick(r.short))}</p></div></a>`).join('')}</div>`;}
function paper(p){return `<article class="paper-row" id="paper-${e(p.id)}"><span class="paper-year">${e(p.year)}</span><div><p class="venue">${e(p.venue)}</p><h3>${external(p.url,p.title,'paper-title')}</h3><p class="authors">${e(p.authors)}</p></div>${external(p.url,S().link.viewPaper,'paper-link')}</article>`;}
function portrait(person){
  const src=mediaUrl(person.photo,site.media?.people);
  return `<div class="profile-art${src?' has-photo':''}"${src?'':' aria-hidden="true"'}>${researchArt('contour')}<span aria-hidden="true">${e(initials(person.name))}</span>${src?`<img src="${e(src)}" alt="${e(portraitAlt(person))}" loading="lazy" decoding="async">`:''}</div>`;
}
function avatar(person){
  const src=mediaUrl(person.photo,site.media?.alumni||site.media?.people);
  return `<span class="avatar-sm${src?' has-photo':''}"${src?'':' aria-hidden="true"'}><span aria-hidden="true">${e(initials(person.name))}</span>${src?`<img src="${e(src)}" alt="${e(portraitAlt(person))}" loading="lazy" decoding="async">`:''}</span>`;
}
function recordLinks(person){
  const links=[];
  if(person.url)links.push(external(person.url,pick(person.urlLabel)||S().link.homepage));
  if(person.email)links.push(`<a class="text-link" href="mailto:${e(person.email)}">${e(person.email)}</a>`);
  return links.length?`<div class="record-links">${links.join('')}</div>`:'';
}
function galleryCard(g){
  const src=mediaUrl(g.photo,site.media?.gallery), L=S();
  return `<figure class="gallery-card"><div class="gallery-frame">${src?`<img src="${e(src)}" alt="${e(pick(g.alt)||pick(g.title)||L.labels.labMoment)}" loading="lazy" decoding="async">`:''}</div><figcaption>${pick(g.date)?`<p class="gallery-meta">${e(pick(g.date))}</p>`:''}<h3>${e(pick(g.title)||L.labels.labMoment)}</h3>${pick(g.caption)?`<p class="gallery-caption">${e(pick(g.caption))}</p>`:''}${pick(g.credit)?`<p class="gallery-credit">${e(L.labels.photoCredit)}${e(pick(g.credit))}</p>`:''}</figcaption></figure>`;
}
function pageHead(id,title){return `<div class="subhead"><div class="container">${eyebrow(site.brand+' / '+pick(site.university))}<h1>${e(title||pick(site.pages[id].title))}</h1><p>${e(pick(site.pages[id].desc))}</p></div></div>`;}
function home(){
  const L=S(), lines=pick(site.hero.lines);
  return `<section class="hero"><div class="container hero-inner"><div class="hero-copy">${eyebrow(pick(site.university))}<h1>${lines.map((l,i)=>i===lines.length-1?`<em>${e(l)}</em>`:`<span>${e(l)}</span>`).join('')}</h1><p>${e(pick(site.hero.description))}</p><div class="hero-actions">${primary('#/research',L.link.exploreResearch,'book')}${primary('#/simulation',L.link.trySimulation,'network','outline')}</div></div>${terrain()}</div></section>
    ${experiment()}<section class="research-section"><div class="container"><div class="section-head"><div>${eyebrow(L.eyebrow.researchDirections)}<h2>${e(L.heading.whatWeStudy)}</h2></div><a href="#/research" class="text-link">${e(L.link.exploreAll)}</a></div>${cards()}</div></section>
    <section class="container home-pubs"><div class="section-head"><div>${eyebrow(L.eyebrow.researchOutput)}<h2>${e(L.heading.selectedPublications)}</h2></div><a href="#/publications" class="text-link">${e(L.link.allPublications)}</a></div>${site.publications.slice(0,2).map(paper).join('')}</section>${homeMoments()}`;
}
function homeMoments(){
  const L=S(), items=(site.gallery||[]).slice(0,3);
  if(!items.length)return '';
  return `<section class="container home-moments"><div class="section-head"><div>${eyebrow(L.eyebrow.labMoments)}<h2>${e(L.heading.lifeAtDocia)}</h2></div><a href="#/gallery" class="text-link">${e(L.link.viewAllMoments)}</a></div><div class="gallery-grid">${items.map(galleryCard).join('')}</div></section>`;
}
function gallery(){
  const L=S(), items=site.gallery||[];
  return pageHead('gallery')+(items.length?`<div class="container page-body"><div class="gallery-grid">${items.map(galleryCard).join('')}</div></div>`:other({title:L.empty.photosTitle,text:L.empty.photosText}));
}
function news(){
  const L=S(), items=site.news||[];
  if(!items.length)return pageHead('news')+other({title:L.empty.newsTitle,text:L.empty.newsText});
  return pageHead('news')+`<div class="container page-body"><ol class="news-list">${items.map(n=>`<li class="news-item"><span class="news-date">${e(pick(n.date))}</span><p class="news-text">${n.url?external(n.url,pick(n.text)+' ↗','news-link'):e(pick(n.text))}</p></li>`).join('')}</ol></div>`;
}
function honors(){
  const L=S(), items=site.honors||[];
  if(!items.length)return pageHead('honors')+other({title:L.empty.honorsTitle,text:L.empty.honorsText});
  return pageHead('honors')+`<div class="container page-body"><ol class="honors-list">${items.map(h=>`<li class="honor-item"><span class="honor-year">${e(h.year)}</span><div class="honor-body"><h3>${e(pick(h.title))}</h3>${pick(h.recipient)?`<p>${e(pick(h.recipient))}</p>`:''}${pick(h.note)?`<p class="honor-note">${e(pick(h.note))}</p>`:''}</div></li>`).join('')}</ol></div>`;
}
function research(detail){
  const L=S(), item=site.research.find(r=>r.id===detail);
  if(item)return `<div class="subhead"><div class="container">${eyebrow(L.eyebrow.researchDirection)}<h1>${e(pick(item.title))}</h1><p>${e(pick(item.short))}</p></div></div><div class="container reading"><a href="#/research" class="text-link">${e(L.link.allDirections)}</a><div class="reading-art">${researchArt(item.icon)}</div><h2>${e(pick(item.question))}</h2><p>${e(pick(item.detail))}</p><h3 class="minor-title">${e(L.heading.relatedPublication)}</h3>${site.publications.filter(p=>p.id===item.paper).map(paper).join('')}${primary('#/simulation',L.link.trySimulation,'network')}</div>`;
  return pageHead('research')+`<div class="container page-body">${cards()}<div class="feature-band"><div>${eyebrow(L.eyebrow.interactive)}<h2>${e(L.heading.localUpdates)}</h2><p>${e(L.text.localUpdates)}</p></div>${primary('#/simulation',L.link.openPlayground,'network')}</div></div>`;
}
function publications(){const L=S();return pageHead('publications')+`<div class="container page-body"><div class="source-line"><span>${e(L.text.selectedPapers)}</span>${external(site.contact.profile,L.link.facultyPublications)}</div>${site.publications.map(paper).join('')}</div>`;}
function people(){const L=S();return pageHead('people')+`<div class="container page-body"><div class="directory-heading">${eyebrow(L.eyebrow.groupDirectory)}<h2>${e(L.heading.labMembers)}</h2></div>${site.people.map(p=>`<article class="person-record">${portrait(p)}<div><p class="venue">${e(pick(p.role))}</p><h3>${e(p.name)}</h3><p>${e(pick(p.affiliation))} · ${e(pick(site.university))}</p><p>${e(pick(p.description))}</p>${recordLinks(p)}</div></article>`).join('')}<div class="feature-band"><div><h2>${e(L.heading.formerMembers)}</h2><p>${e(L.text.formerMembers)}</p></div>${primary('#/alumni',L.link.alumniDestinations,'agents','outline')}</div></div>`;}
function alumni(){const L=S();return pageHead('alumni')+`<div class="container page-body"><div class="directory-heading">${eyebrow(L.eyebrow.graduateDestinations)}<h2>${e(L.heading.afterDocia)}</h2></div>${site.alumni.map(a=>`<article class="alumni-row"><div class="grad-year">${e(a.year)}<small>${e(L.labels.graduation)}</small></div><div class="alumni-person">${avatar(a)}<div><p class="venue">${e(fill(L.labels.degreeLine,{degree:pick(a.degree)}))}</p><h3>${e(a.name)}</h3>${recordLinks(a)}</div></div><div class="placement"><strong>${e(pick(a.destination))}</strong><p>${e(pick(a.position))} · ${e(pick(a.location))}</p>${a.source?external(a.source,L.link.yearbook):''}</div></article>`).join('')}</div>`;}
function contact(){const c=site.contact,L=S();return pageHead('contact')+`<div class="container page-body contact-grid"><article><span class="contact-icon">${icon('mail',23)}</span><h2>${e(L.heading.writeToLab)}</h2><p>${e(c.name)} · ${e(L.labels.labDirector)}</p><a class="contact-mail" href="mailto:${e(c.email)}">${e(c.email)}</a><p>${external(c.profile,L.link.facultyHomepage)}</p></article><article><span class="contact-icon">${icon('location',23)}</span><h2>${e(L.heading.findUs)}</h2><address>${[c.school,pick(site.university),c.office,c.street,c.city].map(v=>e(pick(v))).join('<br>')}</address>${external(c.center,L.link.starCenter)}</article></div>`;}
function footer(){const L=S();return `<div class="container footer-content"><div class="footer-brand"><img alt="" src="./assets/mark.svg"><strong>${e(site.brand)}</strong></div><p>${e(pick(site.name))}<br>${e(pick(site.university))} · ${e(L.footer.tagline)}</p><div><a href="#/people">${e(L.footer.people)}</a><a href="#/alumni">${e(L.footer.alumni)}</a><a href="#/gallery">${e(L.footer.moments)}</a><a href="#/contact">${e(L.footer.contact)}</a></div></div>`;}
document.querySelector('footer').innerHTML=footer();

function langSwitch(){
  const L=S();
  return `<span class="lang-switch" role="group" aria-label="${e(L.language)}">${LANGS.map(code=>`<button type="button" data-lang="${code}" aria-pressed="${code===lang}" aria-label="${e(code==='en'?L.english:L.chinese)}">${e(LABEL[code])}</button>`).join('')}</span>`;
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
  active='';render();
}
nav.addEventListener('click',ev=>{const button=ev.target.closest('[data-lang]');if(button)setLang(button.dataset.lang);});

function render(){
  const L=S(), [part='home',detail]=location.hash.replace(/^#\/?/,'').split('/');
  const inHome=['home','simulation',''].includes(part), id=inHome?'home':(part in site.pages?part:'home');
  closeMenu();
  skip.textContent=L.skip;
  nav.setAttribute('aria-label',L.navLabel);
  nav.innerHTML=site.navigation.map(n=>`<a class="${n.id==='contact'?'nav-contact':''}" href="#/${e(n.id)}" ${id===n.id?'aria-current="page"':''}>${n.id==='contact'?icon('mail',16):''}${e(pick(n.label))}</a>`).join('')+langSwitch();
  const view=id+'/'+(detail||'')+'/'+lang;
  if(view!==active){
    for(const cleanup of cleanups)cleanup();cleanups=[];
    const pages={home,research:()=>research(detail),publications,people,alumni,gallery,news,honors,contact};
    main.innerHTML=pages[id]();
    if(id==='home')cleanups=[trackDescent(),mountExperiment()];
    if(active)main.focus({preventScroll:true});active=view;
  }
  const item=id==='research'?site.research.find(r=>r.id===detail):null;
  document.title=(id==='home'?'':pick(item?item.title:site.pages[id].title)+' · ')+site.brand+' · '+pick(site.university);
  const description=document.querySelector('meta[name="description"]');
  if(description)description.setAttribute('content',id==='home'?pick(site.hero.description):pick(item?item.short:site.pages[id].desc));
  if(part==='simulation')requestAnimationFrame(()=>document.querySelector('#simulation').scrollIntoView({behavior:'instant'}));
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
render();
