# Handoff: 지식 그래프 (Knowledge Node Graph) — 리디자인

## Overview
학습한 개념을 노드 그래프로 시각화하는 단일 화면 도구. 각 노드 = 하나의 개념(`.md` 파일),
엣지 = 개념 간 연관. 노드 하나에 **도메인(색) · 중요도(크기) · 숙련도(채움) · 빈틈(테두리)** 4개
정보를 인코딩하고, 노드를 클릭하면 우측 패널에 정의·"파인만 설명"·원문 링크가 뜬다.

이 리디자인은 기존 버전(`site/index.html` + `main.js` + `style.css`)의 디자인 진단 결과를 반영한 것이다.
**바뀐 핵심:**
- 숙련도의 **이중 인코딩 제거** — 기존엔 `background-opacity`(투명도) + 흰색 파이 채움 둘 다 숙련도를 표현해
  저숙련(=가장 공부해야 할) 노드가 어두운 배경에서 사라졌다. → 투명도 인코딩을 없애고 **도메인색 파이 채움 한 가지로** 통일.
  노드 본체는 항상 불투명, 테두리는 항상 도메인색 → 숙련도 0이어도 또렷이 보인다.
- **색 충돌 2건 해소** — (1) 빈틈 표시가 `network` 도메인색(주황)과 충돌 → 빈틈을 **흰 점선**으로 분리.
  (2) 선택 하이라이트(파랑)가 `frontend` 도메인색(파랑)과 충돌 → 선택을 **흰색 오버레이 글로우**로 분리.
- **도메인 10색 팔레트 재정비** — 다크 배경 기준 채도/명도를 통일하고 색상환에서 고르게 떨어뜨림.
- **라벨을 노드 밖(아래)으로** — 작은 노드 안에서 한글이 잘리던 문제 해결.
- **추가 기능** — 검색, 도메인 필터(범례 클릭), "빈틈만" 토글, 줌/맞춤 컨트롤, 선택 시 이웃 하이라이트.

## About the Design Files
이 번들의 `지식 그래프.dc.html`은 **HTML로 만든 디자인 레퍼런스(프로토타입)** 이다 — 의도한 외형·동작·인코딩
규칙을 보여주는 것이지, 그대로 가져다 쓰는 프로덕션 코드가 아니다. 작업은 **이 디자인을 대상 코드베이스의
기존 환경에 맞춰 재구현**하는 것이다.

