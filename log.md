# 로그

append-only 연대기. 파싱 가능한 접두사: `## [YYYY-MM-DD] <type> | <설명>`
type: ingest | session | query | lint | gaps

## [2026-06-17] init | 위키 구축 시작
## [2026-06-17] ingest | 이벤트 루프 (시드 예시)
## [2026-06-17] session | 이벤트 루프 파인만 통과 (mastery 2→3, feynman_passed) · 연결 개념 2개 seed 제안
## [2026-06-17] ingest | 콜 스택 · 매크로태스크 큐 · 마이크로태스크 큐 (이벤트 루프 끊긴 연결 3개 해소)
## [2026-06-17] session | 콜 스택 + 큐/Web API 모델 파인만 통과 (3개 신규 understood, mastery 3) · 이벤트 루프 3→4
## [2026-06-18] session | 지식 그래프 시각화 사이트 구축 — frontmatter→graph.json 빌드 + Cytoscape 렌더 + 클릭 패널 + GitHub Pages 자동 배포 (main 병합 완료)
## [2026-06-18] session | async/await 파인만 통과 (신규 understood, mastery 3) — 오해 3개(동기 머리·마이크로 vs 매크로·상수 통과) 교정 · 마이크로큐 미해결 질문 해소 · 4개와 양방향 연결
## [2026-06-18] session | Promise.all 병렬 vs 순차 await (신규 understood, mastery 4) — 평가순서·동시성≠병렬성·CPU 경계(Web Worker 전이)까지 추론 도달 · 5개와 양방향 연결
## [2026-06-19] ingest | Promise (신규 understood, mastery 3, feynman 통과) — ⭐선행 누락분 해소 · 상태 3종(동사 resolve vs 명사 fulfilled)·인자 전달·executor·백그라운드 일꾼이 누름·.then 등록 vs 큐 진입·상태 기억으로 타이밍 경쟁 해방까지 추론 재구성 · 오해 3개 교정 · 기존 5개와 양방향 연결
## [2026-06-19] session | 복습 — async/await(⚠️매크로/마이크로 회귀→자력 회복, review_due 1일 리셋, m3 유지) · Promise 토대 재다지기(상자 모델 자기말 재구성, promise.md 박제) · Promise.all 복습은 다음 세션 1순위로 보류
## [2026-06-21] session | Promise.all 자력 재구성(체감상 첫 세션) — "시계 찍기"로 버전 C=1초·CPU=3초 자력 도출 · 병렬성 범인=in-flight(호출 시점)이지 Promise.all 아님 · 동시성vs병렬성 1차 원리(기다림은 Web API가 떠안음→I/O만 겹침)·Web Worker 전이 · fail-fast(all) vs allSettled 학습 · feynman 재통과, m4 정당화, review_due→6-24
## [2026-06-21] session | async/await 회귀 점검 — `1 3 5 4 2` 앵커에서 micro(4)<macro(2) 즉답, ✅회귀 없음(두 번 무너진 자리 굳음), review_due→6-24
## [2026-06-21] ingest | 클로저 (신규 understood, m3, feynman 통과) — 콜 스택 미해결 질문에서 출발 · 모순(프레임 pop됐는데 콜백이 변수 읽음)→힙 대피로 자력 도출 · "변수 수명=도달 가능성" · makeCounter 상태유지로 전이(비동기→동기) · 콜 스택 미해결 질문 해소 + call-stack/async-await/macrotask 양방향 연결
## [2026-06-22] session | 복습 — Promise(1순위 carry-over 첫 직접 점검: executor 동기 타이밍 빈칸을 C 위치 오답→fetch/new Promise(fn) 추론으로 자력 교정 `A B C D X`, .then 2단계(등록→settled시 마이크로큐) 재확인, m3 유지·review_due→6-25) · 클로저(첫 간격: makeBank로 "배낭=호출 소유"+수명=도달가능성+힙+GC 회수 무힌트 재구성, m3→4·review_due→6-25)
## [2026-06-22] ingest | HTTP (신규 learning, m2, feynman 미통과) — ⭐첫 non-frontend 영역(network) 개방 · fetch 한 줄에서 "서버 입장에서 뭐가 필요한가" 추론으로 요청/응답 3층(시작줄/헤더/바디)·method=동사 vs path=명사·status code 첫 자리 분류 도출 · fetch가 404에도 resolve(답장 도착=네트워크 성공) 함정으로 Promise 사슬과 접합 · promise/async-await/event-loop 양방향 연결
## [2026-06-23] session | HTTP 복습(첫 간격) — ✅feynman 통과, learning→understood, m2→3, review_due→6-26 · 요청 3층 무힌트 자력 재구성(어제 유도받던 헤더를 오늘 자력) · GET 바디 "비움" 스스로 정정 · **`Host` 헤더를 1차 원리로 도출**(시작줄엔 path만, URL 도메인 빠짐→버추얼 호스팅, 택배 회사명 비유) · fetch 404 함정 양방향(fulfilled=답장 도착 / reject=답장 자체 불가, `if(!res.ok)`)
## [2026-06-23] ingest | 쿠키/세션/토큰 (신규 learning, m2, feynman 미통과) — ⭐network 2번째 점 · HTTP stateless 떡밥의 직접 후속 · "두 번째 요청이 나를 어떻게 증명?"→헤더에 신분증=쿠키 자력 도출(오늘 3층 즉시 활용)·출처=`Set-Cookie`/운반=브라우저 자동 `Cookie` · 세션(서버 기억=stateful, 무효화 쉬움) vs 토큰(정보가 토큰에=stateless, 확장 쉬움) "누가 상태 기억하나" 축 자력 압축 · 트레이드오프(확장↔무효화 둘 다 못 가짐)+하이브리드+실사용 예시 · ⚠️토큰 무효화는 막힘(학습 신호)·압축에서 토큰 대가 빠뜨린 비대칭 보강 · HTTP 양방향 연결
## [2026-06-23] ingest | 프로세스 vs 스레드 (신규 learning, m2, feynman 미통과) — ⭐os 영역 개방(사용자 요청 "안 다룬 카테고리") · "JS 싱글스레드"의 밑바닥 · 프로세스=격리된 자기 메모리 / 스레드=프로세스 안 실행 흐름·메모리 공유 자력 도출 · race condition 3단계(읽기/계산/쓰기) 인터리빙을 혼자 트레이스해 balance=70·유실·비결정적까지 도출 · "싱글스레드=race 면제 선물" reframe · Web Worker 복사=race 회피 격리 자력 연결(며칠 전 떡밥 해소) · 콜스택·이벤트루프·Promise.all 양방향 연결
## [2026-06-24] session | 복습 폭탄일(due 8개) — frontend 비동기 클러스터 6개 통합 앵커(출력순서 `A·D·F·C·E·B` 무힌트 정답, 등록순서·micro싹/macro1개·await분할까지 정확) + 신규 2개 파인만. ✅클러스터 5개(이벤트루프·콜스택·async/await·micro·macro) 견고→review_due 7-01 · ⚠️**Promise.all 회귀**: "잘 모름"으로 막힘(m4→자력 실패), 핵심 오해=순차 `await a;await b`에서 "b도 이미 시작" 오답 → await가 다음 줄 호출 자체를 막음(2초) 단계 유도 회복; **재각인=병렬성은 출발 시점(in-flight)이지 Promise.all도 await 개수도 아님**; 사용자 스스로 ①분리호출2개=Promise.all 타이밍 동일·차이는 fail-fast/unhandled rejection ②동시출발=호스트가 네트워크 대기 떠안아 겹침 발의·자가도출; m4→3·1일 리셋(6-25) · ✅쿠키/세션/토큰 feynman 통과(learning→understood,m2→3): stateless→쿠키→세션vs토큰→트레이드오프 골격 무힌트, 지난번 빠뜨린 토큰 무효화 약점 자력 회수·이번엔 토큰 강점(확장성)은 유도 · ✅프로세스/스레드 feynman 통과(learning→understood,m2→3): race 3단계 비결정적(70/150) 자력 트레이스, capstone "싱글스레드=race 면제 선물·대가=병렬 포기, 동시성은 이벤트 루프 유지" 자력 · ⭐**정밀 질문 사용자 자력 발의**: "콜 스택 가진 주체=누구?(언어?엔진?호스트?)"→언어(ECMAScript=사양)/엔진(V8=코드실행 스레드1=콜스택1)/호스트(브라우저·Node=엔진 임베드+API+이벤트루프+I/O 스레드) 3층 + "이벤트 루프·setTimeout·fetch는 엔진 아닌 호스트 제공" 정밀화(process 페이지 박제)
