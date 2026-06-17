# 지식 그래프 시각화 사이트 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 위키의 개념 마크다운(frontmatter + 본문)을 읽어 개념=노드, `related`=간선으로 그리는 지식 그래프 정적 사이트를 만들고 GitHub Pages에 자동 배포한다.

**Architecture:** Node 빌드 스크립트가 `knowledge/**/*.md`를 파싱해 `site/graph.json`(노드+간선+내용 inline)을 생성한다. 정적 프론트엔드(`site/`)가 Cytoscape.js(CDN)로 그래프를 렌더하고 노드 클릭 시 사이드 패널에 핵심을 보여준다. GitHub Actions가 `main` push마다 빌드 후 Pages로 배포한다(graph.json은 미커밋 파생물).

**Tech Stack:** Node.js 22 (ESM, `node:test`), `gray-matter`(frontmatter), `marked`(md→HTML), Cytoscape.js(CDN), GitHub Actions + Pages.

---

## 파일 구조

```
package.json                       # 신규: type=module, deps, scripts
scripts/lib/parse.js               # 신규: 순수 파싱/그래프 빌드 로직 (IO 없음)
scripts/lib/parse.test.js          # 신규: parse.js 단위 테스트 (node:test)
scripts/generate-graph.js          # 신규: 파일 읽기 → buildGraph → site/graph.json 쓰기
scripts/serve.js                   # 신규: 로컬 개발용 최소 정적 서버
site/index.html                    # 신규: 컨테이너 + 패널 + 범례 골격
site/style.css                     # 신규: 레이아웃/패널/범례 스타일
site/main.js                       # 신규: graph.json fetch → Cytoscape 렌더 + 상호작용
.github/workflows/deploy-graph.yml # 신규: 빌드 + Pages 배포
.gitignore                         # 변경: site/graph.json 추가
```

**데이터 계약 (graph.json):**
```json
{
  "nodes": [{
    "id": "concepts/call-stack.md",
    "title": "콜 스택",
    "domain": "frontend",
    "status": "understood",
    "mastery": 3,
    "importance": 5,
    "isGap": false,
    "definitionHtml": "<p>...</p>",
    "feynmanHtml": "<ul>...</ul>",
    "sourcePath": "knowledge/concepts/call-stack.md"
  }],
  "edges": [{ "source": "concepts/call-stack.md", "target": "concepts/event-loop.md" }],
  "generatedAt": "2026-06-17T00:00:00.000Z"
}
```
- 노드 `id` = `knowledge/` 기준 상대경로 (예: `concepts/call-stack.md`). 이는 frontmatter `related[]` 표기와 동일하므로 간선 매칭에 그대로 쓴다.
- `isGap` = `status === 'seed'` **또는** 간선 차수(degree) 0.

---

## Task 1: 프로젝트 스캐폴딩

**Files:**
- Create: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: package.json 작성**

`package.json`:
```json
{
  "name": "dev-study-graph",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "description": "위키 지식 그래프 시각화",
  "scripts": {
    "build": "node scripts/generate-graph.js",
    "test": "node --test",
    "dev": "node scripts/generate-graph.js && node scripts/serve.js"
  },
  "dependencies": {
    "gray-matter": "^4.0.3",
    "marked": "^12.0.0"
  }
}
```

- [ ] **Step 2: 의존성 설치**

Run: `npm install`
Expected: `node_modules/` 생성, `package-lock.json` 생성, 에러 없음.

- [ ] **Step 3: .gitignore에 파생물/모듈 추가**

`.gitignore` 끝에 추가:
```
# 의존성
node_modules/

# 빌드 산출물 (CI가 생성)
site/graph.json
```

- [ ] **Step 4: 커밋**

```bash
git add package.json package-lock.json .gitignore
git commit -m "chore: 그래프 사이트 프로젝트 스캐폴딩 (deps, scripts, gitignore)"
```

---

## Task 2: 파싱/그래프 빌드 로직 (TDD)

순수 함수만 — 파일 IO 없음. 그래서 단위 테스트가 쉽다.

**Files:**
- Create: `scripts/lib/parse.js`
- Test: `scripts/lib/parse.test.js`

