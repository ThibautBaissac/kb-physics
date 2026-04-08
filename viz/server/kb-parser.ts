import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const KB_ROOT = path.resolve(import.meta.dirname, '../../kb');
const OUTPUT = path.resolve(import.meta.dirname, '../src/data/kb-graph.json');

const WIKI_DIRS = ['theories', 'concepts', 'people', 'experiments', 'open-questions'];
const RAW_DIRS = ['articles', 'papers', 'books', 'talks'];

interface KBNode {
  id: string;
  title: string;
  type: string;
  evidence: string;
  description: string;
  created_at: string;
  updated_at: string;
  sources: string[];
  tags: string[];
  connections: number;
}

interface KBEdge {
  source: string;
  target: string;
}

interface RawArticle {
  id: string;
  title: string;
  created_at: string;
  url: string;
  author: string;
  publication: string;
  description: string;
  category: string;
}

function formatDate(val: unknown): string {
  if (!val) return '';
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  const s = String(val);
  // If it already looks like YYYY-MM-DD, return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toISOString().slice(0, 10);
}

function parseWikiPages(): { nodes: KBNode[]; edges: KBEdge[] } {
  const nodes: KBNode[] = [];
  const edges: KBEdge[] = [];
  const nodeIds = new Set<string>();

  for (const dir of WIKI_DIRS) {
    const dirPath = path.join(KB_ROOT, dir);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      let data: Record<string, unknown>;
      try {
        ({ data } = matter(content));
      } catch (e) {
        console.warn(`Skipping ${dir}/${file}: YAML parse error`);
        continue;
      }

      const id = `${dir}/${file}`;
      nodeIds.add(id);

      nodes.push({
        id,
        title: (data.title as string) || file.replace('.md', ''),
        type: (data.type as string) || dir.replace(/s$/, ''),
        evidence: (data.evidence as string) || 'secondary',
        description: (data.description as string) || '',
        created_at: formatDate(data.created_at),
        updated_at: formatDate(data.updated_at),
        sources: Array.isArray(data.sources) ? data.sources : [],
        tags: Array.isArray(data.tags) ? data.tags : [],
        connections: 0,
      });

      // Build edges from related field
      const related: string[] = Array.isArray(data.related) ? data.related : [];
      for (const target of related) {
        edges.push({ source: id, target });
      }
    }
  }

  // Filter edges to only include valid targets and count connections
  const validEdges = edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));

  // Deduplicate edges (keep A->B, skip if B->A already exists)
  const seen = new Set<string>();
  const dedupedEdges: KBEdge[] = [];
  for (const edge of validEdges) {
    const key = [edge.source, edge.target].sort().join('|');
    if (!seen.has(key)) {
      seen.add(key);
      dedupedEdges.push(edge);
    }
  }

  // Count connections per node
  const connectionCount = new Map<string, number>();
  for (const edge of dedupedEdges) {
    connectionCount.set(edge.source, (connectionCount.get(edge.source) || 0) + 1);
    connectionCount.set(edge.target, (connectionCount.get(edge.target) || 0) + 1);
  }
  for (const node of nodes) {
    node.connections = connectionCount.get(node.id) || 0;
  }

  return { nodes, edges: dedupedEdges };
}

function parseRawArticles(): RawArticle[] {
  const articles: RawArticle[] = [];

  for (const category of RAW_DIRS) {
    const dirPath = path.join(KB_ROOT, 'raw', category);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
      let data: Record<string, unknown>;
      try {
        ({ data } = matter(content));
      } catch (e) {
        console.warn(`Skipping raw/${category}/${file}: YAML parse error`);
        continue;
      }

      articles.push({
        id: file,
        title: (data.title as string) || file.replace('.md', ''),
        created_at: formatDate(data.created_at),
        url: (data.url as string) || '',
        author: (data.author as string) || '',
        publication: (data.publication as string) || '',
        description: (data.description as string) || '',
        category,
      });
    }
  }

  return articles.sort((a, b) => a.created_at.localeCompare(b.created_at));
}

// Run
const { nodes, edges } = parseWikiPages();
const articles = parseRawArticles();

const output = {
  nodes,
  edges,
  articles,
  metadata: {
    generated_at: new Date().toISOString(),
    node_count: nodes.length,
    edge_count: edges.length,
    article_count: articles.length,
  },
};

// Ensure output directory exists
fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2));

console.log(`KB parsed: ${nodes.length} nodes, ${edges.length} edges, ${articles.length} articles`);
console.log(`Written to: ${OUTPUT}`);
