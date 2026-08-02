/**
 * I12 verification captures. `node scripts/i12-shots.mjs <before|after>`
 *
 * Headful on purpose: headless SwiftShader renders this scene at 2-4fps, and
 * two of the three things under test (contrail grain, trail continuity) are
 * exactly the things a starved frame rate distorts — judging them under
 * software GL would repeat the I6-b mistake of measuring the measurement.
 * The tier is still pinned so the ladder cannot swap in the static card.
 *
 * Accept-Language pinned (I9). Sequence clock pinned via __ternReplay /
 * __ternFreeze so every width is the same animation instant.
 */
import puppeteer from "puppeteer-core";
import fs from "node:fs";

const PHASE = process.argv[2] === "before" ? "before" : "after";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://localhost:3000";
const OUT = "docs/screenshots";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const VIEWPORTS = [
  [390, 844, 3, "390"],
  [360, 800, 3, "360"],
  [414, 896, 2, "414"],
  [1440, 900, 1, "desktop"],
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: false,
  defaultViewport: null,
  protocolTimeout: 120000,
  // Headful Chrome suspends rAF in occluded/backgrounded windows, which both
  // stalls the fps probe and freezes the very animation being captured.
  args: [
    "--window-size=1500,1000",
    "--hide-scrollbars",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
    "--disable-background-timer-throttling",
  ],
});

const report = [];

for (const [width, height, dpr, label] of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
  await page.setViewport({ width, height, deviceScaleFactor: dpr, isMobile: width < 768, hasTouch: width < 768 });
  const res = await page.goto(BASE + "/", { waitUntil: "networkidle0" });
  await sleep(2500);
  await page.evaluate(() => window.__ternQuality?.set?.("full"));
  await sleep(400);

  const fps = await page.evaluate(
    () =>
      new Promise((resolve) => {
        let n = 0;
        const t0 = performance.now();
        // Hard stop as well as the rAF stop: if rAF is suspended the sampler
        // must report that rather than hang the run.
        const bail = setTimeout(() => resolve(+(n / ((performance.now() - t0) / 1000)).toFixed(1)), 4000);
        const tick = () => {
          n++;
          if (performance.now() - t0 < 1000) requestAnimationFrame(tick);
          else {
            clearTimeout(bail);
            resolve(+(n / ((performance.now() - t0) / 1000)).toFixed(1));
          }
        };
        requestAnimationFrame(tick);
      })
  );
  // Cross-check against the app's own frame governor (I6-b: a page-level rAF
  // sampler starves under load and under-reports).
  const monitor = await page.evaluate(() => window.__ternQuality?.monitor?.() ?? null);

  const stage = await page.evaluate(() => {
    // The drei <View>'s own box = the 3D stage (.hero-stage in globals.css).
    const hero = document.querySelector(".hero-twilight");
    const view = hero?.querySelector(':scope > div.hero-stage');
    const r = view?.getBoundingClientRect();
    return r ? { w: +r.width.toFixed(1), h: +r.height.toFixed(1), aspect: +(r.width / r.height).toFixed(3) } : null;
  });

  // ── orbit: contrail crossing the globe ──
  await page.evaluate(() => window.__ternReplay?.(0));
  await sleep(2400);
  await page.evaluate(() => window.__ternFreeze?.());
  await sleep(150);
  await page.screenshot({ path: `${OUT}/i12-${label}-orbit${PHASE === "before" ? "-before" : ""}.png` });

  // ── settled boarding pass ──
  await page.evaluate(() => window.__ternReplay?.(6200));
  await sleep(900);
  await page.evaluate(() => window.__ternFreeze?.());
  await sleep(150);
  const st = await page.evaluate(() => window.__ternState?.() ?? null);
  await page.screenshot({ path: `${OUT}/i12-${label}-pass${PHASE === "before" ? "-before" : ""}.png` });

  // NDC -> stage px. Off-stage is |ndc.x| > 1; this turns that into the
  // margin in real pixels so "fits" is a number, not an impression.
  let pass = null;
  if (st?.passNdc && stage) {
    const xs = st.passNdc.map(([x]) => (x * 0.5 + 0.5) * stage.w);
    const ys = st.passNdc.map(([, y]) => (0.5 - y * 0.5) * stage.h);
    pass = {
      left: +Math.min(...xs).toFixed(1),
      right: +Math.max(...xs).toFixed(1),
      top: +Math.min(...ys).toFixed(1),
      bottom: +Math.max(...ys).toFixed(1),
      marginLeft: +Math.min(...xs).toFixed(1),
      marginRight: +(stage.w - Math.max(...xs)).toFixed(1),
      fitsHorizontally: Math.min(...xs) >= 0 && Math.max(...xs) <= stage.w,
    };
  }

  // Where the hero headline actually is, so "the pass no longer sits on the
  // headline" is checked against the real box rather than by eye.
  const headline = await page.evaluate(() => {
    // h1 specifically: .hero-headline is also on the nav wordmark and on the
    // static pass's "TERN", and querySelector would hand back one of those.
    const h = document.querySelector("h1.hero-headline");
    const r = h?.getBoundingClientRect();
    return r ? { top: +r.top.toFixed(1), bottom: +r.bottom.toFixed(1), left: +r.left.toFixed(1), right: +r.right.toFixed(1) } : null;
  });

  const overlapsHeadline =
    pass && headline
      ? pass.right > headline.left && pass.left < headline.right && pass.bottom > headline.top && pass.top < headline.bottom
      : null;

  report.push({ label, width, height, dpr, http: res.status(), fps, monitor, stage, pass, headline, overlapsHeadline });
  await page.close();
}

await browser.close();
fs.writeFileSync(`${OUT}/i12-${PHASE}-report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