- [ ] **Step 1: 실패하는 테스트 작성**

`scripts/lib/parse.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractSection, parseConcept, buildGraph } from './parse.js';

const CALL_STACK = `---
title: 콜 스택
type: concept
domain: frontend
status: understood
mastery: 3
importance: 5
related: [concepts/event-loop.md]
---

## 한 줄 정의
함수 호출의 중첩을 추적하는 LIFO 구조.

## 깊은 설명
프레임이 쌓인다.

## 내 파인만 설명 (직접 작성)
- 형제 vs 중첩.

## 미해결 질문
- 클로저?
`;

const EVENT_LOOP = `---
title: 이벤트 루프
domain: frontend
status: understood
mastery: 4
importance: 5
related: [concepts/call-stack.md]
---

## 한 줄 정의
큐에서 작업을 꺼낸다.

## 내 파인만 설명 (직접 작성)
- 마이크로 먼저.
`;

const SEED = `---
title: 상태관리
domain: frontend
status: seed
mastery: 0
importance: 4
related: []
---

## 한 줄 정의
반응성.
`;

test('extractSection은 헤딩 다음~다음 ## 전까지를 반환', () => {
  const body = '## 한 줄 정의\nA\nB\n\n## 깊은 설명\nC';
  assert.equal(extractSection(body, '한 줄 정의'), 'A\nB');
});

test('extractSection은 "(직접 작성)" 접미사가 붙어도 매칭', () => {
  const body = '## 내 파인만 설명 (직접 작성)\n- x\n\n## 미해결 질문\n- y';
  assert.equal(extractSection(body, '내 파인만 설명'), '- x');
});

test('extractSection은 없는 섹션에 빈 문자열', () => {
  assert.equal(extractSection('## 한 줄 정의\nA', '실전 사례'), '');
});

test('parseConcept는 frontmatter와 섹션 HTML을 노드로', () => {
  const n = parseConcept({ id: 'concepts/call-stack.md', content: CALL_STACK });
  assert.equal(n.id, 'concepts/call-stack.md');
  assert.equal(n.title, '콜 스택');
  assert.equal(n.domain, 'frontend');
  assert.equal(n.mastery, 3);
  assert.equal(n.importance, 5);
  assert.deepEqual(n.related, ['concepts/event-loop.md']);
  assert.equal(n.sourcePath, 'knowledge/concepts/call-stack.md');
  assert.match(n.definitionHtml, /LIFO/);
  assert.match(n.feynmanHtml, /형제/);
  assert.doesNotMatch(n.definitionHtml, /깊은 설명/); // 다른 섹션 안 샘
});

test('parseConcept 기본값: 누락 필드 보정', () => {
  const n = parseConcept({ id: 'concepts/x.md', content: '---\ntitle: X\n---\n## 한 줄 정의\nA' });
  assert.equal(n.mastery, 0);
  assert.equal(n.importance, 3);
  assert.equal(n.status, 'seed');
  assert.deepEqual(n.related, []);
});

test('buildGraph는 양방향 related를 간선 1개로 중복 제거', () => {
  const { edges } = buildGraph([
    { id: 'concepts/call-stack.md', content: CALL_STACK },
    { id: 'concepts/event-loop.md', content: EVENT_LOOP },
  ]);
  assert.equal(edges.length, 1);
  assert.deepEqual(
    [edges[0].source, edges[0].target].sort(),
    ['concepts/call-stack.md', 'concepts/event-loop.md']
  );
});

test('buildGraph는 status=seed를 isGap', () => {
  const { nodes } = buildGraph([{ id: 'concepts/state.md', content: SEED }]);
  assert.equal(nodes[0].isGap, true);
});

test('buildGraph는 연결 0개를 isGap', () => {
  const orphan = `---\ntitle: 외톨이\ndomain: cs\nstatus: understood\nmastery: 2\nimportance: 2\nrelated: []\n---\n## 한 줄 정의\nA`;
  const { nodes } = buildGraph([{ id: 'concepts/orphan.md', content: orphan }]);
  assert.equal(nodes[0].isGap, true);
});

