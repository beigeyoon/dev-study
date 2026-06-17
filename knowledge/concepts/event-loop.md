---
title: 이벤트 루프
type: concept
domain: frontend
knowledge_type: model
status: understood
mastery: 3
importance: 5
review: auto
feynman_passed: true
created: 2026-06-17
updated: 2026-06-17
sources: []
related: [concepts/call-stack.md, concepts/microtask-queue.md, concepts/macrotask-queue.md]
tags: [async, runtime, javascript]
review_due: 2026-06-20
---

## 한 줄 정의
싱글 스레드 자바스크립트가 콜 스택이 빌 때마다 큐에서 작업을 꺼내 실행하며 동시성을 흉내 내는 런타임 메커니즘.

## 깊은 설명
콜 스택이 비면 이벤트 루프가 (1) 마이크로태스크 큐를 모두 비우고 (2) 매크로태스크 큐에서 하나를 꺼낸다. 그래서 `Promise.then`이 `setTimeout(0)`보다 먼저 실행된다. 렌더링은 보통 매크로태스크 사이에 끼어든다.

## 내 파인만 설명 (직접 작성)
_(2026-06-17 세션에서 추론으로 재구성)_

- **콜 스택**은 "지금 당장 실행 중인 코드"가 쌓이는 곳이다. **동기 코드**(`console.log('A')`)는 줄을 만나는 즉시 콜 스택에 들어가 실행되고 바로 빠져나온다 — 쌓여서 대기하지 않는다. 그래서 `A` 실행·반환 → `D` 실행·반환.
- 비동기 콜백은 콜 스택이 아니라 **큐**로 보내진다. 큐는 두 종류:
  - `setTimeout`의 `B` → **매크로태스크 큐**
  - `Promise.then`의 `C` → **마이크로태스크 큐**
- 콜 스택이 비면 이벤트 루프는 **마이크로태스크 큐를 전부 비운 뒤, 매크로태스크 큐에서 하나**를 꺼낸다. → `C`가 `B`보다 먼저.
- **drain completely:** 마이크로태스크를 처리하다 새 마이크로태스크가 추가되면, 매크로로 넘어가기 전에 그것까지 다 비운다. 그래서 `C1 → C2 → B` (C1 안에서 생성된 C2가 B보다 먼저).
- **실무 함의:** Promise 체인은 같은 틱의 setTimeout보다 항상 앞선다.

## 연결 / 철학적 질문
- **연결:** 콜 스택(call-stack)이 비는 시점이 이벤트 루프의 트리거다.
- **대조:** 마이크로태스크 큐 vs 매크로태스크 큐의 우선순위 차이.
- **why:** 왜 싱글 스레드인데 블로킹 없이 동시성이 가능한가?

## 미해결 질문
- `requestAnimationFrame`은 어느 큐에 들어가며 렌더 타이밍과 어떤 관계인가?

## 실전 사례
<!-- 실무에서 setTimeout/Promise 순서로 디버깅한 사례가 생기면 연결. -->
