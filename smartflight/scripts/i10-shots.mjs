/**
 * I10 캡처. `node scripts/i10-shots.mjs`
 *
 * 세 가지를 남긴다:
 *   - 존재하지 않는 IATA → 브랜드 404 (ko/en)
 *   - 실존 비큐레이트 공항 → 200 유지, 실제 이름 표시 (before 는 "ATL Airport")
 *
 * I9 와 같은 이유로 Accept-Language 를 로케일마다 고정한다 — localeDetection 이
 * 켜져 있어 접두어 없는 경로가 브라우저 언어를 따라가기 때문.
 */
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://localhost:3000";
const OUT = "docs/screenshots";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const TARGETS = [
  ["en-404-nonexistent", "/guide/airport/ZZZ", "en-US,en;q=0.9"],
  ["ko-404-nonexistent", "/ko/guide/airport/ZZZ", "ko-KR,ko;q=0.9"],
  ["en-uncurated-real", "/guide/airport/ATL", "en-US,en;q=0.9"],
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  defaultViewport: { width: 1280, height: 800 },
});

for (const [label, path, acceptLanguage] of TARGETS) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setExtraHTTPHeaders({ "Accept-Language": acceptLanguage });
  const res = await page.goto(BASE + path, { waitUntil: "networkidle0" });
  await sleep(600);
  const file = `${OUT}/i10-${label}.png`;
  await page.screenshot({ path: file });
  const h1 = await page
    .$eval("h1", (el) => el.textContent.trim())
    .catch(() => "(no h1)");
  console.log(
    `${label.padEnd(20)} ${path.padEnd(26)} http=${res.status()}  h1="${h1}"  -> ${file}`
  );
  await ctx.close();
}

await browser.close();
