import {site} from './site.config.js';
import {icon,escapeHtml as e,eyebrow,initials,mediaUrl} from './ui.js';
import {terrain,trackDescent} from './terrain.js';
import {experiment,mountExperiment} from './experiment.js';

const main=document.querySelector('main'), nav=document.querySelector('nav');
const external=(url,label,cls='text-link')=>`<a class="${cls}" href="${e(url)}" target="_blank" rel="noopener noreferrer">${e(label)}</a>`;
const primary=(url,label,symbol,kind='primary')=>`<a class="btn ${kind}" href="${e(url)}">${icon(symbol,17)}${e(label)}</a>`;
const pageTitles={research:'Research',publications:'Selected publications',people:'People',alumni:'Alumni destinations',gallery:'Lab moments',contact:'Contact'};
let cleanups=[], active='';
const menu=document.querySelector('#menu-toggle');
function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');menu.innerHTML=icon('menu',23);nav.classList.remove('open');}
closeMenu();
menu.onclick=()=>{if(nav.classList.contains('open')){closeMenu();return;}nav.classList.add('open');menu.setAttribute('aria-expanded','true');menu.setAttribute('aria-label','Close navigation');menu.innerHTML=icon('close',23);};
document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});
document.addEventListener('click',ev=>{if(!ev.composedPath().includes(menu)&&!ev.composedPath().includes(nav))closeMenu();});
document.querySelector('.skip').onclick=ev=>{ev.preventDefault();main.focus();main.scrollIntoView();};
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
function cards(){return `<div class="research-grid">${site.research.map(r=>`<a href="#/research/${e(r.id)}" class="research-card">${researchArt(r.icon)}<div><h3>${e(r.title)}</h3><p>${e(r.short)}</p></div></a>`).join('')}</div>`;}
function paper(p){return `<article class="paper-row" id="paper-${e(p.id)}"><span class="paper-year">${e(p.year)}</span><div><p class="venue">${e(p.venue)}</p><h3>${external(p.url,p.title,'paper-title')}</h3><p class="authors">${e(p.authors)}</p></div>${external(p.url,'View paper','paper-link')}</article>`;}
function portrait(person){
  const src=mediaUrl(person.photo,site.media?.people);
  return `<div class="profile-art${src?' has-photo':''}"${src?'':' aria-hidden="true"'}>${researchArt('contour')}<span>${e(initials(person.name))}</span>${src?`<img src="${e(src)}" alt="${e(person.name)} portrait" loading="lazy" decoding="async">`:''}</div>`;
}
function avatar(person){
  const src=mediaUrl(person.photo,site.media?.alumni||site.media?.people);
  return `<span class="avatar-sm"${src?'':' aria-hidden="true"'}><span>${e(initials(person.name))}</span>${src?`<img src="${e(src)}" alt="${e(person.name)} portrait" loading="lazy" decoding="async">`:''}</span>`;
}
function recordLinks(person){
  const links=[];
  if(person.url)links.push(external(person.url,person.urlLabel||'Homepage'));
  if(person.email)links.push(`<a class="text-link" href="mailto:${e(person.email)}">${e(person.email)}</a>`);
  return links.length?`<div class="record-links">${links.join('')}</div>`:'';
}
function galleryCard(g){
  const src=mediaUrl(g.photo,site.media?.gallery);
  return `<figure class="gallery-card"><div class="gallery-frame">${src?`<img src="${e(src)}" alt="${e(g.alt||g.title||'Lab photo')}" loading="lazy" decoding="async">`:''}</div><figcaption>${g.date?`<p class="gallery-meta">${e(g.date)}</p>`:''}<h3>${e(g.title||'Lab moment')}</h3>${g.caption?`<p class="gallery-caption">${e(g.caption)}</p>`:''}${g.credit?`<p class="gallery-credit">Photo: ${e(g.credit)}</p>`:''}</figcaption></figure>`;
}
function pageHead(id,desc){return `<div class="subhead"><div class="container">${eyebrow(site.brand+' / '+site.university)}<h1>${e(pageTitles[id])}</h1><p>${e(desc)}</p></div></div>`;}
function home(){return `<section class="hero"><div class="container hero-inner"><div class="hero-copy">${eyebrow(site.university)}<h1>${site.hero.lines.map((l,i)=>i===site.hero.lines.length-1?`<em>${e(l)}</em>`:`<span>${e(l)}</span>`).join('')}</h1><p>${e(site.hero.description)}</p><div class="hero-actions">${primary('#/research','Explore research','book')}${primary('#/simulation','Try the simulation','network','outline')}</div></div>${terrain()}</div></section>
    ${experiment()}<section class="research-section"><div class="container"><div class="section-head"><div>${eyebrow('Research directions')}<h2>What we study</h2></div><a href="#/research" class="text-link">Explore all research</a></div>${cards()}</div></section>
    <section class="container home-pubs"><div class="section-head"><div>${eyebrow('Research output')}<h2>Selected publications</h2></div><a href="#/publications" class="text-link">All publications</a></div>${site.publications.slice(0,2).map(paper).join('')}</section>${homeMoments()}`;}
