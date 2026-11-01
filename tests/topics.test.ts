import { test } from 'node:test';
import assert from 'node:assert/strict';
import { topics, selectTopics, trackFromHash, nextTrack } from '../src/topics.ts';
import type { Topic } from '../src/topics.ts';

test('the final-screen preview is capped while the catalog contains every matching topic', () => {
  const items: Topic[] = Array.from({ length: 5 }, (_, i) => ({ slug: `program-${i}`, track: 'program', title: `Topik ${i}`, description: '', label: 'Dummy' }));
  items.splice(1, 0, { slug: 'electrical', track: 'elektrikal', title: 'Elektrikal', description: '', label: 'Dummy' });
  assert.equal(selectTopics(items, 'program', 3).length, 3);
  assert.equal(selectTopics(items, 'program').length, 5);
  assert.ok(selectTopics(items, 'program', 3).every(topic => topic.track === 'program'));
  assert.deepEqual(selectTopics(topics, 'elektrikal'), []);
  assert.equal(selectTopics(topics, 'program')[0].slug, 'git-github');
});

test('tab navigation supports arrows, Home/End, and safe catalog hashes', () => {
  assert.equal(nextTrack('program', 'ArrowRight'), 'elektrikal');
  assert.equal(nextTrack('elektrikal', 'ArrowLeft'), 'program');
  assert.equal(nextTrack('program', 'End'), 'elektrikal');
  assert.equal(nextTrack('elektrikal', 'Home'), 'program');
  assert.equal(nextTrack('program', 'Tab'), undefined);
  assert.equal(trackFromHash('#elektrikal'), 'elektrikal');
  assert.equal(trackFromHash('#invalid'), 'program');
});
