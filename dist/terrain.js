import {descent} from './assets/descent.js';
import {icon} from './ui.js';
import {S} from './i18n.js';
const first=descent[0], last=descent.at(-1);
const xy = (p)=>p.slice(0,2).join(',');
const d = 'M'+descent.map(xy).join(' L');
const distances=[0];
for(let i=1;i<descent.length;i++) distances.push(distances.at(-1)+Math.hypot(descent[i][0]-descent[i-1][0],descent[i][1]-descent[i-1][1]));
const length=distances.at(-1);
export function terrain(){
  const samples=[1,3,5,7,10,14,19], L=S().terrain;
  return `<figure class="terrain" aria-label="${L.figureAria}">
    <div class="figure-field"><div class="figure-label"><span class="tiny-square"></span> ${L.objective}</div>
    <svg class="surface" viewBox="0 0 660 460" role="img" aria-label="${L.surfaceAria}">
      <defs><pattern id="plot-grid" width="23" height="23" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.75" fill="#568f88" opacity=".52"/></pattern></defs>
      <rect x="0" y="0" width="660" height="460" fill="url(#plot-grid)" opacity=".55"/>
      <g transform="translate(31,4)">
        <g class="axes" fill="none" stroke="#6b9791" stroke-dasharray="3.5 4" stroke-width="1">
         <path d="M19 320 L19 143 M19 320 L348 423 L587 280"/>
        </g>
        <image href="./assets/landscape.webp" width="600" height="420"/>
        <path d="${d}" fill="none" stroke="#e7f6df" stroke-width="4" opacity=".85"/>
        <path d="${d}" fill="none" stroke="#165b50" stroke-width="2" stroke-dasharray="4 3"/>
        ${samples.map(i=>`<circle cx="${descent[i][0]}" cy="${descent[i][1]}" r="3.2" fill="#216c57" stroke="#e4f5d9" stroke-width="1.1"/>`).join('')}
        <circle cx="${first[0]}" cy="${first[1]}" r="4.5" fill="#175345" stroke="#e8f6e4" stroke-width="1.8"/>
        <g stroke="#326e61" fill="none"><path d="M${first[0]+5} ${first[1]-3} l20 -18 h38"/><path d="M307 278 l35 -16 h31"/></g>
        <text x="${first[0]+50}" y="${first[1]-25}" class="math-label">x₀</text><text x="375" y="266" class="math-label">x*</text>
        <circle cx="${last[0]}" cy="${last[1]}" r="7" fill="#eef7df" stroke="#14594b" stroke-width="1.8"/><circle cx="${last[0]}" cy="${last[1]}" r="2.8" fill="#12634c"/>
        <g id="iterate" transform="translate(${xy(first)})"><circle r="9" fill="#d6f6c6" stroke="#145949" stroke-width="1.7"/><circle r="4.1" fill="#12604e"/></g>
        <g class="axis-text"><text x="4" y="139">f(x)</text><text x="154" y="382">x₁</text><text x="494" y="353">x₂</text></g>
      </g>
    </svg></div>
    <figcaption><span class="fig-key"><i class="path-key"></i>${L.descentPath}</span><span class="fig-key"><i class="opt-key"></i>${L.optimum}</span><span class="scroll-hint">${icon('scroll',14)}<span id="scroll-label">${L.scroll}</span></span></figcaption>
  </figure>`;
}
export function trackDescent(){
  const field=document.querySelector('.figure-field'), marker=document.querySelector('#iterate'), label=document.querySelector('#scroll-label'), L=S().terrain;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let raf=0;
  function paint(){
    raf=0;
    const bounds=field.getBoundingClientRect();
    const start=Math.max(0,window.scrollY+bounds.top-window.innerHeight*.6);
    const finish=Math.max(start+110,window.scrollY+bounds.top+bounds.height*.44-75);
    const p=Math.min(1,Math.max(0,(window.scrollY-start)/(finish-start)));
    const target=(reduced?1:p)*length;
    const i=distances.findIndex(v=>v>=target);
    const a=descent[Math.max(0,i-1)], b=descent[i], span=distances[i]-(distances[i-1]||0);
    const t=span?(target-distances[i-1])/span:0;
    marker.setAttribute('transform',`translate(${a[0]+(b[0]-a[0])*t},${a[1]+(b[1]-a[1])*t})`);
    label.textContent=p>=1||reduced?L.atOptimum:L.scroll;
  }
  function update(){if(!raf) raf=requestAnimationFrame(paint);}
  paint(); window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);
  return ()=>{window.removeEventListener('scroll',update);window.removeEventListener('resize',update);cancelAnimationFrame(raf);};
}
