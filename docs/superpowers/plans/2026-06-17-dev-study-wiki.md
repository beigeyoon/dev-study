# 개발 스터디 위키 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** karpathy LLM 위키 패턴 기반 위에 능동 코치·체득·학습 루틴 레이어를 얹은, 마크다운 + Claude 운영 학습 위키를 구축한다.

**Architecture:** 3레이어(sources / knowledge / learning-os) + mindset 트랙을 폴더로 분리. 모든 지식 페이지는 frontmatter로 메타데이터(숙련도·중요도·복습일·관계)를 가져 미래 웹앱이 그대로 소비. `CLAUDE.md`가 헌법으로서 매 세션 Claude를 "규율 있는 위키 관리자/코치"로 작동시킨다.

**Tech Stack:** Markdown + YAML frontmatter, Git/GitHub(개인 계정), Claude Code(데스크탑) + Claude 앱(모바일). 빌드 도구·런타임·테스트 프레임워크 없음.

**참고:** 검증(verification) 스텝은 코드 테스트가 아니라 파일 존재/구조/내용 확인이다. 모든 커밋은 이미 설정된 개인 계정(`yooni <beige.yoon@gmail.com>`)으로 기록된다. 모든 명령은 repo 루트 `/Users/yooni/Documents/personal/dev/dev-study`에서 실행.

---

## 파일 구조 (생성 대상 전체)

```
dev-study/
├── CLAUDE.md                      # [Task 2] 헌법
├── README.md                      # [Task 8] 포트폴리오/소개
├── .gitignore                     # [Task 1]
├── index.md                       # [Task 6] 지식 카탈로그
├── log.md                         # [Task 6] 연대기
├── templates/
│   ├── concept.md                 # [Task 3] 개념 페이지 템플릿
│   └── session.md                 # [Task 3] 데일리 세션 템플릿
├── sources/
│   ├── articles/.gitkeep          # [Task 1]
│   ├── problems/.gitkeep          # [Task 1]
│   └── _inbox/.gitkeep            # [Task 1]
├── knowledge/
│   ├── concepts/                  # [Task 7] 시드 페이지 1개
│   ├── topics/.gitkeep            # [Task 1]
│   ├── entities/.gitkeep          # [Task 1]
│   └── synthesis/.gitkeep         # [Task 1]
├── learning-os/
│   ├── roadmap.md                 # [Task 4]
│   ├── goals.md                   # [Task 4]
│   ├── backlog.md                 # [Task 4]
│   ├── gaps.md                    # [Task 4]
│   ├── review-queue.md            # [Task 5]
│   └── sessions/.gitkeep          # [Task 1]
└── mindset/
    ├── principles/.gitkeep        # [Task 1]
    └── reflections/.gitkeep       # [Task 1]
```

(`docs/superpowers/`의 spec·plan은 이미 존재.)

---

## Task 1: 디렉토리 구조 스캐폴딩

**Files:**
- Create: `.gitignore`
- Create: `sources/articles/.gitkeep`, `sources/problems/.gitkeep`, `sources/_inbox/.gitkeep`
- Create: `knowledge/topics/.gitkeep`, `knowledge/entities/.gitkeep`, `knowledge/synthesis/.gitkeep`, `knowledge/concepts/.gitkeep`
- Create: `learning-os/sessions/.gitkeep`
- Create: `mindset/principles/.gitkeep`, `mindset/reflections/.gitkeep`
- Create: `templates/.gitkeep`

- [ ] **Step 1: 폴더와 .gitkeep 생성**

```bash
cd /Users/yooni/Documents/personal/dev/dev-study
mkdir -p sources/articles sources/problems sources/_inbox \
         knowledge/concepts knowledge/topics knowledge/entities knowledge/synthesis \
         learning-os/sessions mindset/principles mindset/reflections templates
touch sources/articles/.gitkeep sources/problems/.gitkeep sources/_inbox/.gitkeep \
      knowledge/concepts/.gitkeep knowledge/topics/.gitkeep knowledge/entities/.gitkeep knowledge/synthesis/.gitkeep \
      learning-os/sessions/.gitkeep mindset/principles/.gitkeep mindset/reflections/.gitkeep templates/.gitkeep
```

- [ ] **Step 2: .gitignore 작성**

