import { escapeHtml, renderMarkdown } from './constants.js';

let currentChatId = null;
let chatMessages = []; // { role: 'user'|'assistant', content: string }
let activeQueryController = null;
let contextUsage = { input_tokens: 0, output_tokens: 0 };

const MAX_CONTEXT = 200_000;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * 6; // ~37.7

function updateContextGauge(usage) {
  contextUsage = usage;
  const arc = document.getElementById('context-gauge-arc');
  const tip = document.getElementById('context-gauge-tooltip');
  if (!arc) return;

  const total = usage.input_tokens + usage.output_tokens;
  const pct = Math.min(total / MAX_CONTEXT, 1);

  arc.setAttribute('stroke-dashoffset', String(GAUGE_CIRCUMFERENCE * (1 - pct)));

  let color = '#58a6ff';
  if (pct >= 0.9) color = '#f85149';
  else if (pct >= 0.75) color = '#d29922';
  arc.setAttribute('stroke', color);

  arc.style.opacity = String(Math.max(0.15, pct));

  if (tip) {
    const fmt = (n) => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);
    tip.textContent = `${fmt(total)} / ${fmt(MAX_CONTEXT)} tokens (${Math.round(pct * 100)}%)`;
  }
}

// Rule 3: pre-fill chat input from external callers
export function prefillChat(text) {
  const input = document.getElementById('chat-input');
  if (!input) return;
  input.value = text;
  input.focus();
  // auto-expand textarea
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 120) + 'px';
}

export function initChat() {
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const messagesEl = document.getElementById('chat-messages');

  renderChatHeader();
  loadChatList();

  /**
   * Stream an SSE response from an API endpoint into the chat messages area.
   * Returns the accumulated raw text from the agent.
   */
  async function streamSSE(endpoint, body, signal) {
    let rawText = '';
    const startTime = Date.now();

    const assistantDiv = document.createElement('div');
    assistantDiv.className = 'chat-msg assistant';

    const statusBar = document.createElement('div');
    statusBar.className = 'agent-status';
    statusBar.innerHTML = '<span class="agent-spinner"></span> <span class="agent-status-text">Connecting...</span> <span class="agent-elapsed">0s</span>';
    assistantDiv.appendChild(statusBar);

    const assistantBubble = document.createElement('div');
    assistantBubble.className = 'chat-bubble';
    assistantBubble.style.display = 'none';
    assistantDiv.appendChild(assistantBubble);

    messagesEl.appendChild(assistantDiv);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    const elapsedEl = statusBar.querySelector('.agent-elapsed');
    const statusTextEl = statusBar.querySelector('.agent-status-text');
    const timerInterval = setInterval(() => {
      const secs = Math.floor((Date.now() - startTime) / 1000);
      elapsedEl.textContent = secs < 60 ? `${secs}s` : `${Math.floor(secs / 60)}m${String(secs % 60).padStart(2, '0')}s`;
    }, 1000);

    const toolLog = document.createElement('div');
    toolLog.className = 'agent-tool-log';
    statusBar.appendChild(toolLog);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal,
      });

      if (!res.ok) {
        clearInterval(timerInterval);
        statusBar.remove();
        assistantBubble.style.display = '';
        assistantBubble.textContent = `Error: ${res.status} ${res.statusText}`;
        return rawText;
      }

      statusTextEl.textContent = 'Thinking...';

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
              assistantBubble.style.display = '';
              assistantBubble.innerHTML = renderMarkdown(rawText);
              statusTextEl.textContent = 'Writing...';
              messagesEl.scrollTop = messagesEl.scrollHeight;
            } else if (data.type === 'error') {
              assistantBubble.style.display = '';
              assistantBubble.innerHTML += `<div style="color:#ff6b6b;margin-top:8px">Error: ${escapeHtml(data.content)}</div>`;
              messagesEl.scrollTop = messagesEl.scrollHeight;
            } else if (data.type === 'tool') {
              statusTextEl.textContent = `Using ${data.tool}`;
              const entry = document.createElement('div');
              entry.className = 'agent-tool-entry';
              entry.textContent = data.detail ? `${data.tool}: ${data.detail}` : data.tool;
              toolLog.appendChild(entry);
              while (toolLog.children.length > 4) toolLog.removeChild(toolLog.firstChild);
              messagesEl.scrollTop = messagesEl.scrollHeight;
            } else if (data.type === 'usage' && data.usage) {
              updateContextGauge(data.usage);
            }
          } catch { /* skip */ }
        }
      }

      clearInterval(timerInterval);
      statusBar.remove();

      if (rawText) {
        assistantBubble.style.display = '';
        assistantBubble.innerHTML = renderMarkdown(rawText);
      } else {
        assistantBubble.style.display = '';
        assistantBubble.innerHTML = '<span style="color:var(--text-muted)">No response received.</span>';
      }
    } catch (err) {
      clearInterval(timerInterval);
      statusBar.remove();
      if (err.name !== 'AbortError') {
        assistantBubble.style.display = '';
        assistantBubble.textContent = `Connection error: ${err.message}`;
      }
    }

    return rawText;
  }

  async function sendQuery() {
    const prompt = input.value.trim();
    if (!prompt) return;

    if (activeQueryController) activeQueryController.abort();
    activeQueryController = new AbortController();

    input.value = '';
    input.disabled = true;
    sendBtn.disabled = true;

    if (!currentChatId) {
      currentChatId = 'chat-' + Date.now();
      chatMessages = [];
    }

    chatMessages.push({ role: 'user', content: prompt });
    renderMessages();

    const rawText = await streamSSE('/api/query', { prompt }, activeQueryController.signal);

    if (rawText) {
      chatMessages.push({ role: 'assistant', content: rawText });
      await saveChat();
      loadChatList();
    }

    activeQueryController = null;
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
  }

  function renderMessages() {
    renderChatMessages();
  }

  sendBtn.addEventListener('click', sendQuery);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuery();
    }
  });
}

