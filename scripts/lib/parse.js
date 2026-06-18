import matter from 'gray-matter';
import { marked } from 'marked';

// 본문에서 "## <prefix>..." 헤딩 다음부터 다음 "## " 전까지의 원문 마크다운을 반환.
export function extractSection(body, prefix) {
  const lines = body.split('\n');
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('## ') && line.slice(3).trim().startsWith(prefix)) {
      start = i + 1;
      break;
    }
  }
  if (start === -1) return '';
  const out = [];
  for (let i = start; i < lines.length; i++) {
    if (lines[i].trim().startsWith('## ')) break;
    out.push(lines[i]);
  }
  return out.join('\n').trim();
}

export function parseConcept({ id, content }) {
  const { data, content: body } = matter(content);
  const definitionMd = extractSection(body, '한 줄 정의');
  const feynmanMd = extractSection(body, '내 파인만 설명');
  return {
    id,
    title: data.title ?? id,
    domain: data.domain ?? 'unknown',
    status: data.status ?? 'seed',
    mastery: Number.isFinite(data.mastery) ? data.mastery : 0,
    importance: Number.isFinite(data.importance) ? data.importance : 3,
    related: Array.isArray(data.related) ? data.related : [],
    definitionHtml: definitionMd ? marked.parse(definitionMd) : '',
    feynmanHtml: feynmanMd ? marked.parse(feynmanMd) : '',
    sourcePath: `knowledge/${id}`,
  };
}

export function buildGraph(files) {
  const nodes = files.map(parseConcept);
  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges = [];
  const seen = new Set();
  const warnings = [];
  const degree = new Map();

  for (const node of nodes) {
    for (const rel of node.related) {
      if (!nodeIds.has(rel)) {
        warnings.push(`[경고] ${node.id} → 존재하지 않는 related 대상: ${rel}`);
        continue;
      }
      const key = [node.id, rel].sort().join('::');
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ source: node.id, target: rel });
      degree.set(node.id, (degree.get(node.id) ?? 0) + 1);
      degree.set(rel, (degree.get(rel) ?? 0) + 1);
    }
  }

  for (const node of nodes) {
    node.isGap = node.status === 'seed' || (degree.get(node.id) ?? 0) === 0;
  }

  return { nodes, edges, warnings };
}