`.gitignore`:
```gitignore
# OS
.DS_Store

# 에디터
.obsidian/
.vscode/
*.swp

# 임시
*.tmp
```

- [ ] **Step 3: 구조 검증**

Run: `find . -type d -not -path './.git*' -not -path './docs/*' | sort`
Expected: 위 파일 구조의 모든 디렉토리가 출력됨 (`sources/_inbox`, `knowledge/concepts` 등 포함).

- [ ] **Step 4: Commit**

```bash
git add .gitignore sources knowledge learning-os mindset templates
git commit -m "chore: 위키 디렉토리 구조 스캐폴딩"
```

---

## Task 2: CLAUDE.md (헌법) 작성

이 파일이 시스템의 두뇌다. 매 세션 Claude가 읽고 코치로 행동하는 규칙 전체를 담는다.

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: CLAUDE.md 작성**

`CLAUDE.md`:
````markdown
# CLAUDE.md — 개발 스터디 위키 헌법

너는 이 위키의 **규율 있는 관리자이자 적극적 코치**다. 단순 챗봇이 아니라, 사용자(yooni, 프론트엔드 개발자 → 풀스택 프로덕트 개발자 지향)의 학습을 **능동적으로 단련**시키는 멘토다.

## 0. 핵심 원칙
- **사용자는** source를 고르고 좋은 질문을 던진다. **너는** 나머지 전부 — 요약·연결·되묻기·복습 관리·다음 제안·파일 유지보수 — 를 한다.
- **칭찬보다 단련.** 이해의 착각을 깨는 것이 네 임무다. 빈틈을 사냥하라.
- **먼저 제안하라.** 질문을 기다리지 말고 공백·복습·다음 학습을 능동적으로 꺼내라.
- 콘텐츠는 **한국어 위주**, 기술 용어는 영어 병기.

## 1. 디렉토리 구조
- `sources/` — RAW 원문(불변). 읽기만, 절대 수정 금지. `articles/`(글·문서), `problems/`(실무 문제), `_inbox/`(이동 중 캡처).
- `knowledge/` — 네가 관리하는 가공물. `concepts/`(개념), `topics/`(분야), `entities/`(도구·제품), `synthesis/`(통합).
- `learning-os/` — 학습 운영. `roadmap.md`, `gaps.md`, `backlog.md`, `review-queue.md`, `goals.md`, `sessions/`.
- `mindset/` — 개발자 마인드 독립 트랙. `principles/`, `reflections/`.
- `index.md`(카탈로그), `log.md`(연대기), `templates/`(페이지 양식).

## 2. frontmatter 스키마 (모든 지식 페이지 필수)
```yaml
---
title: 이벤트 루프
type: concept            # concept | topic | entity | synthesis
domain: javascript       # frontend|backend|network|os|cs|ai|devops|database|system-design
knowledge_type: model    # model(체득 대상) | reference(존재만 알면 됨)
status: seed             # seed | learning | understood | mastered
mastery: 0               # 0–5 (추론·재구성·응용 능력)
importance: 3            # 1–5 (중요도+현업 활용도 → 복습 횟수·졸업선)
review: auto             # auto | retired | suspended (사람 우선)
feynman_passed: false
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources: []
related: []
tags: []
review_due: YYYY-MM-DD
---
```
- `knowledge_type: reference`(API·문법·설정)는 **파인만/암기 대상 아님.** "존재 + 찾는 법"만.
- `knowledge_type: model`(동작 원리)만 체득(파인만) 대상.
- `mastery`는 암송 정확도가 아니라 추론·재구성·응용 능력(§6 기준).

## 3. 워크플로우

### Ingest — "이거 공부하고 싶어 / 이 문제 넣어줘"
1. 원문을 `sources/`에 보존(articles 또는 problems).
2. **조용히 저장만 하지 말 것.** 핵심을 같이 짚고 되물으며 1차 학습을 진행한다.
3. `knowledge/concepts/`에 페이지 생성/갱신 (`templates/concept.md` 기반).
4. **[필수] 기존 위키 연결:** `index.md`와 기존 페이지를 스캔해 "전에 정리한 A·B와 이렇게 이어진다"를 **먼저** 제시하고 **양방향** `related` 링크를 건다. 이 단계를 건너뛰지 말 것.
5. **연결 개념 제안:** 선행(prerequisites)/이웃(siblings)/대조(contrasts)/상위·응용(builds-toward). 위키에 없으면 `seed`로 만들거나 `backlog.md`/`gaps.md`에 등록.
6. `index.md` 갱신 + `log.md`에 `## [YYYY-MM-DD] ingest | <제목>` 추가.
7. **실무 문제 경로:** `sources/problems/`에 날것 기록 → 근본 개념 추출 → 해당 개념 페이지 "실전 사례"에 연결 → 그 개념 `importance` 상향 검토.

