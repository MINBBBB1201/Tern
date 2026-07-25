/**
 * I5-1 non-destructive checks that need a real browser:
 *   1. affiliate (Travelpayouts) link params survive the locale prefix
 *   2. router.push() from a locale page keeps the prefix — this is the exact
 *      mechanism the post-login redirect in signin/page.tsx uses
 *   3. the language switcher changes the URL and the choice sticks
 *
 * Each check runs in its own incognito context so a cookie set by an earlier
 * check can't make a later one pass for the wrong reason.
 */
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://localhost:3000";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SEARCH = "from=ICN&to=NRT&departureDate=2026-09-15&adults=1&cabinClass=economy";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--enable-webgl", "--use-gl=angle"],
});

async function fresh() {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  return { ctx, page };
}

// ---- 1. affiliate link on the localized booking page -----------------------
for (const prefix of ["", "/ko"]) {
  const { ctx, page } = await fresh();
  await page.goto(`${BASE}${prefix}/booking?${SEARCH}`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await sleep(14000); // live Duffel search
  const hrefs = await page.evaluate(() =>
    [...document.querySelectorAll('a[href*="book.flytern.site"]')].map((a) => a.href)
  );
  console.log(`[affiliate] ${prefix || "(en)"} count=${hrefs.length} first=${hrefs[0] ?? "NONE"}`);
  await ctx.close();
}

// ---- 2. router.push() keeps the locale prefix ------------------------------
// signin/page.tsx does router.push("/") after login with this same
// next-intl useRouter; proving the prefix survives here proves it there.
{
  const { ctx, page } = await fresh();
  await page.goto(`${BASE}/ko`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await sleep(6000);
  console.log("[router] start =", page.url());
  // Reveal the lazy sections so the sample-flight cards exist, then click the
  // one whose onClick is router.push(`/booking?...`).
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 150));
    }
  });
  await sleep(1500);
  const clicked = await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) =>
      (b.innerText || "").trim().includes("지금 예약")
    );
    if (!btn) return false;
    btn.click();
    return true;
  });
  console.log("[router] button found =", clicked);
  await sleep(6000);
  console.log("[router] after router.push =", page.url());
  await ctx.close();
}

// ---- 3. language switcher changes the URL and sticks ----------------------
{
  const { ctx, page } = await fresh();
  await page.goto(`${BASE}/about`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await sleep(4000);
  console.log("[switch] start =", page.url(), "lang=", await page.evaluate(() => document.documentElement.lang));
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) =>
      /^(EN|KO|JA|ZH)$/.test((b.innerText || "").trim())
    );
    btn?.click();
  });
  await sleep(800);
  await page.evaluate(() => {
    const opt = [...document.querySelectorAll("button")].find(
      (b) => (b.innerText || "").trim() === "日本語"
    );
    opt?.click();
  });
  await sleep(5000);
  console.log("[switch] after =", page.url(), "lang=", await page.evaluate(() => document.documentElement.lang));

  // Does the choice stick on a later bare-path visit?
  await page.goto(`${BASE}/about`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await sleep(3000);
  console.log("[switch] revisit /about ->", page.url(), "lang=", await page.evaluate(() => document.documentElement.lang));
  await ctx.close();
}

await browser.close();