function homeMoments(){
  const items=(site.gallery||[]).slice(0,3);
  if(!items.length)return '';
  return `<section class="container home-moments"><div class="section-head"><div>${eyebrow('Lab moments')}<h2>Life at DOCIA</h2></div><a href="#/gallery" class="text-link">View all moments</a></div><div class="gallery-grid">${items.map(galleryCard).join('')}</div></section>`;
}
function gallery(){
  const items=site.gallery||[];
  return pageHead('gallery','Gatherings, retreats, and everyday life in the lab.')+`<div class="container page-body">${items.length?`<div class="gallery-grid">${items.map(galleryCard).join('')}</div>`:`<div class="empty-state"><h2>Photos coming soon</h2><p>Group photos from lab gatherings will appear here once they are published.</p></div>`}</div>`;
}
function research(detail){
  const item=site.research.find(r=>r.id===detail);
  if(item)return `<div class="subhead"><div class="container">${eyebrow('Research direction')}<h1>${e(item.title)}</h1><p>${e(item.short)}</p></div></div><div class="container reading"><a href="#/research" class="text-link">All research directions</a><div class="reading-art">${researchArt(item.icon)}</div><h2>${e(item.question)}</h2><p>${e(item.detail)}</p><h3 class="minor-title">Related publication</h3>${site.publications.filter(p=>p.id===item.paper).map(paper).join('')}${primary('#/simulation','Try the simulation','network')}</div>`;
  return pageHead('research','How can a network solve a problem when each agent sees only a part of it?')+`<div class="container page-body">${cards()}<div class="feature-band"><div>${eyebrow('Interactive experiment')}<h2>Local updates in action</h2><p>See how communication links change the speed of load balancing.</p></div>${primary('#/simulation','Open playground','network')}</div></div>`;
}
function publications(){return pageHead('publications','Journal articles on distributed optimization, constraints, and consensus.')+`<div class="container page-body"><div class="source-line"><span>Selected journal articles</span>${external(site.contact.profile,'Faculty publication list')}</div>${site.publications.map(paper).join('')}</div>`;}
function people(){return pageHead('people','The researchers behind DOCIA’s work in optimization and control.')+`<div class="container page-body"><div class="directory-heading">${eyebrow('Group directory')}<h2>Lab members</h2></div>${site.people.map(p=>`<article class="person-record">${portrait(p)}<div><p class="venue">${e(p.role)}</p><h3>${e(p.name)}</h3><p>${e(p.affiliation)} · ${e(site.university)}</p><p>${e(p.description)}</p>${recordLinks(p)}</div></article>`).join('')}<div class="feature-band"><div><h2>Former members</h2><p>Explore where DOCIA graduates went after the lab.</p></div>${primary('#/alumni','Alumni destinations','agents','outline')}</div></div>`;}
function alumni(){return pageHead('alumni','Selected first appointments after graduation from the lab.')+`<div class="container page-body"><div class="directory-heading">${eyebrow('Graduate destinations')}<h2>After DOCIA</h2></div>${site.alumni.map(a=>`<article class="alumni-row"><div class="grad-year">${e(a.year)}<small>Graduation</small></div><div class="alumni-person">${avatar(a)}<div><p class="venue">${e(a.degree)} graduate</p><h3>${e(a.name)}</h3>${recordLinks(a)}</div></div><div class="placement"><strong>${e(a.destination)}</strong><p>${e(a.position)} · ${e(a.location)}</p>${a.source?external(a.source,'SIST graduate yearbook'):''}</div></article>`).join('')}</div>`;}
function contact(){const c=site.contact;return pageHead('contact','Contact the lab about research, collaboration, and graduate study.')+`<div class="container page-body contact-grid"><article><span class="contact-icon">${icon('mail',23)}</span><h2>Write to the lab</h2><p>${e(c.name)} · Lab Director</p><a class="contact-mail" href="mailto:${e(c.email)}">${e(c.email)}</a><p>${external(c.profile,'Faculty homepage')}</p></article><article><span class="contact-icon">${icon('location',23)}</span><h2>Find us on campus</h2><address>${[c.school,site.university,c.office,c.street,c.city].map(e).join('<br>')}</address>${external(c.center,'STAR Center directory')}</article></div>`;}
function footer(){return `<div class="container footer-content"><div class="footer-brand"><img alt="" src="./assets/mark.svg"><strong>${e(site.brand)}</strong></div><p>${e(site.name)}<br>${e(site.university)} · Homepage demo</p><div><a href="#/people">People</a><a href="#/alumni">Alumni</a><a href="#/gallery">Moments</a><a href="#/contact">Contact</a></div></div>`;}
document.querySelector('footer').innerHTML=footer();
function render(){
  const [part='home',detail]=location.hash.replace(/^#\/?/,'').split('/');
  const inHome=['home','simulation',''].includes(part), id=inHome?'home':(part in pageTitles?part:'home');
  closeMenu();
  nav.innerHTML=site.navigation.map(n=>`<a class="${n.id==='contact'?'nav-contact':''}" href="#/${e(n.id)}" ${id===n.id?'aria-current="page"':''}>${n.id==='contact'?icon('mail',16):''}${e(n.label)}</a>`).join('');
  const view=id==='home'?'home':id+'/'+(detail||'');
  if(view!==active){
    for(const cleanup of cleanups)cleanup();cleanups=[];
    const pages={home,research:()=>research(detail),publications,people,alumni,gallery,contact};
    main.innerHTML=pages[id]();
    if(id==='home')cleanups=[trackDescent(),mountExperiment()];
    if(active)main.focus({preventScroll:true});active=view;
  }
  document.title=(id==='home'?'':pageTitles[id]+' · ')+site.brand+' · '+site.university;
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
  const box=img.closest('.profile-art.has-photo,.avatar-sm');
  if(!box)return;
  box.classList.remove('has-photo');
  img.remove();
},true);
render();