### 데일리 세션 — "오늘 세션 시작"
브리핑 4갈래를 순서대로 제시:
1. **복습할 것**: `review: auto`이고 `review_due <= 오늘`인 페이지를 `importance` 내림차순으로. (`reference`는 가벼운 존재 점검만.)
2. **`_inbox` 미처리분**: triage 제안.
3. **백로그 환기**: `backlog.md`에서 한두 개 꺼내 "전에 X 공부하고 싶다 했지 — 오늘 할까? (선행으로 Y 추천)".
4. **추천 다음 학습**: `gaps.md` 기반.
세션 종료 시 `learning-os/sessions/YYYY-MM-DD.md` 생성(`templates/session.md` 기반) + `log.md`에 `## [YYYY-MM-DD] session | <요약>`.

### Query — "X가 뭐야 / A vs B"
위키 먼저 검색 → 인용과 함께 답변 → 가치 있는 탐구는 위키 페이지로 적재.

### 공백 분석 — "약점 분석해줘" (데일리/위클리 자동 가능)
전체 frontmatter 스캔 → 끊긴 연결·방치된 `seed`·로드맵 대비 빈 영역 → `gaps.md` 갱신 → 다음 학습 제안.

### Lint — "위키 점검해줘"
모순·구식 정보·고아 페이지·깨진 `related` 링크·`retired` 후보 점검.

## 4. 복습 알고리즘 (간격 반복 + 중요도)
- **간격 진행은 모두 동일**(간격 효과 보존): `1 → 3 → 7 → 14 → 30 → 90일 …`.
- 파인만 통과 시 다음 단계로 `review_due` 확장. 막히면 1일로 리셋.
- **`importance`는 간격이 아니라 횟수·졸업선을 조절:**
  - 5: 목표 8회+, **졸업 없음** — 90일마다 영구 유지 복습.
  - 3: 목표 4–5회, 졸업 후 180일 점검.
  - 1: 목표 2회, 빠르게 졸업 → 큐 은퇴.
- `review: retired`는 importance 무관 큐 제외. `suspended`는 일시 정지.
- 졸업/은퇴 판단이나 retired↔auto 전환은 **사용자에게 제안하고 승인받는다.**

## 5. 체득 메커니즘

### 파인만 (추론 기반, 오픈북 허용) — `model` 유형만
- **백지 암송 금지.** 앵커(상황·시작점)를 던지고 사용자가 추론으로 풀게 한다.
- 막히면 실패가 아니라 학습 신호 → 단계적 힌트 → 막힌 부분만 보강.
- **오픈북 허용.** 평가 대상은 *외웠는가*가 아니라 *논리 사슬 재구성 / 왜인지 설명 / 응용*.
- 채점 금지, 빈틈 사냥. 통과 시 사용자 설명을 페이지 "내 파인만 설명"에 박제(다음 복습 기준선), `feynman_passed`·`mastery`·`review_due` 갱신.

### 연결/철학적 질문 (계층적, 점점 깊게)
연결 → 설계 의도(why) → 트레이드오프 → 1차 원리 → 전이(transfer, 타 분야 적용). 가치 있는 답은 페이지에 보존, 못 한 질문은 "미해결 질문"에.

## 6. mastery 평가 기준
- 0–1: 읽기만 / seed
- 2: 파인만 시도하나 빈틈 많음
- 3: 빈틈 없이 설명 (understood)
- 4: 연결·트레이드오프까지, 응용 가능
- 5: 1차 원리에서 재구성(암기 재현 아님) + 타 분야 전이 (mastered)

## 7. 마인드 트랙
기술 외 설계 철학·협업·의사결정은 `mindset/`에서 독립적으로 다룬다. 기술 학습 중 자연스럽게 마인드 교훈이 나오면 `mindset/`에 연결.

