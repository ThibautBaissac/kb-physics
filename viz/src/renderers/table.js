import { TYPE_COLORS } from '../constants.js';

export function renderTable(container, data) {
  container.innerHTML = '';

  // Build table data from KB data or artifact data
  let columns, rows;

  if (data.columns && data.rows) {
    // Artifact format
    columns = data.columns;
    rows = data.rows.map(r => [...r]);
  } else if (data.nodes) {
    // KB graph data — build a comprehensive table
    columns = ['Title', 'Type', 'Evidence', 'Connections', 'Sources', 'Created'];
    rows = data.nodes.map(n => [
      n.title,
      n.type,
      n.evidence,
      String(n.connections),
      String(n.sources?.length || 0),
      n.created_at,
    ]);
  } else {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted)">No table data</div>';
    return { destroy() { container.innerHTML = ''; } };
  }

  let sortCol = -1;
  let sortAsc = true;
  let currentActiveTypes = null;
  let currentSearchQuery = '';
  const typeColIdx = columns.indexOf('Type');
  const titleColIdx = columns.indexOf('Title');

  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'height:100%;overflow:auto;padding:16px;';

  // Filter row
  const filterRow = document.createElement('div');
  filterRow.style.cssText = 'display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;';

  const filters = columns.map((col, i) => {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `Filter ${col}...`;
    input.style.cssText = `
      background: #1c2333;
      border: 1px solid #30363d;
      color: #e6edf3;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      width: ${Math.max(80, col.length * 8 + 40)}px;
      outline: none;
    `;
    input.addEventListener('input', () => renderRows());
    filterRow.appendChild(input);
    return input;
  });

  wrapper.appendChild(filterRow);

  const table = document.createElement('table');
  table.style.cssText = 'width:100%;border-collapse:collapse;font-size:13px;';

  // Header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  columns.forEach((col, i) => {
    const th = document.createElement('th');
    th.textContent = col;
    th.style.cssText = `
      text-align: left;
      padding: 8px 12px;
      border-bottom: 2px solid #30363d;
      color: #8b949e;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
    `;
    th.addEventListener('click', () => {
      if (sortCol === i) {
        sortAsc = !sortAsc;
      } else {
        sortCol = i;
        sortAsc = true;
      }
      renderRows();
      // Update sort indicator
      headerRow.querySelectorAll('th').forEach((h, j) => {
        h.textContent = columns[j] + (j === sortCol ? (sortAsc ? ' ↑' : ' ↓') : '');
      });
    });
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  table.appendChild(tbody);

  function renderRows() {
    const filterValues = filters.map(f => f.value.toLowerCase());

    let filtered = rows.filter(row => {
      // Per-column text filters
      const colMatch = row.every((cell, i) => !filterValues[i] || cell.toLowerCase().includes(filterValues[i]));
      if (!colMatch) return false;
      // External type filter
      if (currentActiveTypes && typeColIdx >= 0 && !currentActiveTypes.has(row[typeColIdx])) return false;
      // External search filter
      if (currentSearchQuery && titleColIdx >= 0 && !row[titleColIdx].toLowerCase().includes(currentSearchQuery)) return false;
      return true;
    });

    if (sortCol >= 0) {
      filtered.sort((a, b) => {
        const va = a[sortCol];
        const vb = b[sortCol];
        // Try numeric sort
        const na = parseFloat(va);
        const nb = parseFloat(vb);
        if (!isNaN(na) && !isNaN(nb)) {
          return sortAsc ? na - nb : nb - na;
        }
        return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      });
    }

    tbody.innerHTML = '';
    for (const row of filtered) {
      const tr = document.createElement('tr');
      tr.style.cssText = 'border-bottom: 1px solid #21262d;';
      tr.addEventListener('mouseenter', () => tr.style.background = '#161b22');
      tr.addEventListener('mouseleave', () => tr.style.background = 'transparent');

      for (let i = 0; i < row.length; i++) {
        const td = document.createElement('td');
        td.style.cssText = 'padding: 8px 12px; color: #e6edf3;';

        if (columns[i] === 'Type' && TYPE_COLORS[row[i]]) {
          td.innerHTML = `<span style="
            display:inline-block;
            padding:1px 8px;
            border-radius:4px;
            font-size:11px;
            background:${TYPE_COLORS[row[i]]}22;
            color:${TYPE_COLORS[row[i]]};
          ">${row[i]}</span>`;
        } else {
          td.textContent = row[i];
        }
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
  }

  wrapper.appendChild(table);
  container.appendChild(wrapper);
  renderRows();

  // Stats
  const stats = document.createElement('div');
  stats.className = 'stats-badge';
  stats.textContent = `${rows.length} rows / ${columns.length} columns`;
  container.appendChild(stats);

  return {
    updateFilter(activeTypes, searchQuery) {
      currentActiveTypes = activeTypes;
      currentSearchQuery = (searchQuery || '').toLowerCase();
      renderRows();
    },
    destroy() { container.innerHTML = ''; }
  };
}
