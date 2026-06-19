// 지식 그래프 — 리디자인 (vanilla JS + Cytoscape.js)
// 스펙: design_handoff_knowledge_graph/README.md / 데이터 계약: graph.json (변경 없음)

// 도메인 10색 팔레트 (다크 배경 기준 재정비)
const DOMAIN_COLORS = {
  frontend: '#ff8a5b', network: '#f0b34a', devops: '#8fc861', backend: '#46c98a',
  database: '#34c4c4', 'system-design': '#5aa6f0', cs: '#8b93f5', ai: '#c77ae0',
  os: '#f06b8a', unknown: '#8a93a6',
};
const REPO_BLOB_BASE = 'https://github.com/beigeyoon/dev-study/blob/main/';

const colorFor = (d) => DOMAIN_COLORS[d] ?? DOMAIN_COLORS.unknown;

// ── DOM 참조 ──
const $ = (id) => document.getElementById(id);
const els = {
  cy: $('cy'),
  stats: $('kg-stats'),
  search: $('kg-search'),
  gaps: $('kg-gaps'),
  zoomIn: $('kg-zoom-in'),
  zoomOut: $('kg-zoom-out'),
  fit: $('kg-fit'),
  domains: $('kg-domains'),
  panel: $('kg-panel'),
  panelContent: $('kg-panel-content'),
  panelClose: $('kg-panel-close'),
};

// ── 상태 ──
const state = {
  selected: null,        // 선택된 노드 data (또는 null)
  query: '',             // 검색어
  activeDomains: {},     // { [domain]: false } — 명시적 false만 숨김 (기본 표시)
  gapsOnly: false,       // 빈틈만 보기
};

let cy = null;

// ── 그래프 로드 & 초기화 ──
async function main() {
  let data;
  try {
    data = await fetch('./graph.json').then((r) => r.json());
  } catch (e) {
    console.error('graph.json 로드 실패', e);
    return;
  }

  const nodes = data.nodes || [];
  const edges = data.edges || [];
  const present = [...new Set(nodes.map((n) => n.domain))];
  const gapCount = nodes.filter((n) => n.isGap).length;

  els.stats.textContent = nodes.length ? `${nodes.length}개 개념 · 빈틈 ${gapCount}` : '';
  buildLegend(present);

  const elements = [
    ...nodes.map((n) => ({ data: { ...n, masteryPct: (n.mastery / 5) * 100, color: colorFor(n.domain) } })),
    ...edges.map((e) => ({ data: { id: `${e.source}__${e.target}`, source: e.source, target: e.target } })),
  ];

  cy = cytoscape({
    container: els.cy,
    elements,
    minZoom: 0.25,
    maxZoom: 2.5,
    style: [
      { selector: 'node', style: {
        'width': 'mapData(importance, 1, 5, 38, 86)',   // 크기 = 중요도
        'height': 'mapData(importance, 1, 5, 38, 86)',
        'background-color': '#171b27',                    // 본체: 어두운 코어 (항상 불투명)
        'background-opacity': 1,
        'border-color': 'data(color)',                    // 테두리 = 도메인색 (항상 표시)
        'border-width': 2.5,
        'pie-size': '92%',                                // 채움 = 숙련도 (도메인색 파이)
        'pie-1-background-color': 'data(color)',
        'pie-1-background-size': 'data(masteryPct)',
        'pie-1-background-opacity': 0.92,
        'label': 'data(title)',
        'color': '#d6dae3', 'font-family': 'Wanted Sans, sans-serif', 'font-size': 12, 'font-weight': 500,
        'text-valign': 'bottom', 'text-halign': 'center', 'text-margin-y': 6,   // 라벨 = 노드 밖 아래
        'text-wrap': 'wrap', 'text-max-width': 130,
        'text-background-color': '#0e1015', 'text-background-opacity': 0.78,
        'text-background-padding': 3, 'text-background-shape': 'roundrectangle',
        'transition-property': 'opacity, border-width', 'transition-duration': '0.15s',
      }},
      { selector: 'node[?isGap]', style: {                // 빈틈 = 흰 점선
        'border-color': '#e5e7eb', 'border-style': 'dashed', 'border-width': 2.5,
      }},
      { selector: 'edge', style: {
        'width': 1.5, 'line-color': '#333b4f', 'curve-style': 'bezier', 'opacity': 0.6,
        'transition-property': 'opacity, line-color, width', 'transition-duration': '0.15s',
      }},
      { selector: 'edge.hl', style: { 'line-color': '#6b7790', 'width': 2.4, 'opacity': 1 }},
      { selector: '.faded', style: { 'opacity': 0.09 }},
      { selector: 'node.faded', style: { 'text-opacity': 0 }},
      { selector: 'node.dimN', style: { 'opacity': 0.3 }},
      { selector: 'node.labelHide', style: { 'text-opacity': 0 }},
      { selector: 'node.hover', style: { 'overlay-color': '#ffffff', 'overlay-opacity': 0.07, 'overlay-padding': 6 }},
      { selector: 'node:selected', style: { 'overlay-color': '#ffffff', 'overlay-opacity': 0.16, 'overlay-padding': 9, 'border-width': 3.5 }},
    ],
    layout: { name: 'preset' },
  });

  window.cy = cy;   // 디버깅/콘솔 접근용
  cy.on('tap', 'node', (evt) => { selectNode(evt.target.data()); });
  cy.on('tap', (evt) => { if (evt.target === cy) clearSelection(); });
  cy.on('mouseover', 'node', (e) => e.target.addClass('hover'));
  cy.on('mouseout', 'node', (e) => e.target.removeClass('hover'));

  runLayout();
}

