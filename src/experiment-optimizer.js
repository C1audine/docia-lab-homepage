import {icon} from './ui.js';
import {S,fill} from './i18n.js';

// f(x, y) = 0.5(x² + 12y²): a narrow valley whose curvature along y (12) is
// twelve times its curvature along x (1), so plain gradient descent zig-zags.
export const OBJECTIVE = {
  f: (x, y) => 0.5 * (x * x + 12 * y * y),
  grad: (x, y) => [x, 12 * y]
};

export const ALGORITHMS = ['gradient', 'momentum', 'nesterov'];

const START = [-2.6, 1.7];
const MOMENTUM = 0.6;
const DEFAULT_ALPHA = 0.05;
const DEFAULT_STEPS = 60;
const TICK_MS = 180;

// Chart geometry: the world box is stretched onto the 720×300 SVG plot.
const VIEW = {width: 720, height: 300};
const BOUNDS = {xMin: -3.4, xMax: 3.4, yMin: -2.4, yMax: 2.4};
const PLOT = {x: 54, y: 16, width: VIEW.width - 70, height: VIEW.height - 40};
const SCALE = {
  x: PLOT.width / (BOUNDS.xMax - BOUNDS.xMin),
  y: PLOT.height / (BOUNDS.yMax - BOUNDS.yMin)
};
const CONTOURS = [5.2, 2.8, 1.2, 0.3];
const CONTOUR_FILLS = ['#eef6f1', '#e8f2ec', '#e1eee6', '#d9eadf'];
const CONTOUR_STROKE = '#9dc3b1';
const PATH_COLOR = '#198566';
const OPTIMUM_COLOR = '#174b59';

const px = x => PLOT.x + (x - BOUNDS.xMin) * SCALE.x;
const py = y => PLOT.y + (BOUNDS.yMax - y) * SCALE.y;
const n1 = value => value.toFixed(1);
const clamp = value => Math.max(-1e5, Math.min(1e5, value));

export function runOptimizer(algorithm, alpha, steps = DEFAULT_STEPS) {
  if (!ALGORITHMS.includes(algorithm)) throw new RangeError(`Unknown optimization algorithm: ${algorithm}`);
  if (!Number.isFinite(alpha) || alpha <= 0) throw new RangeError(`Invalid step size: ${alpha}`);
  if (!Number.isInteger(steps) || steps < 0) throw new RangeError(`Invalid step count: ${steps}`);
  let x = START[0], y = START[1], vx = 0, vy = 0;
  const path = [[x, y]], losses = [OBJECTIVE.f(x, y)];
  for (let i = 0; i < steps; i += 1) {
    if (algorithm === 'momentum') {
      const [gx, gy] = OBJECTIVE.grad(x, y);
      vx = MOMENTUM * vx - alpha * gx;
      vy = MOMENTUM * vy - alpha * gy;
      x += vx;
      y += vy;
    } else if (algorithm === 'nesterov') {
      const [gx, gy] = OBJECTIVE.grad(x + MOMENTUM * vx, y + MOMENTUM * vy);
      vx = MOMENTUM * vx - alpha * gx;
      vy = MOMENTUM * vy - alpha * gy;
      x += vx;
      y += vy;
    } else {
      const [gx, gy] = OBJECTIVE.grad(x, y);
      x -= alpha * gx;
      y -= alpha * gy;
    }
    path.push([x, y]);
    losses.push(OBJECTIVE.f(x, y));
  }
  return {path, losses, optimum: [0, 0]};
}

// Losses get three decimals at ordinary step sizes; the largest allowed steps
// are genuinely unstable, so let those tickers show exponential notation.
function formatStat(value) {
  if (!Number.isFinite(value)) return '—';
  return Math.abs(value) < 1e6 ? value.toFixed(3) : value.toExponential(2);
}

// The round badge copy is a template ("Iteration {n}" / "第 {n} 次迭代"). The
// stats row has no key of its own, so reuse the longer half of that template.
function iterationLabel(round) {
  const sides = String(round).split('{n}').map(part => part.trim());
  return (sides[0].length >= (sides[1] || '').length ? sides[0] : sides[1]) || String(round).trim();
}

