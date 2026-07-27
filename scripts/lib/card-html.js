export const ACCENTS = {
  lime: '#c2f542',
  cyan: '#3ff0e0',   // UI 미사용이나 override 테스트 위해 유지
  magenta: '#ff5db1',
  orange: '#ff9f45',
};

export function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
  ));
}

const KW = new Set(
  'function let const var return if else for while await async new class of in'.split(' ')
);

// 키워드는 .kw, str/num/fn/com만 태깅, 식별자·구두점·공백은 이스케이프만.
export function highlightJs(code) {
  const re = /(\/\/[^\n]*)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")|(\b\d+\b)|([A-Za-z_$][A-Za-z0-9_$]*)|(\s+)|([^\sA-Za-z0-9_$]+)/g;
  let out = '', m;
  while ((m = re.exec(code))) {
    if (m[1]) out += `<span class="com">${escapeHtml(m[1])}</span>`;
    else if (m[2]) out += `<span class="str">${escapeHtml(m[2])}</span>`;
    else if (m[3]) out += `<span class="num">${escapeHtml(m[3])}</span>`;
    else if (m[4]) {
      const rest = code.slice(re.lastIndex);
      if (KW.has(m[4])) out += `<span class="kw">${escapeHtml(m[4])}</span>`;
      else if (/^\s*\(/.test(rest)) out += `<span class="fn">${escapeHtml(m[4])}</span>`;
      else out += escapeHtml(m[4]);
    } else out += escapeHtml(m[5] || m[6]);
  }
  return out;
}

export function emphasizeKeywords(md) {
  return String(md)
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part) => {
      const m = part.match(/^\*\*([^*]+)\*\*$/);
      return m ? `<span class="hl">${escapeHtml(m[1])}</span>` : escapeHtml(part);
    })
    .join('');
}

// 라인번호 거터(폭 ~60) + 본문 패딩(120) + gap(28) 감안한 사용 폭.
function codeFontSize(code) {
  const maxLen = Math.max(1, ...code.split('\n').map((l) => l.length));
  const avail = 1080 - 120 - 28 - 60;
  const fit = Math.floor(avail / (maxLen * 0.6)); // 모노 문자폭 ≈ 0.6em
  return Math.max(26, Math.min(40, fit));
}

// 정답값을 한 줄에 담는 폰트 크기. 짧으면 186px 유지, 길면 폭에 맞춰 축소.
// 한글(초/개 등)은 모노 폰트에서 폭이 ~2배라 가중 길이로 계산.
function answerFontSize(answer) {
  const weighted = [...String(answer)].reduce(
    (w, ch) => w + (/[가-힣]/.test(ch) ? 2 : 1),
    0
  );
  const avail = 1080 - 52 * 2; // 좌우 패딩 52
  const fit = Math.floor(avail / (Math.max(1, weighted) * 0.62)); // 문자폭 ≈ 0.62em
  return Math.max(64, Math.min(186, fit));
}

function lineNumbers(code) {
  const n = code.split('\n').length;
  return Array.from({ length: n }, (_, i) => i + 1).join('\n');
}

function fileName(card) {
  const base = String(card.concept || card.id || 'snippet').split('/').pop().replace(/\.md$/, '');
  return `${base}.${card.codeLang || 'js'}`;
}

function fontFace(name, url) {
  return url ? `@font-face{font-family:'${name}';src:url('${url}');font-display:block;}` : '';
}

