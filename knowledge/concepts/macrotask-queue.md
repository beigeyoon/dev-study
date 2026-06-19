---
title: 매크로태스크 큐
type: concept
domain: frontend
knowledge_type: model
status: understood
mastery: 3
importance: 4
review: auto
feynman_passed: true
created: 2026-06-17
updated: 2026-06-17
sources: []
related: [concepts/event-loop.md, concepts/microtask-queue.md, concepts/call-stack.md, concepts/async-await.md, concepts/promise-all-vs-sequential.md, concepts/promise.md]
tags: [async, runtime, javascript]
review_due: 2026-06-20
---

## 한 줄 정의
Web API가 처리를 끝낸 비동기 콜백(`setTimeout`·DOM 이벤트·I/O 등)이 줄 서서 콜 스택에 올라갈 차례를 기다리는 FIFO 큐. = task queue.

## 깊은 설명
- 여기 들어가는 것: `setTimeout`/`setInterval` 콜백, **DOM 이벤트 콜백(클릭·키입력)**, I/O 콜백 등.
- 이벤트 루프는 한 사이클에 매크로태스크 큐에서 **딱 하나**만 꺼내 콜 스택에 올린다(마이크로 큐를 전부 비운 뒤).
- 동기 코드 한 덩어리(스크립트 전체)도 사실 하나의 매크로태스크다.

## 내 파인만 설명 (직접 작성)
_(2026-06-17 세션, 추론으로 재구성)_

- `setTimeout(fn, 0)`의 `0`은 **"0ms 뒤 실행"이 아니라 "최소 0ms 뒤 매크로큐에 *집어넣기만*"**. 큐에 들어가도 (1) 현재 task가 끝나야 하고 (2) 마이크로큐가 먼저 다 비워져야 차례가 온다. 그래서 같은 task의 동기 코드보다도, `Promise.then`(마이크로)보다도 늦다.
- 클릭 핸들러 콜백도 매크로태스크 — `setTimeout` 콜백과 **같은 줄**에 선다. 미스터리한 별도 큐가 아니다.
- **출처는 Web API:** 비동기 콜백은 콜 스택에서 직접 안 생긴다. Web API(브라우저 스레드)가 타이머·네트워크·이벤트의 "기다림"을 대신 끝낸 뒤 콜백을 이 큐에 넣어준다.

> ⚠️ **정교화 (2026-06-18) — "Web API가 끝나면 무조건 매크로큐"는 틀림.**
> 매크로큐는 "Web API 전용 출구"가 아니라 **task형(콜백) 완료의 출구**다. 큐는 Web API가 고르는 게 아니라 **그 API의 통지 모델**이 정한다:
> - **task 기반(콜백):** `setTimeout`·DOM 이벤트·`XMLHttpRequest.onload` → **매크로큐**
> - **Promise 기반:** `fetch(...)` → Web API가 하는 일은 "**Promise를 resolve**"뿐 → 그 `.then`/`await` 반응은 [마이크로큐](microtask-queue.md)로 간다.
> 그래서 같은 "네트워크 대기"라도 `XHR.onload`(매크로) vs `fetch().then`(마이크로)이 갈린다. fetch는 두 단계(`fetch` → `res.json()`) 모두 Promise라 마이크로큐를 두 번 경유.

## 연결 / 철학적 질문
- **대조:** [마이크로태스크 큐](microtask-queue.md)보다 **우선순위 낮음** — 한 사이클에 마이크로를 전부 비운 뒤 매크로 하나.
- **연결:** [이벤트 루프](event-loop.md)가 [콜 스택](call-stack.md)이 빌 때 여기서 꺼낸다.

## 미해결 질문
- `requestAnimationFrame`은 매크로큐인가, 별도의 렌더 단계인가? (→ 렌더 파이프라인 떡밥)

## 실전 사례
<!-- setTimeout 순서/지연 디버깅 사례 연결. -->
