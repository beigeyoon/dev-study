# 학습 카드 발행 시스템 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 위키의 파인만 통과 개념을 스레드 발행용 질문/정답 카드 이미지(PNG)로 뽑는 파이프라인과 `/card` 스킬을 만든다.

**Architecture:** 기존 `scripts/lib/parse.js`의 `extractSection`을 재사용해 `knowledge/cards/*.md`(frontmatter + 라벨 섹션)를 파싱(`card.js`) → HTML 카드 문서 생성(`card-html.js`) → Puppeteer로 1080×1350 PNG 렌더(`render-cards.js`). 순수함수(파싱·HTML)는 `node:test`로 단위 테스트, Puppeteer 엔트리는 얇게. 카드 제작 트리거는 코드가 아니라 `.claude/skills/card/`의 워크플로우 스킬.

**Tech Stack:** Node ESM, gray-matter(기존), marked(기존), puppeteer(신규 devDep), node:test.

**커밋 정책(사용자 지정):** 태스크별 커밋 없음. 전체 완료 후 **단일 커밋**(이 계획 + 스펙 문서 + 구현 전부)을 Task 9에서 브랜치 파고 1회 수행.

---

## 파일 구조

**신규**
- `scripts/lib/card.js` — 카드 파싱(순수). `parseCard`, `extractCodeBlock`, `isRenderable`.
- `scripts/lib/card.test.js` — 위 테스트.
- `scripts/lib/card-html.js` — 카드 HTML 렌더(순수). `escapeHtml`, `highlightJs`, `emphasizeKeywords`, `renderCardHtml`.
- `scripts/lib/card-html.test.js` — 위 테스트.
- `scripts/render-cards.js` — Puppeteer 엔트리(approved 카드 → PNG 2장).
- `knowledge/cards/cards.config.json` — handle/accent/폰트 설정.
- `knowledge/cards/closure-makecounter-01.md` — 샘플 카드 1.
- `knowledge/cards/event-loop-order-01.md` — 샘플 카드 2.
- `.claude/skills/card/SKILL.md` — `/card` 스킬.
- `learning-os/publish-queue.md` — 발행 파이프라인 추적.

**수정**
- `scripts/generate-graph.js` — `knowledge/cards/`를 그래프 수집에서 제외.
- `package.json` — `cards` 스크립트 + puppeteer devDep.
- `.gitignore` — `site/cards/dist/` 제외.
- `CLAUDE.md` — 발행 트랙 포인터 소절.

---

## Task 1: 카드 파서 `scripts/lib/card.js`

**Files:**
- Create: `scripts/lib/card.js`
- Test: `scripts/lib/card.test.js`

- [ ] **Step 1: 실패하는 테스트 작성**

Create `scripts/lib/card.test.js`:

````javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractCodeBlock, parseCard, isRenderable } from './card.js';

const CARD = `---
id: closure-makecounter-01
concept: concepts/closure.md
domain: frontend
label: JS · 클로저
status: approved
accent: lime
tags: [closure]
---

## 질문코드
\`\`\`js
function makeCounter() {
  let count = 0;
  return () => ++count;
}
\`\`\`

## 헤드라인
출력은? 🔥

## 정답
1 2 1

## 왜
a·b는 다른 호출 → 각자 다른 count.

## 한줄정리
배낭은 **함수**가 아니라 **호출**이 갖는다

## 캡션
정답은 댓글에서 #클로저
`;

test('extractCodeBlock은 언어와 코드를 분리', () => {
  const r = extractCodeBlock('```js\nconst a = 1;\n```');
  assert.equal(r.lang, 'js');
  assert.equal(r.code, 'const a = 1;');
});

test('extractCodeBlock은 펜스 없으면 lang 빈값 + 원문', () => {
  const r = extractCodeBlock('plain text');
  assert.equal(r.lang, '');
  assert.equal(r.code, 'plain text');
});

