import { renderGraph } from './renderers/graph.js';
import { renderTimeline } from './renderers/timeline.js';
import { renderTable } from './renderers/table.js';
import { initChat } from './chat.js';
const TYPE_COLORS = {
  theory: '#ff6b6b',
  concept: '#4ecdc4',
  person: '#45b7d1',
  experiment: '#7ee787',
  'open-question': '#feca57',
};

let kbData = null;
let currentView = 'graph';
let currentRenderer = null;
let activeTypes = new Set(Object.keys(TYPE_COLORS));
let searchQuery = '';

// Tooltip
const tooltip = document.getElementById('tooltip');

function showTooltip(event, d) {
  const t = tooltip;
  t.querySelector('.tooltip-title').textContent = d.title;
  t.querySelector('.tooltip-desc').textContent = d.description || '';
  const badge = t.querySelector('.tooltip-type');
  badge.textContent = d.type;
  badge.style.background = TYPE_COLORS[d.type] + '33';
  badge.style.color = TYPE_COLORS[d.type];

  const x = event.clientX + 12;
  const y = event.clientY - 10;
  t.style.left = x + 'px';
  t.style.top = y + 'px';
  t.classList.add('visible');
}

function hideTooltip() {
  tooltip.classList.remove('visible');
}

// Detail panel
function showDetail(event, d) {
  let panel = document.querySelector('.detail-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.className = 'detail-panel';
    document.getElementById('viewer').appendChild(panel);
  }

  panel.innerHTML = `
    <button class="detail-close" onclick="this.parentElement.classList.remove('open')">&times;</button>
    <h2>${d.title}</h2>
    <div class="detail-meta">
      <span class="artifact-badge" style="background:${TYPE_COLORS[d.type]}33;color:${TYPE_COLORS[d.type]}">${d.type}</span>
      ${d.evidence ? `<span style="color:var(--text-muted)">evidence: ${d.evidence}</span>` : ''}
    </div>
    <div class="detail-body">
      <p>${d.description || 'No description available.'}</p>
      ${d.connections ? `<p style="margin-top:12px;color:var(--text-muted)">${d.connections} connections</p>` : ''}
      ${d.sources?.length ? `<p style="margin-top:8px;color:var(--text-muted)">Sources: ${d.sources.join(', ')}</p>` : ''}
    </div>
  `;

  requestAnimationFrame(() => panel.classList.add('open'));
}

