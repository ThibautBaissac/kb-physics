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

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
