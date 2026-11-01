import './style.css';

// Keep the landing page's explicit motion preference on the reading page too.
try {
  document.documentElement.classList.toggle('reduced-motion', localStorage.getItem('elkapro-motion') === 'reduced');
} catch { /* CSS still follows the device preference when storage is unavailable. */ }

const figures = document.querySelectorAll<HTMLElement>('.story-figure');
const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add('is-visible');
    observer?.unobserve(entry.target);
  }
}, { threshold: .3 }) : undefined;
figures.forEach(figure => observer?.observe(figure));

if (import.meta.hot) import.meta.hot.dispose(() => observer?.disconnect());
