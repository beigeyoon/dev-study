# 위키 인덱스

모든 지식 페이지의 카탈로그. ingest/query 시 코치가 갱신한다.
형식: `- [제목](경로) — 한 줄 요약 · domain · mastery N/5 · importance N/5`

## 분야별 mastery 집계
<!-- 코치가 frontmatter를 집계해 갱신. 예: frontend 3개(평균 2.3) / network 1개(1.0) -->
- frontend: 4개 (평균 3.5)

## frontend
- [이벤트 루프](knowledge/concepts/event-loop.md) — 콜 스택이 빌 때 큐에서 작업을 꺼내 동시성을 흉내 내는 런타임 메커니즘 · frontend · mastery 4/5 · importance 5/5
- [콜 스택](knowledge/concepts/call-stack.md) — 함수 호출의 중첩을 추적하는 LIFO 구조, 하나뿐이라 JS가 싱글 스레드 · frontend · mastery 3/5 · importance 5/5
- [매크로태스크 큐](knowledge/concepts/macrotask-queue.md) — setTimeout·이벤트 콜백이 줄 서는 task queue, 사이클당 하나 · frontend · mastery 3/5 · importance 4/5
- [마이크로태스크 큐](knowledge/concepts/microtask-queue.md) — Promise.then 등 우선순위 높은 콜백, 사이클당 전부 비움 · frontend · mastery 3/5 · importance 4/5
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
