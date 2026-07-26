/**
 * I5-4 captures: autocomplete rows and the /booking header for a
 * NON-curated airport, per locale.
 *
 * ATL / LGW are deliberately chosen: both are outside the 23 airports we
 * hand-curate, so they exercise the "keep the real dataset name, localize
 * only the country" rule. (The backlog's example list — CDG, GRU, DXB — is
 * wrong: all three ARE curated.)
 */
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://localhost:3000";
const OUT = "docs/screenshots";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--enable-webgl", "--use-gl=angle"],
});

for (const locale of ["en", "ko", "ja", "zh"]) {
  const prefix = locale === "en" ? "" : `/${locale}`;

  // --- autocomplete, non-curated query -------------------------------------
  {
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
    await page.setCookie({ name: "TERN_LOCALE", value: locale, domain: "localhost", path: "/" });
    await page.goto(`${BASE}${prefix}/`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await sleep(6000);
    await page.evaluate(() => document.querySelectorAll("button.vol-field")[0]?.click());
    await sleep(600);
    await page.type(".vol-inline-input", "atlanta", { delay: 40 });
    await sleep(1800);
    await page.screenshot({ path: `${OUT}/i5-4-${locale}-autocomplete-noncurated.png` });
    console.log("saved autocomplete", locale);
    await ctx.close();
  }

  // --- /booking header for a non-curated route ------------------------------
  {
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
    await page.setCookie({ name: "TERN_LOCALE", value: locale, domain: "localhost", path: "/" });
    await page.goto(
      `${BASE}${prefix}/booking?from=ATL&to=LGW&departureDate=2026-09-15&adults=1&cabinClass=economy`,
      { waitUntil: "domcontentloaded", timeout: 120000 }
    );
    await sleep(12000);
    await page.screenshot({ path: `${OUT}/i5-4-${locale}-booking-noncurated.png` });
    console.log("saved booking", locale);
    await ctx.close();
  }
}

await browser.close();
