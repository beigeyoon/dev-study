# Handoff: 학습 카드 이미지 — 질문 A(IDE) + 정답 C(포스터)

## Overview
개발 스터디용 Threads 발행 카드(질문 카드 + 정답 카드, 1080×1350, 4:5)의 최종 시각 디자인은
**질문 = 방향 A(IDE·콘솔)**, **정답 = 방향 C(브루탈리스트 포스터, 색 반전)** 조합이다.
이 문서는 확정 디자인을 기존 렌더 파이프라인(`scripts/lib/card-html.js`)에 **드롭인**하기 위한
지시서다.

- 질문 카드: 어두운 에디터(`#0d1117`) — 윈도우 바(신호등 + 파일명 탭 + 라벨 배지),
  라인번호 + 풀 신택스 하이라이트 코드, 큰 헤드라인, 콘솔풍 서브(`❯ …`) + 핸들.
- 정답 카드: **라임 필드로 색 반전**(`#c2f542` 배경, 잉크 `#111318`) — 헤더 스트립,
  거대한 정답값 중앙, 해설(why + takeaway 반전 칩), 핸들.
- accent는 **라임 `#c2f542` 하나로 통일**. 라임이 두 카드를 잇는 실(질문의 키워드/핸들 색 =
  정답 카드 전체 필드 색)이라 한 쌍이 시각적으로 일관된다. `ACCENTS` 팔레트는 남겨 두되
  현재 모든 카드는 lime.

## About the Design Files
번들의 `Study Card Directions.dc.html` 는 **HTML 디자인 레퍼런스**다(그대로 복붙할 프로덕션
코드가 아님). 브라우저로 열면 상단 `2a` 블록이 **최종 조합(질문 A + 정답 C)** 이고, 아래
`1a/1b/1c` 는 탐색 기록이다. 실제 출력은 `.card` 하나당 정확히 1080×1350; `.dc.html`은 미리보기
편의로 35% 축소해 나란히 배치한 것뿐이다(`support.js` 동봉). 작업은 이 디자인을 기존
파이프라인(Puppeteer + `card-html.js`) 안에서 재현하는 것이다.

## Fidelity
**High-fidelity.** 색상·타이포·간격·존 구조 모두 최종값. 아래 스펙과 레퍼런스 구현을 그대로
반영하면 시안과 픽셀 단위로 일치한다.

---

## 드롭인 계약 (반드시 준수)
수정 대상: **`scripts/lib/card-html.js`** 의 `cardCss(accentHex, fonts)`, `qBody(card, handle)`,
`aBody(card, handle)`, `renderCardHtml(card, side, config)`, `highlightJs(code)`.
렌더 경로 불변: `render-cards.js` → `renderCardHtml()` → Puppeteer. 외부 네트워크 불가
(폰트 = 시스템/로컬 `@font-face`, 이미지 = data URI만).

### 테스트 무결성 (변경 금지 불변식)
`node --test scripts/lib/card-html.test.js` 통과 필수:
- 문서가 `<!doctype html>` 로 시작.
- 문자열에 `1080px`, `1350px` 포함.
- **질문 카드**: 헤드라인 텍스트, `<span class="kw">…</span>`, `@yooni_dev`, `"정답은 댓글"`,
  배지 라벨(`JS · 클로저`) 포함.
- **정답 카드**: 정답값, `<span class="hl">…</span>` 포함, `class="kw"` **없음**.
- accent hex `#c2f542`(lime)·`#3ff0e0`(cyan override 테스트)가 CSS에 반영 →
  `ACCENTS.cyan` 매핑 유지(UI 미사용이라도 override 테스트가 검증).

`highlightJs` 는 키워드만 `.kw`, 그 외 str/num/fn/com만 태깅하고 **식별자·구두점·공백은
이스케이프만** 한다(테스트의 `"a &lt; b"` 불변식 보존 — 식별자를 span으로 감싸면 깨짐).

---

## Screens / Views

### 1) 질문 카드 (side = 'q') — 방향 A · IDE
루트 `.card.card--q`, 배경 `#0d1117`, 기본색 `#c9d1d9`. `box-sizing:border-box`.

- **윈도우 바 (`.bar`)** — height 88, `#161b22`, border-bottom `#21262d`, `padding:0 40px`, gap 16.
  - 신호등 `.dots i` 3개(15px 원): `#ff5f56 / #ffbd2e / #27c93f`.
  - 파일명 `.file` — 모노 26px `#8b949e`. `card.concept`/`card.id` 에서 파생(`closure.js`).
  - 라벨 배지 `.badge` — `margin-left:auto`, 산세리프 800/24px, 색 accent,
    배경 `${accent}22`, `padding:9px 20px`, radius 8.
