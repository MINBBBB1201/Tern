/**
 * I4 verification capture: every key screen in every locale, so translation
 * completeness is confirmed visually rather than by grep.
 *
 * Locale is driven by the TERN_LOCALE cookie (i18n/request.ts) — set it
 * directly rather than clicking the switcher, so a failed click can't
 * silently produce four identical English captures.
 */
import puppeteer from "puppeteer-core";

const BASE = "http://localhost:3000";
const OUT = "docs/screenshots";
const LOCALES = ["en", "ko", "ja", "zh"];

const SCREENS = [
  { name: "home-hero", path: "/", full: false },
  // A concrete future date: with no departureDate the page defaults to
  // today, and Duffel has no same-day offers, so the results list renders
  // its empty state instead of real offer cards.
  { name: "booking", path: "/booking?from=ICN&to=NRT&departureDate=2026-09-15&adults=1&cabinClass=economy", full: true, settle: 12000 },
  { name: "guide-icn", path: "/guide/airport/ICN", full: true },
  { name: "about", path: "/about", full: true },
  { name: "signin", path: "/signin", full: false },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--enable-webgl", "--use-gl=angle"],
});

try {
  for (const locale of LOCALES) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    // Cookie must exist before the first server render of each route.
    await page.setCookie({
      name: "TERN_LOCALE",
      value: locale,
      domain: "localhost",
      path: "/",
    });

    for (const screen of SCREENS) {
      // domcontentloaded, not networkidle2: /booking keeps polling the live
      // search API and the hero canvas keeps painting, so the network never
      // actually goes idle — the per-screen settle below is the real wait.
      await page.goto(`${BASE}${screen.path}`, {
        waitUntil: "domcontentloaded",
        timeout: 90000,
      });
      // Hero canvas + scroll reveals need a beat; /booking also waits on the
      // live Duffel search before the offer list exists.
      await sleep(screen.settle ?? 3500);
      if (screen.full) {
        // Trigger the ScrollFX reveals so no section captures mid-fade.
        await page.evaluate(async () => {
          const step = window.innerHeight * 0.8;
          for (let y = 0; y < document.body.scrollHeight; y += step) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 120));
          }
          window.scrollTo(0, 0);
        });
        await sleep(900);
      }
      const file = `${OUT}/i4-${locale}-${screen.name}.png`;
      await page.screenshot({ path: file, fullPage: screen.full });
      console.log("saved", file);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
