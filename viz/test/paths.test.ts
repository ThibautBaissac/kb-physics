import { describe, it, expect } from 'vitest';
import { safePath } from '../server/paths.js';

describe('safePath', () => {
  const base = '/app/data';

  it('resolves a simple filename with default extension', () => {
    expect(safePath(base, 'my-file')).toBe('/app/data/my-file.json');
  });

  it('does not double-add extension if already present', () => {
    expect(safePath(base, 'my-file.json')).toBe('/app/data/my-file.json');
  });

  it('supports custom extensions', () => {
    expect(safePath(base, 'notes', '.md')).toBe('/app/data/notes.md');
    expect(safePath(base, 'notes.md', '.md')).toBe('/app/data/notes.md');
  });

  it('rejects directory traversal with ../', () => {
    expect(safePath(base, '../etc/passwd')).toBeNull();
    expect(safePath(base, '../../secret')).toBeNull();
  });

  it('rejects traversal disguised in subdirectories', () => {
    expect(safePath(base, 'subdir/../../outside')).toBeNull();
  });

  it('allows subdirectories within base', () => {
    expect(safePath(base, 'sub/file')).toBe('/app/data/sub/file.json');
  });
});
