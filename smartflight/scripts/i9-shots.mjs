/**
 * I9 404 캡처. `node scripts/i9-shots.mjs`
 *
 * 4개 로케일의 garbage 경로를 찍는다. 상태 코드도 함께 기록한다 —
 * 브랜드 404 처럼 보이지만 200 을 주는 가짜 해결책과 구분하기 위해서다.
 */
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://localhost:3000";
const OUT = "docs/screenshots";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Accept-Language 을 로케일마다 고정한다. localeDetection 이 켜져 있어서
 * (routing.ts 참조 — Duffel 복귀 경로 때문에 의도적으로 켠 것) 이걸 고정하지
 * 않으면 접두어 없는 `/nope-404` 가 크롬의 시스템 언어로 리다이렉트되고,
 * en 캡처에 한국어가 찍힌다. 실제로 첫 시도에서 그렇게 나왔다.
 */
const TARGETS = [
  ["en", "/nope-404", "en-US,en;q=0.9"],
  ["ko", "/ko/nope-404", "ko-KR,ko;q=0.9"],
  ["ja", "/ja/nope-404", "ja-JP,ja;q=0.9"],
  ["zh", "/zh/nope-404", "zh-CN,zh;q=0.9"],
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  defaultViewport: { width: 1280, height: 800 },
});

for (const [locale, path, acceptLanguage] of TARGETS) {
  // 로케일마다 새 컨텍스트 — 쿠키가 다음 캡처로 새지 않게.
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setExtraHTTPHeaders({ "Accept-Language": acceptLanguage });
  const res = await page.goto(BASE + path, { waitUntil: "networkidle0" });
  await sleep(600);
  const file = `${OUT}/i9-${locale}-404.png`;
  await page.screenshot({ path: file });
  const h1 = await page
    .$eval("h1", (el) => el.textContent.trim())
    .catch(() => "(no h1)");
  console.log(
    `${locale.padEnd(2)} ${path.padEnd(16)} http=${res.status()}  url=${page.url().replace(BASE, "")}  h1="${h1}"  -> ${file}`
  );
  await ctx.close();
}

await browser.close();
