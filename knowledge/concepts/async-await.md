---
title: async/await
type: concept
domain: frontend
knowledge_type: model
status: understood
mastery: 3
importance: 4
review: auto
feynman_passed: true
created: 2026-06-18
updated: 2026-06-21
sources: []
related: [concepts/promise.md, concepts/microtask-queue.md, concepts/event-loop.md, concepts/call-stack.md, concepts/macrotask-queue.md, concepts/promise-all-vs-sequential.md, concepts/closure.md]
tags: [async, runtime, javascript, promise]
review_due: 2026-06-24
---

## 한 줄 정의
`Promise`를 동기 코드처럼 쓰게 해주는 문법 설탕. `async` 함수는 첫 `await`까지 동기로 달리다가, `await`를 만나면 함수를 일시중단하고 제어권을 호출자에게 돌려준다. `await` 뒤 코드는 그 Promise의 `.then` 콜백처럼 **마이크로큐**로 들어간다.

## 깊은 설명
- **`async` 함수는 항상 Promise를 반환한다.** `return v` → `Promise.resolve(v)`, throw → reject된 Promise.
- **첫 `await` 전까지는 동기.** `f()` 호출 시 함수 본문은 평소처럼 콜 스택에서 즉시 실행을 시작한다. async라고 통째로 미뤄지지 않는다.
- **`await`는 desugar로 이해한다:**
  ```js
  async function f() {
    console.log('A')
    await something
    console.log('B')   // ← await 뒤 코드
  }
  ```
  ⟷ 대략
  ```js
  function f() {
    console.log('A')
    Promise.resolve(something).then(() => {
      console.log('B')   // ← .then 콜백 = 마이크로태스크
    })
  }
  ```
- **대상이 Promise가 아니어도 멈춘다.** `await 42`도 `Promise.resolve(42).then(...)`처럼 처리 → "통과"는 없다. 무조건 일시중단 + 마이크로큐 경유.
- **`await` N개 = 마이크로큐 N번 경유.** 각 `await`마다 한 번씩 현재 task를 양보하고 다음 마이크로태스크로 재개된다.

## 내 파인만 설명 (직접 작성)
_(2026-06-18 세션, 추론으로 재구성)_

- 처음 오해: ① `f()`를 호출하면 함수 전체가 나중으로 미뤄진다(→ 동기 부분도 뒤로 감), ② `await` 뒤 코드는 매크로큐로 간다, ③ `await` 대상이 상수면 멈추지 않고 통과한다. — 셋 다 교정.
- 교정 후 재구성:
  - `f()`는 일반 함수처럼 콜 스택에서 **즉시 시작** → 첫 `await`에서만 멈춘다.
  - `await x` = `Promise.resolve(x).then(...)` → 어제 배운 규칙으로 `.then` 콜백은 **마이크로큐**. 따라서 `await` 뒤 코드는 같은 틱의 `setTimeout(0)`(매크로)보다 항상 먼저.
  - 상수든 이미 끝난 Promise든 `.then`은 동기 실행되는 법이 없으므로, `await`는 무조건 멈춘다.
- 응용 통과: `1 3 5 4 2` (sync→micro→macro), `start A end B C` (await 만나면 즉시 호출자 복귀, 두 await = 마이크로 2회).

**복습 (2026-06-19):** ⚠️ "await 뒤 코드 = 매크로큐" 오해가 **재발**(6-18에 교정했던 그것). → `setTimeout` 대조(`3`이 `T`보다 먼저 나오는 모순)로 스스로 마이크로큐임을 재도출. 회복 후 `await null`이 왜 멈추는지를 Promise 상태기계로 끝까지 재구성(`Promise.resolve(null)`=태어날 때부터 fulfilled → `.then`은 등록만 → 콜백은 무조건 마이크로큐 경유 → "통과"는 없다). **회귀가 있었으므로 review_due를 1일로 리셋(6-21), mastery 3 유지.** 다음 복습 핵심 점검: 마이크로 vs 매크로 즉답 여부.

**복습 (2026-06-21):** ✅ **회귀 없음.** `1 / setTimeout(2) / async f(){3; await null; 4} / 5` 앵커에서 출력 `1 3 5 4 2` 정확 + `4`(await 뒤)가 `2`(setTimeout)보다 먼저인 이유를 *"마이크로큐를 전부 비운 뒤 매크로 1개"* 로 즉답. 두 번 무너졌던 자리가 굳음 → **review_due 6-24(3일)로 확장, mastery 3 유지.**

## 연결 / 철학적 질문
- **연결:** [마이크로태스크 큐](microtask-queue.md) — `await` 뒤 코드의 행선지. (어제의 미해결 질문 "await 뒤 코드 = 마이크로태스크?"의 답이 여기.)
- **연결:** [이벤트 루프](event-loop.md)의 우선순위 규칙 위에서 돌아간다. [콜 스택](call-stack.md) — 첫 await 전까지 본문이 실행되는 곳.
- **대조:** [매크로태스크 큐](macrotask-queue.md) — `await` 재개는 매크로가 아니라 마이크로라서 setTimeout보다 앞선다.
- **why(문법 설탕의 의도):** 콜백 지옥/`.then` 체인의 비선형 흐름을 동기처럼 읽히는 선형 코드로. 단, 실행 모델은 여전히 Promise+마이크로큐 그대로.

## 미해결 질문
- ✅ 일부 해소(2026-06-18): 병렬 `Promise.all` vs 순차 `await` 성능 차이 → [Promise.all 병렬 vs 순차 await](promise-all-vs-sequential.md). (여러 async 함수의 정확한 인터리빙 마이크로태스크 순서는 아직 미해결.)
- `try/catch`로 `await`의 reject를 잡는 메커니즘 — reject된 Promise가 마이크로큐에서 어떻게 throw로 바뀌나?

## 실전 사례
<!-- async 순서 디버깅 / Promise.all 병렬화 사례 연결. -->
