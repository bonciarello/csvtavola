/**
 * CSV Parser — handles RFC 4180 CSV with auto-delimiter detection.
 * Returns { headers: string[], rows: string[][] }
 */

export function detectDelimiter(text) {
  const sample = text.slice(0, 4096);
  const lines = sample.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return ',';

  const candidates = [',', ';', '\t', '|'];
  const scores = candidates.map((d) => {
    // Count occurrences in non-quoted sections
    let count = 0;
    let inQuotes = false;
    for (const line of lines) {
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          inQuotes = !inQuotes;
        } else if (!inQuotes && ch === d) {
          count++;
        }
      }
    }
    return { delim: d, count };
  });

  scores.sort((a, b) => b.count - a.count);
  return scores[0].count > 0 ? scores[0].delim : ',';
}

export function parseCSV(text, delimiter) {
  const delim = delimiter || detectDelimiter(text);
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"') {
        if (next === '"') {
          // Escaped quote
          field += '"';
          i++;
        } else {
          // End of quoted field
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        if (field === '') {
          // Start of quoted field
          inQuotes = true;
        } else {
          // Quote in the middle of an unquoted field — treat as literal
          field += ch;
        }
      } else if (ch === delim) {
        row.push(field);
        field = '';
      } else if (ch === '\r') {
        if (next === '\n') {
          // CRLF — handled on the next char
        } else {
          // Standalone CR
          row.push(field);
          field = '';
          if (row.some((c) => c !== '')) {
            rows.push(row);
          }
          row = [];
        }
      } else if (ch === '\n') {
        row.push(field);
        field = '';
        if (row.some((c) => c !== '')) {
          rows.push(row);
        }
        row = [];
      } else {
        field += ch;
      }
    }
  }

  // Flush last field and row
  row.push(field);
  if (row.some((c) => c !== '')) {
    rows.push(row);
  }

  if (rows.length === 0) {
    return { headers: [], rows: [] };
  }

  // First row is headers
  const headers = rows[0];
  const dataRows = rows.slice(1);

  // Normalize: ensure all rows have same length as headers
  const colCount = headers.length;
  for (const row of dataRows) {
    while (row.length < colCount) row.push('');
    if (row.length > colCount) row.length = colCount;
  }

  return { headers, rows: dataRows };
}

/**
 * Generate a GFM Markdown table from headers and rows.
 */
export function generateMarkdown(headers, rows) {
  if (!headers || headers.length === 0) return '';

  const cols = headers.length;
  const allData = [headers, ...rows];

  // Calculate column widths for alignment
  const widths = new Array(cols).fill(0);
  for (const row of allData) {
    for (let c = 0; c < cols; c++) {
      const len = String(row[c] || '').length;
      if (len > widths[c]) widths[c] = len;
    }
  }

  // Build header row
  let md = '|';
  for (let c = 0; c < cols; c++) {
    md += ' ' + padRight(headers[c] || '', widths[c]) + ' |';
  }
  md += '\n';

  // Build separator row
  md += '|';
  for (let c = 0; c < cols; c++) {
    md += ' ' + '-'.repeat(Math.max(widths[c], 3)) + ' |';
  }
  md += '\n';

  // Build data rows
  for (const row of rows) {
    md += '|';
    for (let c = 0; c < cols; c++) {
      md += ' ' + padRight(row[c] || '', widths[c]) + ' |';
    }
    md += '\n';
  }

  return md;
}

function padRight(str, len) {
  return str + ' '.repeat(Math.max(0, len - str.length));
}
