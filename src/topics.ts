export const tracks = [{ id: 'program', label: 'Program' }, { id: 'elektrikal', label: 'Elektrikal' }] as const;
export type Track = typeof tracks[number]['id'];
export type Topic = { slug: string; track: Track; title: string; description: string; label: string };

export const topics: readonly Topic[] = [
  { slug: 'git-github', track: 'program', title: 'Git dan GitHub', description: 'Contoh materi pengenalan Git dan GitHub.', label: 'Materi dummy' },
];

export function selectTopics(items: readonly Topic[], track: Track, limit?: number) {
  const selected = items.filter(topic => topic.track === track);
  return limit === undefined ? selected : selected.slice(0, limit);
}

export function trackFromHash(hash: string): Track {
  return hash === '#elektrikal' ? 'elektrikal' : 'program';
}

export function nextTrack(track: Track, key: string): Track | undefined {
  if (key === 'Home') return 'program';
  if (key === 'End') return 'elektrikal';
  if (key === 'ArrowLeft' || key === 'ArrowRight') return track === 'program' ? 'elektrikal' : 'program';
}
