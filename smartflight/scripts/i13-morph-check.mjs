/**
 * I13 no-damage check on the bird->ticket morph (§3), on a PHONE this time.
 * `node scripts/i13-morph-check.mjs`
 *
 * I13 shrinks the settled pass in portrait, which means the contrail's
 * condensation targets — outlinePoint(f, PASS_W, PASS_H) — had to be scaled
 * with it. If they had not been, the trail would crystallise into a rectangle
 * the pass is no longer the size of, and the "one object changing form" beat
 * breaks at exactly the frame it has to hold. The crop is the settle corner
 * at each step of the crossfade.
 *
 * Headful (I6-b/I12), Accept-Language pinned (I9), spin pinned.
 */
import puppeteer from "puppeteer-core";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// FLIGHT_MS 4400 + HANDOFF_MS 1400: sample across the crossfade.
const TIMES = [4600, 5000, 5400, 5800];
const SPIN_PIN = -1.02;

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
await page.evaluate(() => {
  window.__ternQuality?.set?.("full");
  setInterval(() => window.__ternQuality?.set?.("full"), 150);
});

for (const t of TIMES) {
  await page.evaluate(() => window.__ternFreeze?.(-1));
  await page.evaluate(() => window.__ternReplay?.(0));
  await sleep(t);
  await page.evaluate(() => window.__ternFreeze?.());
  await page.evaluate((v) => {
    const s = window.__ternGlobeSpin;
    if (s) s.rotation.y = v;
  }, SPIN_PIN);
  await sleep(180);
  await page.screenshot({ path: `docs/screenshots/i13-390-morph-t${t}.png`, clip: { x: 200, y: 50, width: 190, height: 130 } });
  const st = await page.evaluate(() => window.__ternState?.() ?? null);
  console.log("t=" + t, "passVisible", !!st?.passNdc, "birdOpacity", st ? +(st.glassOpacity / 0.62).toFixed(3) : null);
}
await browser.close();
