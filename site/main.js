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