function cardCss(accentHex, fonts = {}) {
  const head = fonts.headline ? "'CardHeadline'," : '';
  const mono = fonts.mono ? "'CardMono'," : '';
  const kor = fonts.korean ? "'CardKorean'," : '';
  return `
*{margin:0;padding:0;box-sizing:border-box;}
${fontFace('CardHeadline', fonts.headline)}
${fontFace('CardMono', fonts.mono)}
${fontFace('CardKorean', fonts.korean)}
.card{width:1080px;height:1350px;display:flex;flex-direction:column;overflow:hidden;
  font-family:${kor}-apple-system,'Apple SD Gothic Neo',sans-serif;}

/* ── 질문 카드 · IDE ── */
.card--q{background:#0d1117;color:#c9d1d9;}
.card--q .bar{height:88px;flex:none;background:#161b22;border-bottom:1px solid #21262d;
  display:flex;align-items:center;gap:16px;padding:0 40px;}
.card--q .dots{display:flex;gap:11px;}
.card--q .dots i{width:15px;height:15px;border-radius:50%;}
.card--q .dots i:nth-child(1){background:#ff5f56;}
.card--q .dots i:nth-child(2){background:#ffbd2e;}
.card--q .dots i:nth-child(3){background:#27c93f;}
.card--q .file{font-family:${mono}ui-monospace,Menlo,monospace;font-size:26px;color:#8b949e;}
.card--q .badge{margin-left:auto;font-family:${head}-apple-system,sans-serif;font-weight:800;
  font-size:24px;color:${accentHex};background:${accentHex}22;padding:9px 20px;border-radius:8px;}
.card--q .body{flex:1;display:flex;flex-direction:column;padding:56px 60px;}
.card--q .code-row{display:flex;gap:28px;}
.card--q .gutter{font-family:${mono}ui-monospace,Menlo,monospace;line-height:1.7;
  color:#484f58;text-align:right;white-space:pre;}
.card--q .code{font-family:${mono}ui-monospace,Menlo,monospace;line-height:1.7;
  white-space:pre;color:#c9d1d9;font-variant-ligatures:none;}
.card--q .code .kw{color:${accentHex};}
.card--q .code .str{color:#a5d6ff;}
.card--q .code .num{color:#79c0ff;}
.card--q .code .fn{color:#d2a8ff;}
.card--q .code .com{color:#8b949e;}
.card--q .headline{margin-top:56px;font-family:${head}-apple-system,sans-serif;
  font-weight:800;font-size:96px;line-height:1.05;letter-spacing:-2px;color:#f0f6fc;}
.card--q .spacer{flex:1;min-height:40px;}
.card--q .sub{font-family:${mono}ui-monospace,Menlo,monospace;font-size:30px;color:#8b949e;}
.card--q .sub .caret{color:${accentHex};}

/* ── 정답 카드 · 포스터 반전 ── */
.card--a{background:${accentHex};color:#111318;}
.card--a .badge{display:flex;justify-content:space-between;align-items:center;
  border-bottom:1px solid rgba(0,0,0,.28);padding:44px 52px;
  font-family:${mono}ui-monospace,Menlo,monospace;font-weight:700;font-size:26px;
  letter-spacing:2px;color:rgba(17,19,24,.72);}
.card--a .answer{flex:1;display:flex;align-items:center;justify-content:center;text-align:center;
  padding:0 52px;font-family:${mono}ui-monospace,Menlo,monospace;font-weight:900;
  font-size:186px;line-height:1;letter-spacing:6px;color:#111318;white-space:nowrap;}
.card--a .explain{border-top:1px solid rgba(0,0,0,.28);padding:44px 52px;
  display:flex;flex-direction:column;gap:26px;}
.card--a .why{font-size:42px;line-height:1.5;color:#1a1c22;}
.card--a .takeaway{font-family:${head}-apple-system,sans-serif;font-weight:800;font-size:56px;
  line-height:1.35;letter-spacing:-1px;color:#111318;}
.card--a .takeaway .hl{background:#111318;color:${accentHex};padding:2px 14px;
  border-radius:4px;white-space:nowrap;}
`;
}

function qBody(card) {
  const size = codeFontSize(card.code);
  return `<div class="bar"><span class="dots"><i></i><i></i><i></i></span>` +
    `<span class="file">${escapeHtml(fileName(card))}</span>` +
    `<span class="badge">${escapeHtml(card.label)}</span></div>` +
    `<div class="body"><div class="code-row" style="font-size:${size}px">` +
    `<pre class="gutter">${lineNumbers(card.code)}</pre>` +
    `<div class="code">${highlightJs(card.code)}</div></div>` +
    `<div class="headline">${escapeHtml(card.headline)}</div>` +
    `<div class="spacer"></div>` +
    `<div class="sub"><span class="caret">❯ </span>정답은 댓글에서</div></div>`;
}

function aBody(card) {
  const asize = answerFontSize(card.answer);
  return `<div class="badge"><span>정답 / ANSWER</span></div>` +
    `<div class="answer" style="font-size:${asize}px">${escapeHtml(card.answer)}</div>` +
    `<div class="explain"><div class="why">${escapeHtml(card.why)}</div>` +
    `<div class="takeaway">${emphasizeKeywords(card.takeaway)}</div></div>`;
}

export function renderCardHtml(card, side, config = {}) {
  const accents = config.accents ?? ACCENTS;
  const accentHex = accents[card.accent] ?? ACCENTS.lime;
  const fonts = config.fonts ?? {};
  const isA = side === 'a';
  const inner = isA ? aBody(card) : qBody(card);
  const cls = isA ? 'card card--a' : 'card card--q';
  return `<!doctype html><html><head><meta charset="utf-8">` +
    `<style>${cardCss(accentHex, fonts)}</style></head>` +
    `<body><div class="${cls}">${inner}</div></body></html>`;
}
