import DOMPurify from 'dompurify';
import { marked } from 'marked';

marked.setOptions({ breaks: true, gfm: true });

/** Render markdown to sanitized HTML. */
export function renderMarkdown(md) {
  return DOMPurify.sanitize(marked.parse(md));
}

export const TYPE_COLORS = {
  theory: '#ff6b6b',
  concept: '#4ecdc4',
  person: '#58a6ff',
  experiment: '#7ee787',
  'open-question': '#feca57',
};

export const TAG_COLORS = {
  'quantum-mechanics': '#a78bfa',
  'quantum-field-theory': '#818cf8',
  'quantum-information': '#6366f1',
  'quantum-gravity': '#c084fc',
  'string-theory': '#e879f9',
  'general-relativity': '#f472b6',
  'cosmology': '#fb923c',
  'black-holes': '#94a3b8',
  'particle-physics': '#f87171',
  'nuclear-and-subatomic': '#fbbf24',
  'astrophysics': '#34d399',
  'condensed-matter': '#2dd4bf',
  'thermodynamics': '#f97316',
  'mathematical-physics': '#60a5fa',
  'experimental-methods': '#a3e635',
  'foundations': '#c4b5fd',
  'history-and-philosophy': '#d4d4d8',
};

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
