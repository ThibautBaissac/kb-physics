import { TYPE_COLORS } from '../constants.js';

export function renderTable(container, data, { selectedNodeId } = {}) {
  container.innerHTML = '';

  let columns, rowsWithMeta;

  if (data.columns && data.rows) {
    columns = data.columns;
    rowsWithMeta = data.rows.map(r => ({ row: [...r], id: null }));
  } else if (data.nodes) {
    columns = ['Title', 'Type', 'Evidence', 'Connections', 'Sources', 'Created'];
    rowsWithMeta = data.nodes.map(n => ({
      id: n.id,
      row: [
        n.title,
        n.type,
        n.evidence,
        String(n.connections),
        String(n.sources?.length || 0),
        n.created_at,
      ],
    }));
  } else {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted)">No table data</div>';
    return { destroy() { container.innerHTML = ''; } };
  }

  let sortCol = -1;
  let sortAsc = true;
  let currentActiveTypes = null;
  let currentSearchQuery = '';
  let currentSelectedId = selectedNodeId || null;
  const typeColIdx = columns.indexOf('Type');
  const titleColIdx = columns.indexOf('Title');

  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'height:100%;overflow:auto;padding:16px;';

  const filterRow = document.createElement('div');
  filterRow.style.cssText = 'display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;';

  const filters = columns.map((col) => {
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

  // Rule 6: stats badge with live count
  const statsEl = document.createElement('div');
  statsEl.className = 'stats-badge';

  function renderRows() {
    const filterValues = filters.map(f => f.value.toLowerCase());

    const filtered = rowsWithMeta.filter(({ row }) => {
      const colMatch = row.every((cell, i) => !filterValues[i] || (cell || '').toLowerCase().includes(filterValues[i]));
      if (!colMatch) return false;
      if (currentActiveTypes && typeColIdx >= 0 && !currentActiveTypes.has(row[typeColIdx])) return false;
      if (currentSearchQuery && titleColIdx >= 0 && !(row[titleColIdx] || '').toLowerCase().includes(currentSearchQuery)) return false;
      return true;
    });

    if (sortCol >= 0) {
      filtered.sort((a, b) => {
        const va = a.row[sortCol] || '';
        const vb = b.row[sortCol] || '';
        const na = parseFloat(va), nb = parseFloat(vb);
        if (!isNaN(na) && !isNaN(nb)) return sortAsc ? na - nb : nb - na;
        return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      });
    }

    tbody.innerHTML = '';
    let selectedTr = null;

    for (const { row, id } of filtered) {
      const tr = document.createElement('tr');
      const isSelected = id && id === currentSelectedId;
      tr.style.cssText = `border-bottom: 1px solid #21262d;${isSelected ? 'background:#1f6feb22;' : ''}`;
      if (isSelected) {
        tr.classList.add('row--selected');
        selectedTr = tr;
      }
      tr.addEventListener('mouseenter', () => {
        if (!isSelected) tr.style.background = '#161b22';
      });
      tr.addEventListener('mouseleave', () => {
        if (!isSelected) tr.style.background = 'transparent';
      });

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
          td.textContent = row[i] || '';
        }
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }

    // Rule 4: scroll selected row into view
    if (selectedTr) {
      requestAnimationFrame(() => selectedTr.scrollIntoView({ block: 'center', behavior: 'smooth' }));
    }

    // Rule 6: live count update
    statsEl.textContent = `${filtered.length} of ${rowsWithMeta.length} rows`;
  }

  wrapper.appendChild(table);
  container.appendChild(wrapper);
  statsEl.textContent = `${rowsWithMeta.length} rows / ${columns.length} columns`;
  container.appendChild(statsEl);

  renderRows();

  return {
    updateFilter(activeTypes, searchQuery) {
      currentActiveTypes = activeTypes;
      currentSearchQuery = (searchQuery || '').toLowerCase();
      renderRows();
    },
    // Rule 4: external selection
    setSelection(id) {
      currentSelectedId = id;
      renderRows();
    },
    destroy() { container.innerHTML = ''; },
  };
}
