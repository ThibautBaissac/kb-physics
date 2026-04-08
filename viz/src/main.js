import { renderGraph } from './renderers/graph.js';
import { renderTimeline } from './renderers/timeline.js';
import { renderTable } from './renderers/table.js';
import { initChat, prefillChat } from './chat.js';
import { TYPE_COLORS, TAG_COLORS, escapeHtml } from './constants.js';

let kbData = null;
let currentView = 'graph';
let currentRenderer = null;
let activeTypes = new Set(Object.keys(TYPE_COLORS));
let activeTags = new Set();
let searchQuery = '';
// Rule 4: shared selection state across views
let selectedNodeId = null;

const tooltip = document.getElementById('tooltip');

function showTooltip(event, d) {
  const t = tooltip;
  t.querySelector('.tooltip-title').textContent = d.title;
  t.querySelector('.tooltip-desc').textContent = d.description || '';
  const badge = t.querySelector('.tooltip-type');
  badge.textContent = d.type;
  badge.style.background = TYPE_COLORS[d.type] + '33';
  badge.style.color = TYPE_COLORS[d.type];
  t.style.left = (event.clientX + 12) + 'px';
  t.style.top = (event.clientY - 10) + 'px';
  t.classList.add('visible');
}

function hideTooltip() {
  tooltip.classList.remove('visible');
}

// Rule 3 + 4: detail panel with Ask AI button
function showDetail(event, d) {
  // Rule 4: update shared selection state
  selectedNodeId = d.id;
  // Notify current renderer of selection (if it's not graph — graph handles its own)
  if (currentRenderer?.setSelection && currentView !== 'graph') {
    currentRenderer.setSelection(d.id);
  }

  let panel = document.querySelector('.detail-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.className = 'detail-panel';
    document.getElementById('viewer').appendChild(panel);
  }

  const safeTitle = escapeHtml(d.title);
  const safeDesc = escapeHtml(d.description || 'No description available.');
  const safeType = escapeHtml(d.type);
  const safeEvidence = d.evidence ? escapeHtml(d.evidence) : '';
  const safeSources = d.sources?.length ? escapeHtml(d.sources.join(', ')) : '';
  const tagsHtml = (d.tags || []).map(t => {
    const color = TAG_COLORS[t] || '#888';
    return `<span class="tag-badge" style="background:${color}22;color:${color};border:1px solid ${color}44">${escapeHtml(t)}</span>`;
  }).join('');

  panel.innerHTML = `
    <button class="detail-close" onclick="this.parentElement.classList.remove('open')">&times;</button>
    <h2>${safeTitle}</h2>
    <div class="detail-meta">
      <span class="artifact-badge" style="background:${TYPE_COLORS[d.type]}33;color:${TYPE_COLORS[d.type]}">${safeType}</span>
      ${safeEvidence ? `<span style="color:var(--text-muted)">evidence: ${safeEvidence}</span>` : ''}
    </div>
    ${tagsHtml ? `<div class="detail-tags">${tagsHtml}</div>` : ''}
    <div class="detail-body">
      <p>${safeDesc}</p>
      ${d.connections ? `<p style="margin-top:12px;color:var(--text-muted)">${d.connections} connections</p>` : ''}
      ${safeSources ? `<p style="margin-top:8px;color:var(--text-muted)">Sources: ${safeSources}</p>` : ''}
    </div>
    <button class="detail-ask-ai">Ask AI about this</button>
  `;

  // Rule 3: Ask AI button opens chat and pre-fills
  panel.querySelector('.detail-ask-ai').addEventListener('click', () => {
    document.getElementById('app').classList.add('chat-open');
    updateChatContext(d);
    prefillChat(`Tell me about ${d.title}`);
  });

  requestAnimationFrame(() => panel.classList.add('open'));
}

// Rule 3: chat context strip update
function updateChatContext(d) {
  const strip = document.getElementById('chat-context-strip');
  if (!strip) return;
  if (d) {
    strip.textContent = `About: ${d.title}`;
    strip.style.display = '';
    strip.style.borderLeftColor = TYPE_COLORS[d.type] || 'var(--accent)';
  } else {
    strip.style.display = 'none';
  }
}

