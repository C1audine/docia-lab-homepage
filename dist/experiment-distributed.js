import {layouts,edgesFor,mean} from './model.js';
import {icon} from './ui.js';
import {S,fill} from './i18n.js';

// Local quadratic objectives: agent i minimizes 0.5 * weights[i] * (x - targets[i])^2.
const WEIGHTS = [1.2, 0.8, 1.5, 1.0, 0.7, 1.3, 0.9, 1.1];
const TARGETS = [-2.4, 1.6, 3.1, -1.2, 0.7, -3.0, 2.2, 1.1];
const INITIAL_ESTIMATES = [3.2, -1.8, 2.4, -2.6, 1.4, -3.0, 2.8, -0.6];

const MAX_MAGNITUDE = 1e6;
const FRAME_MS = 260;
const WIDTH = 720;
const HEIGHT = 240;
const MARGIN = {top: 14, right: 16, bottom: 36, left: 46};
const TICK_COUNT = 4;
const AGENT_COLORS = ['#2f7f6c', '#3d907c', '#4b9f8b', '#5aad99', '#367f7f', '#448f8c', '#529e98', '#60ada5'];

// The interface copy has no per-agent key; the chart contract names the lines
// "Agent 1" ... "Agent 8", so the numeric label is built here.
const agentName = index => `Agent ${index + 1}`;

export function createProblem() {
  const weights = WEIGHTS.slice();
  const targets = TARGETS.slice();
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const optimum = weights.reduce((sum, weight, i) => sum + weight * targets[i], 0) / totalWeight;
  return {weights, targets, optimum};
}

export function simulateDgd(problem, {topology = 'Mesh', alpha = 0.08, beta = 0.5, rounds = 80} = {}) {
  const {weights, targets, optimum} = problem;
  const links = edgesFor(topology) || edgesFor('Mesh');
  const neighbors = weights.map(() => []);
  for (const [a, b] of links) {
    neighbors[a].push(b);
    neighbors[b].push(a);
  }

  const steps = Math.max(0, Math.floor(rounds));
  let estimates = INITIAL_ESTIMATES.slice();
  const history = [estimates.slice()];
  const means = [mean(estimates)];

  for (let round = 0; round < steps; round += 1) {
    const previous = estimates;
    const next = previous.map((value, i) => {
      let consensus = 0;
      for (const j of neighbors[i]) consensus += value - previous[j];
      return value - alpha * (weights[i] * (value - targets[i]) + beta * consensus);
    });
    // A large step can diverge; keep the states already recorded and stop.
    if (next.some(value => !Number.isFinite(value) || Math.abs(value) > MAX_MAGNITUDE)) break;
    estimates = next;
    history.push(estimates.slice());
    means.push(mean(estimates));
  }

  return {history, means, optimum};
}

function legendHtml() {
  const L = S().researchDemo.distributed;
  const agents = AGENT_COLORS.map((color, i) => `<span><i class="line-key" style="border-top-color:${color}"></i>${agentName(i)}</span>`).join('');
  return `${agents}<span><i class="line-key dashed"></i>${L.optimum}</span>`;
}

export function renderDistributedDemo() {
  const {kicker, distributed: L} = S().researchDemo;
  const options = Object.keys(layouts).map(name => `<option value="${name}">${name}</option>`).join('');
  return `<section class="research-demo" id="demo-distributed" aria-labelledby="distributed-title">
  <div class="demo-head">
    <div>
      <p class="demo-kicker">${kicker}</p>
      <h2 id="distributed-title">${L.title}</h2>
      <p class="demo-intro">${L.intro}</p>
    </div>
    <div class="sim-actions"><button type="button" id="dgd-run" class="btn primary">${icon('play',15)}${L.run}</button><button type="button" id="dgd-reset" class="square-btn" aria-label="${L.reset}" title="${L.reset}">${icon('reset')}</button></div>
  </div>
  <div class="demo-panel">
    <div class="demo-toolbar">
      <div class="demo-field"><label for="dgd-topology">${L.topology}</label><select id="dgd-topology">${options}</select></div>
      <div class="demo-field"><label for="dgd-alpha">${L.stepSize}</label><div class="demo-range"><input id="dgd-alpha" type="range" min="0.02" max="0.24" step="0.01" value="0.08"><output id="dgd-alpha-val" for="dgd-alpha">0.08</output></div></div>
      <span class="round" id="dgd-round">${fill(L.round,{n:'00'})}</span>
    </div>
    <div class="demo-visual">
      <p class="demo-chart-title">${L.chartTitle} <span>${L.chartUnit}</span></p>
      <svg id="dgd-chart" viewBox="0 0 720 240" role="img" aria-label="${L.chartAria}"></svg>
      <div class="curve-legend" id="dgd-legend">${legendHtml()}</div>
    </div>
    <div class="demo-stats" aria-live="polite"><div><span>${L.mean}</span><strong id="dgd-mean"></strong></div><div><span>${L.optimalityGap}</span><strong id="dgd-opt-gap"></strong></div><div><span>${L.disagreement}</span><strong id="dgd-disagree"></strong></div></div>
  </div>
  <details class="method"><summary>${L.howTitle}</summary><div><p>${L.howP1}</p><p>${L.howP2}</p></div></details>
</section>`;
}

