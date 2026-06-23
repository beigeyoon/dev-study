# 학습 백로그 (위시리스트)

배우고 싶은 주제를 0초 캡처. 데일리 세션이 여기서 환기한다.
형식: `- [ ] 주제 — (importance: N, 메모)`

## 던져둔 것
<!-- 예: - [ ] 이벤트 소싱 — (importance: 3, 선행으로 메시지 큐 먼저) -->
- [x] **Promise / resolve·reject·pending·then** — ✅ 2026-06-19 완료(understood, mastery 3, feynman 통과). → [Promise](../knowledge/concepts/promise.md). 선행 누락분 해소: 상태 3종·resolve는 동사/fulfilled는 명사·인자 전달·executor·백그라운드 일꾼이 누름·.then 등록 vs 큐 진입·상태 기억으로 타이밍 경쟁 해방까지 추론으로 재구성.

## 코치 제안 (승인 대기) — 2026-06-17 세션에서
- [ ] **Web API / 브라우저 멀티스레드 모델** — (importance: 3, 이벤트 루프에서 "기다림을 떠맡는 주체"로 등장. 독립 개념화 가치 있음)
- [x] **클로저 / 실행 컨텍스트** — ✅ 2026-06-21 완료(understood, m3, feynman 통과). → [클로저](../knowledge/concepts/closure.md). 콜 스택 미해결 질문(프레임 pop 후 변수 접근)을 "힙 대피 + 수명=도달 가능성"으로 해소. **후속:** 실행 컨텍스트/렉시컬 환경/스코프 체인은 클로저 페이지 미해결 질문으로 이관(다음 학습 후보).
- [x] **`async/await` 동작 원리** — ✅ 2026-06-18 완료(understood, mastery 3). → [async/await](../knowledge/concepts/async-await.md)
- [ ] **requestAnimationFrame / 렌더 파이프라인** — (importance: 3, 매크로큐인지 별도 렌더 단계인지 미해결. 로드맵 frontend-렌더링과 연결)
- [ ] **Web Worker** — (importance: 3, ⬆️2→3 상향 2026-06-18: CPU 계산 병렬화의 답으로 부상. "Promise.all=I/O용, 계산=Worker" 경계 완성. 진짜 병렬 처리, "동시성 흉내"와 대조. 📌 postMessage 복사 vs 참조 떡밥은 2026-06-23 [프로세스 vs 스레드](../knowledge/concepts/process-vs-thread.md)에서 부분 해소(race 회피용 격리). 이제 Web Worker 본체=별도 스레드의 실제 사용법만 남음)

## 코치 제안 (승인 대기) — 2026-06-22 HTTP 학습에서
- [x] **상태 비저장(stateless) → 쿠키 / 세션 / 토큰** — ✅ 2026-06-23 완료(learning, m2, 첫 접촉). → [쿠키/세션/토큰](../knowledge/concepts/cookie-session-token.md). 매 요청마다 티켓 자동 재제출(쿠키, `Set-Cookie`/`Cookie`) + 세션(서버 기억=stateful, 무효화 쉬움) vs 토큰(정보가 토큰에=stateless, 확장 쉬움) + 트레이드오프(확장↔무효화 둘 다 못 가짐)·하이브리드까지 유도 추론.
- [ ] **HTTPS / TLS** — (importance: 4, HTTP 텍스트가 평문으로 가면 위험. 암호화·인증서가 HTTP 위에 뭘 더하나. 평문 쿠키 탈취 문제와 직결 — 쿠키/세션/토큰 다음 칸 1순위)
- [ ] **HTTP 메서드 의미론 / 멱등성(idempotency)** — (importance: 3, GET=안전, PUT vs PATCH, DELETE 멱등 — REST 설계의 토대)
- [ ] **TCP/IP (선 아래)** — (importance: 3, HTTP 텍스트가 실제로 서버까지 어떻게 가나. HTTP/2·3 차이도 여기서)
- [ ] **백엔드 기초 (서버 · API)** — (importance: 4, fetch의 반대편. 요청이 도착하면 서버가 뭘 하나. fullstack 본체)

## 코치 제안 (승인 대기) — 2026-06-23 쿠키/세션/토큰 학습에서
- [ ] **JWT 구조 / 서명** — (importance: 3, 토큰이 "위조 불가"인 원리=비밀키 서명. header.payload.signature 3토막. 토큰은 읽을 순 있음(암호화 아님)→비밀번호 담으면 안 됨. 쿠키/세션/토큰 심화)
- [ ] **쿠키 보안 속성 / CSRF·XSS** — (importance: 4, 쿠키 탈취 시 위험. HttpOnly·Secure·SameSite가 각각 뭘 막나. 프론트 보안의 토대 — frontend·network 교차점)
- [ ] **refresh token / 무효화·로그아웃 실제 구현** — (importance: 3, blocklist 어디(Redis?)·refresh 흐름. 하이브리드의 실제 동작)

## 코치 제안 (승인 대기) — 2026-06-23 프로세스/스레드 학습에서
- [ ] **락(lock)/뮤텍스 · 데드락** — (importance: 3, race condition의 해결책. `①②③`을 atomic하게 묶기. 데드락=락이 서로를 기다림. os 심화)
- [ ] **OS 스케줄링 / 컨텍스트 스위치** — (importance: 3, 코어 4개에 스레드 100개를 OS가 어떻게 번갈아 돌리나. "동시성 흉내"가 OS 레벨에서도 반복됨 — 이벤트 루프와 같은 결)

## 코치 제안 (승인 대기)
<!-- 공백 분석/연결 제안에서 나온 후보. 사용자 승인 시 위로 이동. -->
