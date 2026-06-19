---
title: Promise
type: concept
domain: frontend
knowledge_type: model
status: understood
mastery: 3
importance: 5
review: auto
feynman_passed: true
created: 2026-06-19
updated: 2026-06-19
sources: []
related: [concepts/async-await.md, concepts/microtask-queue.md, concepts/event-loop.md, concepts/macrotask-queue.md, concepts/promise-all-vs-sequential.md]
tags: [async, runtime, javascript, promise]
review_due: 2026-06-20
---

## 한 줄 정의
"지금은 값이 없지만 나중에 줄게"라는 **약속 객체**. 비동기 작업의 미래 결과(값 또는 실패 이유)를 담는 그릇이며, 상태와 값을 **박제**해두기 때문에 콜백을 언제 등록하든 결과를 놓치지 않는다.

## 깊은 설명

### 3가지 상태 (state)
```
                 resolve(값)  ──►  fulfilled  (이행됨, 값value을 품음)
   pending  ──┤
   (대기)       reject(이유)  ──►  rejected   (거부됨, 이유reason를 품음)
```
- **pending**: 아직 결과 없음(약속만 한 상태).
- **fulfilled / rejected**: 확정됨 = **settled**. 한 번 settled되면 **절대 안 바뀜**(불변).

### 상태(명사) vs 행동(동사) — 핵심 구분
- `fulfilled`/`rejected`는 **상태(명사)**. `resolve`/`reject`는 그 상태로 바꾸는 **행동(함수)**.
- `resolve("값")` 호출 ≠ 즉시 fulfilled. resolve에 **또 다른 Promise를 넘기면** 그게 끝날 때까지 pending에 머문다 → "resolved ≠ fulfilled".

### resolve / reject의 정체 = "전달책(messenger) 함수"
```js
const p = new Promise((resolve, reject) => {  // 콜백 = executor, 생성 즉시 동기 실행
  setTimeout(() => resolve("성공!"), 500);    // resolve, reject는 엔진이 인자로 건네주는 함수
});
```
- 개발자가 정하는 건 **① 언제 부를지(타이밍) + ② 무슨 값으로 부를지**뿐. resolve의 내부 동작은 엔진이 만들었고, 너는 **누르기만** 한다.
- **값은 return이 아니라 인자(argument)로 전달.** `resolve(값)`의 인자가 곧 Promise의 값. (executor가 동기로 끝난 뒤 *나중에* 값을 주입하려면 호출 가능한 함수에 인자로 넘기는 수밖에 없다 — return은 그 자리에서 끝나 못 씀.)
- 한 번 누르면 두 번째 호출은 **무시**(settled 불변).

### 누가 resolve를 누르나
- **그 비동기 작업을 실제로 수행하는 백그라운드 일꾼.** 네트워크면 네트워크 엔진, 타이머면 타이머, 파일이면 파일 시스템. = 어제 배운 "기다림을 떠맡는 주체 = Web API".
- `fetch()` 내부에도 숨은 executor가 있어, 응답 도착 시 브라우저의 네트워크 모듈이 `resolve(응답)`을, 실패 시 `reject(에러)`를 누른다.

### .then / .catch — 등록과 체이닝
- `.then(콜백)`은 콜백을 **등록만** 한다(즉시 실행 ❌). Promise가 settled되는 순간 그 콜백이 **마이크로태스크 큐**로 들어간다.
- `resolve(값) → fulfilled → .then(값=>)`, `reject(이유) → rejected → .catch(이유=>)`로 짝이 맞는다.
- **`.then`은 새 Promise를 반환** → 그래서 체이닝 가능.
- **자동 flatten:** `.then` 콜백이 Promise를 반환하면, 그게 끝날 때까지 기다렸다가 **안의 값만 꺼내** 다음 `.then`에 넘긴다. 덕분에 중첩 없이 평평하게 쓸 수 있다.

## 내 파인만 설명 (직접 작성)
_(2026-06-19 세션, 추론으로 재구성 — 백지 아닌 앵커 추론)_

앵커: `fetch().then(data => render(data))`이 0.5초를 안 기다리고 넘어가면서도 응답이 오면 render를 실행하는 원리.

1. `fetch()`는 즉시 **pending** 상태의 Promise를 반환한다(JS는 안 기다리고 다음 줄로).
2. 0.5초 동안 백그라운드 작업자(Web API)가 대기하고, 응답이 오면 작업자가 **resolve를 실행**해 인자로 전달된 값을 Promise에 등록하고 상태를 **fulfilled로 전환**한다.
3. `.then`의 콜백은 우선 Promise에 **등록되어 있다가**, Promise가 fulfilled로 **확정되는 순간 마이크로태스크 큐로** 넘어간다.
4. (강점) Promise가 **상태와 값을 기억**하기 때문에, `.then` 등록이 resolve보다 늦어도(이미 fulfilled여도) 콜백은 기억된 값으로 실행된다 → 콜백이 "타이밍 경쟁"에서 자유로워진다.

교정한 오해:
- "resolve/reject는 상태다" → ❌ 행동(함수)이다. 상태는 fulfilled/rejected.
- "resolve가 값을 return한다" → ❌ 인자로 전달한다.
- "이미 fulfilled된 Promise에 .then을 늦게 붙이면 콜백이 안 간다" → ❌ Promise가 값을 기억하므로 **즉시 마이크로큐로** 간다(오히려 가장 빠른 케이스).

## 연결 / 철학적 질문
- **상위/응용:** [async/await](async-await.md) — Promise의 문법 설탕. `await x` ≈ `Promise.resolve(x).then(...)`. Promise를 알아야 async/await의 실행 모델이 보인다.
- **연결:** [마이크로태스크 큐](microtask-queue.md) — `.then` 콜백의 행선지. "왜 마이크로큐가 Promise 콜백 전용인지"의 토대.
- **연결:** [이벤트 루프](event-loop.md) — resolve가 콜백을 큐로 보냄 → 이벤트 루프가 꺼내 실행. 이 사슬의 **첫 단추**가 resolve. [콜 스택](call-stack.md)이 빌 때 콜백 실행.
- **응용:** [Promise.all 병렬 vs 순차 await](promise-all-vs-sequential.md) — 여러 Promise를 묶는 것. 개별 Promise 구조 위에서 동작.
- **why(설계 의도):** 단순 콜백은 "등록이 늦으면 결과를 놓침". Promise는 상태·값을 박제해 **시점 분리**를 보장 → 콜백 지옥 대신 체이닝 가능. 이게 Promise가 콜백보다 강력한 본질적 이유.

## 미해결 질문
- "resolved ≠ fulfilled" 떡밥: resolve에 또 다른 Promise를 넘기면 정확히 어떤 절차로 그 Promise를 따라가(adopt) pending을 유지하나?
- `Promise.all` / `race` / `allSettled` 등 정적 메서드의 내부 동작(여러 Promise 상태를 어떻게 종합하나) → 일부는 [Promise.all 페이지](promise-all-vs-sequential.md)에서.
- `try/catch`가 `await`의 reject를 throw로 바꾸는 메커니즘 (async/await 페이지 미해결 질문과 연결).

## 실전 사례
<!-- 직접 new Promise로 콜백 API를 Promise화(promisify)한 사례, Promise 체인 디버깅 사례 연결. -->
</content>
</invoke>
