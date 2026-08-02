/**
 * I12-1 close-up: crop the contrail region so "smooth curve" is judged at a
 * size where it can actually be judged (§5 — a change that is only visible in
 * the numbers is not a pass). `node scripts/i12-trail-crop.mjs <before|after>`
 */
import puppeteer from "puppeteer-core";

const PHASE = process.argv[2] === "before" ? "before" : "after";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT = "docs/screenshots";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// label, viewport, dpr, crop box (CSS px within the stage)
const CASES = [
  ["390", 390, 844, 3, { x: 0, y: 130, width: 390, height: 300 }],
  ["desktop", 1440, 900, 2, { x: 120, y: 120, width: 700, height: 320 }],
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: false,
  defaultViewport: null,
  protocolTimeout: 120000,
  args: [
    "--window-size=1500,1000",
    "--hide-scrollbars",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
    "--disable-background-timer-throttling",
  ],
});

for (const [label, w, h, dpr, clip] of CASES) {
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
  await page.setViewport({ width: w, height: h, deviceScaleFactor: dpr, isMobile: w < 768, hasTouch: w < 768 });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle0" });
  await sleep(2500);
  await page.evaluate(() => window.__ternQuality?.set?.("full"));
  await sleep(400);
  await page.evaluate(() => window.__ternReplay?.(0));
  await sleep(2400);
  await page.evaluate(() => window.__ternFreeze?.());
  await sleep(150);
  await page.screenshot({
    path: `${OUT}/i12-${label}-trail-${PHASE}.png`,
    clip,
  });
  await page.close();
  console.log(`${label} -> ${OUT}/i12-${label}-trail-${PHASE}.png`);
}

await browser.close();
