---
id: promise-all-sequential-01
concept: concepts/promise-all-vs-sequential.md
domain: frontend
label: JS · 비동기
status: approved
accent: lime
created: 2026-07-22
published:
tags: [async, promise, concurrency]
---

## 질문코드
```js
// 각 fetch는 1초

// A
await fetchA();
await fetchB();
await fetchC();

// B
await Promise.all([fetchA(), fetchB(), fetchC()]);
```

## 헤드라인
A와 B, 각각 몇 초? 🔥

## 정답
3초 vs 1초

## 왜
A는 하나 끝나야 다음 시작이라 1초씩 3번. B는 셋을 한꺼번에 던져놓고 같이 기다리니까 1초.

## 한줄정리
A는 **기다리며** 부르고, B는 **다 부르고** 기다린다

## 캡션
A랑 B, 각각 몇 초일까? 👇 정답은 댓글에서 #자바스크립트 #비동기
