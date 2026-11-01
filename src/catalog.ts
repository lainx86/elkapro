import './style.css';
import { mountMaterials } from './materials';

const root = document.querySelector<HTMLElement>('#catalog-materials');
if (!root) throw new Error('Missing material catalog');
const dispose = mountMaterials(root);
if (import.meta.hot) import.meta.hot.dispose(dispose);
