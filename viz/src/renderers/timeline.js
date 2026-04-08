import * as d3 from 'd3';
import { TYPE_COLORS as BASE_TYPE_COLORS } from '../constants.js';

const TYPE_COLORS = { ...BASE_TYPE_COLORS, article: '#c9d1d9' };

export function renderTimeline(container, data, { selectedNodeId, onArticleClick } = {}) {
  container.innerHTML = '';

  const rect = container.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  const margin = { top: 40, right: 40, bottom: 60, left: 120 };

  // Build events from articles + compiled pages
  const events = [];

  // Raw articles as primary events
  const articles = data.articles || [];
  for (const a of articles) {
    if (!a.created_at) continue;
    events.push({
      date: new Date(a.created_at),
      title: a.title,
      type: 'article',
      description: `${a.author} — ${a.publication}`,
      id: a.id,
      isArticle: true,
    });
  }

  // Compiled pages grouped by creation date
  const nodes = data.nodes || [];
  for (const n of nodes) {
    if (!n.created_at) continue;
    events.push({
      date: new Date(n.created_at),
      title: n.title,
      type: n.type,
      description: n.description,
      id: n.id,
      tags: n.tags || [],
      isArticle: false,
    });
  }

  events.sort((a, b) => a.date - b.date);

  if (!events.length) {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted)">No timeline data</div>';
    return { destroy() { container.innerHTML = ''; } };
  }

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const g = svg.append('g');

  // Zoom
  const zoom = d3.zoom()
    .scaleExtent([0.5, 10])
    .on('zoom', (event) => g.attr('transform', event.transform));
  svg.call(zoom);

  // Scales
  const dateExtent = d3.extent(events, d => d.date);
  const dayPad = 3 * 24 * 60 * 60 * 1000;
  const x = d3.scaleTime()
    .domain([new Date(dateExtent[0] - dayPad), new Date(dateExtent[1].getTime() + dayPad)])
    .range([margin.left, width - margin.right]);

  // Group by type for vertical stacking
  const types = [...new Set(events.map(e => e.type))];
  const y = d3.scaleBand()
    .domain(types)
    .range([margin.top + 30, height - margin.bottom])
    .padding(0.3);

  // Axis
  g.append('g')
    .attr('transform', `translate(0,${margin.top + 20})`)
    .call(d3.axisTop(x)
      .ticks(d3.timeMonth.every(1))
      .tickFormat(d3.timeFormat('%b %d')))
    .selectAll('text')
    .attr('fill', '#8b949e')
    .attr('font-size', '10px');

  g.selectAll('.domain, .tick line')
    .attr('stroke', '#30363d');

  // Type labels
  g.selectAll('.type-label')
    .data(types)
    .join('text')
    .attr('x', margin.left - 4)
    .attr('y', d => y(d) + y.bandwidth() / 2)
    .attr('text-anchor', 'end')
    .attr('dominant-baseline', 'middle')
    .attr('fill', d => TYPE_COLORS[d] || '#888')
    .attr('font-size', '10px')
    .text(d => d);

  // Horizontal lines per type
  g.selectAll('.type-line')
    .data(types)
    .join('line')
    .attr('x1', margin.left)
    .attr('x2', width - margin.right)
    .attr('y1', d => y(d) + y.bandwidth() / 2)
    .attr('y2', d => y(d) + y.bandwidth() / 2)
    .attr('stroke', '#30363d')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '2,4');

  // Event dots
  const dots = g.selectAll('.event-dot')
    .data(events)
    .join('circle')
    .attr('cx', d => x(d.date))
    .attr('cy', d => y(d.type) + y.bandwidth() / 2)
    .attr('r', d => d.isArticle ? 6 : 4)
    .attr('fill', d => TYPE_COLORS[d.type] || '#888')
    .attr('stroke', d => d.isArticle ? '#fff' : 'none')
    .attr('stroke-width', d => d.isArticle ? 1.5 : 0)
    .attr('opacity', 0.85)
    .attr('cursor', 'pointer');

  // Rule 4: highlight selected node
  let currentSelectedId = selectedNodeId || null;
  dots
    .attr('r', d => d.isArticle ? 6 : (d.id === currentSelectedId ? 7 : 4))
    .attr('stroke', d => d.id === currentSelectedId ? '#fff' : (d.isArticle ? '#fff' : 'none'))
    .attr('stroke-width', d => d.id === currentSelectedId ? 2 : (d.isArticle ? 1.5 : 0));

  // Tooltip on hover
  const tooltip = d3.select('#tooltip');

  dots.on('mouseenter', function (event, d) {
    d3.select(this).attr('r', d.isArticle ? 9 : 6).attr('opacity', 1);
    tooltip.select('.tooltip-title').text(d.title);
    tooltip.select('.tooltip-desc').text(d.description || '');
    const badge = tooltip.select('.tooltip-type');
    badge.text(d.type);
    badge.style('background', (TYPE_COLORS[d.type] || '#888') + '33');
    badge.style('color', TYPE_COLORS[d.type] || '#888');
    tooltip.style('left', (event.clientX + 12) + 'px');
    tooltip.style('top', (event.clientY - 10) + 'px');
    tooltip.classed('visible', true);
  });

  dots.on('mouseleave', function (event, d) {
    const isSelected = d.id === currentSelectedId;
    d3.select(this)
      .attr('r', d.isArticle ? 6 : (isSelected ? 7 : 4))
      .attr('opacity', 0.85);
    tooltip.classed('visible', false);
  });

  dots.on('click', (event, d) => {
    if (d.isArticle && onArticleClick) onArticleClick(event, d);
  });

  // Stats
  const stats = document.createElement('div');
  stats.className = 'stats-badge';
  stats.textContent = `${events.length} events / ${articles.length} articles`;
  container.appendChild(stats);

  return {
    updateFilter(activeTypes, searchQuery, activeTags) {
      const sq = (searchQuery || '').toLowerCase();
      const hasTags = activeTags && activeTags.size > 0;
      dots.transition().duration(200)
        .attr('opacity', d => {
          const typeOk = activeTypes.has(d.type) || (d.isArticle && activeTypes.size > 0);
          const searchOk = !sq || d.title.toLowerCase().includes(sq) || (d.description || '').toLowerCase().includes(sq) || (d.sources || []).some(s => s.toLowerCase().includes(sq));
          const tagOk = !hasTags || d.isArticle || (d.tags || []).some(t => activeTags.has(t));
          return typeOk && searchOk && tagOk ? 0.85 : 0.05;
        });
    },
    // Rule 4: external selection
    setSelection(id) {
      currentSelectedId = id;
      dots
        .attr('r', d => d.isArticle ? 6 : (d.id === id ? 7 : 4))
        .attr('stroke', d => d.id === id ? '#fff' : (d.isArticle ? '#fff' : 'none'))
        .attr('stroke-width', d => d.id === id ? 2 : (d.isArticle ? 1.5 : 0));
    },
    focusEvent(id) {
      const target = events.find(e => e.id === id);
      if (!target) return;
      const tx = x(target.date);
      const ty = y(target.type) + y.bandwidth() / 2;
      const scale = 2;
      const transform = d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(scale)
        .translate(-tx, -ty);
      svg.transition().duration(600).call(zoom.transform, transform);
    },
    destroy() { container.innerHTML = ''; },
  };
}
