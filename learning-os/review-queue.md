# 복습 큐

복습은 각 개념 페이지의 `review_due`/`review`/`importance`로 구동된다(§CLAUDE.md 4).
이 파일은 사람이 빠르게 훑는 **요약 뷰**다 — 코치가 데일리 세션마다 갱신.

## 오늘 due (importance 내림차순)
<!-- review:auto 이고 review_due <= 오늘 인 페이지 목록 -->
- 없음

## 곧 due (7일 내)
<!-- 다가오는 복습 미리보기 -->
**2026-06-20 대규모 due (7개 몰아서 — Promise 토대 위에서 클러스터 점검):**
- Promise (importance 5, mastery 3) — 신규, 토대. 복습 시 상위 개념 굳는지 점검
- async/await (importance 4, mastery 3) — 6-19에서 이월
- Promise.all 병렬 vs 순차 await (importance 4, mastery 4) — 6-19에서 이월
- 이벤트 루프 (importance 5, mastery 4)
- 콜 스택 (importance 5, mastery 3)
- 매크로태스크 큐 (importance 4, mastery 3)
- 마이크로태스크 큐 (importance 4, mastery 3)

## 유지 복습 루프 (importance 5, 졸업 없음)
<!-- 90일 주기로 계속 도는 핵심 개념 -->
- 이벤트 루프 · 콜 스택 (importance 5 → 졸업 없음, 영구 유지)

## retired (복습 제외)
<!-- 사용자가 온전히 이해해 큐에서 뺀 것 -->
