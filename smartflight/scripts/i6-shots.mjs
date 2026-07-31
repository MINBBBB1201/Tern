/**
 * I6 전/후 캡처. `node scripts/i6-shots.mjs before|after`
 *
 * 두 화면을 찍는다:
 *   - booking-order : /booking 상단 (스마트픽 → 결과 → 교통편 순서가 보이게)
 *   - home-flights  : 홈 "Choose Your Perfect Flight" 헤더 (토글 유무)
 *
 * 캡처와 함께 수치도 찍어서, 육안 차이가 애매할 때 근거가 남게 한다.
 */
import puppeteer from "puppeteer-core";

const LABEL = process.argv[2];
if (!["before", "after"].includes(LABEL)) {
  console.error("usage: node scripts/i6-shots.mjs before|after");
  process.exit(1);
}

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://localhost:3000";
const OUT = "docs/screenshots";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SEARCH = "from=ICN&to=NRT&departureDate=2026-09-15&adults=1&cabinClass=economy";

async function pinnedPage(browser) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
  await page.setCookie({ name: "TERN_LOCALE", value: "en", domain: "localhost", path: "/" });
  return { ctx, page };
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--enable-webgl", "--use-gl=angle"],
});

// ── /booking: 순서 ────────────────────────────────────────────────────
{
  const { ctx, page } = await pinnedPage(browser);
  await page.goto(`${BASE}/booking?${SEARCH}`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await sleep(20000);

  const m = await page.evaluate(() => {
    const card = document.querySelector('[id^="flight-card-"]');
    const guide = [...document.querySelectorAll("*")].find(
      (e) => (e.textContent || "").includes("Incheon International Airport") && e.className?.includes?.("glass-panel")
    );
    const pick = [...document.querySelectorAll("button")].find((b) => /CHEAPEST/i.test(b.innerText || ""));
    const top = (el) => (el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : null);
    return {
      viewportH: window.innerHeight,
      firstOfferTop: top(card),
      guideTop: top(guide),
      smartPickCursor: pick ? getComputedStyle(pick).cursor : null,
    };
  });
  console.log(`[${LABEL}] 첫 예약카드 ${m.firstOfferTop}px (${(m.firstOfferTop / m.viewportH).toFixed(2)} 뷰포트분)`);
  console.log(`[${LABEL}] 교통편 섹션 ${m.guideTop}px / 예약카드보다 아래: ${m.guideTop > m.firstOfferTop}`);
  console.log(`[${LABEL}] SmartPick cursor: ${m.smartPickCursor}`);

  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(600);
  await page.screenshot({ path: `${OUT}/i6-${LABEL}-booking-order.png`, fullPage: true });
  await ctx.close();
}

// ── 홈: 항공편 섹션 헤더 ───────────────────────────────────────────────
{
  const { ctx, page } = await pinnedPage(browser);
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await sleep(6000);
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
  });
  await sleep(1500);

  const m = await page.evaluate(() => {
    const h = [...document.querySelectorAll("h2")].find((e) => /Choose Your Perfect Flight/i.test(e.textContent || ""));
    h?.scrollIntoView({ block: "center" });
    return {
      toggleFound: [...document.querySelectorAll("button")].some(
        (b) => b.className.includes("w-12") && b.className.includes("h-6")
      ),
      grayLeak: [...document.querySelectorAll("*")].some((e) => e.className?.includes?.("bg-gray-300")),
    };
  });
  console.log(`[${LABEL}] Show Offers 토글 존재: ${m.toggleFound} / bg-gray-300 잔여: ${m.grayLeak}`);

  await sleep(900);
  await page.screenshot({ path: `${OUT}/i6-${LABEL}-home-flights.png` });
  await ctx.close();
}

await browser.close();
