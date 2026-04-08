import * as d3 from 'd3';
import { TYPE_COLORS } from '../constants.js';

function nodeRadius(d) {
  return 5 + Math.sqrt(d.connections) * 3;
}

// Rule 9: module-level position cache persists across view switches
const positionCache = new Map();

// Rule 5: curved quadratic bezier path for edges
function linkPath(d) {
  const sx = d.source.x, sy = d.source.y;
  const tx = d.target.x, ty = d.target.y;
  const dx = tx - sx, dy = ty - sy;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const offset = Math.min(len * 0.15, 25);
  const cx = (sx + tx) / 2 + (-dy / len) * offset;
  const cy = (sy + ty) / 2 + (dx / len) * offset;
  return `M${sx},${sy} Q${cx},${cy} ${tx},${ty}`;
}

// Rule 7: convex hull with padding per type group
function expandedHullPath(typeNodes, padding = 22) {
  if (typeNodes.length < 3) return null;
  const points = typeNodes.map(n => [n.x, n.y]);
  const hull = d3.polygonHull(points);
  if (!hull) return null;
  const cx = d3.mean(hull, p => p[0]);
  const cy = d3.mean(hull, p => p[1]);
  const padded = hull.map(([px, py]) => {
    const dx = px - cx, dy = py - cy;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return [px + (dx / len) * padding, py + (dy / len) * padding];
  });
  return `M${padded.map(p => p.join(',')).join('L')}Z`;
}

