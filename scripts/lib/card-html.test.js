import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml, highlightJs, emphasizeKeywords, renderCardHtml } from './card-html.js';

test('escapeHtml은 특수문자를 이스케이프', () => {
  assert.equal(escapeHtml('<a> & "b"'), '&lt;a&gt; &amp; &quot;b&quot;');
});

test('highlightJs는 키워드를 kw span으로, 나머지 이스케이프', () => {
  const h = highlightJs('const a = () => 1;');
  assert.match(h, /<span class="kw">const<\/span>/);
  assert.doesNotMatch(h, /<span class="kw">a<\/span>/);
});

test('highlightJs는 꺾쇠를 이스케이프', () => {
  assert.match(highlightJs('a < b'), /a &lt; b/);
});

test('emphasizeKeywords는 **x**를 hl span으로', () => {
  const h = emphasizeKeywords('배낭은 **함수**가 아니라 **호출**');
  assert.match(h, /<span class="hl">함수<\/span>/);
  assert.match(h, /<span class="hl">호출<\/span>/);
  assert.match(h, /배낭은/);
});

test('emphasizeKeywords는 강조 밖 텍스트를 이스케이프', () => {
  assert.match(emphasizeKeywords('a < b **c**'), /a &lt; b/);
});

const CARD = {
  id: 'closure-makecounter-01', concept: 'concepts/closure.md', domain: 'frontend',
  label: 'JS · 클로저', status: 'approved', accent: 'lime', tags: ['closure'],
  code: 'const a = 1;', codeLang: 'js',
  headline: '출력은? 🔥', answer: '1 2 1',
  why: 'a·b는 다른 호출.', takeaway: '배낭은 **호출**이 갖는다',
  caption: '#클로저',
};

test('renderCardHtml(q)는 코드/헤드라인/핸들/치수 포함', () => {
  const html = renderCardHtml(CARD, 'q', { handle: '@yooni_dev' });
  assert.match(html, /^<!doctype html>/i);
  assert.match(html, /1080px/);
  assert.match(html, /1350px/);
  assert.match(html, /출력은\?/);
  assert.match(html, /<span class="kw">const<\/span>/);
  assert.match(html, /@yooni_dev/);
  assert.match(html, /#c2f542/);
  assert.match(html, /정답은 댓글/);
  assert.match(html, /JS · 클로저/);
});

test('renderCardHtml(a)는 정답/한줄정리 강조/핸들 포함, 코드 없음', () => {
  const html = renderCardHtml(CARD, 'a', { handle: '@yooni_dev' });
  assert.match(html, /1 2 1/);
  assert.match(html, /<span class="hl">호출<\/span>/);
  assert.match(html, /@yooni_dev/);
  assert.doesNotMatch(html, /class="kw"/);
});

test('renderCardHtml은 accent를 config.accents로 오버라이드', () => {
  const html = renderCardHtml({ ...CARD, accent: 'cyan' }, 'q', {});
  assert.match(html, /#3ff0e0/);
});
