---
name: card
description: 학습 카드(스레드 발행용) 제작. 파인만 통과 개념에서 간결한 Q+A를 뽑아 knowledge/cards/에 저장하고 렌더한다. `/card <개념>`으로 개념 지정, `/card`만 호출 시 후보 추천. 사용자가 명시 발동할 때만 사용.
---

# /card — 학습 카드 제작

위키 개념을 스레드 발행용 **질문 카드 + 정답 카드**(이미지)로 만든다. 설계 근거: `docs/superpowers/specs/2026-07-22-threads-study-card-publishing-design.md`.

## 발동 모드
- **`/card <개념>`** (예: `/card 클로저`) → 그 개념으로 제작.
- **`/card`** (인자 없음) → 아래 자격 기준으로 **후보 2–4개 추천** → 사용자가 선택.

## 자격 (eligibility)
- 기본: `knowledge/concepts/*.md`의 frontmatter `feynman_passed: true`.
- **추천 모드**: `feynman_passed: true` **AND** `mastery >= 4`만 후보. 이미 `knowledge/cards/`에 해당 concept으로 만든 카드가 있으면 후순위.
- **직접 지정 모드**: 사용자가 이름을 대면 자격 미달이어도 진행하되 **경고 1회**("이거 지금 mastery N/회귀 상태인데 낼래?") 후 사용자 결정 존중.

## 제작 흐름
1. 대상 개념 확정.
2. 그 개념 페이지의 `## 내 파인만 설명`에서 **앵커(상황·코드)** 를 찾아 **간결한 Q+A 초안**을 만든다. 원칙(스펙 §1): 질문 간결, 해설 정수만. 페이지의 회귀로그·복습앵글을 그대로 옮기지 말 것.
3. 다음 6필드를 사용자에게 제안하고 승인받는다:
   - `질문코드`(```lang 코드블록), `헤드라인`, `정답`, `왜`(2줄 이내), `한줄정리`(핵심 키워드에 `**굵게**`), `캡션`(훅+해시태그).
4. 승인되면 `knowledge/cards/<id>.md` 생성. `id` 규칙: **`<오늘날짜>-<concept-slug>-<anchor-slug>`**(예: `2026-07-22-closure-makecounter`). 날짜 prefix로 세션 파일과 동일하게 정렬됨. 파일명 = id. frontmatter: `id, concept, domain, label, status: approved, accent: lime, created:<오늘>, published:(빈값), tags`.
   - `label`은 배지 텍스트(예: `JS · 클로저`).
5. `learning-os/publish-queue.md`의 **approved** 섹션에 카드 추가.
6. 렌더 제안: "`npm run cards` 돌려서 뽑을까?" → 사용자 승인 시 실행. 산출물은 **카드별 폴더** `site/cards/dist/<id>/` 안에 `question.png`·`answer.png`·`caption.txt`(발행용 본문+안내). 폴더 하나 = 스레드 포스트 하나.
7. 개념 페이지 `## 실전 사례`(또는 related)에 카드 역링크는 선택(가벼운 수준).

## 발행 후(사용자가 스레드에 올린 뒤)
- 카드 frontmatter `status: published` + `published: <날짜>`.
- `publish-queue.md`에서 approved→published로 이동.

## 하지 않을 것
- 자동 포스팅 없음(수동 업로드). 페이지 프로즈 자동 추출 없음(코치 큐레이션). 파인만 미통과 개념은 추천하지 않음.
