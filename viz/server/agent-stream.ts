import type { ContentBlockToolUse, IngestEvent, SDKAssistantMessage, SDKResultMessage } from './types.js';

/** Extract a human-readable detail string from a tool_use block. */
export function toolEvent(block: ContentBlockToolUse): IngestEvent {
  const name = block.name || '';
  const input = (block.input || {}) as Record<string, string>;
  let detail = '';
  if (name === 'Read' && input.file_path) detail = input.file_path.replace(/.*\/kb\//, 'kb/');
  else if (name === 'Glob' && input.pattern) detail = input.pattern;
  else if (name === 'Grep' && input.pattern) detail = `"${input.pattern}"`;
  else if ((name === 'Write' || name === 'Edit') && input.file_path) detail = input.file_path.replace(/.*\/kb\//, 'kb/');
  else if (name === 'WebFetch' && input.url) detail = input.url.slice(0, 80);
  else if (name === 'Bash' && input.command) detail = input.command.slice(0, 60);
  return { type: 'tool', tool: name, detail };
}

/** Process the SDK agent stream, emitting normalized events via the callback. */
export async function processAgentStream(
  stream: AsyncIterable<any>,
  emit: (event: IngestEvent) => void,
) {
  for await (const message of stream) {
    if (message.type === 'assistant') {
      const assistantMsg = message as SDKAssistantMessage;
      const content = assistantMsg.message?.content;
      if (Array.isArray(content)) {
        for (const block of content) {
          if (block.type === 'text' && block.text) {
            emit({ type: 'text', content: block.text });
          } else if (block.type === 'tool_use') {
            emit(toolEvent(block));
          }
        }
      }
    } else if (message.type === 'result') {
      const resultMsg = message as SDKResultMessage;
      if (resultMsg.subtype === 'success' && resultMsg.result) {
        emit({ type: 'text', content: resultMsg.result });
      }
      if (resultMsg.subtype === 'error_max_turns') {
        emit({ type: 'error', content: 'Agent reached max turns limit.' });
      }
      if ('errors' in resultMsg && resultMsg.errors?.length) {
        console.error('[agent result errors]', resultMsg.errors);
        emit({ type: 'error', content: resultMsg.errors.join('\n') });
      }
    }
  }
}