// ── 레이아웃 (기본: cose force-directed) ──
function runLayout() {
  if (!cy) return;
  cy.resize();   // ⚠️ 레이아웃 직전 필수 — 컨테이너 크기 측정 전 돌면 줌이 튄다
  const lay = cy.layout({
    name: 'cose', animate: true, randomize: true, padding: 70,
    nodeRepulsion: 11000, idealEdgeLength: 135, nodeDimensionsIncludeLabels: true,
  });
  lay.one('layoutstop', () => { cy.fit(undefined, 70); refresh(); });
  lay.run();
}

// ── 필터/하이라이트 재계산 (검색·도메인·빈틈 AND 결합 + 이웃 강조) ──
function refresh() {
  if (!cy) return;
  const { query, gapsOnly, activeDomains, selected } = state;
  const q = (query || '').trim().toLowerCase();
  const selNode = selected ? cy.getElementById(selected.id) : null;
  const keep = (selNode && selNode.nonempty()) ? selNode.closedNeighborhood() : null;

  cy.batch(() => {
    cy.nodes().forEach((n) => {
      const d = n.data();
      const domainOn = activeDomains[d.domain] !== false;
      const gapOk = !gapsOnly || d.isGap;
      const matchOk = !q || (d.title || '').toLowerCase().includes(q) || (d.domain || '').toLowerCase().includes(q);
      const visible = domainOn && gapOk && matchOk;
      n.removeClass('faded dimN labelHide');
      if (!visible) { n.addClass('faded'); return; }
      if (keep && !keep.contains(n)) n.addClass('dimN');
    });
    cy.edges().forEach((e) => {
      const hidden = e.source().hasClass('faded') || e.target().hasClass('faded');
      e.removeClass('faded hl');
      if (hidden) { e.addClass('faded'); return; }
      if (keep && keep.contains(e)) e.addClass('hl');
    });
  });
}

// ── 범례 (존재하는 도메인만, 클릭해 필터 토글) ──
function buildLegend(domainKeys) {
  els.domains.innerHTML = '';
  domainKeys.forEach((key) => {
    const row = document.createElement('div');
    row.className = 'kg-dom-row';
    row.innerHTML = `<span class="kg-dom-swatch" style="background:${colorFor(key)}"></span>${key}`;
    row.addEventListener('click', () => toggleDomain(key, row));
    els.domains.appendChild(row);
  });
}

function toggleDomain(key, row) {
  const off = state.activeDomains[key] !== false;  // 현재 켜져 있으면 끈다
  state.activeDomains[key] = off ? false : undefined;
  row.classList.toggle('off', off);
  row.title = off ? `${key} 숨김 — 클릭해 표시` : `${key} 표시 중 — 클릭해 숨김`;
  refresh();
}

// ── 상세 패널 ──
function selectNode(d) {
  state.selected = d;
  els.panelContent.innerHTML = `
    <div class="kg-panel-head">
      <span class="kg-panel-chip" style="background:${d.color}"></span>
      <h1>${d.title}</h1>
    </div>
    <div class="kg-badges">
      <span class="kg-badge">${d.domain}</span>
      <span class="kg-badge">숙련도 ${d.mastery}/5</span>
      <span class="kg-badge">중요도 ${d.importance}/5</span>
      <span class="kg-badge">${d.status}</span>
    </div>
    <div class="kg-body">
      <h3>한 줄 정의</h3>${d.definitionHtml || '<p>(없음)</p>'}
      <h3>내 파인만 설명</h3>${d.feynmanHtml || '<p>(아직 없음)</p>'}
      <a class="kg-src" href="${REPO_BLOB_BASE}${d.sourcePath}" target="_blank" rel="noopener">원문 보기 <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 17L17 7M17 7H8M17 7v9"/></svg></a>
    </div>`;
  els.panel.classList.add('open');
  refresh();
}

function clearSelection() {
  if (cy) cy.$(':selected').unselect();
  state.selected = null;
  els.panel.classList.remove('open');
  refresh();
}

// ── 줌/맞춤 ──
const zoomIn = () => cy && cy.animate({ zoom: cy.zoom() * 1.3, center: { eles: cy.elements() } }, { duration: 150 });
const zoomOut = () => cy && cy.animate({ zoom: cy.zoom() / 1.3, center: { eles: cy.elements() } }, { duration: 150 });
const fitView = () => cy && cy.animate({ fit: { padding: 70 } }, { duration: 200 });

// ── 이벤트 바인딩 ──
els.search.addEventListener('input', (e) => { state.query = e.target.value; refresh(); });
els.gaps.addEventListener('click', () => {
  state.gapsOnly = !state.gapsOnly;
  els.gaps.classList.toggle('active', state.gapsOnly);
  refresh();
});
els.zoomIn.addEventListener('click', zoomIn);
els.zoomOut.addEventListener('click', zoomOut);
els.fit.addEventListener('click', fitView);
els.panelClose.addEventListener('click', clearSelection);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') clearSelection(); });
window.addEventListener('resize', () => { if (cy) cy.resize(); });

main();
