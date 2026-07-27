# 발행 큐 — 카드 파이프라인

`/card` 스킬이 갱신. 상태 흐름: `draft → approved → published`.
(id = `YYYY-MM-DD-<개념>-<앵커>`. 렌더 산출물은 `site/cards/dist/<id>/`에
question.png·answer.png·caption.txt. rendered는 별도 status가 아니라 폴더 존재로 파생.)

## approved (렌더/발행 대기)
- (없음)

## published (발행 완료)
- `2026-07-22-promise-all-sequential` — 순차 await vs Promise.all 몇 초 · concepts/promise-all-vs-sequential.md
  - **2026-07-27 발행** (스레드 1호). 주제 `자바스크립트`, 본문 해시태그 없음, 2단계(질문 → 바로 정답 답글 + "Promise.all이 빨라서가 아니다" 멘트).

## draft (작성 중)
- (아직 없음)
