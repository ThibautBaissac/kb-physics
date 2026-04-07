import * as d3 from 'd3';
import { TYPE_COLORS } from '../constants.js';

function nodeRadius(d) {
  return 5 + Math.sqrt(d.connections) * 3;
}

export function renderGraph(container, data, { onNodeClick, onNodeHover, onNodeLeave, activeTypes, searchQuery } = {}) {
  container.innerHTML = '';

  const rect = container.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  // Filter nodes by active types and search
  let nodes = data.nodes.map(n => ({ ...n }));
  let edges = data.edges.map(e => ({ ...e }));

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const g = svg.append('g');

  // Zoom
  const zoom = d3.zoom()
    .scaleExtent([0.15, 5])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });
  svg.call(zoom);

  // Initial zoom to fit
  const initialScale = Math.min(width, height) / 800;
  svg.call(zoom.transform, d3.zoomIdentity
    .translate(width / 2, height / 2)
    .scale(initialScale));

  // Force simulation
  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(edges).id(d => d.id).distance(70).strength(0.5))
    .force('charge', d3.forceManyBody().strength(-180))
    .force('center', d3.forceCenter(0, 0))
    .force('collision', d3.forceCollide().radius(d => nodeRadius(d) + 3))
    .force('x', d3.forceX(0).strength(0.05))
    .force('y', d3.forceY(0).strength(0.05));

  // Edges
  const link = g.append('g')
    .attr('class', 'edges')
    .selectAll('line')
    .data(edges)
    .join('line')
    .attr('stroke', '#30363d')
    .attr('stroke-width', 1)
    .attr('stroke-opacity', 0.4);

  // Node groups
  const node = g.append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(nodes)
    .join('g')
    .attr('cursor', 'pointer')
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));

  // Node circles
  node.append('circle')
    .attr('r', d => nodeRadius(d))
    .attr('fill', d => TYPE_COLORS[d.type] || '#888')
    .attr('stroke', d => d3.color(TYPE_COLORS[d.type] || '#888').brighter(0.5))
    .attr('stroke-width', 1.5)
    .attr('opacity', 0.9);

  // Labels (visible for high-connection nodes)
  node.append('text')
    .text(d => d.title)
    .attr('dx', d => nodeRadius(d) + 4)
    .attr('dy', '0.35em')
    .attr('font-size', d => d.connections > 6 ? '11px' : '9px')
    .attr('fill', d => d.connections > 6 ? '#e6edf3' : '#8b949e')
    .attr('opacity', d => d.connections > 4 ? 1 : 0)
    .attr('pointer-events', 'none');

  // Hover events
  node.on('mouseenter', function (event, d) {
    // Highlight connected nodes
    const connected = new Set();
    edges.forEach(e => {
      if (e.source.id === d.id) connected.add(e.target.id);
      if (e.target.id === d.id) connected.add(e.source.id);
    });

    node.select('circle')
      .attr('opacity', n => n.id === d.id || connected.has(n.id) ? 1 : 0.15);
    node.select('text')
      .attr('opacity', n => n.id === d.id || connected.has(n.id) ? 1 : 0);
    link
      .attr('stroke-opacity', e =>
        e.source.id === d.id || e.target.id === d.id ? 0.8 : 0.05)
      .attr('stroke', e =>
        e.source.id === d.id || e.target.id === d.id
          ? TYPE_COLORS[d.type] || '#888'
          : '#30363d');

    if (onNodeHover) onNodeHover(event, d);
  });

  node.on('mouseleave', function (event, d) {
    node.select('circle').attr('opacity', 0.9);
    node.select('text').attr('opacity', n => n.connections > 4 ? 1 : 0);
    link
      .attr('stroke-opacity', 0.4)
      .attr('stroke', '#30363d');

    if (onNodeLeave) onNodeLeave(event, d);
  });

  node.on('click', function (event, d) {
    if (onNodeClick) onNodeClick(event, d);
  });

  // Tick
  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    node.attr('transform', d => `translate(${d.x},${d.y})`);
  });

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  // Legend
  const legend = document.createElement('div');
  legend.className = 'legend';
  legend.innerHTML = Object.entries(TYPE_COLORS).map(([type, color]) => {
    const count = nodes.filter(n => n.type === type).length;
    return `<div class="legend-item">
      <span class="swatch" style="background:${color}"></span>
      <span>${type} (${count})</span>
    </div>`;
  }).join('');
  container.appendChild(legend);

  // Stats
  const stats = document.createElement('div');
  stats.className = 'stats-badge';
  stats.textContent = `${nodes.length} nodes / ${edges.length} edges`;
  container.appendChild(stats);

  // Auto-resize SVG when container changes size
  const resizeObserver = new ResizeObserver((entries) => {
    const { width: newW, height: newH } = entries[0].contentRect;
    if (newW > 0 && newH > 0) {
      svg.attr('width', newW).attr('height', newH);
    }
  });
  resizeObserver.observe(container);

  // Return controls for external filtering
  return {
    simulation,
    updateFilter(activeTypes, searchQuery) {
      const sq = (searchQuery || '').toLowerCase();
      node.each(function (d) {
        const typeMatch = !activeTypes || activeTypes.has(d.type);
        const searchMatch = !sq || d.title.toLowerCase().includes(sq) || d.description.toLowerCase().includes(sq);
        d._visible = typeMatch && searchMatch;
      });

      node.select('circle')
        .transition().duration(200)
        .attr('opacity', d => d._visible ? 0.9 : 0.08);
      node.select('text')
        .transition().duration(200)
        .attr('opacity', d => d._visible && d.connections > 4 ? 1 : 0);

      link
        .transition().duration(200)
        .attr('stroke-opacity', d => {
          const sv = d.source._visible;
          const tv = d.target._visible;
          return sv && tv ? 0.4 : 0.03;
        });
    },
    destroy() {
      resizeObserver.disconnect();
      simulation.stop();
      container.innerHTML = '';
    }
  };
}