function chartMarkup(path, step) {
  const cx = n1(px(0)), cy = n1(py(0));
  const contours = CONTOURS.map((level, i) => {
    const rx = Math.sqrt(2 * level) * SCALE.x;
    const ry = Math.sqrt(level / 6) * SCALE.y;
    return `<ellipse class="opt-contour" cx="${cx}" cy="${cy}" rx="${n1(rx)}" ry="${n1(ry)}" fill="${CONTOUR_FILLS[i]}" stroke="${CONTOUR_STROKE}" stroke-width="1.1"/>`;
  }).join('');
  let grid = '';
  for (let x = Math.ceil(BOUNDS.xMin); x <= Math.floor(BOUNDS.xMax); x += 1) {
    grid += `<line class="gridline" x1="${n1(px(x))}" y1="${PLOT.y}" x2="${n1(px(x))}" y2="${PLOT.y + PLOT.height}"/>`;
  }
  for (let y = Math.ceil(BOUNDS.yMin); y <= Math.floor(BOUNDS.yMax); y += 1) {
    grid += `<line class="gridline" x1="${PLOT.x}" y1="${n1(py(y))}" x2="${PLOT.x + PLOT.width}" y2="${n1(py(y))}"/>`;
  }
  const start = `<g><circle cx="${n1(px(START[0]))}" cy="${n1(py(START[1]))}" r="5.2" fill="#175345" stroke="#eef7e9" stroke-width="2"/><text class="math-label" x="${n1(px(START[0]) + 12)}" y="${n1(py(START[1]) - 8)}">x₀</text></g>`;
  const optimum = `<g stroke="${OPTIMUM_COLOR}" stroke-width="1.6" fill="none"><path d="M${n1(px(0) - 12)} ${cy}h7M${n1(px(0) + 5)} ${cy}h7M${cx} ${n1(py(0) - 12)}v7M${cx} ${n1(py(0) + 5)}v7"/></g><circle cx="${cx}" cy="${cy}" r="2.6" fill="${OPTIMUM_COLOR}"/><text class="math-label" x="${n1(px(0) + 14)}" y="${n1(py(0) - 12)}">x*</text>`;
  const points = [];
  let current = null;
  for (let i = 0; i <= step && i < path.length; i += 1) {
    const [x, y] = path[i];
    if (!Number.isFinite(x) || !Number.isFinite(y)) break;
    current = [clamp(px(x)), clamp(py(y))];
    points.push(`${n1(current[0])},${n1(current[1])}`);
  }
  const trail = points.length > 1 ? `<polyline points="${points.join(' ')}" fill="none" stroke="${PATH_COLOR}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>` : '';
  const dot = current ? `<circle cx="${n1(current[0])}" cy="${n1(current[1])}" r="4.6" fill="${PATH_COLOR}" stroke="#ffffff" stroke-width="1.7"/>` : '';
  return `<defs><clipPath id="opt-plot-clip"><rect x="${PLOT.x}" y="${PLOT.y}" width="${PLOT.width}" height="${PLOT.height}" rx="10"/></clipPath></defs>
  <rect class="opt-plot-bg" x="${PLOT.x}" y="${PLOT.y}" width="${PLOT.width}" height="${PLOT.height}" rx="10" fill="#f8fbf9" stroke="#d9e7de"/>
  ${contours}
  ${grid}
  <g stroke="#a9c2b6" stroke-width="1.1"><line x1="${PLOT.x}" y1="${cy}" x2="${PLOT.x + PLOT.width}" y2="${cy}"/><line x1="${cx}" y1="${PLOT.y}" x2="${cx}" y2="${PLOT.y + PLOT.height}"/></g>
  <text class="axis-text" x="${n1(PLOT.x + PLOT.width - 10)}" y="${n1(py(0) - 8)}" text-anchor="end">x</text>
  <text class="axis-text" x="${n1(px(0) + 8)}" y="${n1(PLOT.y + 14)}">y</text>
  ${start}
  ${optimum}
  <g clip-path="url(#opt-plot-clip)">${trail}${dot}</g>`;
}