test('parseCard는 frontmatter와 섹션을 구조화', () => {
  const c = parseCard({ id: 'closure-makecounter-01.md', content: CARD });
  assert.equal(c.id, 'closure-makecounter-01');
  assert.equal(c.concept, 'concepts/closure.md');
  assert.equal(c.domain, 'frontend');
  assert.equal(c.label, 'JS · 클로저');
  assert.equal(c.status, 'approved');
  assert.equal(c.accent, 'lime');
  assert.deepEqual(c.tags, ['closure']);
  assert.equal(c.codeLang, 'js');
  assert.match(c.code, /makeCounter/);
  assert.equal(c.headline, '출력은? 🔥');
  assert.equal(c.answer, '1 2 1');
  assert.match(c.why, /다른 호출/);
  assert.equal(c.takeaway, '배낭은 **함수**가 아니라 **호출**이 갖는다');
  assert.match(c.caption, /#클로저/);
});

test('parseCard 기본값: 누락 필드 보정', () => {
  const c = parseCard({ id: 'x.md', content: '---\ndomain: cs\n---\n## 헤드라인\nHi' });
  assert.equal(c.status, 'draft');
  assert.equal(c.accent, 'lime');
  assert.equal(c.label, 'cs');
  assert.deepEqual(c.tags, []);
  assert.equal(c.headline, 'Hi');
});

test('isRenderable: draft 제외, approved/published 포함', () => {
  assert.equal(isRenderable({ status: 'draft' }), false);
  assert.equal(isRenderable({ status: 'approved' }), true);
  assert.equal(isRenderable({ status: 'published' }), true);
});
````

- [ ] **Step 2: 테스트 실패 확인**

Run: `node --test scripts/lib/card.test.js`
Expected: FAIL — `Cannot find module './card.js'`.

- [ ] **Step 3: 구현 작성**

Create `scripts/lib/card.js`:

```javascript
import matter from 'gray-matter';
import { extractSection } from './parse.js';

// "## 질문코드" 섹션의 첫 코드펜스에서 언어와 코드를 분리.
export function extractCodeBlock(md) {
  const m = md.match(/```(\w*)\n([\s\S]*?)```/);
  if (!m) return { lang: '', code: md.trim() };
  return { lang: m[1] || '', code: m[2].replace(/\n$/, '') };
}

// knowledge/cards/*.md → 구조화된 카드 객체.
export function parseCard({ id, content }) {
  const { data, content: body } = matter(content);
  const { lang, code } = extractCodeBlock(extractSection(body, '질문코드'));
  return {
    id: data.id ?? id.replace(/\.md$/, ''),
    concept: data.concept ?? '',
    domain: data.domain ?? 'unknown',
    label: data.label ?? data.domain ?? 'unknown',
    status: data.status ?? 'draft',
    accent: data.accent ?? 'lime',
    tags: Array.isArray(data.tags) ? data.tags : [],
    code,
    codeLang: lang,
    headline: extractSection(body, '헤드라인'),
    answer: extractSection(body, '정답'),
    why: extractSection(body, '왜'),
    takeaway: extractSection(body, '한줄정리'),
    caption: extractSection(body, '캡션'),
  };
}

// 렌더 대상 여부: draft만 제외.
export function isRenderable(card) {
  return card.status === 'approved' || card.status === 'published';
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `node --test scripts/lib/card.test.js`
Expected: PASS (5 tests).

---

## Task 2: HTML 헬퍼 `scripts/lib/card-html.js` (escape/highlight/emphasize)

**Files:**
- Create: `scripts/lib/card-html.js`
- Test: `scripts/lib/card-html.test.js`

- [ ] **Step 1: 실패하는 테스트 작성**

Create `scripts/lib/card-html.test.js`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml, highlightJs, emphasizeKeywords } from './card-html.js';

test('escapeHtml은 특수문자를 이스케이프', () => {
  assert.equal(escapeHtml('<a> & "b"'), '&lt;a&gt; &amp; &quot;b&quot;');
});

test('highlightJs는 키워드를 kw span으로, 나머지 이스케이프', () => {
  const h = highlightJs('const a = () => 1;');
  assert.match(h, /<span class="kw">const<\/span>/);
  assert.doesNotMatch(h, /<span class="kw">a<\/span>/);
});

test('highlightJs는 꺾쇠를 이스케이프', () => {
  assert.match(highlightJs('a < b'), /a &lt; b/);
});

test('emphasizeKeywords는 **x**를 hl span으로', () => {
  const h = emphasizeKeywords('배낭은 **함수**가 아니라 **호출**');
  assert.match(h, /<span class="hl">함수<\/span>/);
  assert.match(h, /<span class="hl">호출<\/span>/);
  assert.match(h, /배낭은/);
});

test('emphasizeKeywords는 강조 밖 텍스트를 이스케이프', () => {
  assert.match(emphasizeKeywords('a < b **c**'), /a &lt; b/);
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `node --test scripts/lib/card-html.test.js`
Expected: FAIL — `Cannot find module './card-html.js'`.

- [ ] **Step 3: 구현 작성 (헬퍼만; renderCardHtml은 Task 3)**

Create `scripts/lib/card-html.js`:

```javascript
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
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `node --test scripts/lib/card-html.test.js`
Expected: PASS (5 tests).

---

## Task 3: `renderCardHtml` (카드 HTML 문서, 디자인 C)

**Files:**
- Modify: `scripts/lib/card-html.js` (append `renderCardHtml`)
- Test: `scripts/lib/card-html.test.js` (append)

- [ ] **Step 1: 실패하는 테스트 추가**

Append to `scripts/lib/card-html.test.js`:

```javascript
import { renderCardHtml } from './card-html.js';

const CARD = {
  id: 'closure-makecounter-01', concept: 'concepts/closure.md', domain: 'frontend',
  label: 'JS · 클로저', status: 'approved', accent: 'lime', tags: ['closure'],
  code: 'const a = 1;', codeLang: 'js',
  headline: '출력은? 🔥', answer: '1 2 1',
  why: 'a·b는 다른 호출.', takeaway: '배낭은 **호출**이 갖는다',
  caption: '#클로저',
};

test('renderCardHtml(q)는 코드/헤드라인/핸들/치수 포함', () => {
  const html = renderCardHtml(CARD, 'q', { handle: '@yooni_dev' });
  assert.match(html, /^<!doctype html>/i);
  assert.match(html, /1080px/);
  assert.match(html, /1350px/);
  assert.match(html, /출력은\?/);
  assert.match(html, /<span class="kw">const<\/span>/);
  assert.match(html, /@yooni_dev/);
  assert.match(html, /#c2f542/);          // accent lime
  assert.match(html, /정답은 댓글/);
  assert.match(html, /JS · 클로저/);       // 배지 라벨
});

test('renderCardHtml(a)는 정답/한줄정리 강조/핸들 포함, 코드 없음', () => {
  const html = renderCardHtml(CARD, 'a', { handle: '@yooni_dev' });
  assert.match(html, /1 2 1/);
  assert.match(html, /<span class="hl">호출<\/span>/);
  assert.match(html, /@yooni_dev/);
  assert.doesNotMatch(html, /class="kw"/);   // 정답 카드엔 코드 없음
});

test('renderCardHtml은 accent를 config.accents로 오버라이드', () => {
  const html = renderCardHtml({ ...CARD, accent: 'cyan' }, 'q', {});
  assert.match(html, /#3ff0e0/);
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `node --test scripts/lib/card-html.test.js`
Expected: FAIL — `renderCardHtml is not a function` (또는 export 없음).

- [ ] **Step 3: `renderCardHtml` 구현**

Append to `scripts/lib/card-html.js`:

```javascript
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
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `node --test scripts/lib/card-html.test.js`
Expected: PASS (8 tests total).

---

## Task 4: 렌더 엔트리 `scripts/render-cards.js` + 설정 + 의존성

**Files:**
- Create: `scripts/render-cards.js`
- Create: `knowledge/cards/cards.config.json`
- Modify: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: puppeteer 설치**

Run: `npm install --save-dev puppeteer`
Expected: `package.json`의 devDependencies에 puppeteer 추가, Chromium 다운로드 완료.

- [ ] **Step 2: 설정 파일 생성**

Create `knowledge/cards/cards.config.json` (폰트는 v1 시스템폴백 → null):

```json
{
  "handle": "@yooni_dev",
  "accentDefault": "lime",
  "accents": {
    "lime": "#c2f542",
    "cyan": "#3ff0e0",
    "magenta": "#ff5db1",
    "orange": "#ff9f45"
  },
  "fonts": {
    "headline": null,
    "mono": null,
    "korean": null
  }
}
```

- [ ] **Step 3: 렌더 스크립트 작성**

Create `scripts/render-cards.js`:

```javascript
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer';
import { parseCard, isRenderable } from './lib/card.js';
import { renderCardHtml } from './lib/card-html.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CARDS_DIR = join(ROOT, 'knowledge', 'cards');
const OUT_DIR = join(ROOT, 'site', 'cards', 'dist');
const CONFIG_PATH = join(CARDS_DIR, 'cards.config.json');

function loadConfig() {
  if (!existsSync(CONFIG_PATH)) return {};
  const c = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
  if (c.fonts) {
    for (const k of Object.keys(c.fonts)) {
      if (c.fonts[k]) c.fonts[k] = pathToFileURL(resolve(CARDS_DIR, c.fonts[k])).href;
    }
  }
  return c;
}

function loadCards() {
  if (!existsSync(CARDS_DIR)) return [];
  return readdirSync(CARDS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => parseCard({ id: f, content: readFileSync(join(CARDS_DIR, f), 'utf8') }));
}

async function main() {
  const config = loadConfig();
  const cards = loadCards().filter(isRenderable);
  if (!cards.length) {
    console.log('렌더할 approved 카드 없음.');
    return;
  }
  mkdirSync(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch();
  try {
    for (const card of cards) {
      for (const side of ['q', 'a']) {
        const page = await browser.newPage();
        await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
        await page.setContent(renderCardHtml(card, side, config), { waitUntil: 'load' });
        await page.evaluateHandle('document.fonts.ready');
        const out = join(OUT_DIR, `${card.id}-${side}.png`);
        await page.screenshot({ path: out });
        await page.close();
        console.log(`✓ ${card.id}-${side}.png`);
      }
    }
  } finally {
    await browser.close();
  }
  console.log(`완료: 카드 ${cards.length}장 → ${OUT_DIR}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 4: package.json에 스크립트 추가**

Modify `package.json` — `scripts`에 추가:

```json
    "cards": "node scripts/render-cards.js",
```

(기존 `build`/`test`/`dev` 아래에 한 줄 추가. 쉼표 유지.)

- [ ] **Step 5: .gitignore에 dist 추가**

Modify `.gitignore` — 다음 줄 추가 (빌드 산출물이므로 버전관리 제외):

```
site/cards/dist/
```

- [ ] **Step 6: 빈 상태 스모크 확인**

Run: `npm run cards`
Expected: `렌더할 approved 카드 없음.` (아직 카드 파일 없음 → 크래시 없이 정상 종료).

---

## Task 5: 그래프 생성에서 `cards/` 제외

`generate-graph.js`의 `collectMarkdown`은 `knowledge/` 전체 .md를 수집한다. 카드 파일이 생기면 `parseConcept`가 카드를 개념 노드로 오인하므로 제외해야 한다.

**Files:**
- Modify: `scripts/generate-graph.js`

- [ ] **Step 1: collectMarkdown에 cards/ 제외 필터 추가**

Modify `scripts/generate-graph.js` — `collectMarkdown`의 return을 다음으로 교체 (`.map(...)` 뒤에 `.filter` 추가):

```javascript
  return entries
    .filter((e) => e.isFile() && e.name.endsWith('.md'))
    .map((e) => {
      const full = join(e.parentPath ?? e.path, e.name);
      const id = relative(KNOWLEDGE_DIR, full).split(sep).join('/');
      return { id, content: readFileSync(full, 'utf8') };
    })
    .filter((f) => !f.id.startsWith('cards/'));
```

- [ ] **Step 2: 빌드가 여전히 정상인지 확인**

Run: `npm run build`
Expected: 기존과 동일 — `그래프 생성 완료: 노드 11개, ...` (카드 없어서 아직 변화 없음; 크래시 없이 통과).

---

## Task 6: 샘플 카드 2장 + 렌더 검증

**Files:**
- Create: `knowledge/cards/closure-makecounter-01.md`
- Create: `knowledge/cards/event-loop-order-01.md`

- [ ] **Step 1: 샘플 카드 1 (클로저)**

Create `knowledge/cards/closure-makecounter-01.md`:

````markdown
---
id: closure-makecounter-01
concept: concepts/closure.md
domain: frontend
label: JS · 클로저
status: approved
accent: lime
created: 2026-07-22
published:
tags: [closure]
---

## 질문코드
```js
function makeCounter() {
  let count = 0;
  return () => ++count;
}
const a = makeCounter();
const b = makeCounter();
console.log(a(), a(), b());
```

## 헤드라인
출력은? 🔥

## 정답
1 2 1

## 왜
a·b는 makeCounter의 다른 호출 → 각자 다른 count(배낭). a는 두 번 눌러 1→2, b는 새 count라 1.

## 한줄정리
배낭은 **함수**가 아니라 **호출**이 갖는다

## 캡션
이 코드 출력, 3초 안에 맞혀봐 👇 정답은 댓글에서 #자바스크립트 #클로저
````

- [ ] **Step 2: 샘플 카드 2 (이벤트 루프)**

Create `knowledge/cards/event-loop-order-01.md`:

````markdown
---
id: event-loop-order-01
concept: concepts/event-loop.md
domain: frontend
label: JS · 이벤트 루프
status: approved
accent: lime
created: 2026-07-22
published:
tags: [event-loop, microtask]
---

## 질문코드
```js
console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');
```

## 헤드라인
출력 순서는? 🔥

## 정답
A D C B

## 왜
동기(A·D) 먼저 → 콜스택 비면 마이크로태스크(C) → 그다음 매크로태스크(B). setTimeout 0도 큐에서 대기.

## 한줄정리
마이크로태스크가 **매크로태스크보다 먼저** 비워진다

## 캡션
이 순서 맞히면 이벤트 루프 이해한 거 👇 정답은 댓글에서 #자바스크립트 #이벤트루프
````

- [ ] **Step 3: 렌더 실행**

Run: `npm run cards`
Expected:
```
✓ closure-makecounter-01-q.png
✓ closure-makecounter-01-a.png
✓ event-loop-order-01-q.png
✓ event-loop-order-01-a.png
완료: 카드 2장 → .../site/cards/dist
```

- [ ] **Step 4: PNG 육안 검증**

`site/cards/dist/`의 4개 PNG를 연다(예: `open site/cards/dist/closure-makecounter-01-q.png`).
확인 항목:
- 1080×1350(고DPI로 2160×2700px) 크기.
- 질문 카드: 배지(JS · 클로저) / 코드 전체 가독 / 키워드 라임 하이라이트 / "출력은? 🔥" / 핸들.
- 정답 카드: "정답" 배지 / 큰 라임 `1 2 1` / 왜 2줄 / "배낭은 **함수**가 아니라 **호출**" 키워드 라임 / 콜아웃 박스·장식 이모지 없음.
- 폰트 크기·여백이 넘치거나 잘리면 `cardCss`의 `font-size`를 조정(디자인 튜닝은 예상된 반복 — 코드가 길면 `.code` font-size 하향).

---

## Task 7: `/card` 스킬 `.claude/skills/card/SKILL.md`

**Files:**
- Create: `.claude/skills/card/SKILL.md`

- [ ] **Step 1: 스킬 파일 작성**

Create `.claude/skills/card/SKILL.md`:

````markdown
---
name: card
description: 학습 카드(스레드 발행용) 제작. 파인만 통과 개념에서 간결한 Q+A를 뽑아 knowledge/cards/에 저장하고 렌더한다. `/card <개념>`으로 개념 지정, `/card`만 호출 시 후보 추천. 사용자가 명시 발동할 때만 사용.
---

# /card — 학습 카드 제작

위키 개념을 스레드 발행용 **질문 카드 + 정답 카드**(이미지)로 만든다. 설계 근거: `docs/superpowers/specs/2026-07-22-threads-study-card-publishing-design.md`.

## 발동 모드
- **`/card <개념>`** (예: `/card 클로저`) → 그 개념으로 제작.
- **`/card`** (인자 없음) → 아래 자격 기준으로 **후보 2–4개 추천** → 사용자가 선택.

## 자격 (eligibility)
- 기본: `knowledge/concepts/*.md`의 frontmatter `feynman_passed: true`.
- **추천 모드**: `feynman_passed: true` **AND** `mastery >= 4`만 후보. 이미 `knowledge/cards/`에 해당 concept으로 만든 카드가 있으면 후순위.
- **직접 지정 모드**: 사용자가 이름을 대면 자격 미달이어도 진행하되 **경고 1회**("이거 지금 mastery N/회귀 상태인데 낼래?") 후 사용자 결정 존중.

## 제작 흐름
1. 대상 개념 확정.
2. 그 개념 페이지의 `## 내 파인만 설명`에서 **앵커(상황·코드)** 를 찾아 **간결한 Q+A 초안**을 만든다. 원칙(스펙 §1): 질문 간결, 해설 정수만. 페이지의 회귀로그·복습앵글을 그대로 옮기지 말 것.
3. 다음 6필드를 사용자에게 제안하고 승인받는다:
   - `질문코드`(```lang 코드블록), `헤드라인`, `정답`, `왜`(2줄 이내), `한줄정리`(핵심 키워드에 `**굵게**`), `캡션`(훅+해시태그).
4. 승인되면 `knowledge/cards/<id>.md` 생성. `id` 규칙: `<concept-slug>-<anchor-slug>-NN`(예: `closure-makecounter-01`). frontmatter: `id, concept, domain, label, status: approved, accent: lime, created:<오늘>, published:(빈값), tags`.
   - `label`은 배지 텍스트(예: `JS · 클로저`).
5. `learning-os/publish-queue.md`의 **approved** 섹션에 카드 추가.
6. 렌더 제안: "`npm run cards` 돌려서 PNG 뽑을까?" → 사용자 승인 시 실행, `site/cards/dist/<id>-q.png`·`-a.png` 안내.
7. 개념 페이지 `## 실전 사례`(또는 related)에 카드 역링크는 선택(가벼운 수준).

## 발행 후(사용자가 스레드에 올린 뒤)
- 카드 frontmatter `status: published` + `published: <날짜>`.
- `publish-queue.md`에서 approved→published로 이동.

## 하지 않을 것
- 자동 포스팅 없음(수동 업로드). 페이지 프로즈 자동 추출 없음(코치 큐레이션). 파인만 미통과 개념은 추천하지 않음.
````

- [ ] **Step 2: 스킬 파일 존재 확인**

Run: `test -f .claude/skills/card/SKILL.md && echo OK`
Expected: `OK`.

---

## Task 8: 위키 통합 — publish-queue.md + CLAUDE.md 포인터

**Files:**
- Create: `learning-os/publish-queue.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: publish-queue.md 생성**

Create `learning-os/publish-queue.md`:

```markdown
# 발행 큐 — 카드 파이프라인

`/card` 스킬이 갱신. 상태 흐름: `draft → approved → published`.
(rendered는 별도 status가 아니라 `site/cards/dist/`에 PNG 존재 여부로 파생.)

## approved (렌더/발행 대기)
- `closure-makecounter-01` — 클로저 makeCounter 출력 · concepts/closure.md
- `event-loop-order-01` — 이벤트 루프 출력 순서 · concepts/event-loop.md

## published (발행 완료)
- (아직 없음)

## draft (작성 중)
- (아직 없음)
```

- [ ] **Step 2: CLAUDE.md에 발행 트랙 포인터 추가**

Modify `CLAUDE.md` — `## 3. 워크플로우` 섹션의 마지막(§3의 `### Lint ...` 블록 뒤)에 다음 소절을 추가:

```markdown

### 카드 발행 — `/card` (사용자 발동)
잘 학습된 개념을 스레드 발행용 질문/정답 카드 이미지로 뽑는 트랙. **자동 제안 아님 — 사용자가 `/card`로 발동**할 때만 동작한다.
- 자격: `feynman_passed: true` 개념(추천 모드는 추가로 `mastery ≥ 4`).
- 소스는 `knowledge/cards/`, 렌더는 `npm run cards` → `site/cards/dist/` PNG, 발행은 수동.
- 상세 워크플로우는 `.claude/skills/card/SKILL.md`, 설계는 `docs/superpowers/specs/2026-07-22-threads-study-card-publishing-design.md`, 큐는 `learning-os/publish-queue.md`.
```

- [ ] **Step 3: 디렉토리 구조(§1)에 cards 언급 추가**

Modify `CLAUDE.md` — §1의 `knowledge/` 줄에 `cards/`를 덧붙인다. 기존:

```
- `knowledge/` — 네가 관리하는 가공물. `concepts/`(개념), `topics/`(분야), `entities/`(도구·제품), `synthesis/`(통합).
```

교체:

```
- `knowledge/` — 네가 관리하는 가공물. `concepts/`(개념), `topics/`(분야), `entities/`(도구·제품), `synthesis/`(통합), `cards/`(발행용 카드 소스).
```

---

## Task 9: 전체 검증 + 단일 커밋

**Files:** 없음(브랜치 + 커밋만)

- [ ] **Step 1: 전체 테스트**

Run: `npm test`
Expected: 기존 parse 테스트 + card/card-html 테스트 모두 PASS, 실패 0.

- [ ] **Step 2: 빌드 회귀 확인**

Run: `npm run build`
Expected: `그래프 생성 완료: 노드 11개, ...` (카드가 그래프에 안 섞임).

- [ ] **Step 3: 렌더 최종 확인**

Run: `npm run cards`
Expected: 4개 PNG 재생성, 크래시 없음.

- [ ] **Step 4: 브랜치 생성**

Run: `git checkout -b feat/study-cards`
Expected: 새 브랜치로 전환(현재 작업트리 변경분 유지).

- [ ] **Step 5: 단일 커밋**

Run:
```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: 스레드 학습 카드 발행 시스템 (/card 스킬 + 렌더 파이프라인)

- knowledge/cards/ 카드 소스 포맷 + 샘플 2장(closure, event-loop)
- scripts/lib/card.js·card-html.js 파싱/렌더(순수, 테스트 포함)
- scripts/render-cards.js Puppeteer로 1080×1350 PNG 2장(질문/정답)
- .claude/skills/card/ 카드 제작 워크플로우
- learning-os/publish-queue.md + CLAUDE.md 발행 트랙 포인터
- generate-graph.js: cards/ 그래프 수집 제외
- 설계/계획 문서 포함(docs/superpowers)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```
Expected: 스펙·계획 문서와 구현 전부가 한 커밋으로 기록.

- [ ] **Step 6: 커밋 확인**

Run: `git show --stat HEAD`
Expected: 위 파일들이 모두 포함된 단일 커밋.

---

## Self-Review 기록
- **스펙 커버리지**: §3 데이터모델→T1/T6, §4 렌더→T3/T4, §4 디자인C→T3, §5 스킬→T7, §6 통합→T8, §7 v1범위→전체, §8 성공기준→T6/T9. 커버됨.
- **cards/ 그래프 오염**(스펙에 없던 통합 리스크) → T5로 처리.
- **폰트 미결정**(스펙 §9) → config null + 시스템폴백으로 v1 실행 가능하게, 실제 폰트는 후속.
- **타입 일관성**: `parseCard` 반환 필드(id/concept/domain/label/status/accent/tags/code/codeLang/headline/answer/why/takeaway/caption)를 `renderCardHtml`·테스트·샘플카드가 동일하게 사용. `isRenderable`/`renderCardHtml(card, side, config)` 시그니처 태스크 간 일치.
- **커밋 정책**: 사용자 요청대로 태스크별 커밋 제거, T9 단일 커밋.
