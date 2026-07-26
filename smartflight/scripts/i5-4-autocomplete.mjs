/**
 * I5-4 verification: airport autocomplete rows per locale.
 *
 * Checks three things the strategy hinges on:
 *   1. a CURATED airport (ICN) shows verified localized city + airport name
 *   2. a NON-curated airport (ATL) keeps its real dataset name — NOT the
 *      "ATL 공항" placeholder — while its country still localizes via CLDR
 *   3. searching by English text and by IATA code still matches after the
 *      display change (matching stays on the English dataset, server-side)
 */
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://localhost:3000";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--enable-webgl", "--use-gl=angle"],
});

async function rowsFor(locale, query) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  // Pin the locale explicitly. A fresh context still sends the OS
  // Accept-Language, and localeDetection would redirect "/" to "/ko" — which
  // silently made an "en" run report Korean rows on the first attempt.
  await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
  await page.setCookie({ name: "TERN_LOCALE", value: locale, domain: "localhost", path: "/" });
  const prefix = locale === "en" ? "" : `/${locale}`;
  await page.goto(`${BASE}${prefix}/`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await sleep(5000);

  // Open the FROM field and type.
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button.vol-field")][0];
    btn?.click();
  });
  await sleep(500);
  await page.keyboard.down("Control");
  await page.keyboard.press("KeyA");
  await page.keyboard.up("Control");
  await page.type(".vol-inline-input", query, { delay: 40 });
  await sleep(1600);

  const rows = await page.evaluate(() =>
    [...document.querySelectorAll(".glass-panel > div")]
      .map((d) => (d.innerText || "").replace(/\s+/g, " ").trim())
      .filter((t) => /^[A-Z]{3}/.test(t))
      .slice(0, 3)
  );
  await ctx.close();
  return rows;
}

for (const locale of ["en", "ko", "ja", "zh"]) {
  console.log(`\n===== ${locale} =====`);
  console.log("  [curated ICN]      ", JSON.stringify(await rowsFor(locale, "incheon")));
  console.log("  [non-curated ATL]  ", JSON.stringify(await rowsFor(locale, "atlanta")));
  console.log("  [IATA code 'LGW']  ", JSON.stringify(await rowsFor(locale, "LGW")));
}

await browser.close();