## 8. 항상 지킬 것
- `sources/`는 절대 수정하지 않는다.
- 새 지식은 항상 기존 위키망에 연결된 채로 들어온다(고립된 점 금지).
- 모든 변경 후 `index.md`/`log.md` 동기화.
- 날짜는 사용자 환경의 오늘 날짜를 사용한다.
````

- [ ] **Step 2: 내용 검증**

Run: `grep -E "^## " CLAUDE.md`
Expected: `## 0. 핵심 원칙` 부터 `## 8. 항상 지킬 것` 까지 9개 섹션 헤더가 출력됨.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "feat: CLAUDE.md 헌법 작성 (워크플로우·복습·체득 규약)"
```

---

## Task 3: 페이지 템플릿 작성

**Files:**
- Create: `templates/concept.md`
- Create: `templates/session.md`
- Delete: `templates/.gitkeep` (실파일 생기므로)

- [ ] **Step 1: 개념 페이지 템플릿 작성**

`templates/concept.md`:
```markdown
---
title:
type: concept
domain:
knowledge_type: model
status: seed
mastery: 0
importance: 3
review: auto
feynman_passed: false
created:
updated:
sources: []
related: []
tags: []
review_due:
---

## 한 줄 정의
<!-- 이 개념을 한 문장으로. -->

## 깊은 설명
<!-- 왜·어떻게 동작하는가. model 유형이면 메커니즘 중심. -->

## 내 파인만 설명 (직접 작성)
<!-- 사용자가 추론으로 풀어낸 설명을 박제. 다음 복습의 기준선. -->

## 연결 / 철학적 질문
<!-- 연결·설계의도·트레이드오프·1차원리·전이 중 다룬 것. -->

## 미해결 질문
<!-- 아직 답 못 한 것 → 다음 학습 떡밥. -->

## 실전 사례
<!-- sources/problems/ 와 연결되는 실무 사례. -->
```

- [ ] **Step 2: 데일리 세션 템플릿 작성**

`templates/session.md`:
```markdown
---
date:
type: session
duration_min:
reviewed: []      # 복습한 개념 페이지
learned: []       # 새로 ingest 한 것
---

## 오늘의 브리핑
<!-- 복습 / _inbox / 백로그 환기 / 추천 -->

## 진행한 것
<!-- 복습·학습 내용과 파인만 결과 -->

## 막힌 지점 / 보강한 것
<!-- 진짜 모르던 부분 -->

## 다음 액션
<!-- 코치 제안 + 사용자 결정 -->
```

- [ ] **Step 3: .gitkeep 제거 및 검증**

```bash
rm -f templates/.gitkeep
ls templates/
```
Expected: `concept.md  session.md`

- [ ] **Step 4: Commit**

```bash
git add templates/
git commit -m "feat: 개념·세션 페이지 템플릿 추가"
```

---

## Task 4: learning-os 운영 파일 (roadmap/goals/backlog/gaps)

**Files:**
- Create: `learning-os/roadmap.md`, `learning-os/goals.md`, `learning-os/backlog.md`, `learning-os/gaps.md`

- [ ] **Step 1: goals.md 작성**

`learning-os/goals.md`:
```markdown
# 목표 & 방향성

## 최종 목적
대체 불가능한 풀스택 프로덕트 개발자. 프론트엔드를 넘어 네트워크/OS/AI/CS/백엔드/DevOps + 개발자 마인드까지 다채롭게 체득.

## 현재 시즌 목표
<!-- 분기/월 단위로 코치와 함께 갱신. 예: "네트워크 기초 model 개념 10개 understood 이상". -->

## 원칙
- 저장이 아니라 체득. 파인만으로 검증되지 않은 건 안다고 치지 않는다.
- 점이 아니라 망. 모든 새 지식은 기존 지식에 연결한다.
- 중요한 것은 끝까지 단련하고, 참고용은 빠르게 졸업시킨다.
```

- [ ] **Step 2: roadmap.md 작성**

`learning-os/roadmap.md`:
```markdown
# 풀스택 로드맵

각 분야의 토픽 트리. 코치가 공백 분석 시 이 트리 대비 빈 영역을 식별한다.
체크박스는 해당 토픽에 `understood` 이상 개념이 존재함을 의미.

