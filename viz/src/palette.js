import { TYPE_COLORS, escapeHtml } from './constants.js';

let items = [];        // combined nodes + articles
let overlay = null;
let input = null;
let list = null;
let activeIndex = 0;
let filtered = [];
let onSelectNode = null;   // callback: (node) => void
let onSelectArticle = null; // callback: (articleId) => void

export function initPalette(kbData, { onNode, onArticle }) {
  onSelectNode = onNode;
  onSelectArticle = onArticle;

  // Build search items: nodes first, then articles
  items = (kbData.nodes || []).map(n => ({
    id: n.id,
    title: n.title,
    description: n.description || '',
    type: n.type,
    kind: 'node',
    raw: n,
  }));

  for (const a of (kbData.articles || [])) {
    items.push({
      id: a.id,
      title: a.title,
      description: `${a.author} — ${a.publication}`,
      type: 'article',
      kind: 'article',
      raw: a,
    });
  }

  // Build DOM
  overlay = document.createElement('div');
  overlay.className = 'palette-overlay';
  overlay.innerHTML = `
    <div class="palette">
      <input class="palette-input" type="text" placeholder="Jump to node or article..." />
      <div class="palette-list"></div>
      <div class="palette-hint"><kbd>↑↓</kbd> navigate <kbd>Enter</kbd> select <kbd>Esc</kbd> close</div>
    </div>
  `;
  document.body.appendChild(overlay);

  input = overlay.querySelector('.palette-input');
  list = overlay.querySelector('.palette-list');

  // Close on backdrop click
  overlay.addEventListener('mousedown', (e) => {
    if (e.target === overlay) closePalette();
  });

  // Input events
  input.addEventListener('input', () => {
    activeIndex = 0;
    renderResults();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, filtered.length - 1);
      updateActive();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      updateActive();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      selectItem(filtered[activeIndex]);
    } else if (e.key === 'Escape') {
      closePalette();
    }
  });

  // Global shortcut: Cmd+K / Ctrl+K
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (overlay.classList.contains('open')) {
        closePalette();
      } else {
        openPalette();
      }
    }
  });
}

export function openPalette() {
  overlay.classList.add('open');
  input.value = '';
  activeIndex = 0;
  renderResults();
  input.focus();
}

function closePalette() {
  overlay.classList.remove('open');
  input.value = '';
}

function renderResults() {
  const q = input.value.toLowerCase().trim();

  if (!q) {
    // Show top nodes by connection count
    filtered = items
      .filter(i => i.kind === 'node')
      .sort((a, b) => (b.raw.connections || 0) - (a.raw.connections || 0))
      .slice(0, 12);
  } else {
    // Score and filter
    filtered = [];
    for (const item of items) {
      const titleLower = item.title.toLowerCase();
      const descLower = item.description.toLowerCase();
      let score = 0;

      if (titleLower === q) {
        score = 100;
      } else if (titleLower.startsWith(q)) {
        score = 80;
      } else if (titleLower.includes(q)) {
        score = 60;
      } else if (descLower.includes(q)) {
        score = 30;
      }

      if (score > 0) {
        filtered.push({ ...item, _score: score });
      }
    }
    filtered.sort((a, b) => b._score - a._score);
    filtered = filtered.slice(0, 20);
  }

  list.innerHTML = filtered.length
    ? filtered.map((item, i) => {
        const color = TYPE_COLORS[item.type] || '#c9d1d9';
        const desc = escapeHtml(truncate(item.description, 80));
        const title = highlightMatch(escapeHtml(item.title), q);
        return `<div class="palette-item${i === activeIndex ? ' active' : ''}" data-index="${i}">
          <span class="palette-dot" style="background:${color}"></span>
          <div class="palette-item-text">
            <span class="palette-item-title">${title}</span>
            <span class="palette-item-desc">${desc}</span>
          </div>
          <span class="palette-item-type" style="color:${color}">${escapeHtml(item.type)}</span>
        </div>`;
      }).join('')
    : '<div class="palette-empty">No results</div>';

  // Click handlers on items
  list.querySelectorAll('.palette-item').forEach(el => {
    el.addEventListener('mousedown', (e) => {
      e.preventDefault();
      selectItem(filtered[parseInt(el.dataset.index)]);
    });
    el.addEventListener('mouseenter', () => {
      activeIndex = parseInt(el.dataset.index);
      updateActive();
    });
  });
}

function updateActive() {
  list.querySelectorAll('.palette-item').forEach((el, i) => {
    el.classList.toggle('active', i === activeIndex);
  });
  // Scroll active into view
  const active = list.querySelector('.palette-item.active');
  if (active) active.scrollIntoView({ block: 'nearest' });
}

function selectItem(item) {
  if (!item) return;
  closePalette();

  if (item.kind === 'article' && onSelectArticle) {
    onSelectArticle(item.id);
  } else if (item.kind === 'node' && onSelectNode) {
    onSelectNode(item.raw);
  }
}

function truncate(str, max) {
  if (!str || str.length <= max) return str || '';
  return str.slice(0, max) + '...';
}

function highlightMatch(escapedTitle, query) {
  if (!query) return escapedTitle;
  const idx = escapedTitle.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return escapedTitle;
  const before = escapedTitle.slice(0, idx);
  const match = escapedTitle.slice(idx, idx + query.length);
  const after = escapedTitle.slice(idx + query.length);
  return `${before}<mark>${match}</mark>${after}`;
}
