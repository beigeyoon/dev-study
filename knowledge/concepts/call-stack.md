---
title: 콜 스택
type: concept
domain: frontend
knowledge_type: model
status: understood
mastery: 3
importance: 5
review: auto
feynman_passed: true
created: 2026-06-17
updated: 2026-06-24
sources: []
related: [concepts/event-loop.md, concepts/macrotask-queue.md, concepts/microtask-queue.md, concepts/async-await.md, concepts/promise-all-vs-sequential.md, concepts/promise.md, concepts/closure.md, concepts/process-vs-thread.md]
tags: [runtime, javascript, execution]
review_due: 2026-07-01
---

## 한 줄 정의
함수 호출의 중첩 관계를 추적하는 LIFO 자료구조 — "지금 실행 중인 함수들"이 프레임 단위로 쌓이고 끝난 순서대로 pop된다. 콜 스택이 하나뿐인 것이 곧 JS가 싱글 스레드인 이유.

## 깊은 설명
- 함수를 호출하면 함수당 **스택 프레임(stack frame)** 하나가 push된다. 프레임 안에는 **지역 변수 · 매개변수 · 돌아갈 지점(return address)** = 그 함수의 "작업대".
- `return` 시 프레임을 pop.
- **왜 스택(LIFO)인가:** 함수 호출은 중첩된다. 부모(`a`)는 자식(`b`)의 결과를 받아야 끝나므로 자식이 도는 동안 부모는 남아 대기한다. "마지막에 연 게 가장 먼저 닫힌다"는 중첩의 성질이 그대로 LIFO를 강제. FIFO면 부모가 자식보다 먼저 끝나는 모순.
- **재귀 / 스택 오버플로:** `f(){ f() }`는 pop 없이 push만 누적 → 메모리 한계 → `Maximum call stack size exceeded`. 무한루프(`while(true){}`)는 스택이 안 자라지만 재귀는 자란다. 그래서 종료 조건(base case) 필수.

## 내 파인만 설명 (직접 작성)
_(2026-06-17 세션, 추론으로 재구성)_

- **형제(sibling) vs 중첩(nested):** `log('A'); log('D');`는 형제 — 하나 끝나고 다음이라 한 번에 하나만 올라갔다 내려가 "안 쌓여 보임". `a(){ b() }`는 중첩 — `a`가 `b`를 기다리며 남아 `[a][b][c]` 동시 존재. (어제 혼동했던 바로 그 지점.)
- **"콜 스택이 빈다"의 정확한 의미:** 순간적으로 프레임 0개가 아니라 **현재 돌던 task가 끝나 제어가 이벤트 루프로 돌아온 상태.** 동기 코드 한 덩어리(스크립트 전체)는 이벤트 루프 입장에서 쪼갤 수 없는 한 task라, 줄과 줄 사이의 빈 틈엔 이벤트 루프가 끼어들지 않는다.
- **블로킹:** 무거운 동기 코드가 콜 스택을 점유하면, 클릭 콜백은 큐에 **접수는 되지만** 실행할 빈 콜 스택이 안 나서 대기만 → 화면 멈춤. ("접수를 못 받아서"가 아니라 "실행할 자리가 안 나서".)
- **`setTimeout`/`Promise.then` 호출 자체는 동기** — 콜 스택에서 push-실행-pop. 다만 그 실행 내용이 "콜백을 나중에 돌리도록 등록"일 뿐. 콜백은 절대 콜 스택으로 직접 안 들어가고 항상 `큐 → 이벤트 루프 → 콜 스택` 경로만 탄다.

## 연결 / 철학적 질문
- **builds-toward:** 콜 스택이 비는 시점 = [이벤트 루프](event-loop.md)의 트리거.
- **대조:** 콜 스택(동기 실행) ↔ [매크로](macrotask-queue.md)/[마이크로](microtask-queue.md) 큐(비동기 대기).
- **1차 원리:** 중첩 구조 → LIFO. 자료구조 선택이 자의가 아니라 문제의 성질에서 강제됨.
- **builds-under:** "콜 스택이 하나 = JS 싱글 스레드"의 그 *스레드*가 뭔지는 [프로세스 vs 스레드](process-vs-thread.md). 스레드가 하나라 race condition·락을 걱정 안 해도 되는 게 싱글 스레드의 트레이드오프 뒷면.

## 미해결 질문
- ✅ 해소(2026-06-21): 비동기 콜백이 큐에서 콜 스택으로 올라올 때, 등록 당시 함수 프레임은 이미 사라졌는데 어떻게 변수에 접근하나? → 잡힌 변수는 **클로저**로 **힙에 대피**해 프레임과 따로 산다. 변수 수명은 프레임이 아니라 도달 가능성(참조)이 결정. → [클로저](closure.md).

## 실전 사례
<!-- 무거운 동기 연산으로 UI 프리징 디버깅한 사례가 생기면 연결. -->