export function renderOptimizerDemo() {
  const L = S().researchDemo.optimizer;
  const startLoss = OBJECTIVE.f(START[0], START[1]);
  const startDistance = Math.hypot(START[0], START[1]);
  const iteration = iterationLabel(L.round);
  return `<section class="research-demo" id="demo-optimizer">
  <div class="demo-head">
    <div>
      <p class="demo-kicker">${S().researchDemo.kicker}</p>
      <h2>${L.title}</h2>
      <p class="demo-intro">${L.intro}</p>
    </div>
    <div class="sim-actions"><button id="opt-run" class="btn primary">${icon('play', 15)}${L.run}</button><button id="opt-reset" class="square-btn" aria-label="${L.reset}" title="${L.reset}">${icon('reset')}</button></div>
  </div>
  <div class="demo-panel">
    <div class="demo-toolbar">
      <div class="demo-field"><label for="opt-algo">${L.algorithm}</label><select id="opt-algo" aria-label="${L.algorithm}">${ALGORITHMS.map(algorithm => `<option value="${algorithm}">${L[algorithm]}</option>`).join('')}</select></div>
      <div class="demo-field"><label for="opt-alpha">${L.stepSize}</label><div class="demo-range"><input id="opt-alpha" type="range" min="0.01" max="0.3" step="0.01" value="${DEFAULT_ALPHA}" aria-label="${L.stepSize}"><output id="opt-alpha-val" for="opt-alpha">${DEFAULT_ALPHA.toFixed(2)}</output></div></div>
      <span class="round" id="opt-round">${fill(L.round, {n: 0})}</span>
    </div>
    <div class="demo-visual">
      <p class="demo-chart-title">${L.contours} <span>${L.optimum} (0, 0)</span></p>
      <svg id="opt-chart" viewBox="0 0 720 300" role="img" aria-label="${L.chartAria}"></svg>
      <div class="curve-legend" id="opt-legend"><span><i class="line-key"></i>${L.contours}</span><span><i class="line-key strong"></i>${L.path}</span><span><i class="opt-key"></i>${L.optimum}</span></div>
    </div>
    <div class="demo-stats">
      <div><span>${L.loss}</span><strong id="opt-loss">${formatStat(startLoss)}</strong></div>
      <div><span>${L.distance}</span><strong id="opt-distance">${formatStat(startDistance)}</strong></div>
      <div><span>${iteration}</span><strong id="opt-iterations">0</strong></div>
    </div>
  </div>
  <details class="method"><summary>${L.howTitle}</summary><div><p>${L.howP1}</p><p>${L.howP2}</p></div></details>
</section>`;
}

export function mountOptimizerDemo(root = document) {
  const find = id => (typeof root.getElementById === 'function' ? root.getElementById(id) : root.querySelector(`#${id}`));
  const need = id => {
    const node = find(id);
    if (!node) throw new Error(`Optimizer demo markup is missing #${id}`);
    return node;
  };
  const chart = need('opt-chart');
  const runButton = need('opt-run');
  const resetButton = need('opt-reset');
  const select = need('opt-algo');
  const alphaInput = need('opt-alpha');
  const alphaOutput = need('opt-alpha-val');
  const roundOutput = need('opt-round');
  const lossOutput = need('opt-loss');
  const distanceOutput = need('opt-distance');
  const iterationsOutput = need('opt-iterations');
  const L = S().researchDemo.optimizer;
  const listeners = new AbortController();
  const on = (node, type, handler) => node.addEventListener(type, handler, {signal: listeners.signal});
  const minAlpha = Number(alphaInput.min) || 0.01;
  const maxAlpha = Number(alphaInput.max) || 0.3;
  let algorithm = ALGORITHMS.includes(select.value) ? select.value : ALGORITHMS[0];
  let alpha = Math.min(maxAlpha, Math.max(minAlpha, Number(alphaInput.value) || DEFAULT_ALPHA));
  let run = runOptimizer(algorithm, alpha);
  let step = 0, timer = null;

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }
  function paintButton() {
    const running = timer !== null;
    const finished = step >= run.path.length - 1;
    runButton.innerHTML = icon(running ? 'pause' : 'play', 15) + (running ? L.pause : finished ? L.replay : L.run);
  }
  function paint() {
    const point = run.path[step] || START;
    chart.innerHTML = chartMarkup(run.path, step);
    roundOutput.textContent = fill(L.round, {n: step});
    lossOutput.textContent = formatStat(run.losses[step]);
    distanceOutput.textContent = formatStat(Math.hypot(point[0], point[1]));
    iterationsOutput.textContent = String(step);
    paintButton();
  }
  function restart() {
    run = runOptimizer(algorithm, alpha);
    step = 0;
    paint();
  }
  function advance() {
    step = Math.min(step + 1, run.path.length - 1);
    if (step >= run.path.length - 1) stop();
    paint();
  }
  function toggle() {
    if (timer) {
      stop();
      paint();
      return;
    }
    if (step >= run.path.length - 1) step = 0;
    if (run.path.length > 1) timer = setInterval(advance, TICK_MS);
    paint();
  }

  on(runButton, 'click', toggle);
  on(resetButton, 'click', () => {
    stop();
    step = 0;
    paint();
  });
  on(select, 'change', () => {
    stop();
    algorithm = select.value;
    restart();
  });
  on(alphaInput, 'input', () => {
    stop();
    alpha = Math.min(maxAlpha, Math.max(minAlpha, Number(alphaInput.value) || DEFAULT_ALPHA));
    alphaOutput.textContent = alpha.toFixed(2);
    restart();
  });
  alphaOutput.textContent = alpha.toFixed(2);
  select.value = algorithm;
  paint();
  return () => {
    stop();
    listeners.abort();
  };
}
