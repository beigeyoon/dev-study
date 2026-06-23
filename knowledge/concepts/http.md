---
title: HTTP
type: concept
domain: network
knowledge_type: model
status: understood
mastery: 3
importance: 4
review: auto
feynman_passed: true
created: 2026-06-22
updated: 2026-06-23
sources: []
related: [concepts/promise.md, concepts/async-await.md, concepts/event-loop.md, concepts/cookie-session-token.md]
tags: [network, http, web, protocol, fetch, request-response]
review_due: 2026-06-26
---

## 한 줄 정의
클라이언트와 서버가 **요청(request)–응답(response)** 한 쌍의 **텍스트 메시지**로 대화하는 규약. `fetch()`가 "선(wire) 위로" 실제 주고받는 것의 정체 = 지금까지 "Web API가 떠맡는 네트워크 요청"이라고만 알던 블랙박스의 내용물.

## 깊은 설명

### 요청과 응답은 둘 다 똑같은 3층 구조
"서버가 이 요청을 처리하려면 *최소한* 뭐가 필요한가"로 매번 재구성할 수 있다(암기 대상 아님).

**요청(request):**
```
POST /users HTTP/1.1               ← ① 시작줄: 동사(method) + 명사(path) + 버전
Host: api.example.com              ┐
Content-Type: application/json     │ ② 헤더: 메타데이터 ("body는 JSON이야", "나 이런 사람이야")
Authorization: Bearer abc123       ┘
                                   ← (빈 줄 = "헤더 끝, 이제 본문" 신호)
{ "name": "유니", "email": "..." } ← ③ body: 실제 데이터 (GET엔 보통 없음)
```

**응답(response):** 첫 줄만 `동사+명사` 대신 `상태코드`로 바뀔 뿐, 같은 3층.
```
HTTP/1.1 200 OK                    ← ① 상태줄: 버전 + 상태코드 + 사유구
Content-Type: application/json     ← ② 헤더
                                   ← (빈 줄)
{ "id": 42, "name": "유니" }       ← ③ body: 실제 데이터
```

### `Host` 헤더 = 빠진 도메인 (버추얼 호스팅)
- 시작줄에는 **path만** 들어간다: `GET /users/42`. URL의 `api.example.com`은 거기 없다. 그 도메인이 들어가는 칸이 **`Host:` 헤더.**
- **왜 필요한가:** 서버 한 대(IP 한 개)에 도메인 여러 개가 얹힐 수 있다(`api.example.com`·`blog.example.com`이 같은 건물에 세 들어 산다 = **virtual hosting**). path `/users/42`만으론 *어느 사이트의* `/users/42`인지 모호 → `Host`가 그걸 가린다. (택배 송장에 "3층 42호"만 있고 회사 이름이 없으면 배달 불가.)

### method = 동사, path = 명사
- `/users/42` = **무엇을**(자원, resource) → 명사. `GET`/`POST`/`PUT`/`DELETE` = **어떻게 할지**(행동) → 동사.
- 같은 `/users/42`라도 method가 "보여줘(GET)"인지 "삭제해(DELETE)"인지를 가른다. (Promise의 "상태=명사 / resolve=동사" 구분과 같은 결.)
- `GET`은 보통 body가 없다(그냥 "보여줘"). `POST`/`PUT`처럼 *만들거나 고치는* 동사는 그 데이터를 **body**에 실어 보낸다.

### status code = 첫 자리가 곧 분류
| 첫 자리 | 뜻 | 예 |
|---|---|---|
| **2**xx | 성공 | `200 OK`, `201 Created` |
| **3**xx | 리다이렉트 | `301`, `304` |
| **4**xx | **클라이언트 잘못**(네가 틀림) | `404` 없음, `401` 인증 안 됨, `403` 권한 없음 |
| **5**xx | **서버 잘못**(서버가 터짐) | `500`, `503` |
- 책임 소재가 첫 자리에 박혀 있다: `4xx`=요청한 쪽 잘못, `5xx`=서버 잘못.

### fetch 사슬과의 접합 (기존 지식망과의 다리)
```
fetch(url) ─► Web API가 위 HTTP 요청 텍스트를 서버로 전송
            서버가 HTTP 응답 텍스트로 답장 (status+headers+body)
            응답 도착 ─► Web API가 resolve(응답) 누름 ─► Promise fulfilled
```
- **함정:** `fetch`의 Promise는 `404`·`500`을 받아도 **reject가 아니라 resolve**된다. Web API 입장에선 *응답이 도착한 것 자체*가 네트워크 작업 성공이고, `404`도 엄연히 도착한 응답이기 때문. fetch가 reject하는 건 **응답이 아예 못 올 때**(서버 다운·DNS 실패·오프라인)뿐. → 실무에선 `if (!res.ok)`로 status를 직접 확인해야 한다.
- "resolve = 작업 완료 소식"이 HTTP에선 정확히 *"답장이 왔다"*로 매핑된다.

