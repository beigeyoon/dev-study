import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer';
import { parseCard, isRenderable } from './lib/card.js';
import { renderCardHtml } from './lib/card-html.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CARDS_DIR = join(ROOT, 'knowledge', 'cards');
const OUT_DIR = join(ROOT, 'site', 'cards', 'dist');
const CONFIG_PATH = join(CARDS_DIR, 'cards.config.json');

function loadConfig() {
  if (!existsSync(CONFIG_PATH)) return {};
  const c = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
  if (c.fonts) {
    for (const k of Object.keys(c.fonts)) {
      if (c.fonts[k]) c.fonts[k] = pathToFileURL(resolve(CARDS_DIR, c.fonts[k])).href;
    }
  }
  return c;
}

function loadCards() {
  if (!existsSync(CARDS_DIR)) return [];
  return readdirSync(CARDS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => parseCard({ id: f, content: readFileSync(join(CARDS_DIR, f), 'utf8') }));
}

// 발행 시 그 폴더 하나만 열면 되도록: 본문 캡션 + 발행 순서 안내.
function captionFile(card) {
  return [
    '━━ 질문 포스트 본문 ━━',
    card.caption,
    '',
    '━━ 발행 방법 ━━',
    '1. 질문 포스트: question.png 첨부 + 위 본문 붙여넣기',
    '2. 자기 답글: answer.png 첨부 (정답)',
    '',
  ].join('\n');
}

async function main() {
  const config = loadConfig();
  const cards = loadCards().filter(isRenderable);
  if (!cards.length) {
    console.log('렌더할 approved 카드 없음.');
    return;
  }
  mkdirSync(OUT_DIR, { recursive: true });
  // chrome-headless-shell 사용(전체 chrome 대신) — 렌더 전용이라 충분하고, 다운로드도 가벼움.
  const browser = await puppeteer.launch({ headless: 'shell' });
  try {
    for (const card of cards) {
      // 카드 1장 = 자기 폴더 하나(질문·정답 이미지 + 발행용 캡션).
      const cardDir = join(OUT_DIR, card.id);
      mkdirSync(cardDir, { recursive: true });
      for (const [side, name] of [['q', 'question'], ['a', 'answer']]) {
        const page = await browser.newPage();
        await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
        await page.setContent(renderCardHtml(card, side, config), { waitUntil: 'load' });
        await page.evaluate(() => document.fonts.ready); // 폰트 로딩 완료까지 대기(실제 promise resolve)
        await page.screenshot({ path: join(cardDir, `${name}.png`) });
        await page.close();
      }
      writeFileSync(join(cardDir, 'caption.txt'), captionFile(card));
      console.log(`✓ ${card.id}/ (question.png · answer.png · caption.txt)`);
    }
  } finally {
    await browser.close();
  }
  console.log(`완료: 카드 ${cards.length}장 → ${OUT_DIR}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