test('buildGraph는 존재하지 않는 related 대상을 무시하고 경고', () => {
  const { edges, warnings } = buildGraph([{ id: 'concepts/call-stack.md', content: CALL_STACK }]);
  assert.equal(edges.length, 0); // event-loop 노드가 없음
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /concepts\/event-loop\.md/);
});
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `npm test`
Expected: FAIL — `Cannot find module './parse.js'` (또는 import 에러).

- [ ] **Step 3: parse.js 구현**

`scripts/lib/parse.js`:
```js
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
```

- [ ] **Step 4: 테스트 실행 → 통과 확인**

Run: `npm test`
Expected: PASS — 모든 테스트 통과.

- [ ] **Step 5: 커밋**

```bash
git add scripts/lib/parse.js scripts/lib/parse.test.js
git commit -m "feat: 그래프 파싱/빌드 순수 로직 + 단위 테스트"
```

---

## Task 3: 빌드 스크립트 (파일 IO)

**Files:**
- Create: `scripts/generate-graph.js`

- [ ] **Step 1: generate-graph.js 구현**

`scripts/generate-graph.js`:
```js
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
```

- [ ] **Step 2: 빌드 실행 → graph.json 확인**

Run: `npm run build`
Expected: `그래프 생성 완료: 노드 4개, 간선 ...개` 출력. `site/graph.json` 생성됨.

- [ ] **Step 3: 산출물 형태 검증**

Run: `node -e "const g=require('./site/graph.json'); console.log(g.nodes.length, g.edges.length, g.nodes[0].title, !!g.nodes[0].definitionHtml)"`
Expected: `4 <간선수> <제목> true` (노드 4개, definitionHtml 채워짐).

- [ ] **Step 4: 커밋**

```bash
git add scripts/generate-graph.js
git commit -m "feat: knowledge 마크다운 → site/graph.json 빌드 스크립트"
```

---

## Task 4: 프론트엔드 (렌더 + 상호작용)

정적 사이트. Cytoscape는 CDN. 자동화 테스트 대신 로컬 서버로 수동 검증(아래 단계에 명시).

**Files:**
- Create: `site/index.html`
- Create: `site/style.css`
- Create: `site/main.js`
- Create: `scripts/serve.js`

- [ ] **Step 1: index.html 작성**

`site/index.html`:
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>지식 그래프 · dev-study</title>
  <link rel="stylesheet" href="./style.css" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.30.2/cytoscape.min.js"></script>
</head>
<body>
  <div id="cy"></div>

  <aside id="legend" aria-label="범례">
    <h2>범례</h2>
    <div id="legend-domains"></div>
    <hr />
    <ul class="legend-enc">
      <li><b>크기</b> = 중요도(importance)</li>
      <li><b>채움/밝기</b> = 숙련도(mastery)</li>
      <li><b>주황 점선</b> = seed/고아(빈틈)</li>
    </ul>
  </aside>

  <aside id="panel" class="panel hidden" aria-label="개념 상세">
    <button id="panel-close" aria-label="닫기">×</button>
    <div id="panel-body"></div>
  </aside>

  <script src="./main.js"></script>
</body>
</html>
```

- [ ] **Step 2: style.css 작성**

`site/style.css`:
```css
* { box-sizing: border-box; }
html, body { margin: 0; height: 100%; font-family: system-ui, sans-serif; background: #0f1117; color: #e5e7eb; }
#cy { position: absolute; inset: 0; }

#legend {
  position: absolute; left: 16px; bottom: 16px; z-index: 5;
  background: rgba(20,23,31,.9); border: 1px solid #2a3043; border-radius: 10px;
  padding: 12px 14px; max-width: 240px; font-size: 13px;
}
#legend h2 { margin: 0 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: .04em; color: #9ca3af; }
#legend hr { border: none; border-top: 1px solid #2a3043; margin: 10px 0; }
.legend-enc { margin: 0; padding-left: 16px; }
.legend-enc li { margin: 3px 0; }
.legend-dom { display: flex; align-items: center; gap: 8px; margin: 3px 0; }
.legend-dom .swatch { width: 12px; height: 12px; border-radius: 3px; flex: none; }

