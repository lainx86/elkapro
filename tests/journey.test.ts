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
  for (const [p, key] of [[0, 'intro'], [.17, 'power'], [.32, 'textLogic'], [.47, 'outro'], [.6, 'textWave'], [.76, 'textTunnel'], [.9, 'textNetwork'], [1, 'outro']] as const) {
    assert.equal(journeyState(p)[key], 1, `${key} must be fully visible at ${p}`);
  }
  for (let i = 0; i <= 1000; i++) {
    const state = journeyState(i / 1000);
    const readable = [state.intro, state.power, state.textLogic, state.outro, state.textWave, state.textTunnel, state.textNetwork].filter(v => v >= .5);
    assert.ok(readable.length <= 1, `overlapping narrative at ${i / 1000}`);
    Object.values(state).forEach(value => assert.ok(value >= 0 && value <= 1));
  }
});

test('reverse scrolling and direct deep entry resolve to the same state', () => {
  const forward = Array.from({ length: 101 }, (_, i) => journeyState(i / 100));
  for (let i = 100; i >= 0; i--) assert.deepEqual(journeyState(i / 100), forward[i]);
  for (const boundary of [.04, .075, .095, .11, .2, .215, .24, .34, .385, .415, .46, .485, .5, .54, .55, .56, .58, .635, .65, .655, .665, .67, .705, .71, .735, .79, .82, .85, .855, .88, .885, .925, .95, .985]) {
    const before = journeyState(boundary - .00001);
    const after = journeyState(boundary + .00001);
    for (const key of Object.keys(before) as (keyof typeof before)[]) assert.ok(Math.abs(before[key] - after[key]) < .002, `${key} jumps at ${boundary}`);
  }
});

test('the continuation replaces the original sculpture and keeps a visual at each handoff', () => {
  assert.equal(journeyState(.5).original, 1, 'the old ending occurs halfway through the longer journey');
  assert.equal(journeyState(.6).departure, 1, 'the lightning and chip have left the scene');
  assert.equal(journeyState(.6).wave, 1);
  assert.equal(journeyState(.76).tunnel, 1);
  assert.equal(journeyState(.9).network, 1);
  for (let i = 500; i <= 1000; i++) {
    const s = journeyState(i / 1000);
    assert.ok(Math.max(1 - s.departure, s.wave, s.tunnel, s.network) >= .3, `empty handoff at ${i / 1000}`);
    if (i < 950) assert.equal(s.finale, 0, 'replay belongs at the new ending');
  }
});
