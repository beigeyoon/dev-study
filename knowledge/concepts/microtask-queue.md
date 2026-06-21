---
title: 마이크로태스크 큐
type: concept
domain: frontend
knowledge_type: model
status: understood
mastery: 3
importance: 4
review: auto
feynman_passed: true
created: 2026-06-17
updated: 2026-06-21
sources: []
related: [concepts/promise.md, concepts/event-loop.md, concepts/macrotask-queue.md, concepts/call-stack.md, concepts/async-await.md, concepts/promise-all-vs-sequential.md]
tags: [async, runtime, javascript, promise]
review_due: 2026-06-24
---

## 한 줄 정의
`Promise.then` 등 우선순위 높은 비동기 콜백이 줄 서는 큐. 이벤트 루프는 매크로 하나를 꺼내기 전에 이 큐를 **완전히 비운다(drain)**.

## 깊은 설명
- 여기 들어가는 것: `Promise.then/catch/finally`, `queueMicrotask`, `MutationObserver`.
- **drain completely:** 마이크로태스크를 처리하다 새 마이크로태스크가 추가되면, 매크로로 넘어가기 전에 그것까지 다 비운다. → `C1`(안에서 `C2` 생성)이면 `C1 → C2 → B(매크로)`.
- 그래서 같은 틱의 `Promise.then`은 항상 `setTimeout(0)`보다 앞선다.

## 내 파인만 설명 (직접 작성)
_(2026-06-17 세션, 추론으로 재구성)_

- 우선순위 규칙: 콜 스택이 비면(현재 task 종료) → **마이크로큐를 전부 비우고** → 매크로큐에서 하나. 이 "전부 vs 하나"의 비대칭이 핵심.
- `Promise.resolve().then(cb)`에서 `then` 호출 자체는 동기(콜 스택)지만 `cb`는 마이크로큐로 가 현재 task 종료 후 실행된다.
- 위험: 마이크로태스크가 계속 새 마이크로태스크를 만들면 매크로(렌더 포함)로 영영 못 넘어가 starvation 가능.

## 연결 / 철학적 질문
- **대조:** [매크로태스크 큐](macrotask-queue.md)보다 **우선순위 높음**(전부 비움 vs 하나). Promise 기반 코드의 즉시성을 보장.
- **연결:** [이벤트 루프](event-loop.md)의 우선순위 규칙, [콜 스택](call-stack.md)이 빈 직후 실행.
- **why:** 왜 마이크로를 매크로보다 먼저, 그것도 전부 비울까? → Promise 체인이 다음 렌더/타이머 전에 일관되게 완결되도록.

## 미해결 질문
- ✅ 해소(2026-06-18): `async/await`는 내부적으로 어느 시점에 마이크로태스크를 만드나? → `await x` ≈ `Promise.resolve(x).then(...)`. `await` 뒤 코드가 `.then` 콜백처럼 마이크로큐로 간다. 상세는 [async/await](async-await.md).

## 실전 사례
<!-- Promise vs setTimeout 순서로 디버깅한 사례 연결. -->