.panel {
  position: absolute; top: 0; right: 0; z-index: 10;
  width: min(420px, 90vw); height: 100%; overflow-y: auto;
  background: #161922; border-left: 1px solid #2a3043;
  padding: 24px 24px 48px; transition: transform .22s ease;
}
.panel.hidden { transform: translateX(100%); }
#panel-close {
  position: absolute; top: 12px; right: 16px; background: none; border: none;
  color: #9ca3af; font-size: 28px; line-height: 1; cursor: pointer;
}
#panel-close:hover { color: #e5e7eb; }
.panel h1 { font-size: 22px; margin: 0 30px 12px 0; }
.badges { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 18px; }
.badge { font-size: 12px; padding: 3px 8px; border-radius: 999px; background: #232838; color: #cbd5e1; }
.panel h3 { font-size: 13px; text-transform: uppercase; letter-spacing: .04em; color: #9ca3af; margin: 22px 0 6px; }
.panel a.source { display: inline-block; margin-top: 22px; color: #60a5fa; }
.panel :is(p, ul, li) { line-height: 1.6; }
```

- [ ] **Step 3: main.js 작성**

`site/main.js`:
```js
const DOMAIN_COLORS = {
  frontend: '#3b82f6', backend: '#10b981', network: '#f59e0b', os: '#ef4444',
  cs: '#8b5cf6', ai: '#ec4899', devops: '#14b8a6', database: '#f97316',
  'system-design': '#6366f1', unknown: '#9ca3af',
};
const REPO_BLOB_BASE = 'https://github.com/beigeyoon/dev-study/blob/main/';

const panel = document.getElementById('panel');
const panelBody = document.getElementById('panel-body');

function colorFor(domain) { return DOMAIN_COLORS[domain] ?? DOMAIN_COLORS.unknown; }

function openPanel(d) {
  panelBody.innerHTML = `
    <h1>${d.title}</h1>
    <div class="badges">
      <span class="badge">${d.domain}</span>
      <span class="badge">mastery ${d.mastery}/5</span>
      <span class="badge">importance ${d.importance}/5</span>
      <span class="badge">${d.status}</span>
    </div>
    <h3>한 줄 정의</h3>
    ${d.definitionHtml || '<p>(없음)</p>'}
    <h3>내 파인만 설명</h3>
    ${d.feynmanHtml || '<p>(아직 없음)</p>'}
    <a class="source" href="${REPO_BLOB_BASE}${d.sourcePath}" target="_blank" rel="noopener">원문 보기 ↗</a>
  `;
  panel.classList.remove('hidden');
}
function closePanel() { panel.classList.add('hidden'); }

document.getElementById('panel-close').addEventListener('click', closePanel);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });

function buildLegend() {
  const box = document.getElementById('legend-domains');
  for (const [domain, color] of Object.entries(DOMAIN_COLORS)) {
    if (domain === 'unknown') continue;
    const row = document.createElement('div');
    row.className = 'legend-dom';
    row.innerHTML = `<span class="swatch" style="background:${color}"></span>${domain}`;
    box.appendChild(row);
  }
}

async function main() {
  buildLegend();
  const data = await fetch('./graph.json').then((r) => r.json());

  const elements = [
    ...data.nodes.map((n) => ({
      data: { ...n, masteryPct: (n.mastery / 5) * 100, color: colorFor(n.domain) },
    })),
    ...data.edges.map((e) => ({ data: { id: `${e.source}__${e.target}`, source: e.source, target: e.target } })),
  ];

  cytoscape({
    container: document.getElementById('cy'),
    elements,
    style: [
      {
        selector: 'node',
        style: {
          'width': 'mapData(importance, 1, 5, 36, 84)',
          'height': 'mapData(importance, 1, 5, 36, 84)',
          'background-color': 'data(color)',
          'background-opacity': 'mapData(mastery, 0, 5, 0.35, 1)',
          'border-width': 1.5,
          'border-color': '#0f1117',
          'label': 'data(title)',
          'color': '#e5e7eb',
          'font-size': 11,
          'text-valign': 'center',
          'text-halign': 'center',
          'text-wrap': 'wrap',
          'text-max-width': 70,
          // mastery 게이지(파이 조각, 흰 채움 비율 = mastery/5)
          'pie-size': '100%',
          'pie-1-background-color': '#ffffff',
          'pie-1-background-size': 'data(masteryPct)',
          'pie-1-background-opacity': 0.25,
        },
      },
      {
        selector: 'node[?isGap]',
        style: { 'border-width': 3, 'border-color': '#f59e0b', 'border-style': 'dashed' },
      },
      {
        selector: 'edge',
        style: { 'width': 2, 'line-color': '#3a4256', 'curve-style': 'bezier' },
      },
      { selector: 'node:selected', style: { 'border-width': 3, 'border-color': '#60a5fa', 'border-style': 'solid' } },
    ],
    layout: { name: 'cose', animate: true, padding: 60, nodeRepulsion: 9000, idealEdgeLength: 120 },
  }).on('tap', 'node', (evt) => openPanel(evt.target.data()))
    .on('tap', (evt) => { if (evt.target === evt.cy) closePanel(); });
}

main();
```

- [ ] **Step 4: 로컬 정적 서버 작성**

`scripts/serve.js`:
```js
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = join(dirname(fileURLToPath(import.meta.url)), '..', 'site');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const PORT = 5050;

createServer(async (req, res) => {
  try {
    const path = req.url === '/' ? '/index.html' : decodeURIComponent(req.url.split('?')[0]);
    const file = await readFile(join(SITE, path));
    res.writeHead(200, { 'Content-Type': TYPES[extname(path)] ?? 'application/octet-stream' });
    res.end(file);
  } catch {
    res.writeHead(404); res.end('Not found');
  }
}).listen(PORT, () => console.log(`http://localhost:${PORT} 에서 서빙 중 (Ctrl+C 종료)`));
```

- [ ] **Step 5: 수동 검증**

Run: `npm run dev`
그다음 브라우저로 `http://localhost:5050` 접속해 확인:
- 4개 노드(이벤트 루프·콜 스택·마이크로/매크로태스크 큐)가 보이고 간선으로 연결됨.
- 노드 크기가 importance(이벤트 루프·콜 스택이 더 큼)에 따라 다름.
- 노드 클릭 → 우측 패널에 제목·뱃지·한 줄 정의·내 파인만 설명·원문 링크가 뜸.
- 빈 공간 클릭 또는 ESC → 패널 닫힘.
- 좌하단 범례에 domain 색과 인코딩 설명이 보임.
확인 후 Ctrl+C로 서버 종료.

- [ ] **Step 6: 커밋**

```bash
git add site/index.html site/style.css site/main.js scripts/serve.js
git commit -m "feat: Cytoscape 그래프 렌더 + 사이드 패널 + 범례 + 로컬 서버"
```

---

## Task 5: GitHub Actions 자동 배포

**Files:**
- Create: `.github/workflows/deploy-graph.yml`

- [ ] **Step 1: 워크플로 작성**

`.github/workflows/deploy-graph.yml`:
```yaml
name: Deploy knowledge graph

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: site
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: 커밋 & 푸시**

```bash
git add .github/workflows/deploy-graph.yml
git commit -m "ci: GitHub Pages 자동 배포 워크플로"
git push
```

- [ ] **Step 3: Pages 설정 활성화 (1회, 웹 UI)**

GitHub repo → Settings → Pages → "Build and deployment" → Source를 **GitHub Actions**로 설정.
(브랜치 `/docs` 방식 아님 — `/docs`는 스펙 문서가 점유.)

- [ ] **Step 4: 배포 검증**

GitHub repo → Actions 탭에서 "Deploy knowledge graph" 워크플로가 성공했는지 확인.
성공 시 출력된 page_url(`https://beigeyoon.github.io/dev-study/`)에 접속해 그래프가 뜨는지 확인.

---

## 운영 메모 (구현 후 위키 헌법 동기화)

- 구현 완료 후 `log.md`에 `## [2026-06-17] session | 지식 그래프 사이트 구축` 추가.
- 이후 ingest 워크플로에서 새 개념 push 시 그래프가 자동 최신화됨(별도 작업 불필요).
- (선택) CLAUDE.md에 "ingest 후 변경 push하면 그래프 자동 갱신" 한 줄 메모 검토.