## frontend
- [ ] 렌더링 (브라우저 렌더 파이프라인, 리플로우/리페인트)
- [ ] 상태관리 (반응성, 단방향 데이터플로우)
- [ ] 성능 (번들링, 코드스플리팅, Core Web Vitals)
- [ ] 브라우저 동작 (이벤트 루프, 비동기, 스토리지)

## cs
- [ ] 자료구조 / 알고리즘
- [ ] 동시성 / 병렬성
- [ ] 컴파일러 / 인터프리터 기초

## os
- [ ] 프로세스 / 스레드
- [ ] 메모리 관리 (가상메모리, GC)
- [ ] 파일시스템 / I/O

## network
- [ ] TCP/IP, 핸드셰이크
- [ ] HTTP/1.1·2·3, HTTPS/TLS
- [ ] DNS, CDN, 로드밸런싱

## backend
- [ ] API 설계 (REST, GraphQL)
- [ ] 인증/인가
- [ ] 메시지 큐 / 이벤트 드리븐

## database
- [ ] 관계형 / 인덱스 / 트랜잭션
- [ ] NoSQL / 캐시
- [ ] 데이터 모델링

## devops
- [ ] 컨테이너 / 오케스트레이션
- [ ] CI/CD
- [ ] 관측성 (로깅·메트릭·트레이싱)

## ai
- [ ] LLM 기초 / 프롬프팅
- [ ] RAG / 임베딩
- [ ] 에이전트 / 툴 유즈

## system-design
- [ ] 확장성 / 가용성
- [ ] 캐싱 전략
- [ ] 트레이드오프 사고
```

- [ ] **Step 3: backlog.md 작성**

`learning-os/backlog.md`:
```markdown
# 학습 백로그 (위시리스트)

배우고 싶은 주제를 0초 캡처. 데일리 세션이 여기서 환기한다.
형식: `- [ ] 주제 — (importance: N, 메모)`

## 던져둔 것
<!-- 예: - [ ] 이벤트 소싱 — (importance: 3, 선행으로 메시지 큐 먼저) -->

## 코치 제안 (승인 대기)
<!-- 공백 분석/연결 제안에서 나온 후보. 사용자 승인 시 위로 이동. -->
```

- [ ] **Step 4: gaps.md 작성**

`learning-os/gaps.md`:
```markdown
# 지식 공백 (코치 관리)

공백 분석이 갱신한다. 우선순위 높은 순.

## 끊긴 연결
<!-- related 가 비었거나 한쪽만 링크된 개념 -->

## 방치된 seed
<!-- status: seed 로 오래 머문 페이지 -->

## 로드맵 빈 영역
<!-- roadmap.md 대비 개념이 없는 토픽 -->
```

- [ ] **Step 5: 검증**

Run: `ls learning-os/ && head -1 learning-os/roadmap.md learning-os/goals.md learning-os/backlog.md learning-os/gaps.md`
Expected: 네 파일 존재, 각 첫 줄이 `# 풀스택 로드맵` / `# 목표 & 방향성` / `# 학습 백로그 (위시리스트)` / `# 지식 공백 (코치 관리)`.

- [ ] **Step 6: Commit**

```bash
git add learning-os/roadmap.md learning-os/goals.md learning-os/backlog.md learning-os/gaps.md
git commit -m "feat: learning-os 운영 파일 (roadmap/goals/backlog/gaps)"
```

---

## Task 5: 복습 큐 파일

**Files:**
- Create: `learning-os/review-queue.md`

- [ ] **Step 1: review-queue.md 작성**

`learning-os/review-queue.md`:
```markdown
# 복습 큐

복습은 각 개념 페이지의 `review_due`/`review`/`importance`로 구동된다(§CLAUDE.md 4).
이 파일은 사람이 빠르게 훑는 **요약 뷰**다 — 코치가 데일리 세션마다 갱신.

## 오늘 due (importance 내림차순)
<!-- review:auto 이고 review_due <= 오늘 인 페이지 목록 -->

## 곧 due (7일 내)
<!-- 다가오는 복습 미리보기 -->

## 유지 복습 루프 (importance 5, 졸업 없음)
<!-- 90일 주기로 계속 도는 핵심 개념 -->

## retired (복습 제외)
<!-- 사용자가 온전히 이해해 큐에서 뺀 것 -->
```

