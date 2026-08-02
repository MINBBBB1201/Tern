/** Sweep the sequence clock at 390 so the contrail is judged where it is
 *  actually on screen, not wherever one arbitrary freeze put it.
 *
 *  Accept-Language is pinned (I9). The first run of this probe omitted it and
 *  localeDetection served ko off the machine's system locale — the exact trap
 *  I9 recorded, repeated in a throwaway script. */
import puppeteer from "puppeteer-core";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TIMES = [1400, 2000, 2800, 3600, 4200];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: false,
  defaultViewport: null,
  protocolTimeout: 120000,
  args: ["--window-size=1500,1000", "--hide-scrollbars", "--disable-backgrounding-occluded-windows", "--disable-renderer-backgrounding", "--disable-background-timer-throttling"],
});
const page = await browser.newPage();
await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle0" });
await sleep(2500);
await page.evaluate(() => window.__ternQuality?.set?.("full"));

for (const t of TIMES) {
  // Run from 0 so the trail has real history, then pin at t.
  await page.evaluate(() => window.__ternReplay?.(0));
  await sleep(t);
  await page.evaluate(() => window.__ternFreeze?.());
  await sleep(150);
  await page.screenshot({ path: `docs/screenshots/i12-diag-390-t${t}.png`, clip: { x: 0, y: 56, width: 390, height: 340 } });
  console.log("t=" + t);
}
await browser.close();
