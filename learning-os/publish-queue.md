# 발행 큐 — 카드 파이프라인

`/card` 스킬이 갱신. 상태 흐름: `draft → approved → published`.
(id = `YYYY-MM-DD-<개념>-<앵커>`. 렌더 산출물은 `site/cards/dist/<id>/`에
question.png·answer.png·caption.txt. rendered는 별도 status가 아니라 폴더 존재로 파생.)

## approved (렌더/발행 대기)
- `2026-07-22-closure-makecounter` — 클로저 makeCounter 출력 · concepts/closure.md
- `2026-07-22-event-loop-order` — 이벤트 루프 출력 순서 · concepts/event-loop.md
- `2026-07-22-promise-all-sequential` — 순차 await vs Promise.all 몇 초 · concepts/promise-all-vs-sequential.md

## published (발행 완료)
- (아직 없음)

## draft (작성 중)
- (아직 없음)
