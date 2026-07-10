import { describe, it, expect } from 'vitest';
import { detectDelimiter, parseCSV, generateMarkdown } from '../src/utils/csv.js';

describe('detectDelimiter', () => {
  it('detects comma delimiter', () => {
    const text = 'Name,Age,City\nAlice,30,Rome\nBob,25,Milan';
    expect(detectDelimiter(text)).toBe(',');
  });

  it('detects semicolon delimiter', () => {
    const text = 'Name;Age;City\nAlice;30;Rome\nBob;25;Milan';
    expect(detectDelimiter(text)).toBe(';');
  });

  it('detects tab delimiter', () => {
    const text = 'Name\tAge\tCity\nAlice\t30\tRome\nBob\t25\tMilan';
    expect(detectDelimiter(text)).toBe('\t');
  });

  it('defaults to comma for empty text', () => {
    expect(detectDelimiter('')).toBe(',');
  });
});

describe('parseCSV', () => {
  it('parses simple comma-separated CSV', () => {
    const text = 'Name,Age,City\nAlice,30,Rome\nBob,25,Milan';
    const { headers, rows } = parseCSV(text);
    expect(headers).toEqual(['Name', 'Age', 'City']);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual(['Alice', '30', 'Rome']);
    expect(rows[1]).toEqual(['Bob', '25', 'Milan']);
  });

  it('parses semicolon-separated CSV', () => {
    const text = 'Name;Age;City\nAlice;30;Rome\nBob;25;Milan';
    const { headers, rows } = parseCSV(text);
    expect(headers).toEqual(['Name', 'Age', 'City']);
    expect(rows).toHaveLength(2);
  });

  it('handles quoted fields with commas inside', () => {
    const text = 'Name,Description,Price\n"Widget, Large","A big, heavy widget",19.99\n"Gadget, Small","A small gadget",9.99';
    const { headers, rows } = parseCSV(text);
    expect(headers).toEqual(['Name', 'Description', 'Price']);
    expect(rows[0]).toEqual(['Widget, Large', 'A big, heavy widget', '19.99']);
    expect(rows[1]).toEqual(['Gadget, Small', 'A small gadget', '9.99']);
  });

  it('handles quoted fields with escaped quotes', () => {
    const text = 'Name,Description\n"Say ""Hello""",Test';
    const { headers, rows } = parseCSV(text);
    expect(headers).toEqual(['Name', 'Description']);
    expect(rows[0]).toEqual(['Say "Hello"', 'Test']);
  });

  it('handles CRLF line endings', () => {
    const text = 'A,B,C\r\n1,2,3\r\n4,5,6';
    const { headers, rows } = parseCSV(text);
    expect(headers).toEqual(['A', 'B', 'C']);
    expect(rows).toHaveLength(2);
  });

  it('handles mixed line endings', () => {
    const text = 'A,B,C\n1,2,3\r\n4,5,6';
    const { headers, rows } = parseCSV(text);
    expect(headers).toEqual(['A', 'B', 'C']);
    expect(rows).toHaveLength(2);
  });

  it('handles empty fields', () => {
    const text = 'A,B,C\n1,,3\n,2,';
    const { headers, rows } = parseCSV(text);
    expect(rows[0]).toEqual(['1', '', '3']);
    expect(rows[1]).toEqual(['', '2', '']);
  });

  it('returns empty arrays for empty input', () => {
    const { headers, rows } = parseCSV('');
    expect(headers).toEqual([]);
    expect(rows).toEqual([]);
  });

  it('handles single-row CSV (headers only)', () => {
    const text = 'Name,Age,City';
    const { headers, rows } = parseCSV(text);
    expect(headers).toEqual(['Name', 'Age', 'City']);
    expect(rows).toEqual([]);
  });

  it('normalizes row lengths to match headers', () => {
    const text = 'A,B,C\n1,2\n4,5,6,7';
    const { headers, rows } = parseCSV(text);
    expect(rows[0]).toHaveLength(3);
    expect(rows[1]).toHaveLength(3);
  });

  it('handles quoted fields spanning multiple lines', () => {
    const text = 'Name,Description\n"Widget","Line 1\nLine 2"';
    const { headers, rows } = parseCSV(text);
    expect(rows[0]).toEqual(['Widget', 'Line 1\nLine 2']);
  });
});

describe('generateMarkdown', () => {
  it('generates a basic markdown table', () => {
    const headers = ['Name', 'Age', 'City'];
    const rows = [
      ['Alice', '30', 'Rome'],
      ['Bob', '25', 'Milan']
    ];
    const md = generateMarkdown(headers, rows);
    // Check that header row exists
    expect(md).toMatch(/^\| Name\s+\| Age\s+\| City\s+\|/m);
    expect(md).toMatch(/^\| Alice\s+\| 30\s+\| Rome\s+\|/m);
    expect(md).toMatch(/^\| Bob\s+\| 25\s+\| Milan\s+\|/m);
    expect(md).toMatch(/\| -{3,} \| -{3,} \| -{3,} \|/); // separator row
  });

  it('handles empty headers', () => {
    expect(generateMarkdown([], [])).toBe('');
  });

  it('aligns columns properly', () => {
    const headers = ['A', 'VeryLongHeader'];
    const rows = [['x', 'short']];
    const md = generateMarkdown(headers, rows);
    const lines = md.trim().split('\n');
    // Check that separator has proper widths
    expect(lines[1]).toContain('---');
  });

  it('handles single column', () => {
    const headers = ['Name'];
    const rows = [['Alice'], ['Bob']];
    const md = generateMarkdown(headers, rows);
    expect(md).toMatch(/^\| Name\s+\|/m);
    expect(md).toMatch(/^\| Alice\s+\|/m);
  });

  it('handles empty cells', () => {
    const headers = ['A', 'B'];
    const rows = [['', 'x'], ['y', '']];
    const md = generateMarkdown(headers, rows);
    expect(md).toMatch(/^\|\s+\| x\s+\|/m);
    expect(md).toMatch(/^\| y\s+\|\s+\|/m);
  });
});
