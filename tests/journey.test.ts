import { test } from 'node:test';
import assert from 'node:assert/strict';
import { journeyState } from '../src/journey.ts';

test('out-of-range, restored, and invalid positions produce a valid scene', () => {
  assert.deepEqual(journeyState(-1), journeyState(0));
  assert.deepEqual(journeyState(2), journeyState(1));
  assert.deepEqual(journeyState(NaN), journeyState(0));
  assert.equal(journeyState(0).intro, 1);
  assert.equal(journeyState(1).outro, 1);
});

test('each narrative has a readable interval and none overlap at full strength', () => {
  for (const [p, key] of [[0, 'intro'], [.34, 'power'], [.64, 'textLogic'], [1, 'outro']] as const) {
    assert.equal(journeyState(p)[key], 1, `${key} must be fully visible at ${p}`);
  }
  for (let i = 0; i <= 1000; i++) {
    const state = journeyState(i / 1000);
    const readable = [state.intro, state.power, state.textLogic, state.outro].filter(v => v >= .5);
    assert.ok(readable.length <= 1, `overlapping narrative at ${i / 1000}`);
    Object.values(state).forEach(value => assert.ok(value >= 0 && value <= 1));
  }
});

test('reverse scrolling and direct deep entry resolve to the same state', () => {
  const forward = Array.from({ length: 101 }, (_, i) => journeyState(i / 100));
  for (let i = 100; i >= 0; i--) assert.deepEqual(journeyState(i / 100), forward[i]);
  for (const boundary of [.08, .15, .19, .22, .4, .43, .48, .68, .77, .83, .92, .97]) {
    const before = journeyState(boundary - .00001);
    const after = journeyState(boundary + .00001);
    for (const key of Object.keys(before) as (keyof typeof before)[]) assert.ok(Math.abs(before[key] - after[key]) < .002, `${key} jumps at ${boundary}`);
  }
});
