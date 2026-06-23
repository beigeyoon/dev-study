# 지식 공백 (코치 관리)

공백 분석이 갱신한다. 우선순위 높은 순.

## 끊긴 연결
<!-- related 가 비었거나 한쪽만 링크된 개념 -->
- ✅ 해소(2026-06-17): 이벤트 루프 → call-stack/micro/macro 큐 3개 깨진 링크 → 페이지 생성 + 양방향 연결 완료.

## 방치된 seed
<!-- status: seed 로 오래 머문 페이지 -->
- 없음 (현재 모든 페이지 understood 이상)

## 선행 누락 (foundation gap)
- ✅ 해소(2026-06-19): **Promise** 페이지 생성 + async/await·Promise.all·마이크로큐와 양방향 연결. 토대 빈칸 메움. → [Promise](../knowledge/concepts/promise.md). 다음 복습 때 상위 3개 페이지가 "이해한 구조"로 굳는지 점검.

## 로드맵 빈 영역
<!-- roadmap.md 대비 개념이 없는 토픽 -->
- ✅ 첫 점(2026-06-22): **network** 영역 개방 — [HTTP](../knowledge/concepts/http.md) 생성. 2026-06-23 understood·m3 승격.
- ✅ network 2번째 점(2026-06-23): [쿠키/세션/토큰](../knowledge/concepts/cookie-session-token.md) 생성(learning, m2). HTTP stateless 떡밥 해소 + 양방향 연결. network 2개(평균 2.5)로 깊이 생기기 시작.
- ✅ os 영역 개방(2026-06-23): [프로세스 vs 스레드](../knowledge/concepts/process-vs-thread.md) 생성(learning, m2). 콜스택·이벤트루프·Promise.all과 양방향 연결 — "JS 싱글스레드"·"동시성≠병렬성"·"Web Worker 복사"의 밑바닥을 깖. (frontend 비동기 클러스터의 토대가 뒤늦게 채워짐.)
- 여전히 빈 6개 분야: backend·cs·database·devops·ai·system-design.
- network 내 다음 칸: HTTPS/TLS(평문 쿠키 탈취 직결, 1순위), 쿠키 보안(HttpOnly/SameSite/CSRF), JWT 서명 구조, HTTP 메서드 의미론, TCP/IP. → backlog 등록.
- os 내 다음 칸(process-vs-thread 미해결 질문): 락/뮤텍스·데드락, OS 스케줄링·컨텍스트 스위치, SharedArrayBuffer/Atomics.
- frontend 내에서도 "브라우저 동작"만 채워짐. **렌더링·상태관리·성능**은 미착수.
- 코치 제안 다음 후보: ① HTTP 심화(stateless→인증, 백엔드 관문) ② backend 기초(fetch의 반대편) ③ frontend 렌더 파이프라인.
