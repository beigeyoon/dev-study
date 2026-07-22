import matter from 'gray-matter';
import { extractSection } from './parse.js';

// "## 질문코드" 섹션의 첫 코드펜스에서 언어와 코드를 분리.
export function extractCodeBlock(md) {
  const m = md.match(/```(\w*)\n([\s\S]*?)```/);
  if (!m) return { lang: '', code: md.trim() };
  return { lang: m[1] || '', code: m[2].replace(/\n$/, '') };
}

// knowledge/cards/*.md → 구조화된 카드 객체.
export function parseCard({ id, content }) {
  const { data, content: body } = matter(content);
  const { lang, code } = extractCodeBlock(extractSection(body, '질문코드'));
  return {
    id: data.id ?? id.replace(/\.md$/, ''),
    concept: data.concept ?? '',
    domain: data.domain ?? 'unknown',
    label: data.label ?? data.domain ?? 'unknown',
    status: data.status ?? 'draft',
    accent: data.accent ?? 'lime',
    tags: Array.isArray(data.tags) ? data.tags : [],
    code,
    codeLang: lang,
    headline: extractSection(body, '헤드라인'),
    answer: extractSection(body, '정답'),
    why: extractSection(body, '왜'),
    takeaway: extractSection(body, '한줄정리'),
    caption: extractSection(body, '캡션'),
  };
}

// 렌더 대상 여부: draft만 제외.
export function isRenderable(card) {
  return card.status === 'approved' || card.status === 'published';
}
