---
id: 2026-07-22-event-loop-order
concept: concepts/event-loop.md
domain: frontend
label: JS · 이벤트 루프
status: approved
accent: lime
created: 2026-07-22
published:
tags: [event-loop, microtask]
---

## 질문코드
```js
console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');
```

## 헤드라인
출력 순서는? 🔥

## 정답
A D C B

## 왜
동기(A·D) 먼저 → 콜스택 비면 마이크로태스크(C) → 그다음 매크로태스크(B). setTimeout 0도 큐에서 대기.

## 한줄정리
마이크로태스크가 **매크로태스크보다 먼저** 비워진다

## 캡션
이 순서 맞히면 이벤트 루프 이해한 거 👇 정답은 댓글에서 #자바스크립트 #이벤트루프
