import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { buildGraph } from './lib/parse.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const KNOWLEDGE_DIR = join(ROOT, 'knowledge');
const OUT = join(ROOT, 'site', 'graph.json');

// knowledge 하위의 .md를 재귀 수집 (.gitkeep 등 무시)
function collectMarkdown(dir) {
  const entries = readdirSync(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith('.md'))
    .map((e) => {
      const full = join(e.parentPath ?? e.path, e.name);
      const id = relative(KNOWLEDGE_DIR, full).split(sep).join('/');
      return { id, content: readFileSync(full, 'utf8') };
    });
}

const files = collectMarkdown(KNOWLEDGE_DIR);
const { nodes, edges, warnings } = buildGraph(files);
warnings.forEach((w) => console.warn(w));

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(
  OUT,
  JSON.stringify({ nodes, edges, generatedAt: new Date().toISOString() }, null, 2)
);
console.log(`그래프 생성 완료: 노드 ${nodes.length}개, 간선 ${edges.length}개 → ${relative(ROOT, OUT)}`);