> **이 프로젝트의 실제 환경은 vanilla JS + [Cytoscape.js](https://js.cytoscape.org/)** (`site/main.js`, `style.css`)이다.
> Cytoscape가 이미 렌더링 엔진이므로, 아래의 Cytoscape 스타일 스펙은 **기존 `main.js`에 거의 그대로 이식**할 수 있다.
> (프로토타입은 React 클래스로 작성됐지만, 그건 프리뷰 환경 때문이고 — 로직/스타일 값은 프레임워크 독립적이다.)

데이터 계약(`graph.json` 스키마)과 GitHub 원문 링크 규칙은 기존 그대로 유지한다.

## Fidelity
**High-fidelity (hifi).** 색·타이포·간격·인코딩 규칙 모두 최종값이다. 아래 토큰/스펙을 그대로 적용하면 된다.

---

## Screen: 그래프 뷰 (단일 화면)

전체 레이아웃: `position:absolute; inset:0` 풀스크린, **세로 flex** — 상단 헤더(고정 54px) + 본문(`flex:1`).
- 배경 `#0e1015`, 기본 텍스트 `#e5e7eb`, 폰트 `Pretendard, system-ui, sans-serif`.
- 본문은 `position:relative`이고 그 안에 **(a) 그래프 캔버스(절대배치 inset:0)**, **(b) 좌하단 범례/필터**, **(c) 우측 상세 패널**이 겹쳐 있다.

### (1) 헤더 (toolbar)
- 높이 54px, `background:#11141c`, `border-bottom:1px solid #232a3a`, 좌우 padding 18px, 항목 `gap:16px`, `z-index:6`.
- **타이틀**: "지식 그래프" — 15px / weight 600 / letter-spacing -0.02em. 옆에 통계 텍스트 12px `#6f7890` (예: `4개 개념 · 빈틈 0`).
- **검색창**: width 208px, height 34px, `background:#0b0d13`, `border:1px solid #2a3142`, radius 8px, 좌측 16px 돋보기 아이콘(SVG, stroke `#6f7890`), placeholder "개념·도메인 검색", **focus 시 `border-color:#00d9a6`**. 입력 시 그래프를 실시간 필터.
- **"빈틈만" 토글 버튼**: height 34px, 같은 다크 배경/보더. 좌측에 9px 흰 점선 사각형 아이콘. 활성 시 우측에 6px `#00d9a6` 점. hover `border-color:#3a4358`.
- **줌 컨트롤** (좌측 `border-left:1px solid #232a3a`로 구분, `gap:4px`): 축소(−) / 전체보기(프레임 코너 아이콘) / 확대(+) 각 34×34 정사각 버튼. 모두 SVG 아이콘(stroke `#cbd5e1`, 2px, round cap).

### (2) 범례 + 도메인 필터 (좌하단)
- `position:absolute; left:16px; bottom:16px; z-index:5`.
- `background:rgba(15,18,26,.92)`, `backdrop-filter:blur(6px)`, `border:1px solid #262d3d`, radius 11px, padding 13px 15px, max-width 230px.
- 제목 "도메인 · 클릭해 필터" 11px / uppercase / letter-spacing .08em / `#6f7890` / weight 600.
- **도메인 행** (데이터에 실제로 존재하는 도메인만 렌더): 11px 둥근사각 색 스와치 + 도메인명 13px `#cbd5e1`. **클릭 = 해당 도메인 토글**. 꺼지면 행 `opacity:0.32` + 그래프에서 그 도메인 노드들이 흐려짐(opacity 0.09).
- 구분선(`border-top:1px solid #262d3d`) 아래 **인코딩 키** 3줄 (12px `#9aa2b4`):
  - "크기 = 중요도" (작은 점 + 큰 점)
  - "채움 = 숙련도" (conic-gradient로 65% 채운 원 예시)
  - "흰 점선 = 빈틈" (흰 점선 테두리 원)

### (3) 상세 패널 (우측 슬라이드)
- `position:absolute; top:0; right:0; z-index:10`, `width:min(440px, 92%)`, 전체 높이, `overflow-y:auto`.
- `background:#12151e`, `border-left:1px solid #232a3a`, `box-shadow:-12px 0 32px rgba(0,0,0,.32)`, padding 26px 26px 56px.
- **슬라이드 인/아웃**: `transform: translateX(100%)`(숨김) ↔ `translateX(0)`(표시), `transition:transform .24s ease`.
- 닫기 버튼(×): 우상단 30×30, `#7c8499`, hover 시 `color:#e5e7eb; background:#1c2230`.
- 내용:
  - 제목 행: 13px 둥근사각 도메인 색칩 + 개념 제목 `<h1>` 21px / weight 600 / letter-spacing -0.02em.
  - 배지들 (`flex-wrap`, gap 7px): 도메인 / `숙련도 n/5` / `중요도 n/5` / status. 각 12px, padding 4px 9px, radius 6px, `background:#1d2433`, color `#aeb6c7`.
  - 본문(`.kg-body`): `definitionHtml`("한 줄 정의") + `feynmanHtml`("내 파인만 설명") + 원문 링크를 주입.
    - 섹션 헤더 `<h3>`: 11px / uppercase / .08em / `#6f7890` / 600.
    - 본문 `<p>`/`<li>`: 14px, line-height 1.7, `#c3c9d6`.
    - `<code>`: `background:#222838`, radius 4px, 12.5px, mono, color `#7fe3c0`.
    - `<strong>`: `#eef1f6`. `<em>`(세션 메모): `#7c8499`, 12.5px, 비이탤릭.
    - 원문 링크: `color:#00d9a6`, `border:1px solid #1f5447`, padding 7px 12px, radius 7px, hover `background:#102a23`. 텍스트 "원문 보기" + 외부링크 SVG. `href = repoBase + node.sourcePath`.

---

## 노드/엣지 렌더링 인코딩 (Cytoscape 스타일 스펙 — 거의 드롭인)

기존 `site/main.js`의 `style:[...]`를 아래로 교체하면 리디자인이 그대로 적용된다.
`color`/`masteryPct`는 element data로 미리 계산해 넣는다(기존 코드와 동일):

```js
// elements 빌드 시 (기존 그대로)
nodes.map(n => ({ data: { ...n, masteryPct: (n.mastery / 5) * 100, color: colorFor(n.domain) } }))

style: [
  { selector: 'node', style: {
    'width':  'mapData(importance, 1, 5, 38, 86)',   // 크기 = 중요도
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
    'color': '#d6dae3', 'font-family': 'Pretendard, sans-serif', 'font-size': 12, 'font-weight': 500,
    'text-valign': 'bottom', 'text-halign': 'center', 'text-margin-y': 6,   // 라벨 = 노드 밖 아래
    'text-wrap': 'wrap', 'text-max-width': 130,
    'text-background-color': '#0e1015', 'text-background-opacity': 0.78,
    'text-background-padding': 3, 'text-background-shape': 'roundrectangle',
    'transition-property': 'opacity, border-width', 'transition-duration': '0.15s',
  }},
  { selector: 'node[?isGap]', style: {                // 빈틈 = 흰 점선 (도메인색과 충돌 없음)
    'border-color': '#e5e7eb', 'border-style': 'dashed', 'border-width': 2.5,
  }},
  { selector: 'edge', style: {
    'width': 1.5, 'line-color': '#333b4f', 'curve-style': 'bezier', 'opacity': 0.6,
    'transition-property': 'opacity, line-color, width', 'transition-duration': '0.15s',
  }},
  { selector: 'edge.hl',        style: { 'line-color': '#6b7790', 'width': 2.4, 'opacity': 1 }},     // 이웃 엣지 강조
  { selector: '.faded',         style: { 'opacity': 0.09 }},                                          // 필터/검색 제외
  { selector: 'node.faded',     style: { 'text-opacity': 0 }},
  { selector: 'node.dimN',      style: { 'opacity': 0.3 }},                                           // 선택 시 비이웃
  { selector: 'node.labelHide', style: { 'text-opacity': 0 }},
  { selector: 'node.hover',     style: { 'overlay-color':'#ffffff','overlay-opacity':0.07,'overlay-padding':6 }},
  { selector: 'node:selected',  style: { 'overlay-color':'#ffffff','overlay-opacity':0.16,'overlay-padding':9,'border-width':3.5 }}, // 선택 = 흰 글로우
],
minZoom: 0.25, maxZoom: 2.5,
```

### 레이아웃
- 기본: `cose` (force-directed) — `animate:true, randomize:true, padding:70, nodeRepulsion:11000, idealEdgeLength:135, nodeDimensionsIncludeLabels:true`. `layoutstop`에서 `cy.fit(undefined, 70)`.
- 대안 2종(프로토타입의 `layoutMode` prop): `concentric`(중요도 높을수록 중앙), 도메인별 컬럼(`x = 120 + columnIndex*230`, `y = 120 + rowIndex*150`).
- ⚠️ **재빌드(데이터 교체) 시 레이아웃 직전 `cy.resize()` 필수** — 컨테이너 크기 측정 전 레이아웃이 돌면 줌이 튀고 빈 화면이 된다. 창 리사이즈에도 `cy.resize()`.

---

## Interactions & Behavior
- **노드 클릭** → 상세 패널 슬라이드 인 + 이웃 하이라이트(선택 노드의 `closedNeighborhood()`만 또렷, 나머지 노드 `opacity:0.3`, 이웃 엣지 `.hl`).
- **배경 클릭** → 선택 해제, 패널 슬라이드 아웃.
- **검색**: 제목 또는 도메인에 부분일치(소문자) 안 되는 노드 `.faded`.
- **도메인 필터**: 범례 행 클릭으로 토글, 꺼진 도메인 노드 `.faded`.
- **"빈틈만"**: `isGap !== true`인 노드 `.faded`.
- (필터들은 AND 결합) — 위 조건 어느 하나라도 탈락하면 흐려짐. 흐려진 노드에 붙은 엣지도 흐려짐.
- **라벨 밀집 제어**(`crowdedLabels` prop): 기본 true(항상 라벨). false면 선택 노드+이웃만 라벨 표시.
- **줌/맞춤**: ×1.3 / ÷1.3 / `fit({padding:70})`, 모두 150–200ms 애니메이션.
- 트랜지션: 노드/엣지 0.15s, 패널 0.24s ease. 바운스·스프링 없음.

## State Management
- `selected` — 클릭된 노드 data(또는 null). 패널 표시 + 이웃 하이라이트 기준.
- `query` — 검색 문자열.
- `activeDomains` — `{ [domain]: false }` 형태, 명시적으로 false인 것만 숨김(기본 표시).
- `gapsOnly` — 빈틈만 보기 boolean.
- `domainKeys` / `nodeCount` / `gapCount` — `graph.json` 로드 후 파생(범례·통계용).
- 데이터: 마운트 시 `fetch('./graph.json')` 1회. 스키마는 아래.

### graph.json 스키마 (변경 없음 — 기존 파이프라인 유지)
```ts
{
  nodes: Array<{
    id: string;            // 예: "concepts/call-stack.md" (엣지 source/target가 이 id 참조)
    title: string;
    domain: string;        // 아래 팔레트 키 중 하나
    status: string;        // "understood" | "learning" | "seed" 등
    mastery: number;       // 0–5  → 파이 채움
    importance: number;    // 1–5  → 노드 크기
    isGap: boolean;        // true → 흰 점선
    related: string[];
    definitionHtml: string;// 패널 "한 줄 정의" (HTML)
    feynmanHtml: string;   // 패널 "파인만 설명" (HTML)
    sourcePath: string;    // repoBase + 이 값 = GitHub 원문 링크
  }>;
  edges: Array<{ source: string; target: string }>;  // id 참조
}
```

## Design Tokens

### 도메인 팔레트 (재정비 — 다크 배경 기준)
| domain | hex | | domain | hex |
|---|---|---|---|---|
| `frontend` | `#ff8a5b` (coral) | | `cs` | `#8b93f5` (periwinkle) |
| `network` | `#f0b34a` (amber) | | `ai` | `#c77ae0` (orchid) |
| `devops` | `#8fc861` (lime) | | `os` | `#f06b8a` (rose) |
| `backend` | `#46c98a` (emerald) | | `unknown` | `#8a93a6` (gray) |
| `database` | `#34c4c4` (teal) | | `system-design` | `#5aa6f0` (sky) |

### 표면 / 텍스트
| 용도 | hex |
|---|---|
| 앱 배경 | `#0e1015` |
| 헤더 배경 | `#11141c` |
| 패널 배경 | `#12151e` |
| 노드 코어 | `#171b27` |
| 입력/버튼 배경 | `#0b0d13` |
| 배지 배경 | `#1d2433` |
| 보더(헤더) | `#232a3a` |
| 보더(입력) | `#2a3142` / hover `#3a4358` |
| 보더(범례) | `#262d3d` |
| 텍스트 기본 | `#e5e7eb` / 본문 `#c3c9d6` / 라벨 `#d6dae3` |
| 텍스트 약함 | `#6f7890` · `#9aa2b4` · `#7c8499` |
| 엣지 | `#333b4f` / 강조 `#6b7790` |
| 빈틈/선택 글로우 | `#e5e7eb` / `#ffffff` |
| 액센트(focus·링크) | `#00d9a6` |

### 기타
- Radius: 4px(코드/링크 등 소) · 6–8px(버튼/입력/배지) · 11px(범례).
- 폰트: **Pretendard** (CDN: `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css`) — 코드베이스에 이미 Pretendard가 있으면 그걸 사용.
- 타입 스케일: 11(라벨/캡션) · 12(배지/통계) · 13(검색/버튼/도메인) · 14(본문) · 15(타이틀) · 21(패널 제목).
- 트랜지션: 0.15s(요소) / 0.24s ease(패널).

## Assets
- **Cytoscape.js 3.30.2** — 그래프 렌더링 엔진 (기존 의존성). 프로토타입은 `cdn.jsdelivr.net`에서 로드(원본은 cdnjs).
- **아이콘** — 모두 인라인 SVG(돋보기/줌±/전체보기 프레임/외부링크 화살표). 별도 아이콘 폰트·이미지 없음. 코드베이스의 아이콘 시스템(lucide 등)으로 대체 가능 — 형태만 맞추면 됨.
- 외부 이미지·래스터 에셋 없음.

## Files
- `지식 그래프.dc.html` — 리디자인 프로토타입 전체(마크업 + 로직 + Cytoscape 스타일). 단일 파일.
- `graph.json` — 현재 샘플 데이터(JS 이벤트루프 개념 4개). 스키마 참조용.
- 기존 코드: `site/index.html`, `site/main.js`, `site/style.css` — 이 위에 위 스펙을 이식하면 됨.
