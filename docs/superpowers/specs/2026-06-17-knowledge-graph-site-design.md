# 설계: 지식 그래프 시각화 사이트

- 날짜: 2026-06-17
- 상태: 승인 대기
- 작성: yooni + 코치(브레인스토밍)

## 한 줄 목표
위키의 개념 페이지 frontmatter를 읽어, 개념(노드)과 `related` 연결(간선)을
**지식 그래프**로 그리는 정적 웹사이트. 목적은 **연결 파악 + 빈틈/고아 개념 사냥**.
노드 클릭 시 그 개념의 핵심(한 줄 정의 + 내 파인만 설명)을 사이드 패널로 읽는다.

위키 헌법 정렬: `sources/`는 절대 수정하지 않음. 그래프는 **위키망의 거울**일 뿐이며,
원본(source of truth)은 항상 커밋되는 마크다운이다. graph.json은 거기서 계산되는 파생물.

## 결정 요약 (브레인스토밍 합의)
- 시각화 형태: **지식 그래프** (히트맵/복습판/정적위키 아님)
- 동기화: **빌드 스크립트**가 frontmatter → `graph.json` 생성
- 호스팅: **GitHub Pages**, **GitHub Actions 자동 배포**
- 그래프 라이브러리: **Cytoscape.js** (CDN, 번들러 없음)
- 노드 인코딩: 색=domain · 크기=importance · **링게이지+밝기=mastery** · 점선주황=seed/고아
- 클릭 동작: 우측 사이드 패널에 **한 줄 정의 + 내 파인만 설명**(핵심만, 옵션 2)
- 데이터 담는 법: **graph.json 하나에 내용까지 inline**(옵션 1)
- graph.json은 **git에 커밋하지 않음**(파생물, CI가 배포 시 생성)

## 1. 아키텍처 / 데이터 흐름
```
knowledge/**/*.md (frontmatter + 본문)
        │  ① scripts/generate-graph.js 가 읽음
        ▼
   graph.json  (nodes + edges + 노드별 내용 inline)
        │  ② site/main.js 가 Cytoscape로 렌더
        ▼
   정적 사이트(site/) ──③ GitHub Actions(push 시)──▶ GitHub Pages URL
```
- "다른 PC/폰 접근" = **Pages URL 열기**. 배포본엔 CI가 graph.json을 항상 포함.
- "다른 PC 로컬 개발" = 클론 후 `node scripts/generate-graph.js` 한 번(마크다운에서 재생성).

## 2. 빌드 스크립트 — `scripts/generate-graph.js` (Node.js)
의존성: `gray-matter`(frontmatter 파싱), `marked`(마크다운→HTML).

처리:
1. `knowledge/**/*.md` 글롭으로 수집.
2. 각 파일에서 frontmatter 추출: `title, domain, knowledge_type, status, mastery,
   importance, related[]`.
3. 본문에서 **"## 한 줄 정의"** 와 **"## 내 파인만 설명"** 섹션만 잘라 `marked`로 HTML 변환.
   - 섹션은 헤딩 기준으로 파싱(다음 `##` 전까지). 섹션 없으면 빈 문자열.
4. 노드 생성: `{ id(파일 경로 기준), title, domain, status, mastery, importance,
   isGap, definitionHtml, feynmanHtml, sourcePath }`.
5. 간선 생성: 각 노드의 `related[]`를 간선으로. **양방향 중복 제거**
   (A↔B가 양쪽에 있어도 간선 하나). related 대상이 노드로 존재하지 않으면 무시(+경고 로그).
6. `graph.json` = `{ nodes: [...], edges: [...], generatedAt }` 출력.

**고아/빈틈(isGap) 판정:** `status === 'seed'` **또는** 연결(간선)이 0개.

엣지 케이스:
- frontmatter 누락 필드는 기본값으로(예: mastery=0, importance=3, status='seed') 처리하고 경고.
- `related` 경로 표기 정규화(예: `concepts/call-stack.md` ↔ 파일 실제 경로 매칭).

## 3. 프론트엔드 — `site/`
파일: `index.html`, `main.js`, `style.css`. Cytoscape.js는 CDN `<script>`. 번들러/프레임워크 없음.

렌더:
- 레이아웃: `cose`(force) — 연결된 노드끼리 뭉침. 팬/줌 기본.
- 노드 스타일(데이터 매핑):
  - **색** = domain (아래 팔레트)
  - **크기** = importance (1~5 → 반지름 매핑)
  - **mastery** = 둘레 **링 게이지**(pie 조각으로 mastery/5 비율) + **밝기**(낮을수록 흐림)
  - **isGap** = 점선 + 주황 테두리
- **클릭 → 우측 사이드 패널**: 제목 + 뱃지(domain·mastery·importance·status)
  + 한 줄 정의(HTML) + 내 파인만 설명(HTML) + 원문 파일 GitHub 링크. 패널 밖 클릭/ESC로 닫힘.
- **범례**(좌하단): domain 색 매핑 + 인코딩 설명(크기/링/밝기/점선 의미).

domain 색 팔레트(9종, 구분 잘 되게):
`frontend, backend, network, os, cs, ai, devops, database, system-design`
→ 가독성 좋은 9색 지정(스펙 구현 시 확정, 색맹 고려해 명도 차 둠).

## 4. 배포 — `.github/workflows/deploy-graph.yml`
- 트리거: `main` push.
- 단계: checkout → Node 셋업 → `npm ci` → `node scripts/generate-graph.js`
  → `site/` + 생성된 `graph.json`을 Pages artifact로 업로드 → deploy.
- `graph.json`은 `.gitignore`(파생물). 배포 시 CI가 생성하므로 배포본엔 항상 존재.
- Pages source = GitHub Actions (브랜치 `/docs` 방식 아님 — `/docs`는 스펙 문서가 점유).

## 5. 프로젝트 구조 (신규/변경 파일)
```
package.json                      # 신규: deps(gray-matter, marked), scripts(build, dev)
scripts/generate-graph.js         # 신규: 빌드 스크립트
site/index.html                   # 신규
site/main.js                      # 신규: Cytoscape 렌더 + 사이드 패널
site/style.css                    # 신규
.github/workflows/deploy-graph.yml# 신규: 자동 배포
.gitignore                        # 변경: graph.json 추가
```
로컬 보기: `npm run build` (graph.json 생성) 후 `site/`를 정적 서버로 서빙(`npm run dev`).

## 6. 범위 밖 (v1 제외, 나중에)
- 필터링(domain/status 토글), 검색
- mastery 타임라인 / 복습 due 표시
- 지연 로딩(lazy) 구조 — inline이 수백 노드까지 충분. 커지면 그때 분리.

## 7. 성공 기준
- `npm run build`가 현재 4개 개념으로 유효한 graph.json 생성.
- 사이트가 4노드 + related 간선을 인코딩대로 렌더.
- 노드 클릭 시 한 줄 정의 + 파인만 설명이 패널에 뜸.
- `main` push 시 Actions가 Pages에 자동 배포, URL로 접근 가능.
- seed/고아 노드가 점선주황으로 시각적으로 구분됨.
