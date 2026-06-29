# 위키 인덱스

모든 지식 페이지의 카탈로그. ingest/query 시 코치가 갱신한다.
형식: `- [제목](경로) — 한 줄 요약 · domain · mastery N/5 · importance N/5`

## 분야별 mastery 집계
<!-- 코치가 frontmatter를 집계해 갱신. 예: frontend 3개(평균 2.3) / network 1개(1.0) -->
- frontend: 8개 (평균 3.3)
- network: 2개 (평균 3.0)
- os: 1개 (평균 3.0)

## frontend
- [Promise](knowledge/concepts/promise.md) — "나중에 줄게" 약속 객체. pending→fulfilled/rejected(settled 불변), 상태·값을 박제해 콜백을 늦게 등록해도 결과를 안 놓침 · frontend · mastery 3/5 · importance 5/5
- [이벤트 루프](knowledge/concepts/event-loop.md) — 콜 스택이 빌 때 큐에서 작업을 꺼내 동시성을 흉내 내는 런타임 메커니즘 · frontend · mastery 4/5 · importance 5/5
- [콜 스택](knowledge/concepts/call-stack.md) — 함수 호출의 중첩을 추적하는 LIFO 구조, 하나뿐이라 JS가 싱글 스레드 · frontend · mastery 3/5 · importance 5/5
- [매크로태스크 큐](knowledge/concepts/macrotask-queue.md) — setTimeout·이벤트 콜백이 줄 서는 task queue, 사이클당 하나 · frontend · mastery 3/5 · importance 4/5
- [마이크로태스크 큐](knowledge/concepts/microtask-queue.md) — Promise.then 등 우선순위 높은 콜백, 사이클당 전부 비움 · frontend · mastery 3/5 · importance 4/5
- [async/await](knowledge/concepts/async-await.md) — Promise의 문법 설탕, 첫 await까지 동기 실행 후 뒤 코드는 마이크로큐로 · frontend · mastery 3/5 · importance 4/5
- [Promise.all 병렬 vs 순차 await](knowledge/concepts/promise-all-vs-sequential.md) — 순차 await는 tA+tB+tC, Promise.all은 max — 병렬성은 "출발 시점(in-flight)"에서, I/O 겹치기일 뿐 계산 병렬화 아님 · frontend · mastery 3/5 · importance 4/5
- [클로저](knowledge/concepts/closure.md) — 함수가 태어난 곳의 변수를 기억해 들고 다니는 것. 잡힌 변수는 프레임 pop 후에도 힙에 남아 산다(수명=도달 가능성) · frontend · mastery 4/5 · importance 5/5
## backend
## network
- [HTTP](knowledge/concepts/http.md) — 클라이언트·서버가 요청/응답 한 쌍의 텍스트 메시지로 대화하는 규약. 둘 다 3층(시작줄/헤더/바디), 요청 첫 줄=method+path, 응답 첫 줄=status code, Host 헤더로 도메인 식별. fetch가 선 위로 주고받는 것의 정체 · network · mastery 3/5 · importance 4/5
- [쿠키/세션/토큰](knowledge/concepts/cookie-session-token.md) — HTTP가 stateless인데 로그인이 유지되는 비밀: 매 요청마다 티켓 자동 재제출(쿠키). 세션=서버가 기억(stateful, 무효화 쉬움) vs 토큰=정보가 토큰에 담김(stateless, 확장 쉬움). 둘 다 깔끔히는 못 가짐 · network · mastery 3/5 · importance 4/5
## os
- [프로세스 vs 스레드](knowledge/concepts/process-vs-thread.md) — 프로세스=격리된 자기 메모리를 받은 실행 단위, 스레드=프로세스 안 실행 흐름으로 메모리 공유. "JS 싱글 스레드"=콜 스택 하나=race condition 면제(선물). 콜 스택의 주체=JS 엔진(V8)의 단일 실행 스레드, 이벤트 루프는 호스트(브라우저·Node) 제공. 공유의 양날: 통신 공짜 ↔ race condition · os · mastery 3/5 · importance 4/5
## cs
## database
## devops
## ai
## system-design
## synthesis
<!-- 분야를 가로지르는 통합 페이지 -->