## 내 파인만 설명 (직접 작성)
_(2026-06-22 세션, fetch 한 줄에서 출발 — "서버 입장에서 뭐가 필요한가" 추론으로 구조 도출)_

- "서버가 같은 `/users/42`에서 보여줄지 삭제할지 어떻게 구분?" → **method**가 필요함을 자력 도출.
- "POST로 *만들* 때 새 유저의 이름·이메일은 어디에?" → **body**로 자력 도출.
- status code가 "어느 정도 규격화돼 있다"고 직감 → 세 자리 + 첫 자리 분류로 정리.
- 압축: "HTTP 요청과 응답은 둘 다 **3층 구조**이고, 요청 첫 줄은 **method+path**, 응답 첫 줄은 **status code**다. fetch가 404에도 resolve하는 이유는 **어쨌든 답장을 받았기 때문**이다."
- _(주의: 헤더의 필요성은 코치가 유도. 첫 접촉 = 유도된 학습이지 무힌트 재구성 아님. 다음 복습에서 혼자 3층을 세우는지 점검.)_

_(2026-06-23 첫 간격 복습 — feynman 통과, m2→3 / learning→understood)_
- 요청 3층(시작줄/헤더/바디)을 **무힌트로** 자력 재구성 (어제는 유도받았던 부분).
- GET `/users/42`의 바디 → 처음 "바디"라 적었다가 "GET은 딸려 보낼 데이터가 없다 → 비움"으로 **스스로 정정.** (동사가 바디 유무를 가른다.)
- **Host 헤더를 1차 원리로 도출:** 시작줄엔 path(`/users/42`)만 있고 URL의 `api.example.com`이 빠짐 → "같은 건물(IP)에 여러 회사(도메인)가 세 들어 사니, 회사 이름이 없으면 배달부가 어디로 갈지 모른다" → 이 빠진 조각이 들어가는 칸 = **`Host:` 헤더 (= 버추얼 호스팅의 이유).**
- 응답 첫 줄 = status code + 사유구. fetch 404 함정을 **양방향**으로 설명: 404=fulfilled(답장 도착 자체가 네트워크 성공) / reject는 답장이 아예 못 올 때(서버다운·DNS·오프라인)만 → 개발자는 status code로 직접 실패를 판별(`if(!res.ok)`).

## 연결 / 철학적 질문
- **builds-on:** [Promise](promise.md)·[async/await](async-await.md)·[이벤트 루프](event-loop.md) — `fetch`가 반환하는 Promise의 행선지·resolve를 누르는 주체(Web API)가 실제로 *무엇을* 주고받는지가 HTTP. 며칠간 본 비동기 사슬의 **바깥 칸**.
- **why(설계 의도):** 사람이 읽을 수 있는 텍스트 + 요청/응답 한 쌍이라는 단순한 규약이라 누구든 구현 가능 → 웹의 보편성.
- **트레이드오프(떡밥):** 매 요청이 독립(stateless)이라 단순·확장 쉽지만, "이 사람 누구였지"를 매번 다시 알려야 함 → 쿠키·토큰·세션이 등장하는 이유.

## 미해결 질문
- ✅ **상태 비저장(stateless):** HTTP는 요청마다 독립인데 로그인은 어떻게 유지? → [쿠키/세션/토큰](cookie-session-token.md)으로 해소(2026-06-23). 매 요청마다 티켓 자동 재제출 + 세션(서버 기억) vs 토큰(stateless).
- **method의 의미론:** GET/POST 말고 PUT vs PATCH 차이, "멱등성(idempotency)"이란? 안전한 메서드?
- **선 아래:** HTTP 텍스트는 실제로 어떻게 서버까지 가나 — TCP/IP, 그리고 HTTPS(TLS)는 이 위에 뭘 더하나?
- **버전:** `HTTP/1.1` vs `HTTP/2` vs `HTTP/3`은 뭐가 다른가?

## 실전 사례
<!-- fetch 404 미처리 버그, REST API 설계, status code 디버깅 등 실제 사례 연결. -->
