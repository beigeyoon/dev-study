export const ACCENTS = {
  lime: '#c2f542',
  cyan: '#3ff0e0',
  magenta: '#ff5db1',
  orange: '#ff9f45',
};

export function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
  ));
}

// 코드의 JS 키워드를 네온 span으로. 그 외 문자는 이스케이프.
export function highlightJs(code) {
  const escaped = escapeHtml(code);
  return escaped.replace(
    /\b(function|let|const|var|return|if|else|for|while|await|async|new|class|of|in)\b/g,
    '<span class="kw">$1</span>'
  );
}

// "**x**" → <span class="hl">x</span>, 그 외 텍스트는 이스케이프.
export function emphasizeKeywords(md) {
  return String(md)
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part) => {
      const m = part.match(/^\*\*([^*]+)\*\*$/);
      return m ? `<span class="hl">${escapeHtml(m[1])}</span>` : escapeHtml(part);
    })
    .join('');
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
.card{width:1080px;height:1350px;background:linear-gradient(160deg,#1d1440,#150e30);
  color:#e9e4ff;font-family:${kor}-apple-system,'Apple SD Gothic Neo',sans-serif;
  padding:88px 76px;display:flex;flex-direction:column;overflow:hidden;}
.badge{align-self:flex-start;font-weight:900;font-size:30px;letter-spacing:2px;
  padding:12px 30px;border-radius:50px;background:${accentHex}26;color:${accentHex};
  font-family:${head}-apple-system,sans-serif;}
.code{margin-top:52px;background:#ffffff0f;border:1px solid ${accentHex}30;border-radius:28px;
  padding:44px 48px;font-family:${mono}ui-monospace,Menlo,monospace;font-size:40px;
  line-height:1.6;white-space:pre-wrap;word-break:break-word;color:#e9e4ff;}
.code .kw{color:${accentHex};}
.headline{margin-top:auto;font-family:${head}-apple-system,sans-serif;font-weight:900;
  font-size:104px;line-height:1.04;letter-spacing:-2px;color:#fff;}
.answer{margin-top:20px;font-family:${mono}ui-monospace,Menlo,monospace;font-weight:900;
  font-size:196px;letter-spacing:6px;color:${accentHex};}
.why{margin-top:40px;font-size:46px;line-height:1.6;color:#e9e4ff;}
.takeaway{margin-top:auto;font-family:${head}-apple-system,sans-serif;font-weight:900;
  font-size:66px;line-height:1.3;letter-spacing:-1px;color:#fff;}
.takeaway .hl{color:${accentHex};}
.sub{margin-top:30px;font-size:36px;color:#8b7fd6;}
.handle{margin-top:18px;font-size:30px;color:#6b5fb0;}
`;
}

function qBody(card, handle) {
  return `<div class="badge">${escapeHtml(card.label)}</div>
<div class="code">${highlightJs(card.code)}</div>
<div class="headline">${escapeHtml(card.headline)}</div>
<div class="sub">정답은 댓글에서 — 먼저 맞혀봐</div>
<div class="handle">${escapeHtml(handle)}</div>`;
}

function aBody(card, handle) {
  return `<div class="badge">정답</div>
<div class="answer">${escapeHtml(card.answer)}</div>
<div class="why">${escapeHtml(card.why)}</div>
<div class="takeaway">${emphasizeKeywords(card.takeaway)}</div>
<div class="handle">${escapeHtml(handle)}</div>`;
}

// card + side('q'|'a') + config → 완결 HTML 문서.
export function renderCardHtml(card, side, config = {}) {
  const accents = config.accents ?? ACCENTS;
  const accentHex = accents[card.accent] ?? ACCENTS.lime;
  const handle = config.handle ?? '@yooni_dev';
  const fonts = config.fonts ?? {};
  const inner = side === 'a' ? aBody(card, handle) : qBody(card, handle);
  return `<!doctype html><html><head><meta charset="utf-8">` +
    `<style>${cardCss(accentHex, fonts)}</style></head>` +
    `<body><div class="card">${inner}</div></body></html>`;
}
