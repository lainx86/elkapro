import { tracks, topics, selectTopics, trackFromHash, nextTrack } from './topics';
import type { Track } from './topics';

/** The homepage limits its preview; the catalog renders the same topic source in full. */
export function mountMaterials(root: HTMLElement, previewLimit?: number) {
  const catalog = root.hasAttribute('data-catalog');
  const tablist = document.createElement('div');
  tablist.className = 'material-tabs';
  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-label', 'Bidang materi');
  const buttons: HTMLButtonElement[] = [];
  const panels: HTMLElement[] = [];
  const more = document.createElement('a');
  more.className = 'material-all';
  more.textContent = 'Semua materi ↗';

  for (const track of tracks) {
    const button = document.createElement('button');
    button.type = 'button';
    button.id = `${root.id}-${track.id}-tab`;
    button.dataset.track = track.id;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', `${root.id}-${track.id}-panel`);
    button.textContent = track.label;
    tablist.append(button);
    buttons.push(button);

    const panel = document.createElement('div');
    panel.id = `${root.id}-${track.id}-panel`;
    panel.className = 'material-tab-panel';
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', button.id);
    panel.tabIndex = 0;
    const selected = selectTopics(topics, track.id, previewLimit);
    if (catalog) {
      const count = document.createElement('p');
      count.className = 'material-count';
      count.textContent = `${selected.length} topik`;
      panel.append(count);
    }
    if (!selected.length) {
      const empty = document.createElement('p');
      empty.className = 'materials-empty';
      empty.textContent = `Belum ada materi ${track.label}.`;
      panel.append(empty);
    }
    for (const [index, topic] of selected.entries()) {
      const link = document.createElement('a');
      link.className = 'topic-link';
      link.href = `/materi/${encodeURIComponent(topic.slug)}/`;
      const number = document.createElement('span');
      number.className = 'topic-number';
      number.textContent = String(index + 1).padStart(2, '0');
      number.setAttribute('aria-hidden', 'true');
      const content = document.createElement('span');
      content.className = 'topic-content';
      const label = document.createElement('span');
      label.className = 'topic-level';
      label.textContent = topic.label;
      const title = document.createElement('strong');
      title.textContent = topic.title;
      const description = document.createElement('span');
      description.className = 'topic-summary';
      description.textContent = topic.description;
      content.append(label, title, description);
      const arrow = document.createElement('span');
      arrow.className = 'topic-arrow';
      arrow.textContent = '↗';
      arrow.setAttribute('aria-hidden', 'true');
      link.append(number, content, arrow);
      panel.append(link);
    }
    panels.push(panel);
  }

  function select(track: Track, focus = false, updateHash = false) {
    buttons.forEach((button, index) => {
      const selected = button.dataset.track === track;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      panels[index].hidden = !selected;
      if (selected && focus) button.focus({ preventScroll: true });
    });
    more.href = `/materi/#${track}`;
    if (catalog && updateHash) history.replaceState(null, '', `#${track}`);
  }
  function tabForEvent(event: Event) {
    const target = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('button[role="tab"]') : null;
    return target && root.contains(target) ? target : null;
  }
  function onClick(event: Event) {
    const button = tabForEvent(event);
    if (button) select(button.dataset.track as Track, false, true);
  }
  function onKeyDown(event: KeyboardEvent) {
    const button = tabForEvent(event);
    if (!button) return;
    const next = nextTrack(button.dataset.track as Track, event.key);
    if (!next) return;
    event.preventDefault();
    select(next, true, true);
  }
  function onHashChange() { select(trackFromHash(location.hash)); }
  root.replaceChildren(tablist, ...panels, ...(catalog ? [] : [more]));
  select(catalog ? trackFromHash(location.hash) : 'program');
  root.addEventListener('click', onClick);
  root.addEventListener('keydown', onKeyDown);
  if (catalog) window.addEventListener('hashchange', onHashChange);
  return () => {
    root.removeEventListener('click', onClick);
    root.removeEventListener('keydown', onKeyDown);
    if (catalog) window.removeEventListener('hashchange', onHashChange);
  };
}