- [ ] **Step 2: 검증**

Run: `grep -E "^## " learning-os/review-queue.md`
Expected: `## 오늘 due`, `## 곧 due`, `## 유지 복습 루프`, `## retired` 4개 헤더.

- [ ] **Step 3: Commit**

```bash
git add learning-os/review-queue.md
git commit -m "feat: 복습 큐 요약 뷰 파일"
```

---

## Task 6: index.md + log.md (카탈로그·연대기)

**Files:**
- Create: `index.md`, `log.md`

- [ ] **Step 1: index.md 작성**

`index.md`:
```markdown
# 위키 인덱스

모든 지식 페이지의 카탈로그. ingest/query 시 코치가 갱신한다.
형식: `- [제목](경로) — 한 줄 요약 · domain · mastery N/5 · importance N/5`

## 분야별 mastery 집계
<!-- 코치가 frontmatter를 집계해 갱신. 예: frontend 3개(평균 2.3) / network 1개(1.0) -->

## frontend
## backend
## network
## os
## cs
## database
## devops
## ai
## system-design
## synthesis
<!-- 분야를 가로지르는 통합 페이지 -->
```

- [ ] **Step 2: log.md 작성**

`log.md`:
```markdown
# 로그

append-only 연대기. 파싱 가능한 접두사: `## [YYYY-MM-DD] <type> | <설명>`
type: ingest | session | query | lint | gaps

## [2026-06-17] init | 위키 구축 시작
```

- [ ] **Step 3: 검증**

Run: `head -1 index.md log.md`
Expected: `# 위키 인덱스`, `# 로그`.

- [ ] **Step 4: Commit**

```bash
git add index.md log.md
git commit -m "feat: index.md 카탈로그 + log.md 연대기"
```

---

## Task 7: 시드 개념 페이지 (실작동 예시)

스키마·연결·체득 섹션이 실제로 어떻게 채워지는지 보여주는 worked example 1개. 프론트엔드 개발자에게 친숙한 `이벤트 루프`로 작성.

**Files:**
- Create: `knowledge/concepts/event-loop.md`
- Modify: `index.md` (frontend 섹션에 항목 추가, mastery 집계 갱신)
- Modify: `log.md` (ingest 기록 추가)
- Delete: `knowledge/concepts/.gitkeep`

- [ ] **Step 1: 시드 페이지 작성**

`knowledge/concepts/event-loop.md`:
```markdown
---
title: 이벤트 루프
type: concept
domain: frontend
knowledge_type: model
status: learning
mastery: 2
importance: 5
review: auto
feynman_passed: false
created: 2026-06-17
updated: 2026-06-17
sources: []
related: [concepts/call-stack.md, concepts/microtask-queue.md]
tags: [async, runtime, javascript]
review_due: 2026-06-18
---

## 한 줄 정의
싱글 스레드 자바스크립트가 콜 스택이 빌 때마다 큐에서 작업을 꺼내 실행하며 동시성을 흉내 내는 런타임 메커니즘.

## 깊은 설명
콜 스택이 비면 이벤트 루프가 (1) 마이크로태스크 큐를 모두 비우고 (2) 매크로태스크 큐에서 하나를 꺼낸다. 그래서 `Promise.then`이 `setTimeout(0)`보다 먼저 실행된다. 렌더링은 보통 매크로태스크 사이에 끼어든다.

## 내 파인만 설명 (직접 작성)
<!-- 다음 세션에서 사용자가 추론으로 채울 자리. -->

## 연결 / 철학적 질문
- **연결:** 콜 스택(call-stack)이 비는 시점이 이벤트 루프의 트리거다.
- **대조:** 마이크로태스크 큐 vs 매크로태스크 큐의 우선순위 차이.
- **why:** 왜 싱글 스레드인데 블로킹 없이 동시성이 가능한가?

## 미해결 질문
- `requestAnimationFrame`은 어느 큐에 들어가며 렌더 타이밍과 어떤 관계인가?

## 실전 사례
<!-- 실무에서 setTimeout/Promise 순서로 디버깅한 사례가 생기면 연결. -->
```

- [ ] **Step 2: .gitkeep 제거**