function chartMarkup(history, optimum, upto) {
  const L = S().researchDemo.distributed;
  const plotWidth = WIDTH - MARGIN.left - MARGIN.right;
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const horizon = Math.max(1, history.length - 1);
  const visible = history.slice(0, upto + 1);

  const values = [...history.flat(), optimum];
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (max - min < 1e-9) {
    min -= 1;
    max += 1;
  }
  const padding = (max - min) * 0.08;
  min -= padding;
  max += padding;

  const x = round => MARGIN.left + plotWidth * round / horizon;
  const y = value => MARGIN.top + plotHeight * (max - value) / (max - min);

  let grid = '';
  for (let i = 0; i <= TICK_COUNT; i += 1) {
    const value = min + (max - min) * i / TICK_COUNT;
    const lineY = y(value).toFixed(1);
    grid += `<line class="gridline" x1="${MARGIN.left}" y1="${lineY}" x2="${MARGIN.left + plotWidth}" y2="${lineY}"/><text x="${MARGIN.left - 8}" y="${(Number(lineY) + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="#5c756c">${value.toFixed(1)}</text>`;
  }
  for (let i = 0; i <= TICK_COUNT; i += 1) {
    const round = Math.round(horizon * i / TICK_COUNT);
    grid += `<text x="${x(round).toFixed(1)}" y="${HEIGHT - MARGIN.bottom + 18}" text-anchor="middle" font-size="11" fill="#5c756c">${round}</text>`;
  }

  const axis = `<line x1="${MARGIN.left}" y1="${MARGIN.top}" x2="${MARGIN.left}" y2="${MARGIN.top + plotHeight}" stroke="#b9cec5" stroke-width="1"/><line x1="${MARGIN.left}" y1="${MARGIN.top + plotHeight}" x2="${MARGIN.left + plotWidth}" y2="${MARGIN.top + plotHeight}" stroke="#b9cec5" stroke-width="1"/>`;

  const optimumY = y(optimum).toFixed(1);
  const central = `<g class="optimum"><title>${L.optimum}</title><line x1="${MARGIN.left}" y1="${optimumY}" x2="${MARGIN.left + plotWidth}" y2="${optimumY}" stroke="#b07850" stroke-width="1.4" stroke-dasharray="6 5"/></g>`;

  const lines = AGENT_COLORS.map((color, i) => {
    const points = visible.map((state, round) => `${x(round).toFixed(2)},${y(state[i]).toFixed(2)}`).join(' ');
    const endY = y(visible.at(-1)[i]).toFixed(2);
    return `<g class="agent-line"><title>${agentName(i)}</title><polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${x(upto).toFixed(2)}" cy="${endY}" r="2.3" fill="${color}"/></g>`;
  }).join('');

  return `${grid}${axis}${central}${lines}`;
}

export function mountDistributedDemo(root = document) {
  const runButton = root.querySelector('#dgd-run');
  if (!runButton) return () => {};
  const resetButton = root.querySelector('#dgd-reset');
  const topologySelect = root.querySelector('#dgd-topology');
  const alphaInput = root.querySelector('#dgd-alpha');
  const alphaOutput = root.querySelector('#dgd-alpha-val');
  const roundOutput = root.querySelector('#dgd-round');
  const chart = root.querySelector('#dgd-chart');
  const meanOutput = root.querySelector('#dgd-mean');
  const gapOutput = root.querySelector('#dgd-opt-gap');
  const disagreementOutput = root.querySelector('#dgd-disagree');

  const problem = createProblem();
  let topology = topologySelect.value || 'Mesh';
  let alpha = Number(alphaInput.value);
  let result = simulateDgd(problem, {topology, alpha});
  let round = 0;
  let timer = null;

  function stop() {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  }

  function paint() {
    const L = S().researchDemo.distributed;
    const estimate = result.history[round];
    const average = mean(estimate);
    const finished = round === result.history.length - 1;
    alphaOutput.textContent = alpha.toFixed(2);
    roundOutput.textContent = fill(L.round,{n:String(round).padStart(2,'0')});
    meanOutput.textContent = average.toFixed(3);
    gapOutput.textContent = Math.abs(average - result.optimum).toFixed(3);
    disagreementOutput.textContent = Math.max(...estimate.map(value => Math.abs(value - average))).toFixed(3);
    runButton.innerHTML = icon(timer ? 'pause' : 'play',15) + (timer ? L.pause : finished ? L.replay : L.run);
    chart.innerHTML = chartMarkup(result.history,result.optimum,round);
  }

  function start() {
    if (result.history.length < 2) return;
    timer = setInterval(() => {
      round += 1;
      if (round >= result.history.length - 1) {
        round = result.history.length - 1;
        stop();
      }
      paint();
    },FRAME_MS);
  }

  runButton.onclick = () => {
    if (timer !== null) stop();
    else {
      if (round >= result.history.length - 1) round = 0;
      start();
    }
    paint();
  };
  resetButton.onclick = () => {
    stop();
    round = 0;
    paint();
  };
  topologySelect.onchange = () => {
    stop();
    topology = topologySelect.value;
    result = simulateDgd(problem,{topology,alpha});
    round = 0;
    paint();
  };
  alphaInput.oninput = () => {
    stop();
    alpha = Number(alphaInput.value);
    result = simulateDgd(problem,{topology,alpha});
    round = 0;
    paint();
  };

  paint();
  return stop;
}