export function renderGraph(container, data, {
  onNodeClick,
  onNodeHover,
  onNodeLeave,
  onNodeSelect,
  activeTypes,
  searchQuery,
  selectedNodeId: initialSelectedId,
} = {}) {
  container.innerHTML = '';

  const rect = container.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  const allNodes = data.nodes.map(n => ({ ...n }));
  const allEdges = data.edges.map(e => ({ ...e }));

  // Rule 9: restore cached positions before simulation starts
  allNodes.forEach(n => {
    const cached = positionCache.get(n.id);
    if (cached) { n.x = cached.x; n.y = cached.y; }
  });
  const hasCached = allNodes.some(n => positionCache.has(n.id));

  // Rule 2: top 50 by connections for progressive disclosure
  const TOP_N = 50;
  const sorted = [...allNodes].sort((a, b) => b.connections - a.connections);
  const topIds = new Set(sorted.slice(0, TOP_N).map(n => n.id));
  allNodes.forEach(n => { n._top = topIds.has(n.id); });
  let showAll = allNodes.length <= TOP_N;

  // Selected node tracking
  let selectedId = initialSelectedId || null;
  allNodes.forEach(n => { n._selected = n.id === selectedId; });

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  // Rule 1: SVG glow filter
  const defs = svg.append('defs');
  const glowFilter = defs.append('filter')
    .attr('id', 'node-glow')
    .attr('x', '-60%').attr('y', '-60%')
    .attr('width', '220%').attr('height', '220%');
  glowFilter.append('feGaussianBlur')
    .attr('in', 'SourceGraphic')
    .attr('stdDeviation', '3.5')
    .attr('result', 'blur');
  const feMerge = glowFilter.append('feMerge');
  feMerge.append('feMergeNode').attr('in', 'blur');
  feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

  const g = svg.append('g');

  // Zoom — Rule 8: track k for label visibility + viewport-based disclosure
  let currentK = Math.min(width, height) / 900;
  let currentTransform = d3.zoomIdentity.translate(width / 2, height / 2).scale(currentK);
  const zoom = d3.zoom()
    .scaleExtent([0.08, 8])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
      currentK = event.transform.k;
      currentTransform = event.transform;
      updateLabelsForZoom();
      updateViewportVisibility();
    });
  svg.call(zoom);

  // Force simulation — always runs on allNodes for stable positions
  const simulation = d3.forceSimulation(allNodes)
    .force('link', d3.forceLink(allEdges).id(d => d.id).distance(80).strength(0.4))
    .force('charge', d3.forceManyBody().strength(-220))
    .force('center', d3.forceCenter(0, 0))
    .force('collision', d3.forceCollide().radius(d => nodeRadius(d) + 4))
    .force('x', d3.forceX(0).strength(0.04))
    .force('y', d3.forceY(0).strength(0.04))
    .alpha(hasCached ? 0.15 : 1);

  // Rule 7: hull layer behind everything
  const hullLayer = g.append('g').attr('class', 'hull-layer');
  const hullPaths = {};
  Object.keys(TYPE_COLORS).forEach(type => {
    hullPaths[type] = hullLayer.append('path')
      .attr('fill', TYPE_COLORS[type])
      .attr('fill-opacity', 0.05)
      .attr('stroke', TYPE_COLORS[type])
      .attr('stroke-opacity', 0.08)
      .attr('stroke-width', 1)
      .attr('stroke-linejoin', 'round')
      .style('pointer-events', 'none')
      .attr('d', null);
  });

  // Rule 5: curved path edges
  const link = g.append('g')
    .attr('class', 'edges')
    .selectAll('path')
    .data(allEdges)
    .join('path')
    .attr('fill', 'none')
    .attr('stroke', '#58687a')
    .attr('stroke-width', 1)
    .attr('stroke-opacity', d => {
      const sid = d.source.id ?? d.source;
      const tid = d.target.id ?? d.target;
      return (showAll || (topIds.has(sid) && topIds.has(tid))) ? 0.45 : 0;
    });

  // Node groups
  const node = g.append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(allNodes)
    .join('g')
    .attr('cursor', 'pointer')
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));

  node.append('circle')
    .attr('r', d => nodeRadius(d))
    .attr('fill', d => TYPE_COLORS[d.type] || '#888')
    .attr('stroke', d => d._selected ? (TYPE_COLORS[d.type] || '#888') : '#484F58')
    .attr('stroke-width', d => d._selected ? 2.5 : 1)
    .attr('filter', d => d._selected ? 'url(#node-glow)' : null)
    .attr('opacity', d => isVisible(d) ? 0.88 : 0);

  node.append('text')
    .text(d => d.title.length > 22 ? d.title.slice(0, 20) + '…' : d.title)
    .attr('dx', d => nodeRadius(d) + 4)
    .attr('dy', '0.35em')
    .attr('font-size', '10px')
    .attr('fill', '#c9d1d9')
    .attr('pointer-events', 'none')
    .attr('opacity', 0);

  // Apply initial zoom transform and label visibility (node must exist first)
  currentTransform = d3.zoomIdentity.translate(width / 2, height / 2).scale(currentK);
  svg.call(zoom.transform, currentTransform);
  updateLabelsForZoom();

  // Hover events — Rule 1 glow + 15% fade
  node.on('mouseenter', function (event, d) {
    if (!isVisible(d)) return;

    const connected = new Set();
    allEdges.forEach(e => {
      const sid = e.source.id ?? e.source;
      const tid = e.target.id ?? e.target;
      if (sid === d.id) connected.add(tid);
      if (tid === d.id) connected.add(sid);
    });

    node.select('circle')
      .attr('opacity', n => {
        if (!isVisible(n)) return 0;
        return n.id === d.id ? 1 : (connected.has(n.id) ? 0.85 : 0.12);
      })
      .attr('filter', n => (n.id === d.id || n._selected) ? 'url(#node-glow)' : null);

    node.select('text')
      .attr('opacity', n => {
        if (!isVisible(n)) return 0;
        return (n.id === d.id || connected.has(n.id)) ? 1 : 0;
      });

    link
      .attr('stroke-opacity', e => {
        const sid = e.source.id ?? e.source;
        const tid = e.target.id ?? e.target;
        return (sid === d.id || tid === d.id) ? 0.8 : 0.03;
      })
      .attr('stroke', e => {
        const sid = e.source.id ?? e.source;
        const tid = e.target.id ?? e.target;
        return (sid === d.id || tid === d.id) ? TYPE_COLORS[d.type] || '#888' : '#30363d';
      });

    if (onNodeHover) onNodeHover(event, d);
  });

  node.on('mouseleave', function (event, d) {
    node.select('circle')
      .attr('opacity', n => isVisible(n) ? 0.88 : 0)
      .attr('filter', n => n._selected ? 'url(#node-glow)' : null);
    node.select('text').attr('opacity', n => getTextOpacity(n));
    link
      .attr('stroke', '#58687a')
      .attr('stroke-opacity', d => isVisible(d.source) && isVisible(d.target) ? 0.45 : 0);
    if (onNodeLeave) onNodeLeave(event, d);
  });

  node.on('click', function (event, d) {
    // Update selection ring
    selectedId = d.id;
    allNodes.forEach(n => { n._selected = n.id === d.id; });
    node.select('circle')
      .attr('stroke', n => n._selected ? (TYPE_COLORS[n.type] || '#888') : '#484F58')
      .attr('stroke-width', n => n._selected ? 2.5 : 1)
      .attr('filter', n => n._selected ? 'url(#node-glow)' : null);
    if (onNodeSelect) onNodeSelect(d.id);
    if (onNodeClick) onNodeClick(event, d);
  });

  // Tick handler
  let tickCount = 0;
  simulation.on('tick', () => {
    link.attr('d', linkPath);
    node.attr('transform', d => `translate(${d.x},${d.y})`);
    // Rule 7: update hulls every 4 ticks for performance
    if (tickCount++ % 4 === 0) updateHulls();
  });

  // Rule 7: final hull update when simulation ends
  simulation.on('end', updateHulls);

  // Stats badge — Rule 6: live count + show-all toggle
  const statsEl = document.createElement('div');
  statsEl.className = 'stats-badge';
  updateStats();
  container.appendChild(statsEl);

  // Auto-resize
  const resizeObserver = new ResizeObserver((entries) => {
    const { width: newW, height: newH } = entries[0].contentRect;
    if (newW > 0 && newH > 0) svg.attr('width', newW).attr('height', newH);
  });
  resizeObserver.observe(container);

  // ---- Helper functions ----

  // A node is in the current viewport (graph coordinates)
  function isInViewport(n) {
    if (n.x == null || n.y == null) return false;
    const { k, x, y } = currentTransform;
    const pad = nodeRadius(n) + 20;
    return (
      n.x >= (-x / k) - pad &&
      n.x <= (width - x) / k + pad &&
      n.y >= (-y / k) - pad &&
      n.y <= (height - y) / k + pad
    );
  }

  function isVisible(d) {
    if (d._visible === false) return false;
    if (showAll || d._top) return true;
    // Progressive disclosure by zoom: reveal hidden nodes when zoomed in
    return currentK >= 1.5 && isInViewport(d);
  }

  function updateViewportVisibility() {
    if (showAll) return; // nothing to reveal
    node.select('circle')
      .attr('opacity', d => isVisible(d) ? 0.88 : 0);
    node.select('text')
      .attr('opacity', n => getTextOpacity(n));
    link
      .attr('stroke-opacity', d =>
        isVisible(d.source) && isVisible(d.target) ? 0.45 : 0);
    updateHulls();
  }

  // Rule 8: zoom-level label opacity
  function getTextOpacity(n) {
    if (!isVisible(n)) return 0;
    if (currentK >= 2.0) return 1;
    if (currentK >= 1.0) return n.connections > 3 ? 1 : 0;
    if (currentK >= 0.5) return n.connections > 6 ? 1 : 0;
    return 0;
  }

  function updateLabelsForZoom() {
    node.select('text').attr('opacity', n => getTextOpacity(n));
  }

  function updateHulls() {
    Object.keys(TYPE_COLORS).forEach(type => {
      const typeNodes = allNodes.filter(n => isVisible(n) && n.type === type && n.x != null);
      const path = expandedHullPath(typeNodes);
      hullPaths[type].attr('d', path || null).attr('display', path ? null : 'none');
    });
  }

  function updateStats(filteredCount) {
    const visTotal = allNodes.filter(n => showAll || n._top).length;
    let text;
    if (filteredCount !== undefined) {
      text = `${filteredCount} of ${allNodes.length} nodes`;
    } else if (!showAll && visTotal < allNodes.length) {
      text = `${visTotal} of ${allNodes.length} nodes`;
    } else {
      text = `${allNodes.length} nodes / ${allEdges.length} edges`;
    }

    if (allNodes.length > TOP_N) {
      const label = showAll ? `Focus top ${TOP_N}` : `Show all ${allNodes.length}`;
      statsEl.innerHTML = `${text} <button class="stats-toggle" id="btn-graph-show-all">${label}</button>`;
      statsEl.querySelector('#btn-graph-show-all').addEventListener('click', () => {
        showAll = !showAll;
        applyDisclosure();
      });
    } else {
      statsEl.textContent = text;
    }
  }

  function applyDisclosure() {
    node.select('circle')
      .transition().duration(350)
      .attr('opacity', d => isVisible(d) ? 0.88 : 0);
    node.select('text')
      .transition().duration(350)
      .attr('opacity', n => getTextOpacity(n));
    link.transition().duration(350)
      .attr('stroke-opacity', e => {
        return isVisible(e.source) && isVisible(e.target) ? 0.45 : 0;
      });
    updateStats();
    updateHulls();
    simulation.alpha(0.25).restart();
  }

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
    updateHulls();
  }

  return {
    simulation,

    // Rule 6: live count update
    updateFilter(activeTypes, searchQuery, activeTags) {
      const sq = (searchQuery || '').toLowerCase();
      const hasTags = activeTags && activeTags.size > 0;
      allNodes.forEach(d => {
        const typeMatch = !activeTypes || activeTypes.has(d.type);
        const searchMatch = !sq || d.title.toLowerCase().includes(sq) || (d.description || '').toLowerCase().includes(sq);
        const tagMatch = !hasTags || (d.tags || []).some(t => activeTags.has(t));
        d._visible = typeMatch && searchMatch && tagMatch;
      });

      const filteredCount = allNodes.filter(n => n._visible && (showAll || n._top)).length;

      node.select('circle')
        .transition().duration(200)
        .attr('opacity', d => isVisible(d) ? 0.88 : 0.05);
      node.select('text')
        .transition().duration(200)
        .attr('opacity', n => getTextOpacity(n));
      link.transition().duration(200)
        .attr('stroke-opacity', d => {
          return isVisible(d.source) && isVisible(d.target) ? 0.45 : 0;
        });

      updateStats(filteredCount);
      updateHulls();
    },

    // Rule 4: selection from external view
    setSelection(id) {
      selectedId = id;
      allNodes.forEach(n => { n._selected = n.id === id; });
      node.select('circle')
        .attr('stroke', n => n._selected ? (TYPE_COLORS[n.type] || '#888') : '#484F58')
        .attr('stroke-width', n => n._selected ? 2.5 : 1)
        .attr('filter', n => n._selected ? 'url(#node-glow)' : null);
    },

    focusNode(id) {
      const target = allNodes.find(n => n.id === id);
      if (!target || target.x == null) return;
      const rect = container.getBoundingClientRect();
      const scale = 1.5;
      const transform = d3.zoomIdentity
        .translate(rect.width / 2, rect.height / 2)
        .scale(scale)
        .translate(-target.x, -target.y);
      svg.transition().duration(600).call(zoom.transform, transform);
    },

    // Rule 9: save positions on destroy
    destroy() {
      allNodes.forEach(n => {
        if (n.x != null) positionCache.set(n.id, { x: n.x, y: n.y });
      });
      resizeObserver.disconnect();
      simulation.stop();
      container.innerHTML = '';
    },
  };
}
