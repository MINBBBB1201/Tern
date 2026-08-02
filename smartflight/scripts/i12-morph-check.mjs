/**
 * I12 no-damage check on the bird->ticket morph (§3: the morph must survive
 * the trail rewrite). Phase B is where the old material was worst — the
 * not-yet-emitted tail sat on the pass outline at fade 0 and punched a black
 * dashed rectangle (docs/screenshots/i12-desktop-orbit-before.png).
 * `node scripts/i12-morph-check.mjs`
 */
import puppeteer from "puppeteer-core";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// FLIGHT_MS 4400 + HANDOFF_MS 1400: sample across the crossfade.
const TIMES = [4600, 5000, 5400, 5800];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: false,
  defaultViewport: null,
  protocolTimeout: 120000,
  args: ["--window-size=1500,1000", "--hide-scrollbars", "--disable-backgrounding-occluded-windows", "--disable-renderer-backgrounding"],
});
const page = await browser.newPage();
await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2, isMobile: false });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle0" });
await sleep(2500);
await page.evaluate(() => window.__ternQuality?.set?.("full"));

for (const t of TIMES) {
  await page.evaluate(() => window.__ternReplay?.(0));
  await sleep(t);
  await page.evaluate(() => window.__ternFreeze?.());
  await sleep(150);
  await page.screenshot({ path: `docs/screenshots/i12-morph-t${t}.png`, clip: { x: 760, y: 80, width: 560, height: 260 } });
  console.log("t=" + t);
}
await browser.close();
