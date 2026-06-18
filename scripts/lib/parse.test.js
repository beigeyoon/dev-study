import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractSection, parseConcept, buildGraph } from './parse.js';

const CALL_STACK = `---
title: 콜 스택
type: concept
domain: frontend
status: understood
mastery: 3
importance: 5
related: [concepts/event-loop.md]
---

## 한 줄 정의
함수 호출의 중첩을 추적하는 LIFO 구조.

## 깊은 설명
프레임이 쌓인다.

## 내 파인만 설명 (직접 작성)
- 형제 vs 중첩.

## 미해결 질문
- 클로저?
`;

const EVENT_LOOP = `---
title: 이벤트 루프
domain: frontend
status: understood
mastery: 4
importance: 5
related: [concepts/call-stack.md]
---

## 한 줄 정의
큐에서 작업을 꺼낸다.

## 내 파인만 설명 (직접 작성)
- 마이크로 먼저.
`;

const SEED = `---
title: 상태관리
domain: frontend
status: seed
mastery: 0
importance: 4
related: []
---

## 한 줄 정의
반응성.
`;

test('extractSection은 헤딩 다음~다음 ## 전까지를 반환', () => {
  const body = '## 한 줄 정의\nA\nB\n\n## 깊은 설명\nC';
  assert.equal(extractSection(body, '한 줄 정의'), 'A\nB');
});

test('extractSection은 "(직접 작성)" 접미사가 붙어도 매칭', () => {
  const body = '## 내 파인만 설명 (직접 작성)\n- x\n\n## 미해결 질문\n- y';
  assert.equal(extractSection(body, '내 파인만 설명'), '- x');
});

test('extractSection은 없는 섹션에 빈 문자열', () => {
  assert.equal(extractSection('## 한 줄 정의\nA', '실전 사례'), '');
});

test('parseConcept는 frontmatter와 섹션 HTML을 노드로', () => {
  const n = parseConcept({ id: 'concepts/call-stack.md', content: CALL_STACK });
  assert.equal(n.id, 'concepts/call-stack.md');
  assert.equal(n.title, '콜 스택');
  assert.equal(n.domain, 'frontend');
  assert.equal(n.mastery, 3);
  assert.equal(n.importance, 5);
  assert.deepEqual(n.related, ['concepts/event-loop.md']);
  assert.equal(n.sourcePath, 'knowledge/concepts/call-stack.md');
  assert.match(n.definitionHtml, /LIFO/);
  assert.match(n.feynmanHtml, /형제/);
  assert.doesNotMatch(n.definitionHtml, /깊은 설명/);
});

test('parseConcept 기본값: 누락 필드 보정', () => {
  const n = parseConcept({ id: 'concepts/x.md', content: '---\ntitle: X\n---\n## 한 줄 정의\nA' });
  assert.equal(n.mastery, 0);
  assert.equal(n.importance, 3);
  assert.equal(n.status, 'seed');
  assert.deepEqual(n.related, []);
});

test('buildGraph는 양방향 related를 간선 1개로 중복 제거', () => {
  const { edges } = buildGraph([
    { id: 'concepts/call-stack.md', content: CALL_STACK },
    { id: 'concepts/event-loop.md', content: EVENT_LOOP },
  ]);
  assert.equal(edges.length, 1);
  assert.deepEqual(
    [edges[0].source, edges[0].target].sort(),
    ['concepts/call-stack.md', 'concepts/event-loop.md']
  );
});

test('buildGraph는 status=seed를 isGap', () => {
  const { nodes } = buildGraph([{ id: 'concepts/state.md', content: SEED }]);
  assert.equal(nodes[0].isGap, true);
});

test('buildGraph는 연결 0개를 isGap', () => {
  const orphan = `---\ntitle: 외톨이\ndomain: cs\nstatus: understood\nmastery: 2\nimportance: 2\nrelated: []\n---\n## 한 줄 정의\nA`;
  const { nodes } = buildGraph([{ id: 'concepts/orphan.md', content: orphan }]);
  assert.equal(nodes[0].isGap, true);
});

test('buildGraph는 존재하지 않는 related 대상을 무시하고 경고', () => {
  const { edges, warnings } = buildGraph([{ id: 'concepts/call-stack.md', content: CALL_STACK }]);
  assert.equal(edges.length, 0);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /concepts\/event-loop\.md/);
});
