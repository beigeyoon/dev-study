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
- ✅ 승격(2026-06-24): network·os 신규 2개(쿠키/세션/토큰·프로세스/스레드)가 첫 간격 feynman 통과로 **learning→understood**(m2→3). 이제 network 2개(평균 3.0)·os 1개(3.0) **전부 understood**로 굳음 — 영역 개방 후 첫 점들이 "이해한 구조"로 안착.
- ✅ **승격(2026-07-27): 쿠키/세션/토큰 m3→4.** 33일 공백 뒤 처음 보는 시나리오(LB 3대 랜덤 로그아웃)에 응용 성공 + **상위 축("상태를 어디에 둘까")을 자력 압축.** network 2개 평균 3.0→3.5. **관찰 대상:** 트레이드오프 **양 날 비대칭 진동**(6-24·7-27 연속으로 한쪽씩만 회수) — 8-26 복습에서 한 호흡에 나오는지가 m5 관문.
- 🔴 회귀 감시(2026-06-24): **Promise.all**이 m4→복습에서 막힘("잘 모름"). 핵심 오해=순차 await에서 "다음 fetch도 이미 시작됐다" 오답. "병렬성=출발 시점(in-flight)"이 안 굳었던 것 → m3·1일 리셋(6-25). 6-25 재점검에서 무힌트 재구성 확인 필요. (3일 만에 m4가 무너짐 → **통합 앵커가 개별 Feynman을 대체하지 못하는 신호**일 수 있음, 관찰.)
- 🟡 **문 두드림(2026-07-27): database·system-design 두 영역이 동시에 노크됨.** 쿠키/세션/토큰 복습 중 "세션 수첩을 공유 저장소로" 해법에서 파생 — ① 사용자가 직접 물음(*"공유 저장소가 DB와 다른 개념이야?"*) → **인메모리(Redis) vs 관계형(MySQL)** = database 영역의 자연스러운 첫 점. ② **SPOF·수평 확장·로드밸런서**를 자력으로 다룸 = system-design 영역의 첫 점. **아직 페이지 없음 — 개념 조각만 쿠키 페이지에 얹혀 있는 상태**(고립 위험은 없으나 제 집이 없음). → backlog 등록, 다음 신규 후보 상위권.
- 여전히 빈 6개 분야: backend·cs·database·devops·ai·system-design. (단 database·system-design은 위처럼 **떡밥이 이미 깔림** — 개방 비용이 낮아짐.)
- network 내 다음 칸: HTTPS/TLS(평문 쿠키 탈취 직결, 1순위), 쿠키 보안(HttpOnly/SameSite/CSRF), JWT 서명 구조, HTTP 메서드 의미론, TCP/IP. → backlog 등록.
- os 내 다음 칸(process-vs-thread 미해결 질문): 락/뮤텍스·데드락, OS 스케줄링·컨텍스트 스위치, SharedArrayBuffer/Atomics.
- frontend 내에서도 "브라우저 동작"만 채워짐. **렌더링·상태관리·성능**은 미착수.
- 코치 제안 다음 후보: ① HTTP 심화(stateless→인증, 백엔드 관문) ② backend 기초(fetch의 반대편) ③ frontend 렌더 파이프라인.
