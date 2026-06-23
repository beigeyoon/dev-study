---
title: Promise.all 병렬 vs 순차 await
type: concept
domain: frontend
knowledge_type: model
status: understood
mastery: 4
importance: 4
review: auto
feynman_passed: true
created: 2026-06-18
updated: 2026-06-21
sources: []
related: [concepts/promise.md, concepts/async-await.md, concepts/event-loop.md, concepts/macrotask-queue.md, concepts/microtask-queue.md, concepts/call-stack.md, concepts/process-vs-thread.md]
tags: [async, performance, javascript, promise, concurrency]
review_due: 2026-06-24
---

## 한 줄 정의
여러 비동기 작업을 **순차 `await`** 하면 각 await가 다음 시작을 막아 총합 시간(`tA+tB+tC`), **`Promise.all`** 로 묶으면 먼저 다 호출해 동시에 켜두고 한꺼번에 기다려 최댓값 시간(`max(tA,tB,tC)`). 단, 이 이득은 **I/O·타이머 같은 "기다림"에만** 적용된다.

## 깊은 설명
- **핵심 원리: 호출 = 일 시작.** async/Promise 반환 함수는 호출하는 순간 첫 `await`까지 즉시 실행되며 타이머/요청을 켠다. `await`는 "기다릴지 말지"만 정한다.
- **순차 (느림, `tA+tB+tC`):**
  ```js
  const x = await fetchA()  // A 끝날 때까지 함수 일시중단
  const y = await fetchB()  // ← A가 끝나야 비로소 호출됨 = B 늦게 시작
  ```
  `await`가 다음 줄 평가를 막으므로 B는 A가 끝난 뒤에야 시작 → 직렬.
- **병렬 (`max`):**
  ```js
  const [x, y] = await Promise.all([ fetchA(), fetchB() ])
  ```
  `Promise.all`의 인자 배열을 만들려면 `fetchA()`·`fetchB()`를 **먼저 다 평가** → 둘 다 즉시 pending Promise 반환 → **두 타이머 동시에 켜짐** → all이 한꺼번에 대기.
- **Promise.all은 마법이 아니다.** 병렬성은 `Promise.all`이 아니라 **"먼저 다 호출해 in-flight로 만든다"** 에서 나온다. 아래도 똑같이 병렬:
  ```js
  const pA = fetchA(); const pB = fetchB()  // 둘 다 시작
  const x = await pA; const y = await pB     // 이미 도는 중
  ```
  `Promise.all`은 편한 집계기일 뿐. (추가로 fail-fast: 하나라도 reject되면 즉시 reject. 모두 기다리려면 `Promise.allSettled`.)

## 내 파인만 설명 (직접 작성)
_(2026-06-18 세션, 추론으로 재구성)_

- 처음엔 "둘 다 3초, 차이 없다"고 봤음. 교정 과정:
  - **평가 순서 질문(best):** `await delay(1000)`에서 왜 delay가 먼저인가? → `await`는 연산자, `delay(1000)`은 피연산자. `console.log(getName())`처럼 **안쪽 호출이 먼저** 평가돼 Promise를 만들고, 그 Promise에 대고 await가 멈춘다. "멈춰라"가 아니라 "오른쪽 평가 결과가 끝날 때까지 멈춰라".
  - 그래서 순차 A는 await가 다음 호출을 막아 3초, B는 배열 만들 때 셋 다 즉시 호출돼 타이머 동시 점화 → 1초.
- **1차 원리(Web API 스레드 질문에서):** 동시 대기 = 스레드 3개가 아니다. 타이머는 "시각 T에 깨워라"는 **장부 예약**이라 거의 0스레드. 네트워크도 OS non-blocking I/O + 인터럽트로 한 스레드가 수천 요청 감독.
- **경계선(CPU 버전 추론):** `await delay` 대신 `while`로 1초 CPU를 태우면 `Promise.all`로 묶어도 **3초**. ① 양보(`await`)할 지점이 없어 동기로 끝까지 돌고 ② 평범한 계산은 Web API 전용 창구로 못 보내 메인 스레드 독점. 진짜 병렬 계산은 Web Worker(별도 스레드 + postMessage).

**복습/자력 재구성 (2026-06-21):** 6-18에 페이지는 있었으나 *재복습 미진행*이라 체감상 "처음" — 사실상 첫 자력 재구성 세션. "시계 찍기"(각 fetch가 *몇 초 시점에 호출되는가*) 렌즈로 끝까지 도달:
  - **버전 C(분리 호출 후 await) = 1초**를 자력 도출. 처음엔 "await 줄줄이 = 3초"로 오답 → A에선 `await`가 다음 줄 진입을 막아 fetchB가 t=1에야 호출되지만, C에선 세 줄 사이에 `await`가 없어 셋 다 t=0에 점화 → `await pB` 도달 시 pB는 이미 끝나 있음(추가 대기 0초)을 스스로 짚음.
  - **빈칸 자가 충전:** "병렬성은 `Promise.all`이 아니라 *await보다 먼저 다 호출해 in-flight로 만든 데서* 나온다." B와 C가 같은 1초인 건 같은 범인(호출 시점) 때문, `Promise.all`은 편한 집계기일 뿐.
  - **CPU 버전 = 3초**를 *암기가 아닌 원리로* 잡아냄("JS 스레드는 하나라 CPU 계산이 그 스레드를 점유"). 이어 핵심 비대칭을 자기 말로: **"네트워크 기다림은 CPU가 아니라 Web API가 처리하고 CPU는 완료 소식만 듣는다"** → 그래서 단일 스레드인데도 I/O는 겹치고 CPU는 못 겹침. **겹침은 실행이 아니라 기다림에서.** 전이: 진짜 계산 병렬 = Web Worker. → mastery 4 정당화, feynman 재통과.

## 연결 / 철학적 질문
- **동시성 vs 병렬성:** 세 fetch는 **동시적(concurrent)** 이지만 **병렬적(parallel)** 이지 않다. JS 스레드는 하나. 겹침은 "실행"이 아니라 "기다림"에서 일어나고, 그 기다림은 일이 아니라 OS/하드웨어에 떠넘긴 예약이다.
- **연결:** [async/await](async-await.md)의 "호출=시작, await=일시중단+제어권 반환"이 직접 근거. [이벤트 루프](event-loop.md)/[매크로큐](macrotask-queue.md)(타이머 만료 콜백이 들어가는 곳).
- **트레이드오프/경계:** `Promise.all`은 **I/O 겹치기** 도구지 **계산 병렬화** 도구가 아니다. CPU-bound → Web Worker. fail-fast(all) vs 전부 대기(allSettled).
- **실무 함의:** 독립적인 비동기 호출을 순차 await로 쓰면 N배 느려진다. 의존성 없는 요청은 묶어라.

## 미해결 질문
- 여러 async 함수가 인터리빙될 때 정확한 마이크로태스크 순서는?
- ✅ 부분 해소(2026-06-23): Web Worker는 메모리를 공유하지 않고 `postMessage`로 **복사**한다 — 공유하면 race condition이 터지니 일부러 격리. → [프로세스 vs 스레드](process-vs-thread.md). (`SharedArrayBuffer`로 진짜 공유 시엔 직접 락 필요.)

## 실전 사례
<!-- 순차 await로 느렸던 API 호출을 Promise.all로 묶어 개선한 사례 연결. -->
