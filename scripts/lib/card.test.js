import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractCodeBlock, parseCard, isRenderable } from './card.js';

const CARD = `---
id: closure-makecounter-01
concept: concepts/closure.md
domain: frontend
label: JS · 클로저
status: approved
accent: lime
tags: [closure]
---

## 질문코드
\`\`\`js
function makeCounter() {
  let count = 0;
  return () => ++count;
}
\`\`\`

## 헤드라인
출력은? 🔥

## 정답
1 2 1

## 왜
a·b는 다른 호출 → 각자 다른 count.

## 한줄정리
배낭은 **함수**가 아니라 **호출**이 갖는다

## 캡션
정답은 댓글에서 #클로저
`;

test('extractCodeBlock은 언어와 코드를 분리', () => {
  const r = extractCodeBlock('```js\nconst a = 1;\n```');
  assert.equal(r.lang, 'js');
  assert.equal(r.code, 'const a = 1;');
});

test('extractCodeBlock은 펜스 없으면 lang 빈값 + 원문', () => {
  const r = extractCodeBlock('plain text');
  assert.equal(r.lang, '');
  assert.equal(r.code, 'plain text');
});

test('parseCard는 frontmatter와 섹션을 구조화', () => {
  const c = parseCard({ id: 'closure-makecounter-01.md', content: CARD });
  assert.equal(c.id, 'closure-makecounter-01');
  assert.equal(c.concept, 'concepts/closure.md');
  assert.equal(c.domain, 'frontend');
  assert.equal(c.label, 'JS · 클로저');
  assert.equal(c.status, 'approved');
  assert.equal(c.accent, 'lime');
  assert.deepEqual(c.tags, ['closure']);
  assert.equal(c.codeLang, 'js');
  assert.match(c.code, /makeCounter/);
  assert.equal(c.headline, '출력은? 🔥');
  assert.equal(c.answer, '1 2 1');
  assert.match(c.why, /다른 호출/);
  assert.equal(c.takeaway, '배낭은 **함수**가 아니라 **호출**이 갖는다');
  assert.match(c.caption, /#클로저/);
});

test('parseCard 기본값: 누락 필드 보정', () => {
  const c = parseCard({ id: 'x.md', content: '---\ndomain: cs\n---\n## 헤드라인\nHi' });
  assert.equal(c.status, 'draft');
  assert.equal(c.accent, 'lime');
  assert.equal(c.label, 'cs');
  assert.deepEqual(c.tags, []);
  assert.equal(c.headline, 'Hi');
});

test('isRenderable: draft 제외, approved/published 포함', () => {
  assert.equal(isRenderable({ status: 'draft' }), false);
  assert.equal(isRenderable({ status: 'approved' }), true);
  assert.equal(isRenderable({ status: 'published' }), true);
});