// View switching
function switchView(view) {
  currentView = view;
  document.querySelectorAll('.view-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.view === view);
  });

  if (currentRenderer?.destroy) currentRenderer.destroy();
  const viewer = document.getElementById('viewer');

  if (view === 'graph' && kbData) {
    currentRenderer = renderGraph(viewer, kbData, {
      onNodeHover: showTooltip,
      onNodeLeave: hideTooltip,
      onNodeClick: showDetail,
    });
  } else if (view === 'timeline' && kbData) {
    currentRenderer = renderTimeline(viewer, kbData);
  } else if (view === 'table' && kbData) {
    currentRenderer = renderTable(viewer, kbData);
  } else {
    viewer.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted)">
      <p>Select a view or load an artifact</p>
    </div>`;
  }
}

// Type filters
function initTypeFilters() {
  const container = document.getElementById('type-filters');
  container.innerHTML = Object.entries(TYPE_COLORS).map(([type, color]) =>
    `<span class="type-filter active" data-type="${type}" style="color:${color}">
      <span class="dot" style="background:${color}"></span>
      ${type}
    </span>`
  ).join('');

  container.addEventListener('click', (e) => {
    const filter = e.target.closest('.type-filter');
    if (!filter) return;

    const type = filter.dataset.type;
    filter.classList.toggle('active');
    if (filter.classList.contains('active')) {
      activeTypes.add(type);
    } else {
      activeTypes.delete(type);
    }
    if (currentRenderer?.updateFilter) {
      currentRenderer.updateFilter(activeTypes, searchQuery);
    }
  });
}

// Search
function initSearch() {
  const input = document.getElementById('search-input');
  input.addEventListener('input', () => {
    searchQuery = input.value;
    if (currentRenderer?.updateFilter) {
      currentRenderer.updateFilter(activeTypes, searchQuery);
    }
  });
}

// Chat panel resize
function initChatResize() {
  const handle = document.getElementById('chat-resize');
  const app = document.getElementById('app');
  let dragging = false;

  handle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    dragging = true;
    handle.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const appRect = app.getBoundingClientRect();
    const newWidth = Math.max(280, Math.min(appRect.width * 0.7, appRect.right - e.clientX));
    app.style.setProperty('--chat-width', newWidth + 'px');
  });

  window.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    handle.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    // Re-render graph after resize
    if (currentView === 'graph') switchView('graph');
  });
}

// Sidebar & Chat toggles
function initToggles() {
  document.getElementById('btn-sidebar').addEventListener('click', () => {
    document.getElementById('app').classList.toggle('sidebar-open');
    // Resize viewer after layout change
    setTimeout(() => {
      if (currentView === 'graph') switchView('graph');
    }, 50);
  });

  document.getElementById('btn-chat').addEventListener('click', () => {
    document.getElementById('app').classList.toggle('chat-open');
    setTimeout(() => {
      if (currentView === 'graph') switchView('graph');
    }, 50);
  });

  document.getElementById('btn-chat-close').addEventListener('click', () => {
    document.getElementById('app').classList.remove('chat-open');
    setTimeout(() => {
      if (currentView === 'graph') switchView('graph');
    }, 50);
  });
}

// Sidebar artifacts
async function loadArtifacts() {
  try {
    const res = await fetch('/api/artifacts');
    if (!res.ok) return;
    const artifacts = await res.json();
    const list = document.getElementById('artifact-list');
    if (!artifacts.length) {
      list.innerHTML = '<div style="padding:16px;color:var(--text-muted);font-size:12px">No artifacts yet. Ask a question to generate one.</div>';
      return;
    }
    list.innerHTML = artifacts.map(a => `
      <div class="artifact-item" data-filename="${a.filename}">
        <div class="artifact-title">
          <span class="artifact-badge" style="background:var(--accent-dim);color:var(--accent)">${a.type}</span>
          ${escapeHtml(a.title || a.filename)}
          <button class="artifact-delete" data-filename="${a.filename}" title="Delete artifact">&times;</button>
        </div>
        <div class="artifact-meta">${a.created || ''} ${a.query ? '— ' + escapeHtml(a.query.slice(0, 50)) : ''}</div>
      </div>
    `).join('');

    list.addEventListener('click', async (e) => {
      // Handle delete
      const deleteBtn = e.target.closest('.artifact-delete');
      if (deleteBtn) {
        e.stopPropagation();
        const filename = deleteBtn.dataset.filename;
        const res = await fetch(`/api/artifacts/${filename}`, { method: 'DELETE' });
        if (res.ok) {
          loadArtifacts();
        }
        return;
      }
      // Handle load
      const item = e.target.closest('.artifact-item');
      if (!item) return;
      const res = await fetch(`/api/artifacts/${item.dataset.filename}`);
      const artifact = await res.json();
      displayArtifact(artifact);
    });
  } catch {
    // Server not running, that's fine
  }
}

function displayArtifact(artifact) {
  if (currentRenderer?.destroy) currentRenderer.destroy();
  const viewer = document.getElementById('viewer');
  viewer.innerHTML = '';

  if (artifact.html) {
    // HTML artifact — render in sandboxed iframe
    const iframe = document.createElement('iframe');
    iframe.className = 'artifact-iframe';
    iframe.sandbox = 'allow-scripts';
    iframe.srcdoc = artifact.html;
    viewer.appendChild(iframe);
  } else if (artifact.data) {
    // Legacy JSON artifact — try to render as table fallback
    const pre = document.createElement('pre');
    pre.style.cssText = 'padding:20px;color:var(--text-secondary);font-size:12px;overflow:auto;height:100%';
    pre.textContent = JSON.stringify(artifact.data, null, 2);
    viewer.appendChild(pre);
  }

  // Deactivate view tabs
  document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
  currentView = 'artifact';
  currentRenderer = { destroy() { viewer.innerHTML = ''; } };
}

// View tab clicks
function initViewTabs() {
  document.querySelectorAll('.view-tab').forEach(tab => {
    tab.addEventListener('click', () => switchView(tab.dataset.view));
  });
}

// HMR: auto-load new artifacts
if (import.meta.hot) {
  import.meta.hot.on('artifact-changed', async ({ filename }) => {
    try {
      const res = await fetch(`/api/artifacts/${filename}`);
      const artifact = await res.json();
      displayArtifact(artifact);
      loadArtifacts(); // refresh sidebar
    } catch { /* server may not be running */ }
  });
}

// Init
async function init() {
  const res = await fetch('/data/kb-graph.json');
  kbData = await res.json();

  initTypeFilters();
  initSearch();
  initToggles();
  initChatResize();
  initViewTabs();
  initChat();
  loadArtifacts();

  switchView('graph');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

init();
