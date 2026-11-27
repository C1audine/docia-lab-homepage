import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALGORITHMS,
  OBJECTIVE,
  mountOptimizerDemo,
  renderOptimizerDemo,
  runOptimizer
} from '../src/experiment-optimizer.js';

const START = [-2.6, 1.7];
const START_DISTANCE = Math.hypot(START[0], START[1]);
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const near = (actual, expected, message) => {
  assert.ok(Math.abs(actual - expected) < 1e-12, `${message}: expected ${expected}, got ${actual}`);
};

test('objective and gradient match the specified quadratic', () => {
  near(OBJECTIVE.f(0, 0), 0, 'f(0, 0)');
  near(OBJECTIVE.f(2, 0.5), 3.5, 'f(2, 0.5)');
  assert.deepEqual(OBJECTIVE.grad(2, 0.5), [2, 6]);
});

test('gradient descent takes the expected first step from the start point', () => {
  const {path, losses, optimum} = runOptimizer('gradient', 0.05, 1);
  assert.equal(path.length, 2);
  near(path[0][0], START[0], 'start x');
  near(path[0][1], START[1], 'start y');
  near(path[1][0], -2.47, 'x after one step');
  near(path[1][1], 0.68, 'y after one step');
  near(losses[0], 20.72, 'loss at the start');
  near(losses[1], 5.82485, 'loss after one step');
  assert.deepEqual(optimum, [0, 0]);
});

test('all methods stay finite and end closer to the optimum at the default step size', () => {
  for (const algorithm of ALGORITHMS) {
    const {path, losses} = runOptimizer(algorithm, 0.05);
    assert.equal(path.length, 61, `${algorithm}: one point per step plus the start`);
    assert.equal(losses.length, path.length, `${algorithm}: one loss per path point`);
    assert.ok(path.every(([x, y]) => Number.isFinite(x) && Number.isFinite(y)), `${algorithm}: path is finite`);
    assert.ok(losses.every(loss => Number.isFinite(loss)), `${algorithm}: losses are finite`);
    near(losses[0], 20.72, `${algorithm}: loss at the start`);
    const [endX, endY] = path.at(-1);
    assert.ok(Math.hypot(endX, endY) < START_DISTANCE, `${algorithm}: ends closer to zero than it started`);
    assert.ok(losses.at(-1) < losses[0], `${algorithm}: loss decreases`);
  }
});

test('momentum and Nesterov follow different trajectories from gradient descent', () => {
  const gradient = runOptimizer('gradient', 0.05).path;
  const momentum = runOptimizer('momentum', 0.05).path;
  const nesterov = runOptimizer('nesterov', 0.05).path;
  assert.notDeepEqual(momentum, gradient);
  assert.notDeepEqual(nesterov, gradient);
  assert.notDeepEqual(nesterov, momentum);
  // Both accelerated methods start with zero velocity, so step one is shared.
  assert.deepEqual(momentum[1], gradient[1]);
  assert.deepEqual(nesterov[1], gradient[1]);
  assert.notDeepEqual(momentum[2], gradient[2]);
});

test('invalid algorithms and step sizes are rejected, and zero steps returns the start', () => {
  assert.throws(() => runOptimizer('newton', 0.05), RangeError);
  assert.throws(() => runOptimizer('gradient', 0), RangeError);
  assert.deepEqual(runOptimizer('gradient', 0.05, 0).path, [[START[0], START[1]]]);
});

