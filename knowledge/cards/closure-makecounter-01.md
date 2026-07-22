---
id: closure-makecounter-01
concept: concepts/closure.md
domain: frontend
label: JS · 클로저
status: approved
accent: lime
created: 2026-07-22
published:
tags: [closure]
---

## 질문코드
```js
function makeCounter() {
  let count = 0;
  return () => ++count;
}
const a = makeCounter();
const b = makeCounter();
console.log(a(), a(), b());
```

## 헤드라인
출력은? 🔥

## 정답
1 2 1

## 왜
a·b는 makeCounter의 다른 호출 → 각자 다른 count(배낭). a는 두 번 눌러 1→2, b는 새 count라 1.

## 한줄정리
배낭은 **함수**가 아니라 **호출**이 갖는다

## 캡션
이 코드 출력, 3초 안에 맞혀봐 👇 정답은 댓글에서 #자바스크립트 #클로저
