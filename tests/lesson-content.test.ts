import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../materi/git-github/index.html', import.meta.url), 'utf8');
const chapter = readFileSync(new URL('../isi-materi/Program/1-Git-dan-Github/1. Menghubungkan Git ke GitHub menggunakan SSH.md', import.meta.url), 'utf8');
const decode = (text: string) => text.replace(/&(amp|lt|gt|quot|#x27);/g, (_, name: string) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#x27': "'" })[name]!);

test('every supplied SSH code block is preserved literally, including shell quoting and Windows paths', () => {
  const expected = [...chapter.matchAll(/```[^\n]*\n([\s\S]*?)\n```/g)].map(match => match[1]);
  const actual = [...page.matchAll(/<pre\b[^>]*><code>([\s\S]*?)<\/code><\/pre>/g)].map(match => decode(match[1]));
  assert.ok(expected.length > 15);
  assert.deepEqual(actual, expected);
});

test('the lesson exposes both chapters and navigable OS guides, with no dummy or authoring instruction', () => {
  for (const anchor of ['bab-0', 'bab-1', 'windows', 'linux']) {
    assert.ok(page.includes(`id="${anchor}"`));
    assert.ok(page.includes(`href="#${anchor}"`));
  }
  assert.doesNotMatch(page, /dummy|Instruksi untuk AI|Gunakan skills/i);
  assert.equal((page.match(/class="story-figure"/g) ?? []).length, 3);
  for (const file of ['MyProject_v1', 'MyProject_v2', 'MyProject_v3_buatan_guweh', 'MyProject_v4', 'MyProject_v5']) assert.ok(page.includes(file));
  const ids = [...page.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const match of page.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(match[1]), `Missing target ${match[1]}`);
});
