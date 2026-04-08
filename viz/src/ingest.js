import { escapeHtml, renderMarkdown } from './constants.js';

let onKBUpdated = null;
let timerInterval = null;
let startTime = 0;
let isRunning = false;
let renderRAF = null;

const els = {};

export function initIngest(reloadKBData) {
  onKBUpdated = reloadKBData;

  els.btn = document.getElementById('btn-add-source');
  els.backdrop = document.getElementById('ingest-backdrop');
  els.close = document.getElementById('ingest-close');
  els.form = document.getElementById('ingest-form');
  els.urlInput = document.getElementById('ingest-url');
  els.startBtn = document.getElementById('ingest-start');
  els.progress = document.getElementById('ingest-progress');
  els.statusText = document.getElementById('ingest-status-text');
  els.elapsed = document.getElementById('ingest-elapsed');
  els.toolLog = document.getElementById('ingest-tool-log');
  els.output = document.getElementById('ingest-output');
  els.status = document.getElementById('ingest-status');

  els.btn.addEventListener('click', openModal);
  els.close.addEventListener('click', closeModal);
  els.backdrop.addEventListener('click', (e) => {
    if (e.target === els.backdrop) closeModal();
  });
  els.startBtn.addEventListener('click', startIngest);
  els.urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); startIngest(); }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && els.backdrop.classList.contains('open')) closeModal();
  });

  checkRunningIngest();
}

function openModal() {
  if (!isRunning) showForm();
  els.backdrop.classList.add('open');
  if (els.form.style.display !== 'none') {
    els.urlInput.focus();
  }
}

function closeModal() {
  els.backdrop.classList.remove('open');
}

function showForm() {
  els.form.style.display = '';
  els.progress.style.display = 'none';
  els.urlInput.value = '';
  els.urlInput.disabled = false;
  els.startBtn.disabled = false;
}

function showProgress() {
  els.form.style.display = 'none';
  els.progress.style.display = '';
  els.output.innerHTML = '';
  els.toolLog.innerHTML = '';
  els.statusText.textContent = 'Starting...';
  els.status.classList.remove('done', 'error');
}

function setButtonRunning(running) {
  isRunning = running;
  if (running) {
    els.btn.classList.add('ingesting');
    els.btn.innerHTML = '<span class="agent-spinner"></span> Ingesting...';
  } else {
    els.btn.classList.remove('ingesting');
    els.btn.textContent = '+ Add source';
  }
}

function setButtonDone(success) {
  els.btn.classList.remove('ingesting');
  if (success) {
    els.btn.classList.add('ingest-done');
    els.btn.textContent = '\u2713 Source added';
    setTimeout(() => {
      els.btn.classList.remove('ingest-done');
      els.btn.textContent = '+ Add source';
    }, 3000);
  } else {
    els.btn.textContent = '+ Add source';
  }
}

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const secs = Math.floor((Date.now() - startTime) / 1000);
    els.elapsed.textContent = secs < 60 ? `${secs}s` : `${Math.floor(secs / 60)}m${String(secs % 60).padStart(2, '0')}s`;
  }, 1000);
}

function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

async function startIngest() {
  const url = els.urlInput.value.trim();
  if (!url) return;

  els.urlInput.disabled = true;
  els.startBtn.disabled = true;

  // Start the background ingest
  try {
    const res = await fetch('/api/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      els.output.innerHTML = `<div style="color:#ff6b6b">${escapeHtml(err.error || 'Failed to start')}</div>`;
      els.urlInput.disabled = false;
      els.startBtn.disabled = false;
      return;
    }
  } catch (err) {
    els.output.innerHTML = `<div style="color:#ff6b6b">Connection error: ${escapeHtml(err.message)}</div>`;
    els.urlInput.disabled = false;
    els.startBtn.disabled = false;
    return;
  }

  showProgress();
  setButtonRunning(true);
  startTimer();
  streamEvents();
}

async function streamEvents() {
  let rawText = '';

  try {
    const res = await fetch('/api/ingest/events');
    if (!res.ok) {
      els.output.innerHTML = '<div style="color:#ff6b6b">Failed to connect to event stream</div>';
      onFinish(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const data = JSON.parse(line.slice(6));
          if (data.type === 'text') {
            rawText += data.content;
            els.statusText.textContent = 'Writing...';
            if (!renderRAF) {
              renderRAF = requestAnimationFrame(() => {
                els.output.innerHTML = renderMarkdown(rawText);
                els.output.scrollTop = els.output.scrollHeight;
                renderRAF = null;
              });
            }
          } else if (data.type === 'error') {
            els.output.innerHTML += `<div style="color:#ff6b6b;margin-top:8px">Error: ${escapeHtml(data.content)}</div>`;
            els.output.scrollTop = els.output.scrollHeight;
          } else if (data.type === 'tool') {
            els.statusText.textContent = `Using ${data.tool}`;
            const entry = document.createElement('div');
            entry.className = 'agent-tool-entry';
            entry.textContent = data.detail ? `${data.tool}: ${data.detail}` : data.tool;
            els.toolLog.appendChild(entry);
            while (els.toolLog.children.length > 4) els.toolLog.removeChild(els.toolLog.firstChild);
          } else if (data.type === 'kb_updated') {
            if (onKBUpdated) onKBUpdated();
          } else if (data.type === 'done') {
            onFinish(true);
            return;
          }
        } catch { /* skip malformed */ }
      }
    }

    // Stream ended without explicit done
    onFinish(!!rawText);
  } catch (err) {
    if (err.name !== 'AbortError') {
      els.output.innerHTML += `<div style="color:#ff6b6b;margin-top:8px">Connection lost: ${escapeHtml(err.message)}</div>`;
    }
    onFinish(false);
  }
}

function onFinish(success) {
  stopTimer();
  if (renderRAF) { cancelAnimationFrame(renderRAF); renderRAF = null; }
  els.status.classList.add(success ? 'done' : 'error');
  els.statusText.textContent = success ? 'Done' : 'Failed';
  els.status.querySelector('.agent-spinner')?.remove();
  setButtonDone(success);
}

/** On page load, check if a background ingest is running and reconnect. */
async function checkRunningIngest() {
  try {
    const res = await fetch('/api/ingest/status');
    if (!res.ok) return;
    const status = await res.json();
    if (!status.running) return;

    // Reconnect to in-progress ingest
    showProgress();
    setButtonRunning(true);
    startTime = status.startedAt;
    startTimer();
    streamEvents();
  } catch { /* server not running */ }
}
