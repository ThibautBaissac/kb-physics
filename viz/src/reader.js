import { renderMarkdown, escapeHtml, TYPE_COLORS, initPanelResize } from './constants.js';

let articles = [];
let articleCache = new Map();
let currentArticleId = null;

export function initReader(kbData) {
  articles = kbData.articles || [];

  document.getElementById('btn-reader-close').addEventListener('click', closeReader);

  const app = document.getElementById('app');
  initPanelResize(document.getElementById('reader-resize'), {
    onDrag(e) {
      const appRect = app.getBoundingClientRect();
      const chatWidth = app.classList.contains('chat-open')
        ? parseFloat(getComputedStyle(app).getPropertyValue('--chat-width')) || 0
        : 0;
      const newWidth = Math.max(300, Math.min(appRect.width * 0.75, appRect.right - chatWidth - e.clientX));
      app.style.setProperty('--reader-width', newWidth + 'px');
    },
  });
}

export async function openReader(articleId, { breadcrumb } = {}) {
  const app = document.getElementById('app');
  app.classList.add('reader-open');

  // Close detail panel if open
  const detailPanel = document.querySelector('.detail-panel.open');
  if (detailPanel) detailPanel.classList.remove('open');

  // Breadcrumb
  const breadcrumbEl = document.getElementById('reader-breadcrumb');
  if (breadcrumb) {
    const color = TYPE_COLORS[breadcrumb.type] || 'var(--accent)';
    breadcrumbEl.innerHTML = `<span class="reader-breadcrumb-node" style="color:${color}">\u2190 ${escapeHtml(breadcrumb.title)}</span>`;
    breadcrumbEl.classList.add('has-context');
  } else {
    breadcrumbEl.innerHTML = '';
    breadcrumbEl.classList.remove('has-context');
  }

  // Article metadata from client-side data
  const meta = articles.find(a => a.id === articleId);
  const metaEl = document.getElementById('reader-meta');
  if (meta) {
    metaEl.innerHTML = `
      <h1>${escapeHtml(meta.title)}</h1>
      <div class="reader-meta-line">
        ${escapeHtml(meta.author)} &mdash; ${escapeHtml(meta.publication)}, ${escapeHtml(meta.created_at)}
      </div>
      ${meta.url ? `<div class="reader-meta-line"><a href="${escapeHtml(meta.url)}" target="_blank" rel="noopener">Original article \u2197</a></div>` : ''}
    `;
  } else {
    metaEl.innerHTML = `<h1>${escapeHtml(articleId.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '').replace(/-/g, ' '))}</h1>`;
  }

  const loadingEl = document.getElementById('reader-loading');
  const contentEl = document.getElementById('reader-content');
  currentArticleId = articleId;

  // Cached?
  if (articleCache.has(articleId)) {
    loadingEl.style.display = 'none';
    contentEl.style.display = '';
    contentEl.innerHTML = renderMarkdown(articleCache.get(articleId));
    contentEl.scrollTop = 0;
    return;
  }

  // Fetch
  loadingEl.style.display = 'flex';
  contentEl.style.display = 'none';

  try {
    const category = meta?.category || 'articles';
    const res = await fetch(`/api/page/raw/${category}/${articleId}`);
    if (!res.ok) throw new Error(`${res.status}`);
    const { content } = await res.json();
    // Strip YAML frontmatter
    const body = content.replace(/^---[\s\S]*?---\n*/, '');
    articleCache.set(articleId, body);
    contentEl.innerHTML = renderMarkdown(body);
    contentEl.scrollTop = 0;
  } catch (err) {
    contentEl.innerHTML = `<p style="color:var(--text-muted)">Failed to load article. (${escapeHtml(err.message)})</p>`;
  } finally {
    loadingEl.style.display = 'none';
    contentEl.style.display = '';
  }
}

export function closeReader() {
  document.getElementById('app').classList.remove('reader-open');
  currentArticleId = null;
}