- **본문 (`.body`)** — `flex:1`, `padding:56px 60px`, flex column.
  - 코드 행 `.code-row` — flex, gap 28. 폰트 크기는 `codeFontSize(code)` 를 **행에 인라인** 지정.
    - 라인번호 `.gutter` — 모노, `line-height:1.7`, `text-align:right`, `white-space:pre`, `#484f58`.
    - 코드 `.code` — 모노, `line-height:1.7`, `white-space:pre`, `#c9d1d9`, `font-variant-ligatures:none`.
      토큰색: `.kw` accent · `.str` `#a5d6ff` · `.num` `#79c0ff` · `.fn` `#d2a8ff` · `.com` `#8b949e`.
  - `margin-top:56px` 후 헤드라인 `.headline` — 산세리프 800/96px/line-height 1.05/-2px, `#f0f6fc`.
  - `.spacer` (`flex:1; min-height:40px`) — 헤드라인↔푸터 사이 단일 신축 공간(여백 리듬).
  - 푸터 `.foot` — flex column gap 12.
    - `.sub` — 모노 30px `#8b949e`, 앞에 `.caret`(`❯ `, accent) + `"정답은 댓글에서 — 먼저 맞혀봐"`.
    - `.handle` — 모노 30px `#6e7681`, `@yooni_dev`.

### 2) 정답 카드 (side = 'a') — 방향 C · 포스터 반전
루트 `.card.card--a`, 배경 accent, 잉크 `#111318`. 그리드 선 `rgba(0,0,0,.28)`.

- **헤더 `.badge`** — 스트립, border-bottom, `padding:44px 52px`, `space-between`,
  모노 700/26px/letter-spacing 2px, 색 `rgba(17,19,24,.72)`, 텍스트 `"정답 / ANSWER"`.
- **정답 `.answer`** — `flex:1; align-items:center; justify-content:center; text-align:center`,
  모노 900/186px/letter-spacing 6px, `#111318`. 중앙을 채움.
- **해설 `.explain`** — border-top, `padding:44px 52px`, flex column gap 26.
  - `.why` — 42px/line-height 1.5, `#1a1c22`.
  - `.takeaway` — 산세리프 800/56px/line-height 1.35/-1px, `#111318`.
    `.hl` = 반전 칩: 배경 `#111318`, 글자 accent, `padding:2px 14px; radius:4px; white-space:nowrap`.
- **푸터 `.foot`** — border-top, `padding:30px 52px`, `.handle` `@yooni_dev`, `rgba(17,19,24,.62)`.

---

## Design Tokens
- 질문 배경 `#0d1117` · 바 `#161b22` · 선 `#21262d` · 기본텍스트 `#c9d1d9` · 헤드라인 `#f0f6fc`
- accent(라임) `#c2f542` — 키워드/라벨/캐럿/핸들 · **정답 카드 전체 배경**
- 코드 토큰: kw accent · str `#a5d6ff` · num `#79c0ff` · fn `#d2a8ff` · com `#8b949e` · 라인번호 `#484f58`
- 정답 잉크 `#111318` · why `#1a1c22` · 선 `rgba(0,0,0,.28)` · muted `rgba(17,19,24,.32~.72)`
- 타이포: 헤드라인 96 · 정답 186 · takeaway 56 · why 42 · code 26~40(가변) · badge/sub/handle 24~30
- 존 패딩: 바 `0 40`, 본문 `56 60`, 헤더/해설 `44 52`, 정답 `0 52`, 정답푸터 `30 52`

