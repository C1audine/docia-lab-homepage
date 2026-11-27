import test from 'node:test';
import assert from 'node:assert/strict';
import {createProblem,simulateDgd,renderDistributedDemo} from '../src/experiment-distributed.js';

const INITIAL_ESTIMATES = [3.2, -1.8, 2.4, -2.6, 1.4, -3.0, 2.8, -0.6];

const average = values => values.reduce((sum, value) => sum + value, 0) / values.length;
const gap = (result, round = result.history.length - 1) => Math.abs(result.means[round] - result.optimum);
const disagreement = (result, round = result.history.length - 1) => {
  const centre = result.means[round];
  return Math.max(...result.history[round].map(value => Math.abs(value - centre)));
};

test('createProblem exposes the local objectives and the weighted optimum', () => {
  const problem = createProblem();
  assert.deepEqual(problem.weights, [1.2, 0.8, 1.5, 1.0, 0.7, 1.3, 0.9, 1.1]);
  assert.deepEqual(problem.targets, [-2.4, 1.6, 3.1, -1.2, 0.7, -3.0, 2.2, 1.1]);

  const expected = problem.weights.reduce((sum, weight, i) => sum + weight * problem.targets[i], 0)
    / problem.weights.reduce((sum, weight) => sum + weight, 0);
  assert.ok(Math.abs(problem.optimum - expected) < 1e-12);
  assert.ok(problem.optimum > Math.min(...problem.targets) && problem.optimum < Math.max(...problem.targets));
  assert.ok(Math.abs(problem.optimum) > 1e-3);

  const second = createProblem();
  assert.notEqual(second.weights, problem.weights);
  assert.deepEqual(second, {weights: problem.weights.slice(), targets: problem.targets.slice(), optimum: problem.optimum});
});

test('simulateDgd starts at the initial estimates and keeps histories aligned', () => {
  const problem = createProblem();
  const result = simulateDgd(problem, {rounds: 12});
  assert.equal(result.history.length, 13);
  assert.equal(result.means.length, result.history.length);
  assert.deepEqual(result.history[0], INITIAL_ESTIMATES);
  assert.equal(result.optimum, problem.optimum);

  for (let round = 0; round < result.history.length; round += 1) {
    assert.equal(result.history[round].length, 8);
    assert.ok(result.history[round].every(Number.isFinite));
    assert.ok(Math.abs(result.means[round] - average(result.history[round])) < 1e-12);
  }

  const zero = simulateDgd(problem, {rounds: 0});
  assert.deepEqual(zero.history, [INITIAL_ESTIMATES]);
  assert.deepEqual(zero.means, [average(INITIAL_ESTIMATES)]);

  const defaults = simulateDgd(problem);
  assert.equal(defaults.history.length, 81);
});

test('default parameters converge: gap and disagreement shrink from round 0', () => {
  const result = simulateDgd(createProblem());
  const initialGap = gap(result, 0);
  const finalGap = gap(result);
  assert.ok(finalGap < initialGap, `gap ${finalGap} should be below ${initialGap}`);
  assert.ok(finalGap < 0.05);
  assert.ok(disagreement(result) < disagreement(result, 0));
  assert.ok(disagreement(result, 20) < disagreement(result, 0) * 0.5);
});

test('Mesh, Ring and Star settle while producing distinct trajectories', () => {
  const problem = createProblem();
  const results = {};
  for (const topology of ['Mesh', 'Ring', 'Star']) {
    const result = simulateDgd(problem, {topology});
    results[topology] = result;
    assert.deepEqual(result.history[0], INITIAL_ESTIMATES);
    assert.ok(gap(result) < gap(result, 0), `${topology} did not converge`);
    assert.ok(disagreement(result) < disagreement(result, 0), `${topology} did not agree`);
  }

  const finalDistance = (a, b) => Math.max(...a.history.at(-1).map((value, i) => Math.abs(value - b.history.at(-1)[i])));
  assert.ok(finalDistance(results.Mesh, results.Ring) > 0.5, 'Mesh and Ring should end at different states');
  assert.ok(finalDistance(results.Mesh, results.Star) > 0.5, 'Mesh and Star should end at different states');
});

test('rendered HTML exposes the contract ids, classes and controls', () => {
  const html = renderDistributedDemo();
  const ids = ['demo-distributed', 'dgd-run', 'dgd-reset', 'dgd-topology', 'dgd-alpha', 'dgd-alpha-val', 'dgd-round', 'dgd-chart', 'dgd-legend', 'dgd-mean', 'dgd-opt-gap', 'dgd-disagree'];
  for (const id of ids) assert.ok(html.includes(`id="${id}"`), `missing #${id}`);

  const classes = ['research-demo', 'demo-head', 'demo-kicker', 'demo-intro', 'sim-actions', 'demo-panel', 'demo-toolbar', 'demo-field', 'demo-range', 'demo-visual', 'demo-chart-title', 'curve-legend', 'demo-stats', 'method', 'btn primary', 'square-btn', 'round', 'line-key'];
  for (const name of classes) assert.ok(html.includes(`class="${name}"`), `missing class ${name}`);

  for (const topology of ['Mesh', 'Ring', 'Star']) assert.ok(html.includes(`<option value="${topology}">`));
  for (const fragment of ['viewBox="0 0 720 240"', 'role="img"', 'aria-label="', 'aria-live="polite"', 'type="range"', 'min="0.02"', 'max="0.24"', 'step="0.01"', 'value="0.08"', 'for="dgd-alpha"']) {
    assert.ok(html.includes(fragment), `missing fragment ${fragment}`);
  }
  assert.equal((html.match(/type="button"/g) || []).length, 2);
  assert.ok(!html.includes('<canvas'));
});

test('divergence guard stops the run before estimates pass the magnitude limit', () => {
  const result = simulateDgd(createProblem(), {alpha: 100, rounds: 80});
  assert.ok(result.history.length < 81);
  assert.equal(result.means.length, result.history.length);
  for (const state of result.history) {
    for (const value of state) {
      assert.ok(Number.isFinite(value));
      assert.ok(Math.abs(value) <= 1e6);
    }
  }
});
