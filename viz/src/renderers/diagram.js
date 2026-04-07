import * as d3 from 'd3';

const TYPE_COLORS = {
  theory: '#ff6b6b',
  concept: '#4ecdc4',
  person: '#45b7d1',
  experiment: '#7ee787',
  'open-question': '#feca57',
};

export function renderDiagram(container, data) {
  container.innerHTML = '';

  const rect = container.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  // If data has explicit layout type
  const layout = data.layout || 'radial';

  if (layout === 'tree' && data.root) {
    return renderTree(container, data, width, height);
  }
  return renderRadial(container, data, width, height);
}

function renderRadial(container, data, width, height) {
  const nodes = (data.nodes || []).map(n => ({ ...n }));
  const edges = (data.edges || []).map(e => ({ ...e }));

  if (!nodes.length) {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted)">No diagram data. Ask the agent to generate one.</div>';
    return { destroy() { container.innerHTML = ''; } };
  }

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const g = svg.append('g');

  const zoom = d3.zoom()
    .scaleExtent([0.2, 5])
    .on('zoom', (event) => g.attr('transform', event.transform));
  svg.call(zoom);
  svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2));

  // Radial force layout
  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(edges).id(d => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('radial', d3.forceRadial(150, 0, 0).strength(0.3))
    .force('collision', d3.forceCollide(20));

  const link = g.selectAll('line')
    .data(edges)
    .join('line')
    .attr('stroke', '#30363d')
    .attr('stroke-width', 1.5)
    .attr('stroke-opacity', 0.5);

  const node = g.selectAll('g.node')
    .data(nodes)
    .join('g')
    .attr('class', 'node')
    .attr('cursor', 'pointer')
    .call(d3.drag()
      .on('start', (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on('end', (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }));

  node.append('circle')
    .attr('r', 8)
    .attr('fill', d => TYPE_COLORS[d.type] || '#888')
    .attr('stroke', '#0d1117')
    .attr('stroke-width', 2);

  node.append('text')
    .text(d => d.title)
    .attr('dx', 12)
    .attr('dy', '0.35em')
    .attr('fill', '#e6edf3')
    .attr('font-size', '11px')
    .attr('pointer-events', 'none');

  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
    node.attr('transform', d => `translate(${d.x},${d.y})`);
  });

  return {
    destroy() { simulation.stop(); container.innerHTML = ''; }
  };
}

function renderTree(container, data, width, height) {
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const g = svg.append('g');

  const zoom = d3.zoom()
    .scaleExtent([0.2, 5])
    .on('zoom', (event) => g.attr('transform', event.transform));
  svg.call(zoom);
  svg.call(zoom.transform, d3.zoomIdentity.translate(80, height / 2).scale(0.8));

  const root = d3.hierarchy(data.root);
  const treeLayout = d3.tree().size([height - 100, width - 200]);
  treeLayout(root);

  // Links
  g.selectAll('path.tree-link')
    .data(root.links())
    .join('path')
    .attr('class', 'tree-link')
    .attr('d', d3.linkHorizontal().x(d => d.y).y(d => d.x))
    .attr('fill', 'none')
    .attr('stroke', '#30363d')
    .attr('stroke-width', 1.5);

  // Nodes
  const node = g.selectAll('g.tree-node')
    .data(root.descendants())
    .join('g')
    .attr('class', 'tree-node')
    .attr('transform', d => `translate(${d.y},${d.x})`);

  node.append('circle')
    .attr('r', 6)
    .attr('fill', d => TYPE_COLORS[d.data.type] || '#4ecdc4')
    .attr('stroke', '#0d1117')
    .attr('stroke-width', 2);

  node.append('text')
    .text(d => d.data.title || d.data.name)
    .attr('dx', d => d.children ? -10 : 10)
    .attr('text-anchor', d => d.children ? 'end' : 'start')
    .attr('dy', '0.35em')
    .attr('fill', '#e6edf3')
    .attr('font-size', '11px');

  return {
    destroy() { container.innerHTML = ''; }
  };
}
