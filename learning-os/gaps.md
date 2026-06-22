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
- ✅ 첫 점(2026-06-22): **network** 영역 개방 — [HTTP](../knowledge/concepts/http.md) 생성(learning, m2). fetch 사슬과 양방향 연결. 아직 1개뿐, 깊이 미달.
- 여전히 빈 7개 분야: backend·os·cs·database·devops·ai·system-design.
- network 내 다음 칸(HTTP 미해결 질문): 상태 비저장→쿠키/세션/토큰, HTTPS/TLS, HTTP 메서드 의미론, TCP/IP. → backlog 등록.
- frontend 내에서도 "브라우저 동작"만 채워짐. **렌더링·상태관리·성능**은 미착수.
- 코치 제안 다음 후보: ① HTTP 심화(stateless→인증, 백엔드 관문) ② backend 기초(fetch의 반대편) ③ frontend 렌더 파이프라인.
