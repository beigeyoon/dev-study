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
