/**
 * I6 검증: 세 변경이 실제로 먹었는지 브라우저에서 측정.
 *  a) 첫 예약 카드까지의 스크롤 거리 (기준: 변경 전 901px = 뷰포트 1.00개분)
 *  b) SmartPickCard 커서 + 클릭 시 정렬/스크롤이 여전히 동작하는지
 *  c) 홈에서 Show Offers 토글이 사라졌는지
 *  d) ScrollFX 리빌이 이동 후에도 동작하는지 (교통편 카드가 보이는지)
 */
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://localhost:3000";
const OUT = "docs/screenshots";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SEARCH = "from=ICN&to=NRT&departureDate=2026-09-15&adults=1&cabinClass=economy";

/** 로케일을 명시적으로 고정한다. 안 하면 OS의 Accept-Language 때문에
 *  "/" 가 "/ko" 로 리다이렉트되어 영문 셀렉터가 전부 빗나간다. */
async function pinnedPage(browserRef, locale = "en") {
  const ctx = await browserRef.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
  await page.setCookie({ name: "TERN_LOCALE", value: locale, domain: "localhost", path: "/" });
  return { ctx, page };
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--enable-webgl", "--use-gl=angle"],
});

// ── a/b/d: /booking ────────────────────────────────────────────────────
{
  const { ctx, page } = await pinnedPage(browser);
  await page.goto(`${BASE}/booking?${SEARCH}`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await sleep(15000);

  const before = await page.evaluate(() => {
    const card = document.querySelector('[id^="flight-card-"]');
    const pick = [...document.querySelectorAll("button")].find((b) => /CHEAPEST/i.test(b.innerText || ""));
    const guide = [...document.querySelectorAll("*")].find((e) =>
      (e.textContent || "").includes("Incheon International Airport") && e.className?.includes?.("glass-panel")
    );
    return {
      viewportH: window.innerHeight,
      firstOfferTop: card ? Math.round(card.getBoundingClientRect().top + window.scrollY) : null,
      smartPickCursor: pick ? getComputedStyle(pick).cursor : null,
      guideTop: guide ? Math.round(guide.getBoundingClientRect().top + window.scrollY) : null,
      sortValue: document.querySelector("select")?.value ?? null,
    };
  });
  console.log("[a] 첫 예약카드:", before.firstOfferTop, "px =", (before.firstOfferTop / before.viewportH).toFixed(2), "뷰포트분  (변경 전 901px / 1.00)");
  console.log("[b] SmartPick cursor:", before.smartPickCursor);
  console.log("[a] 교통편 섹션 위치:", before.guideTop, "px  (예약카드보다 아래여야 함:", before.guideTop > before.firstOfferTop, ")");
  console.log("[b] 클릭 전 정렬값:", before.sortValue);

  // SmartPick 클릭 → 정렬 변경 + 스크롤 동작 확인
  await page.evaluate(() => {
    const pick = [...document.querySelectorAll("button")].find((b) => /CHEAPEST/i.test(b.innerText || ""));
    pick?.click();
  });
  await sleep(2500);
  const after = await page.evaluate(() => ({
    sortValue: document.querySelector("select")?.value ?? null,
    scrollY: Math.round(window.scrollY),
  }));
  console.log("[b] 클릭 후 정렬값:", after.sortValue, "/ scrollY:", after.scrollY, "(0이 아니면 스크롤 동작)");

  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(800);
  await page.screenshot({ path: `${OUT}/i6-after-booking-order.png`, fullPage: true });
  await ctx.close();
}

// ── c: 홈에서 토글 제거 확인 ───────────────────────────────────────────
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
  await sleep(1200);
  const m = await page.evaluate(() => ({
    toggleFound: [...document.querySelectorAll("button")].some(
      (b) => b.className.includes("w-12") && b.className.includes("h-6")
    ),
    grayLeak: [...document.querySelectorAll("*")].some((e) => e.className?.includes?.("bg-gray-300")),
  }));
  console.log("[c] Show Offers 토글 존재:", m.toggleFound, "/ bg-gray-300 잔여:", m.grayLeak);
  await ctx.close();
}

await browser.close();