// View switching — Rule 4: pass selectedNodeId to each renderer
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
      // Rule 4: graph notifies main of selection so other views can reflect it
      onNodeSelect: (id) => { selectedNodeId = id; },
      selectedNodeId,
    });
  } else if (view === 'timeline' && kbData) {
    currentRenderer = renderTimeline(viewer, kbData, { selectedNodeId });
  } else if (view === 'table' && kbData) {
    currentRenderer = renderTable(viewer, kbData, { selectedNodeId });
  } else {
    viewer.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted)">
      <p>Select a view or load an artifact</p>
    </div>`;
  }
}

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
      currentRenderer.updateFilter(activeTypes, searchQuery, activeTags);
    }
  });
}

function initTagFilters() {
  const btn = document.getElementById('btn-tags');
  const dropdown = document.getElementById('tag-dropdown');
  if (!btn || !dropdown) return;

  dropdown.innerHTML = Object.entries(TAG_COLORS).map(([tag, color]) =>
    `<span class="tag-filter" data-tag="${tag}" style="color:${color}">
      <span class="dot" style="background:${color}"></span>
      ${tag}
    </span>`
  ).join('');

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && e.target !== btn) {
      dropdown.classList.remove('open');
    }
  });

  dropdown.addEventListener('click', (e) => {
    const filter = e.target.closest('.tag-filter');
    if (!filter) return;
    e.stopPropagation();
    const tag = filter.dataset.tag;
    filter.classList.toggle('active');
    if (filter.classList.contains('active')) {
      activeTags.add(tag);
    } else {
      activeTags.delete(tag);
    }
    btn.textContent = activeTags.size ? `Tags (${activeTags.size})` : 'Tags';
    if (currentRenderer?.updateFilter) {
      currentRenderer.updateFilter(activeTypes, searchQuery, activeTags);
    }
  });
}

function initSearch() {
  const input = document.getElementById('search-input');
  input.addEventListener('input', () => {
    searchQuery = input.value;
    if (currentRenderer?.updateFilter) {
      currentRenderer.updateFilter(activeTypes, searchQuery, activeTags);
    }
  });
}

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
  });
}

function initToggles() {
  document.getElementById('btn-sidebar').addEventListener('click', () => {
    document.getElementById('app').classList.toggle('sidebar-open');
  });

  document.getElementById('btn-chat').addEventListener('click', () => {
    document.getElementById('app').classList.toggle('chat-open');
  });

  document.getElementById('btn-chat-close').addEventListener('click', () => {
    document.getElementById('app').classList.remove('chat-open');
  });
}

function initArtifactList() {
  const list = document.getElementById('artifact-list');
  list.addEventListener('click', async (e) => {
    const deleteBtn = e.target.closest('.artifact-delete');
    if (deleteBtn) {
      e.stopPropagation();
      const filename = deleteBtn.dataset.filename;
      const res = await fetch(`/api/artifacts/${filename}`, { method: 'DELETE' });
      if (res.ok) loadArtifacts();
      return;
    }
    const item = e.target.closest('.artifact-item');
    if (!item) return;
    const res = await fetch(`/api/artifacts/${item.dataset.filename}`);
    const artifact = await res.json();
    displayArtifact(artifact);
  });
}

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
  } catch {
    // Server not running
  }
}

// Rule 10: artifact viewer with copy + expand toolbar
function displayArtifact(artifact) {
  if (currentRenderer?.destroy) currentRenderer.destroy();
  const viewer = document.getElementById('viewer');
  viewer.innerHTML = '';

  if (artifact.html) {
    const iframe = document.createElement('iframe');
    iframe.className = 'artifact-iframe';
    iframe.sandbox = 'allow-scripts';
    iframe.srcdoc = artifact.html;
    viewer.appendChild(iframe);

    // Rule 10: toolbar with Copy and Expand
    const toolbar = document.createElement('div');
    toolbar.className = 'artifact-toolbar';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'artifact-toolbar-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.title = 'Copy HTML to clipboard';
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(artifact.html);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
      } catch {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = artifact.html;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
      }
    });

    const expandBtn = document.createElement('button');
    expandBtn.className = 'artifact-toolbar-btn';
    expandBtn.textContent = 'Expand';
    expandBtn.title = 'Fullscreen';
    expandBtn.addEventListener('click', () => {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      } else if (iframe.webkitRequestFullscreen) {
        iframe.webkitRequestFullscreen();
      }
    });

    toolbar.appendChild(copyBtn);
    toolbar.appendChild(expandBtn);
    viewer.appendChild(toolbar);

  } else if (artifact.data) {
    const pre = document.createElement('pre');
    pre.style.cssText = 'padding:20px;color:var(--text-secondary);font-size:12px;overflow:auto;height:100%';
    pre.textContent = JSON.stringify(artifact.data, null, 2);
    viewer.appendChild(pre);
  }

  document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
  currentView = 'artifact';
  currentRenderer = { destroy() { viewer.innerHTML = ''; } };
}

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
      loadArtifacts();
    } catch { /* server may not be running */ }
  });
}

async function init() {
  try {
    const res = await fetch('/data/kb-graph.json');
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    kbData = await res.json();
  } catch (err) {
    document.getElementById('viewer').innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);flex-direction:column;gap:8px">
        <p>Failed to load KB graph data.</p>
        <p style="font-size:12px">Run <code>npm run parse</code> first. (${err.message})</p>
      </div>`;
  }

  initTypeFilters();
  initTagFilters();
  initSearch();
  initToggles();
  initChatResize();
  initViewTabs();
  initChat();
  initArtifactList();
  loadArtifacts();

  switchView('graph');
}

init();
