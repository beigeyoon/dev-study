# 복습 큐

복습은 각 개념 페이지의 `review_due`/`review`/`importance`로 구동된다(§CLAUDE.md 4).
이 파일은 사람이 빠르게 훑는 **요약 뷰**다 — 코치가 데일리 세션마다 갱신.

## 오늘 due (importance 내림차순)
<!-- review:auto 이고 review_due <= 오늘 인 페이지 목록 -->
_(2026-06-23 기준)_
- 없음 — 오늘 due 1개(HTTP) 통과 처리(learning→understood, m2→3, review_due→6-26).

## 곧 due (7일 내)
<!-- 다가오는 복습 미리보기 -->
**2026-06-24 (클러스터 6개 몰아서 — `1 3 5 4 2` 류 통합 복습 가능):**
- 이벤트 루프 (importance 5, mastery 4)
- 콜 스택 (importance 5, mastery 3)
- async/await (importance 4, mastery 3)
- Promise.all 병렬 vs 순차 await (importance 4, mastery 4)
- 매크로태스크 큐 (importance 4, mastery 3)
- 마이크로태스크 큐 (importance 4, mastery 3)
- 🆕 쿠키/세션/토큰 (importance 4, mastery 2) — 첫 간격. 점검: stateless→쿠키 자동 재제출→세션vs토큰→트레이드오프(확장↔무효화) 무힌트 재구성. 압축에서 토큰의 대가(무효화) 빠뜨렸던 비대칭 메우는지.
- 🆕 프로세스 vs 스레드 (importance 4, mastery 2) — 첫 간격. 점검: 프로세스(격리)vs스레드(공유) 대비 + "JS 싱글스레드=race 면제 선물" + race condition 3단계(읽기/계산/쓰기) 무힌트 재구성. Web Worker 복사 이유 자력 연결되는지.

**2026-06-25:**
- Promise (importance 5, mastery 3) — 6-22 통과 후 1→3일
- 클로저 (importance 5, mastery 4) — 6-22 통과 후 1→3일

**2026-06-26:**
- HTTP (importance 4, mastery 3) — 6-23 첫 간격 통과 후 1→3일

## 유지 복습 루프 (importance 5, 졸업 없음)
<!-- 90일 주기로 계속 도는 핵심 개념 -->
- 이벤트 루프 · 콜 스택 (importance 5 → 졸업 없음, 영구 유지)

## retired (복습 제외)
<!-- 사용자가 온전히 이해해 큐에서 뺀 것 -->
