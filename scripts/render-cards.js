import { readFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
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
      for (const side of ['q', 'a']) {
        const page = await browser.newPage();
        await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
        await page.setContent(renderCardHtml(card, side, config), { waitUntil: 'load' });
        await page.evaluate(() => document.fonts.ready); // 폰트 로딩 완료까지 대기(실제 promise resolve)
        const out = join(OUT_DIR, `${card.id}-${side}.png`);
        await page.screenshot({ path: out });
        await page.close();
        console.log(`✓ ${card.id}-${side}.png`);
      }
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