## 폰트 (교체 가능 — 변수 유지)
`cardCss(accentHex, fonts)` 의 `fonts.headline`/`fonts.mono`/`fonts.korean` 유지.
`@font-face`(로컬 file://)로 로드 시 각각 헤드라인/코드/한글 본문을 앞세우고, 없으면 시스템
폴백(`-apple-system,'Apple SD Gothic Neo'`, `ui-monospace,Menlo`). 현재 시스템 폰트로 렌더.

## 긴 코드 줄바꿈 해결
`white-space:pre` + **줄 길이 기반 폰트 스케일**(`codeFontSize`)로 긴 줄도 한 줄에 담는다
(라인번호 거터 폭까지 감안: closure ≈ 40px, event-loop ≈ 30px). 세로 여백은 margin-auto 남발
대신 **단일 `.spacer`(flex:1)** 로 헤드라인↔푸터만 신축시켜 리듬을 잡는다.

---

## 레퍼런스 구현 (`scripts/lib/card-html.js` — 이대로 반영하면 테스트 통과)

```js
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
.card--q .foot{display:flex;flex-direction:column;gap:12px;}
.card--q .sub{font-family:${mono}ui-monospace,Menlo,monospace;font-size:30px;color:#8b949e;}
.card--q .sub .caret{color:${accentHex};}
.card--q .handle{font-family:${mono}ui-monospace,Menlo,monospace;font-size:30px;color:#6e7681;}

/* ── 정답 카드 · 포스터 반전 ── */
.card--a{background:${accentHex};color:#111318;}
.card--a .badge{display:flex;justify-content:space-between;align-items:center;
  border-bottom:1px solid rgba(0,0,0,.28);padding:44px 52px;
  font-family:${mono}ui-monospace,Menlo,monospace;font-weight:700;font-size:26px;
  letter-spacing:2px;color:rgba(17,19,24,.72);}
.card--a .answer{flex:1;display:flex;align-items:center;justify-content:center;text-align:center;
  padding:0 52px;font-family:${mono}ui-monospace,Menlo,monospace;font-weight:900;
  font-size:186px;line-height:1;letter-spacing:6px;color:#111318;}
.card--a .explain{border-top:1px solid rgba(0,0,0,.28);padding:44px 52px;
  display:flex;flex-direction:column;gap:26px;}
.card--a .why{font-size:42px;line-height:1.5;color:#1a1c22;}
.card--a .takeaway{font-family:${head}-apple-system,sans-serif;font-weight:800;font-size:56px;
  line-height:1.35;letter-spacing:-1px;color:#111318;}
.card--a .takeaway .hl{background:#111318;color:${accentHex};padding:2px 14px;
  border-radius:4px;white-space:nowrap;}
.card--a .foot{border-top:1px solid rgba(0,0,0,.28);padding:30px 52px;}
.card--a .handle{font-family:${mono}ui-monospace,Menlo,monospace;font-weight:700;
  font-size:26px;color:rgba(17,19,24,.62);}
`;
}

function qBody(card, handle) {
  const size = codeFontSize(card.code);
  return `<div class="bar"><span class="dots"><i></i><i></i><i></i></span>` +
    `<span class="file">${escapeHtml(fileName(card))}</span>` +
    `<span class="badge">${escapeHtml(card.label)}</span></div>` +
    `<div class="body"><div class="code-row" style="font-size:${size}px">` +
    `<pre class="gutter">${lineNumbers(card.code)}</pre>` +
    `<div class="code">${highlightJs(card.code)}</div></div>` +
    `<div class="headline">${escapeHtml(card.headline)}</div>` +
    `<div class="spacer"></div>` +
    `<div class="foot">` +
    `<div class="sub"><span class="caret">❯ </span>정답은 댓글에서 — 먼저 맞혀봐</div>` +
    `<div class="handle">${escapeHtml(handle)}</div></div></div>`;
}

function aBody(card, handle) {
  return `<div class="badge"><span>정답 / ANSWER</span></div>` +
    `<div class="answer">${escapeHtml(card.answer)}</div>` +
    `<div class="explain"><div class="why">${escapeHtml(card.why)}</div>` +
    `<div class="takeaway">${emphasizeKeywords(card.takeaway)}</div></div>` +
    `<div class="foot"><span class="handle">${escapeHtml(handle)}</span></div>`;
}

export function renderCardHtml(card, side, config = {}) {
  const accents = config.accents ?? ACCENTS;
  const accentHex = accents[card.accent] ?? ACCENTS.lime;
  const handle = config.handle ?? '@yooni_dev';
  const fonts = config.fonts ?? {};
  const isA = side === 'a';
  const inner = isA ? aBody(card, handle) : qBody(card, handle);
  const cls = isA ? 'card card--a' : 'card card--q';
  return `<!doctype html><html><head><meta charset="utf-8">` +
    `<style>${cardCss(accentHex, fonts)}</style></head>` +
    `<body><div class="${cls}">${inner}</div></body></html>`;
}
```

> 클래스는 루트 `.card--q` / `.card--a` 로 스코프해 같은 이름(`.badge` 등)이 질문/정답에서
> 다르게 스타일링된다. `.headline .spacer` 조합이 남는 세로 공간을 흡수해 빈 공간 과다 문제를
> 해결한다.

---

## Verification
1. `node --test scripts/lib/card-html.test.js` → 전부 통과.
2. `npm run cards` → `site/cards/dist/*.png` 생성.
3. **두 샘플 모두** 확인:
   - `knowledge/cards/closure-makecounter-01.md` (짧은 코드) — 코드 40px, 한 줄씩.
   - `knowledge/cards/event-loop-order-01.md` (긴 코드) — 코드 ~30px, **문장 중간 줄바꿈 없이** 한 줄.
   `-q.png`(어두운 에디터)·`-a.png`(라임 반전) 쌍이 시각적으로 일관되는지 확인.
4. accent는 두 샘플 다 `lime`. 색 변경은 md frontmatter `accent` 만 수정.

## Files
- `Study Card Directions.dc.html` — 시안. 상단 `2a` = 최종 조합(질문 A + 정답 C), 아래 `1a/1b/1c` = 탐색.
- `support.js` — 위 `.dc.html` 프리뷰 런타임.
