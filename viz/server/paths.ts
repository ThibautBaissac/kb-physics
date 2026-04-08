import { resolve } from 'path';

const __dirname = import.meta.dirname;

export const KB_PATH = resolve(__dirname, '../../kb');
export const ARTIFACTS_PATH = resolve(__dirname, '../artifacts');
export const AGENT_PROMPT_PATH = resolve(__dirname, 'agent-prompt.md');
export const CHATS_PATH = resolve(__dirname, '../chats');
export const INGEST_PROMPT_PATH = resolve(__dirname, 'ingest-prompt.md');
export const ROOT_PATH = resolve(__dirname, '../..');

/** Resolve a user-supplied filename/id within a base directory, rejecting traversal. */
export function safePath(base: string, untrusted: string, ext = '.json'): string | null {
  const resolved = resolve(base, untrusted.endsWith(ext) ? untrusted : untrusted + ext);
  if (!resolved.startsWith(base + '/') && resolved !== base) return null;
  return resolved;
}
