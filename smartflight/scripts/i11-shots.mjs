/**
 * I11 캡처. `node scripts/i11-shots.mjs`
 *
 * tier2(실존하지만 큐레이션 밖) 공항 가이드를 4개 로케일로 찍는다. 안내 문구가
 * 실제로 보이는지, 그리고 tier1 에는 안 붙는지 대조군까지 남긴다.
 *
 * robots 메타는 여기서 검증하지 않는다 — dev 서버는 모든 페이지에 noindex 를
 * 주입하므로 프로덕션 빌드(next start)에서 curl 로 따로 확인해야 한다. (I11)
 *
 * I9 와 같은 이유로 Accept-Language 를 로케일마다 고정한다.
 */
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://localhost:3000";
const OUT = "docs/screenshots";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const TARGETS = [
  ["en-tier2", "/guide/airport/ATL", "en-US,en;q=0.9"],
  ["ko-tier2", "/ko/guide/airport/ATL", "ko-KR,ko;q=0.9"],
  ["ja-tier2", "/ja/guide/airport/ATL", "ja-JP,ja;q=0.9"],
  ["zh-tier2", "/zh/guide/airport/ATL", "zh-CN,zh;q=0.9"],
  ["en-tier1-control", "/guide/airport/ICN", "en-US,en;q=0.9"],
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
  await sleep(500);
  const file = `${OUT}/i11-${label}.png`;
  await page.screenshot({ path: file });
  const notice = await page
    .$eval(".glass-chip.rounded-xl", (el) => el.textContent.trim().slice(0, 40))
    .catch(() => "(안내문 없음)");
  console.log(
    `${label.padEnd(18)} ${path.padEnd(26)} http=${res.status()}  notice="${notice}"  -> ${file}`
  );
  await ctx.close();
}

await browser.close();
