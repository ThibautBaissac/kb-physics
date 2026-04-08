import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// vi.hoisted runs before vi.mock hoisting — safe to reference in mock factories
const { tmpBase, tmpKB, tmpArtifacts, tmpChats } = vi.hoisted(() => {
  const { mkdtempSync, mkdirSync } = require('fs');
  const { join } = require('path');
  const { tmpdir } = require('os');

  const tmpBase = mkdtempSync(join(tmpdir(), 'kb-test-'));
  const tmpKB = join(tmpBase, 'kb');
  const tmpArtifacts = join(tmpBase, 'artifacts');
  const tmpChats = join(tmpBase, 'chats');

  mkdirSync(tmpKB, { recursive: true });
  mkdirSync(tmpArtifacts, { recursive: true });
  mkdirSync(tmpChats, { recursive: true });

  return { tmpBase, tmpKB, tmpArtifacts, tmpChats };
});

// Mock paths — hoisted above imports
vi.mock('../server/paths.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../server/paths.js')>();
  return {
    ...actual,
    KB_PATH: tmpKB,
    ARTIFACTS_PATH: tmpArtifacts,
    CHATS_PATH: tmpChats,
    AGENT_PROMPT_PATH: join(tmpBase, 'agent-prompt.md'),
    INGEST_PROMPT_PATH: join(tmpBase, 'ingest-prompt.md'),
    ROOT_PATH: tmpBase,
  };
});

// Mock the agent SDK to avoid importing it (has side effects / peer deps)
vi.mock('@anthropic-ai/claude-agent-sdk', () => ({
  query: vi.fn(),
}));

import request from 'supertest';
import app from '../server/app.js';

function cleanDir(dir: string) {
  try {
    for (const f of readdirSync(dir)) unlinkSync(join(dir, f));
  } catch { /* empty is fine */ }
}

afterAll(() => {
  rmSync(tmpBase, { recursive: true, force: true });
});

describe('GET /api/page/*', () => {
  beforeAll(() => {
    mkdirSync(join(tmpKB, 'concepts'), { recursive: true });
    writeFileSync(join(tmpKB, 'concepts', 'entropy.md'), '---\ntitle: Entropy\n---\nContent here');
  });

  it('returns page content for an existing file', async () => {
    const res = await request(app).get('/api/page/concepts/entropy.md');
    expect(res.status).toBe(200);
    expect(res.body.path).toBe('concepts/entropy.md');
    expect(res.body.content).toContain('Entropy');
  });

  it('returns 404 for missing pages', async () => {
    const res = await request(app).get('/api/page/concepts/nonexistent.md');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/artifacts', () => {
  afterAll(() => cleanDir(tmpArtifacts));

  it('returns empty array when no artifacts exist', async () => {
    const res = await request(app).get('/api/artifacts');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('lists artifact metadata', async () => {
    const artifact = { id: 'a1', type: 'summary', title: 'Test', created: '2024-01-01', query: 'test' };
    writeFileSync(join(tmpArtifacts, 'a1.json'), JSON.stringify(artifact));

    const res = await request(app).get('/api/artifacts');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe('a1');
    expect(res.body[0].title).toBe('Test');
  });
});

describe('GET /api/artifacts/:filename', () => {
  beforeAll(() => {
    const artifact = { id: 'a2', type: 'summary', title: 'Full', body: 'details' };
    writeFileSync(join(tmpArtifacts, 'a2.json'), JSON.stringify(artifact));
  });

  afterAll(() => cleanDir(tmpArtifacts));

  it('returns full artifact content', async () => {
    const res = await request(app).get('/api/artifacts/a2');
    expect(res.status).toBe(200);
    expect(res.body.body).toBe('details');
  });

  it('returns 404 for missing artifact', async () => {
    const res = await request(app).get('/api/artifacts/missing');
    expect(res.status).toBe(404);
  });

  it('rejects traversal in filename', async () => {
    const res = await request(app).get('/api/artifacts/..%2F..%2Fetc%2Fpasswd');
    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/artifacts/:filename', () => {
  it('deletes an artifact', async () => {
    writeFileSync(join(tmpArtifacts, 'del.json'), '{}');

    const res = await request(app).delete('/api/artifacts/del');
    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe('del');
  });

  it('returns 404 for missing artifact', async () => {
    const res = await request(app).delete('/api/artifacts/nope');
    expect(res.status).toBe(404);
  });
});

describe('CRUD /api/chats', () => {
  afterAll(() => cleanDir(tmpChats));

  it('returns empty list when no chats exist', async () => {
    const res = await request(app).get('/api/chats');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('saves and retrieves a chat', async () => {
    const chat = { id: 'c1', title: 'Physics Q', created: '2024-01-01', messages: [{ role: 'user', content: 'hi' }] };

    const putRes = await request(app).put('/api/chats/c1').send(chat);
    expect(putRes.status).toBe(200);

    const getRes = await request(app).get('/api/chats/c1');
    expect(getRes.status).toBe(200);
    expect(getRes.body.title).toBe('Physics Q');
    expect(getRes.body.messages).toHaveLength(1);
  });

  it('lists chats with metadata', async () => {
    cleanDir(tmpChats);
    const chat = { id: 'c2', title: 'Another', created: '2024-02-01', messages: [] };
    writeFileSync(join(tmpChats, 'c2.json'), JSON.stringify(chat));

    const res = await request(app).get('/api/chats');
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe('c2');
    expect(res.body[0].messageCount).toBe(0);
  });

  it('deletes a chat', async () => {
    writeFileSync(join(tmpChats, 'c3.json'), '{}');

    const res = await request(app).delete('/api/chats/c3');
    expect(res.status).toBe(200);

    const getRes = await request(app).get('/api/chats/c3');
    expect(getRes.status).toBe(404);
  });
});
