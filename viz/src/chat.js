import { marked } from 'marked';

// Configure marked for safe, clean output
marked.setOptions({
  breaks: true,
  gfm: true,
});

export function initChat() {
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const messages = document.getElementById('chat-messages');

  async function sendQuery() {
    const prompt = input.value.trim();
    if (!prompt) return;

    input.value = '';
    input.disabled = true;
    sendBtn.disabled = true;

    appendMessage('user', prompt);
    const assistantEl = appendMessage('assistant', '');
    const bubble = assistantEl.querySelector('.chat-bubble');
    let rawText = '';

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        bubble.textContent = `Error: ${res.status} ${res.statusText}`;
        return;
      }

      // Handle SSE stream
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
              bubble.innerHTML = marked.parse(rawText);
              messages.scrollTop = messages.scrollHeight;
            }
          } catch { /* skip malformed lines */ }
        }
      }

      // Final render pass
      if (rawText) {
        bubble.innerHTML = marked.parse(rawText);
      }
    } catch (err) {
      bubble.textContent = `Connection error: ${err.message}. Is the server running?`;
    } finally {
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  function appendMessage(role, text) {
    const div = document.createElement('div');
    div.className = `chat-msg ${role}`;
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    if (role === 'user') {
      bubble.textContent = text;
    } else {
      bubble.innerHTML = text ? marked.parse(text) : '';
    }
    div.appendChild(bubble);
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  sendBtn.addEventListener('click', sendQuery);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuery();
    }
  });
}
