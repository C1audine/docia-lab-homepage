import {site} from './site.config.js';
import {icon} from './ui.js';
import {S,fill} from './i18n.js';
import {layouts,edgesFor,mean,simulate} from './model.js';
const options=site.experiment;
const names=Object.keys(layouts);
const nodeName=i=>'N'+String(i+1).padStart(2,'0');
export function experiment(){
  const L=S().experiment;
  return `<section class="experiment-section container" id="simulation">
   <div class="section-head"><div><h2>${L.title}</h2></div><div class="sim-actions"><button id="run" class="btn primary"></button><button id="reset" class="square-btn" aria-label="${L.restart}" title="${L.restart}">${icon('reset')}</button></div></div>
   <p class="section-intro">${L.intro}</p>
   <div class="console"><div class="network-pane">
    <div class="panel-head"><h3>${icon('network',20)}${L.networkTitle}</h3><select id="topology" aria-label="${L.topologyLabel}">${names.map(n=>`<option>${n}</option>`).join('')}</select></div>
    <div class="net-board"><svg class="network-svg" id="network" viewBox="0 0 480 235" role="group" aria-label="${L.networkAria}"></svg><div class="board-foot"><span><i class="dot-key"></i>${L.edgeServer}</span><span><i class="line-key"></i>${L.link}</span></div></div>
    <div class="load-controls"><label for="node-pick">${L.initialLoad}</label><select id="node-pick" aria-label="${L.selectedServer}">${options.initialLoads.map((_,i)=>`<option value="${i}">${nodeName(i)}</option>`).join('')}</select><input id="load" type="range" min="0" max="${Math.round(options.capacity*1.5)}" step="1" aria-label="${L.loadLabel}"><output id="load-val" for="load"></output></div>
   </div><div class="curve-pane">
    <div class="panel-head"><h3>${icon('chart',20)}${L.convergence}</h3><span class="round" id="round"></span></div>
    <div class="chart-wrap"><p class="chart-title">${L.chartTitle} <span>${L.chartUnit}</span></p><svg viewBox="0 0 430 173" id="curve" role="img" aria-label="${L.chartAria}"></svg><div class="curve-legend" id="curve-legend"></div></div>
    <div class="stats"><div><span>${L.efficiency}</span><strong id="efficiency"></strong></div><div><span>${L.withinCapacity}</span><strong id="capacity"></strong></div><div><span>${L.roundsToBalance}</span><strong id="balanced"></strong></div></div>
   </div></div>
   <details class="method"><summary>${L.howTitle}</summary><div><p>${fill(L.howP1,{capacity:options.capacity})}</p><p>${fill(L.howP2,{i:'<i>i</i>',j:'<i>j</i>',d:'<i>d</i>'})}</p><p>${fill(L.howP3,{tolerance:options.tolerance,capacity:options.capacity})}</p></div></details>
  </section>`;
}
export function mountExperiment(){
  const el=id=>document.getElementById(id), L=S().experiment;
  let initial=options.initialLoads.slice(), topology=options.topology, selected=0, k=options.previewRound, timer=null, run, ref, refName;
  function compute(){run=simulate(initial,topology,options.tolerance);refName=topology==='Ring'?'Mesh':'Ring';ref=simulate(initial,refName,options.tolerance);k=Math.min(k,run.states.length-1);}
  function stop(){if(timer)clearInterval(timer);timer=null;}
  function makeNetwork(){
    const coords=layouts[topology], states=run.states[k], cap=options.capacity;
    const edges=edgesFor(topology).map(([a,b])=>`<line x1="${coords[a][0]}" y1="${coords[a][1]}" x2="${coords[b][0]}" y2="${coords[b][1]}" stroke="${a===selected||b===selected?'#67a98f':'#99bdb0'}" stroke-width="1.6"/>`).join('');
    const nodes=coords.map(([x,y],i)=>{
      const radius=6+5*Math.min(1.5,states[i]/cap);
      const color=i===selected?'#128365':states[i] > cap?'#174b59':i%3===1?'var(--sky)':'#278c75';
      return `<g class="server" role="button" tabindex="0" aria-pressed="${i===selected}" aria-label="${nodeName(i)} · ${states[i].toFixed(1)}" data-node="${i}" transform="translate(${x} ${y})"><title>${nodeName(i)} · ${states[i].toFixed(1)}</title><circle r="21" fill="transparent"/><circle class="halo" r="${radius+5}" fill="${i===selected?'#d3eddf':'#e1eee8'}" stroke="${i===selected?'#7bbda3':'#c4dad0'}"/><circle r="${radius}" fill="${color}" stroke="white" stroke-width="1.5"/><circle r="2.5" fill="#eaffef"/><text class="node-tag" text-anchor="middle" y="${radius+22}">${nodeName(i)} · ${states[i].toFixed(1)}</text></g>`;
    }).join('');
    const focused=document.activeElement?.getAttribute('data-node');
    el('network').innerHTML=edges+nodes;
    if(focused!=null)el('network').querySelector('[data-node="'+focused+'"]')?.focus({preventScroll:true});
  }
  function chart(){
    const x0=34,y0=12,w=379,h=118;
    const horizon=Math.max(12,Math.ceil(Math.max(run.errors.length-1,ref.errors.length-1)/4)*4);
    const ymax=Math.max(1,Math.ceil(run.errors[0]/3)*3);
    const xx=i=>x0+w*i/horizon, yy=e=>y0+h-h*e/ymax;
    const pts=values=>values.map((e,i)=>`${xx(i).toFixed(2)},${yy(e).toFixed(2)}`).join(' ');
    let grid='';
    for(let i=0;i<=3;i++){const y=y0+h*i/3;grid+=`<line class="gridline" x1="${x0}" y1="${y}" x2="${x0+w}" y2="${y}"/><text x="${x0-8}" y="${y+4}" text-anchor="end">${Math.round(ymax*(3-i)/3)}</text>`;}
    for(let i=0;i<=4;i++){grid+=`<text x="${xx(horizon*i/4)}" y="${y0+h+18}" text-anchor="middle">${horizon*i/4}</text>`;}
    const data=run.errors.slice(0,k+1);
    el('curve').innerHTML=`<defs><linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#70c4a5" stop-opacity=".36"/><stop offset="1" stop-color="#70c4a5" stop-opacity=".03"/></linearGradient></defs>${grid}<polygon points="${x0},${y0+h} ${pts(data)} ${xx(k)},${y0+h}" fill="url(#chart-fill)"/><polyline points="${pts(ref.errors)}" fill="none" stroke="#63aaba" stroke-width="2" stroke-dasharray="5 4"/><polyline points="${pts(data)}" fill="none" stroke="#198566" stroke-width="2.8" stroke-linejoin="round"/><circle cx="${xx(k)}" cy="${yy(data.at(-1))}" r="4.1" fill="#198566" stroke="white" stroke-width="1.7"/><text x="218" y="170" text-anchor="middle">${L.communicationRound}</text>`;
    el('curve-legend').innerHTML=`<span><i class="line-key strong"></i>${topology}</span><span><i class="line-key dashed"></i>${refName} ${L.reference}</span>`;
  }
  function paint(){
    const v=run.states[k], peak=Math.max(...v), finished=k===run.states.length-1;
    el('topology').value=topology;el('node-pick').value=selected;
    el('load').value=initial[selected];el('load-val').textContent=initial[selected]+' u';
    el('run').innerHTML=icon(timer?'pause':'play',15)+(timer?L.pause:finished?L.replay:L.run);
    el('round').textContent=fill(L.round,{n:String(k).padStart(2,'0')});
    el('efficiency').textContent=(peak?100*mean(v)/peak:100).toFixed(1)+'%';
    el('capacity').textContent=v.filter(x=>x<=options.capacity+1e-9).length+' / '+v.length;
    el('balanced').textContent=(run.states.length-1)+' '+L.rounds;
    makeNetwork();chart();
  }
  function pick(i){selected=i;paint();}
  el('network').addEventListener('click',e=>{const node=e.target.closest('[data-node]');if(node)pick(+node.dataset.node);});
  el('network').addEventListener('keydown',e=>{const node=e.target.closest('[data-node]');if(node&&['Enter',' '].includes(e.key)){e.preventDefault();pick(+node.dataset.node);}});
  el('node-pick').onchange=e=>pick(+e.target.value);
  el('load').oninput=e=>{stop();initial[selected]=+e.target.value;k=0;compute();paint();};
  el('topology').onchange=e=>{stop();topology=e.target.value;k=0;compute();paint();};
  el('reset').onclick=()=>{stop();k=0;paint();};
  el('run').onclick=()=>{
    if(timer) stop();
    else {
      if(k===run.states.length-1)k=0;
      if(run.states.length>1)timer=setInterval(()=>{k++;if(k>=run.states.length-1)stop();paint();},350);
    }
    paint();
  };
  compute();paint();return stop;
}
