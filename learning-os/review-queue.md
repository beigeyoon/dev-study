# 복습 큐

복습은 각 개념 페이지의 `review_due`/`review`/`importance`로 구동된다(§CLAUDE.md 4).
이 파일은 사람이 빠르게 훑는 **요약 뷰**다 — 코치가 데일리 세션마다 갱신.

## 오늘 due (importance 내림차순)
_(2026-06-24 세션 처리 완료)_
- 없음 — 오늘 due **8개 전부 처리**. frontend 비동기 클러스터 6개 통합 앵커(출력 순서 `A·D·F·C·E·B`) + 신규 2개 파인만.
  - ✅ 클러스터 5개(이벤트루프·콜스택·async/await·micro·macro) 견고 → review_due 6-24→**7-01**.
  - ⚠️ **Promise.all 회귀**("잘 모름"으로 막힘 → 단계 유도 회복) → m4→3, review_due **1일 리셋(6-25)**.
  - ✅ 쿠키/세션/토큰 feynman 통과 → understood, m2→3, review_due **6-27**.
  - ✅ 프로세스/스레드 feynman 통과 → understood, m2→3, review_due **6-27**.

## 곧 due (7일 내)
**2026-06-25:**
- 🔴 Promise.all 병렬 vs 순차 (importance 4, m3) — **회귀 재점검 1순위.** 점검: 순차가 2초인 이유(`await`가 *다음 줄 호출 자체*를 막음)부터, **"병렬성=출발 시점(in-flight)이지 `Promise.all`도 await 개수도 아님"**을 무힌트로 다시 세우는지.
- Promise (importance 5, m3) — 6-22 통과 후 due.
- 클로저 (importance 5, m4) — 6-22 통과 후 due.

**2026-06-26:**
- HTTP (importance 4, m3) — 6-23 첫 간격 통과 후 due.

**2026-06-27:**
- 🆕 쿠키/세션/토큰 (importance 4, m3) — 2번째 간격. 점검: "누가 기억하나" 축 + 트레이드오프 양 날(확장 ↔ 즉시 무효화)을 무힌트로. 이번엔 유도받은 **토큰 강점(확장성)**이 자력으로 나오는지.
- 🆕 프로세스/스레드 (importance 4, m3) — 2번째 간격. 점검: capstone("싱글스레드=race 면제 선물, 대가=병렬 포기") + 언어/엔진(V8)/호스트 3층("이벤트 루프는 호스트 제공")을 자력 재구성하는지.

## 7-01 이후
- frontend 비동기 클러스터 5개 (이벤트루프·콜스택·async/await·micro·macro) — **2026-07-01.**

## 유지 복습 루프 (importance 5, 졸업 없음)
<!-- 90일 주기로 계속 도는 핵심 개념 -->
- 이벤트 루프 · 콜 스택 (importance 5 → 졸업 없음, 영구 유지)

## retired (복습 제외)
<!-- 사용자가 온전히 이해해 큐에서 뺀 것 -->