test('rendered demo contains the required ids, classes, and controls', () => {
  const html = renderOptimizerDemo();
  const ids = [
    'demo-optimizer', 'opt-run', 'opt-reset', 'opt-algo', 'opt-alpha', 'opt-alpha-val',
    'opt-round', 'opt-chart', 'opt-legend', 'opt-loss', 'opt-distance', 'opt-iterations'
  ];
  for (const id of ids) assert.match(html, new RegExp(`id="${id}"`), `missing #${id}`);
  const classes = [
    'research-demo', 'demo-head', 'demo-kicker', 'demo-intro', 'sim-actions', 'demo-panel',
    'demo-toolbar', 'demo-field', 'demo-range', 'demo-visual', 'demo-chart-title',
    'curve-legend', 'demo-stats', 'method'
  ];
  for (const className of classes) {
    assert.match(html, new RegExp(`class="[^"]*\\b${className}\\b`), `missing .${className}`);
  }
  assert.match(html, /class="btn primary"/);
  assert.match(html, /class="square-btn"/);
  assert.match(html, /class="round"/);
  assert.match(html, /viewBox="0 0 720 300"/);
  assert.match(html, /<input id="opt-alpha" type="range" min="0.01" max="0.3" step="0.01" value="0.05"/);
  assert.match(html, /<output id="opt-alpha-val" for="opt-alpha">/);
  for (const algorithm of ALGORITHMS) {
    assert.match(html, new RegExp(`<option value="${algorithm}">`), `missing ${algorithm} option`);
  }
  assert.match(html, /<details class="method">/);
  assert.match(html, /role="img" aria-label="[^"]+"/);
});

test('mount paints the demo, restarts on control changes, and cleanup stops the timer', async () => {
  const fakeElement = () => {
    const node = {
      innerHTML: '',
      textContent: '',
      value: '',
      min: '',
      max: '',
      listeners: {},
      addEventListener(type, handler) {
        (node.listeners[type] ||= []).push(handler);
      },
      click() {
        for (const handler of node.listeners.click || []) handler({type: 'click'});
      }
    };
    return node;
  };
  const elements = Object.fromEntries(
    ['opt-run', 'opt-reset', 'opt-algo', 'opt-alpha', 'opt-alpha-val', 'opt-round', 'opt-chart', 'opt-loss', 'opt-distance', 'opt-iterations']
      .map(id => [id, fakeElement()])
  );
  elements['opt-algo'].value = 'gradient';
  elements['opt-alpha'].value = '0.05';
  elements['opt-alpha'].min = '0.01';
  elements['opt-alpha'].max = '0.3';
  const root = {getElementById: id => elements[id] || null};

  const cleanup = mountOptimizerDemo(root);
  assert.equal(typeof cleanup, 'function');
  assert.match(elements['opt-chart'].innerHTML, /class="opt-contour"/);
  assert.match(elements['opt-chart'].innerHTML, /x₀/);
  assert.equal(elements['opt-loss'].textContent, '20.720');
  assert.equal(elements['opt-distance'].textContent, '3.106');
  assert.equal(elements['opt-iterations'].textContent, '0');
  assert.equal(elements['opt-alpha-val'].textContent, '0.05');

  elements['opt-run'].click();
  await wait(350);
  assert.ok(Number(elements['opt-iterations'].textContent) >= 1, 'run advances the step counter');

  elements['opt-reset'].click();
  assert.equal(elements['opt-iterations'].textContent, '0', 'reset returns to step 0');

  elements['opt-algo'].value = 'momentum';
  elements['opt-algo'].listeners.change[0]();
  assert.equal(elements['opt-iterations'].textContent, '0', 'changing the algorithm restarts at step 0');

  elements['opt-alpha'].value = '0.1';
  elements['opt-alpha'].listeners.input[0]();
  assert.equal(elements['opt-alpha-val'].textContent, '0.10', 'step-size output mirrors the slider');
  assert.equal(elements['opt-iterations'].textContent, '0', 'changing the step size restarts at step 0');

  elements['opt-run'].click();
  await wait(350);
  cleanup();
  const pausedAt = elements['opt-iterations'].textContent;
  assert.ok(Number(pausedAt) >= 1, 'run still advances after the restart');
  await wait(300);
  assert.equal(elements['opt-iterations'].textContent, pausedAt, 'cleanup clears the animation timer');
});
