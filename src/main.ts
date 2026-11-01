import './style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { journeyState } from './journey';
import { createWorld } from './world';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

function element<T extends HTMLElement>(selector: string) {
  const found = document.querySelector<T>(selector);
  if (!found) throw new Error(`Missing element: ${selector}`);
  return found;
}

const journey = element('#journey');
const canvas = element<HTMLCanvasElement>('#world');
const motionButton = element<HTMLButtonElement>('.motion-toggle');
const replayButton = element<HTMLButtonElement>('.replay');
const progressElement = element('.progress');
const progressNumber = element('.progress-number');
const progressTrack = element('.progress-track > span');
const objectLabel = element('#object-label');
const powerValue = element('#power-value');
const signalValue = element('#signal-value');
const scrollCue = element('.scroll-cue');
const caption = element('.object-caption');
const intro = element('[data-copy="intro"]');
const power = element('[data-copy="power"]');
const logic = element('[data-copy="logic"]');
const code = element('[data-copy="code"]');
const outro = element('[data-copy="outro"]');
const preference = matchMedia('(prefers-reduced-motion: reduce)');
const playhead = { progress: 0 };
let reduced = preference.matches;
let userOverride = false;
let lastPercent = -1;
let world: ReturnType<typeof createWorld> | undefined;
let timeline: gsap.core.Timeline;

try {
  const saved = localStorage.getItem('elkapro-motion');
  if (saved !== null) { reduced = saved === 'reduced'; userOverride = true; }
} catch { /* Privacy mode can disable storage; the system preference still works. */ }

function showCopy(node: HTMLElement, opacity: number, offset = 0) {
  node.style.opacity = opacity.toFixed(3);
  node.style.visibility = opacity > .005 ? 'visible' : 'hidden';
  node.style.transform = reduced ? 'none' : `translate3d(0, ${offset}px, 0)`;
  node.inert = opacity < .5;
  node.setAttribute('aria-hidden', String(opacity < .5));
}

function update() {
  const s = journeyState(playhead.progress);
  showCopy(intro, s.intro, -s.circuit * 70);
  showCopy(power, s.power, (1 - s.power) * 30);
  showCopy(logic, s.textLogic, (1 - s.textLogic) * 30);
  showCopy(outro, s.outro, (1 - s.outro) * 25);
  code.style.opacity = String(s.textLogic * .65);
  code.style.visibility = s.textLogic > .005 ? 'visible' : 'hidden';
  const percent = Math.round(s.progress * 100);
  if (lastPercent !== percent) {
    progressElement.setAttribute('aria-valuenow', String(percent));
    progressNumber.textContent = String(percent).padStart(3, '0');
    powerValue.textContent = String(Math.round(s.circuit * 100)).padStart(3, '0');
    signalValue.textContent = String(Math.round(s.logic * 100)).padStart(3, '0');
    objectLabel.textContent = s.progress < .22 ? 'ENERGY IN ITS RAWEST FORM' : s.progress < .48 ? 'EVERY CONNECTION, A POSSIBILITY' : s.progress < .8 ? 'WHERE SIGNAL BECOMES INTENTION' : 'ONE CURRENT. INFINITE POSSIBILITIES.';
    lastPercent = percent;
  }
  progressTrack.style.transform = `scaleX(${s.progress})`;
  scrollCue.style.opacity = String(1 - Math.min(1, s.progress * 12));
  caption.style.opacity = String(1 - s.outro);
  world?.update(s.progress, reduced);
}

function configureScroll() {
  timeline?.scrollTrigger?.kill();
  timeline?.kill();
  timeline = gsap.timeline({
    scrollTrigger: {
      trigger: journey,
      start: 'top top',
      end: 'bottom bottom',
      scrub: reduced ? true : .65,
      invalidateOnRefresh: true,
      onRefresh: update,
    },
    onUpdate: update,
  }).fromTo(playhead, { progress: 0 }, { progress: 1, ease: 'none', duration: 1 });
  ScrollTrigger.refresh();
  update();
}

function applyMotion() {
  document.documentElement.classList.toggle('reduced-motion', reduced);
  motionButton.setAttribute('aria-pressed', String(reduced));
  configureScroll();
}

function onMotionToggle() {
  reduced = !reduced;
  userOverride = true;
  try { localStorage.setItem('elkapro-motion', reduced ? 'reduced' : 'full'); } catch { /* Non-persistent preference is sufficient. */ }
  applyMotion();
}
function onPreferenceChange() {
  if (!userOverride) { reduced = preference.matches; applyMotion(); }
}
function replay(event: Event) {
  event.preventDefault();
  // Native scrolling preserves keyboard, touch, browser history, and accessibility.
  window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
  identity.focus({ preventScroll: true });
}
function onPageShow() { ScrollTrigger.refresh(); update(); }

motionButton.addEventListener('click', onMotionToggle);
replayButton.addEventListener('click', replay);
const identity = element<HTMLAnchorElement>('.identity');
identity.addEventListener('click', replay);
preference.addEventListener('change', onPreferenceChange);
window.addEventListener('pageshow', onPageShow);
applyMotion();

function useFallback() {
  document.documentElement.classList.remove('webgl-ready');
  document.documentElement.classList.add('webgl-fallback');
  update();
}
try {
  world = createWorld(canvas, useFallback);
  world.update(playhead.progress, reduced);
  document.documentElement.classList.add('webgl-ready');
} catch (error) {
  console.warn('The 3D installation is unavailable; showing the SVG artwork.', error);
  useFallback();
}
void document.fonts.ready.then(() => ScrollTrigger.refresh());

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    timeline.scrollTrigger?.kill();
    timeline.kill();
    world?.dispose();
    motionButton.removeEventListener('click', onMotionToggle);
    replayButton.removeEventListener('click', replay);
    identity.removeEventListener('click', replay);
    preference.removeEventListener('change', onPreferenceChange);
    window.removeEventListener('pageshow', onPageShow);
  });
}