```bash
rm -f knowledge/concepts/.gitkeep
```

- [ ] **Step 3: index.md에 항목 반영**

`index.md`의 `## frontend` 섹션 바로 아래에 추가:
```markdown
- [이벤트 루프](knowledge/concepts/event-loop.md) — 콜 스택이 빌 때 큐에서 작업을 꺼내 동시성을 흉내 내는 런타임 메커니즘 · frontend · mastery 2/5 · importance 5/5
```
`## 분야별 mastery 집계` 섹션 아래에 추가:
```markdown
- frontend: 1개 (평균 2.0)
```

- [ ] **Step 4: log.md에 ingest 기록 추가**

`log.md` 맨 아래에 추가:
```markdown
## [2026-06-17] ingest | 이벤트 루프 (시드 예시)
```

- [ ] **Step 5: 검증**

Run: `cat knowledge/concepts/event-loop.md | grep -E "^(title|importance|knowledge_type):" && grep "event-loop" index.md`
Expected: frontmatter 3줄 + index.md에 event-loop 링크 한 줄.

- [ ] **Step 6: Commit**

```bash
git add knowledge/concepts/event-loop.md index.md log.md
git commit -m "feat: 시드 개념 페이지(이벤트 루프) + 인덱스/로그 반영"
```

---

## Task 8: README.md + GitHub(개인 계정) 연결

**Files:**
- Create: `README.md`

- [ ] **Step 1: README.md 작성**

`README.md`:
```markdown
# dev-study — 능동 학습 위키

karpathy의 [LLM 위키 패턴](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)을 기반으로, 단순 지식 저장소를 넘어 **능동 코치·체득·학습 루틴**을 결합한 개인 개발 학습 시스템.

## 구조
- `sources/` — 원문(불변): 아티클·실무 문제·캡처
- `knowledge/` — 가공된 지식: 개념·분야·도구·통합 페이지 (frontmatter 메타데이터)
- `learning-os/` — 학습 운영: 로드맵·공백·백로그·복습 큐·세션 로그
- `mindset/` — 개발자 마인드 트랙
- `CLAUDE.md` — 코치의 헌법(워크플로우·복습·체득 규약)

## 운영
데스크탑은 Claude Code, 모바일은 Claude 앱이 같은 repo에 접속해 코치로 작동한다.
- "오늘 세션 시작" — 데일리 복습·학습
- "이거 공부하고 싶어" — ingest
- "약점 분석해줘" — 공백 분석

## 학습 철학
저장이 아니라 체득. 파인만(추론 기반)으로 검증되지 않은 건 안다고 치지 않는다.
점이 아니라 망. 모든 새 지식은 기존 지식에 연결된다.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: README 추가 (위키 소개·운영법)"
```

- [ ] **Step 3: GitHub 개인 계정 인증 확인**

Run: `gh auth status`
Expected: 개인 계정(beige.yoon 관련)으로 로그인되어 있음.
- 만약 회사 계정으로 되어 있거나 미로그인이면 **여기서 멈추고 사용자에게** `gh auth login`(개인 계정)을 직접 실행하도록 요청한다 (대화창에 `! gh auth login` 안내). 임의로 로그인 진행하지 말 것.

- [ ] **Step 4: private repo 생성 및 push**

```bash
gh repo create dev-study --private --source=. --remote=origin --push
```
Expected: 개인 계정 아래 private repo `dev-study` 생성, `main` 브랜치 push 완료.

- [ ] **Step 5: 검증**

Run: `git remote -v && git log --oneline -1 --pretty='%an <%ae>'`
Expected: origin이 개인 계정 repo를 가리키고, 최신 커밋 author가 `yooni <beige.yoon@gmail.com>`.

---

## 완료 기준
- [ ] 전체 디렉토리 구조 + .gitkeep 존재
- [ ] CLAUDE.md 헌법 작성됨
- [ ] 템플릿 2종 작성됨
- [ ] learning-os 5개 파일 작성됨
- [ ] index.md / log.md 작성됨
- [ ] 시드 개념 페이지 1개 + 인덱스/로그 반영
- [ ] README 작성, 개인 계정 private GitHub repo에 push
- [ ] "오늘 세션 시작"으로 첫 데일리 세션이 실제 작동 (push 후 수동 확인)
```
