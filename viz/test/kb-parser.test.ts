import { describe, it, expect } from 'vitest';
import { formatDate } from '../server/kb-parser.js';

describe('formatDate', () => {
  it('returns empty string for falsy values', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
    expect(formatDate('')).toBe('');
  });

  it('returns YYYY-MM-DD strings as-is', () => {
    expect(formatDate('2024-01-15')).toBe('2024-01-15');
    expect(formatDate('2025-12-31')).toBe('2025-12-31');
  });

  it('converts Date objects to YYYY-MM-DD', () => {
    const date = new Date('2024-06-15T12:00:00Z');
    expect(formatDate(date)).toBe('2024-06-15');
  });

  it('parses ISO date strings into YYYY-MM-DD', () => {
    expect(formatDate('2024-03-20T10:30:00Z')).toBe('2024-03-20');
  });

  it('returns unparseable strings as-is', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });

  it('handles non-string non-Date values via String() + new Date()', () => {
    // Numbers get String()-ed, then parsed: '42' → new Date('42') → valid date
    expect(formatDate(42)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // Booleans: String(true) = 'true' → new Date('true') is invalid → returns 'true'
    expect(formatDate(true)).toBe('true');
  });
});