function renderChatHeader() {
  const header = document.querySelector('.chat-header');
  header.innerHTML = `
    <span style="display:flex;align-items:center;gap:6px">
      Ask the KB
      <span class="context-gauge-wrap">
        <svg width="16" height="16" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="6" fill="none" stroke="var(--border)" stroke-width="2.5" opacity="0.3"/>
          <circle cx="8" cy="8" r="6" fill="none" stroke="#58a6ff" stroke-width="2.5"
            stroke-dasharray="${GAUGE_CIRCUMFERENCE} ${GAUGE_CIRCUMFERENCE}" stroke-dashoffset="${GAUGE_CIRCUMFERENCE}"
            stroke-linecap="round" transform="rotate(-90 8 8)" id="context-gauge-arc" style="opacity:0.15"/>
        </svg>
        <div class="context-gauge-tooltip" id="context-gauge-tooltip">0 / 200k tokens (0%)</div>
      </span>
    </span>
    <div style="display:flex;gap:4px;align-items:center">
      <button class="toolbar-btn" id="btn-new-chat" title="New chat">+</button>
      <button class="toolbar-btn" id="btn-chat-history" title="Chat history">&#9776;</button>
      <button class="toolbar-btn" id="btn-chat-close">x</button>
    </div>
  `;

  document.getElementById('btn-new-chat').addEventListener('click', () => {
    currentChatId = null;
    chatMessages = [];
    document.getElementById('chat-messages').innerHTML = '';
    updateContextGauge({ input_tokens: 0, output_tokens: 0 });
    hideChatList();
  });

  document.getElementById('btn-chat-history').addEventListener('click', () => {
    const listEl = document.getElementById('chat-list');
    if (listEl) {
      listEl.style.display = listEl.style.display === 'none' ? 'block' : 'none';
    }
  });

  document.getElementById('btn-chat-close').addEventListener('click', () => {
    document.getElementById('app').classList.remove('chat-open');
  });
}

async function loadChatList() {
  let listEl = document.getElementById('chat-list');
  if (!listEl) {
    listEl = document.createElement('div');
    listEl.id = 'chat-list';
    listEl.className = 'chat-list';
    listEl.style.display = 'none';
    const messagesEl = document.getElementById('chat-messages');
    messagesEl.parentElement.insertBefore(listEl, messagesEl);
  }

  try {
    const res = await fetch('/api/chats');
    if (!res.ok) return;
    const chats = await res.json();

    if (!chats.length) {
      listEl.innerHTML = '<div class="chat-list-empty">No saved chats</div>';
      return;
    }

    listEl.innerHTML = chats.map(c => `
      <div class="chat-list-item ${c.id === currentChatId ? 'active' : ''}" data-id="${c.id}">
        <div class="chat-list-title">${escapeHtml(c.title || 'Untitled')}</div>
        <div class="chat-list-meta">
          ${c.messageCount} messages
          <button class="chat-list-delete" data-id="${c.id}" title="Delete">&times;</button>
        </div>
      </div>
    `).join('');

    listEl.onclick = async (e) => {
      const deleteBtn = e.target.closest('.chat-list-delete');
      if (deleteBtn) {
        e.stopPropagation();
        const id = deleteBtn.dataset.id;
        await fetch(`/api/chats/${id}`, { method: 'DELETE' });
        if (id === currentChatId) {
          currentChatId = null;
          chatMessages = [];
          document.getElementById('chat-messages').innerHTML = '';
        }
        loadChatList();
        return;
      }

      const item = e.target.closest('.chat-list-item');
      if (!item) return;
      const id = item.dataset.id;
      const res = await fetch(`/api/chats/${id}`);
      if (!res.ok) return;
      const chat = await res.json();
      currentChatId = chat.id;
      chatMessages = chat.messages || [];
      renderChatMessages();
      updateContextGauge({ input_tokens: 0, output_tokens: 0 });
      hideChatList();
    };
  } catch { /* server not running */ }
}

function renderChatMessages() {
  const messagesEl = document.getElementById('chat-messages');
  messagesEl.innerHTML = '';
  for (const msg of chatMessages) {
    const div = document.createElement('div');
    div.className = `chat-msg ${msg.role}`;
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    if (msg.role === 'user') {
      bubble.textContent = msg.content;
    } else {
      bubble.innerHTML = renderMarkdown(msg.content);
    }
    div.appendChild(bubble);
    messagesEl.appendChild(div);
  }
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function hideChatList() {
  const listEl = document.getElementById('chat-list');
  if (listEl) listEl.style.display = 'none';
}

async function saveChat() {
  if (!currentChatId || !chatMessages.length) return;

  const firstUserMsg = chatMessages.find(m => m.role === 'user');
  const title = firstUserMsg
    ? firstUserMsg.content.slice(0, 60) + (firstUserMsg.content.length > 60 ? '...' : '')
    : 'Untitled';

  const chat = {
    id: currentChatId,
    title,
    created: new Date().toISOString().slice(0, 10),
    messages: chatMessages,
  };

  await fetch(`/api/chats/${currentChatId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(chat),
  });
}

