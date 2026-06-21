# 로그

append-only 연대기. 파싱 가능한 접두사: `## [YYYY-MM-DD] <type> | <설명>`
type: ingest | session | query | lint | gaps

## [2026-06-17] init | 위키 구축 시작
## [2026-06-17] ingest | 이벤트 루프 (시드 예시)
## [2026-06-17] session | 이벤트 루프 파인만 통과 (mastery 2→3, feynman_passed) · 연결 개념 2개 seed 제안
## [2026-06-17] ingest | 콜 스택 · 매크로태스크 큐 · 마이크로태스크 큐 (이벤트 루프 끊긴 연결 3개 해소)
## [2026-06-17] session | 콜 스택 + 큐/Web API 모델 파인만 통과 (3개 신규 understood, mastery 3) · 이벤트 루프 3→4
## [2026-06-18] session | 지식 그래프 시각화 사이트 구축 — frontmatter→graph.json 빌드 + Cytoscape 렌더 + 클릭 패널 + GitHub Pages 자동 배포 (main 병합 완료)
## [2026-06-18] session | async/await 파인만 통과 (신규 understood, mastery 3) — 오해 3개(동기 머리·마이크로 vs 매크로·상수 통과) 교정 · 마이크로큐 미해결 질문 해소 · 4개와 양방향 연결
## [2026-06-18] session | Promise.all 병렬 vs 순차 await (신규 understood, mastery 4) — 평가순서·동시성≠병렬성·CPU 경계(Web Worker 전이)까지 추론 도달 · 5개와 양방향 연결
## [2026-06-19] ingest | Promise (신규 understood, mastery 3, feynman 통과) — ⭐선행 누락분 해소 · 상태 3종(동사 resolve vs 명사 fulfilled)·인자 전달·executor·백그라운드 일꾼이 누름·.then 등록 vs 큐 진입·상태 기억으로 타이밍 경쟁 해방까지 추론 재구성 · 오해 3개 교정 · 기존 5개와 양방향 연결
## [2026-06-19] session | 복습 — async/await(⚠️매크로/마이크로 회귀→자력 회복, review_due 1일 리셋, m3 유지) · Promise 토대 재다지기(상자 모델 자기말 재구성, promise.md 박제) · Promise.all 복습은 다음 세션 1순위로 보류
## [2026-06-21] session | Promise.all 자력 재구성(체감상 첫 세션) — "시계 찍기"로 버전 C=1초·CPU=3초 자력 도출 · 병렬성 범인=in-flight(호출 시점)이지 Promise.all 아님 · 동시성vs병렬성 1차 원리(기다림은 Web API가 떠안음→I/O만 겹침)·Web Worker 전이 · fail-fast(all) vs allSettled 학습 · feynman 재통과, m4 정당화, review_due→6-24
## [2026-06-21] session | async/await 회귀 점검 — `1 3 5 4 2` 앵커에서 micro(4)<macro(2) 즉답, ✅회귀 없음(두 번 무너진 자리 굳음), review_due→6-24
## [2026-06-21] ingest | 클로저 (신규 understood, m3, feynman 통과) — 콜 스택 미해결 질문에서 출발 · 모순(프레임 pop됐는데 콜백이 변수 읽음)→힙 대피로 자력 도출 · "변수 수명=도달 가능성" · makeCounter 상태유지로 전이(비동기→동기) · 콜 스택 미해결 질문 해소 + call-stack/async-await/macrotask 양방향 연결
