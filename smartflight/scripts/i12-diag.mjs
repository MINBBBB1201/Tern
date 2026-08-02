/**
 * I12-0 diagnosis: reproduce the mobile hero orbit-trail / boarding-pass
 * report at several widths.  `node scripts/i12-diag.mjs`
 *
 * Outputs are DIAGNOSTIC only (i12-diag-*), never reused as pass evidence
 * (I6: a diag capture overwrote a previous round's proof).
 *
 * Determinism:
 *  - quality pinned to "full" so the tier ladder cannot silently swap the
 *    3D pass for the static card mid-capture (I6-b tier system respected,
 *    just not allowed to add noise to a layout diagnosis).
 *  - the sequence clock is driven through __ternReplay/__ternFreeze so the
 *    same animation instant is captured at every width.
 *  - Accept-Language pinned (I9).
 */
import puppeteer from "puppeteer-core";
import fs from "node:fs";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://localhost:3000";
const OUT = "docs/screenshots";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// width, height, dpr, label
const VIEWPORTS = [
  [390, 844, 3, "iphone390"],
  [360, 800, 3, "android360"],
  [414, 896, 2, "iphone414"],
  [1440, 900, 1, "desktop1440"],
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});

const report = [];

for (const [width, height, dpr, label] of VIEWPORTS) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
  await page.setViewport({ width, height, deviceScaleFactor: dpr, isMobile: width < 768, hasTouch: width < 768 });
  const res = await page.goto(BASE + "/", { waitUntil: "networkidle0" });
  await sleep(2500); // textures + first frames

  // Pin the tier so the capture is about layout, not about the ladder.
  const tierBefore = await page.evaluate(() => window.__ternQuality?.get?.() ?? "n/a");
  await page.evaluate(() => window.__ternQuality?.set?.("full"));
  await sleep(600);

  // Measure real frame pacing over 1s (cross-checked against the app's own
  // PerformanceMonitor reading, per the I6-b lesson about rAF samplers).
  const fps = await page.evaluate(
    () =>
      new Promise((resolve) => {
        let n = 0;
        const t0 = performance.now();
        const tick = () => {
          n++;
          if (performance.now() - t0 < 1000) requestAnimationFrame(tick);
          else resolve(+(n / ((performance.now() - t0) / 1000)).toFixed(1));
        };
        requestAnimationFrame(tick);
      })
  );

  const geom = await page.evaluate(() => {
    const hero = document.querySelector(".hero-twilight");
    const canvas = document.querySelector("canvas");
    const hr = hero?.getBoundingClientRect();
    const cr = canvas?.getBoundingClientRect();
    // The drei <View>'s own DOM box — the tracked rect that drives the view
    // camera's aspect. This, not the hero, is the 3D stage.
    const view = [...(hero?.querySelectorAll("div") ?? [])].find((d) => d.style.height !== "");
    const vr = view?.getBoundingClientRect();
    return {
      stage: vr ? { w: +vr.width.toFixed(1), h: +vr.height.toFixed(1), aspect: +(vr.width / vr.height).toFixed(3) } : null,
      hero: hr ? { w: +hr.width.toFixed(1), h: +hr.height.toFixed(1), aspect: +(hr.width / hr.height).toFixed(3) } : null,
      canvas: cr ? { w: +cr.width.toFixed(1), h: +cr.height.toFixed(1) } : null,
      innerW: window.innerWidth,
      innerH: window.innerHeight,
      staticFlag: hero?.getAttribute("data-hero-static") ?? null,
      hasStaticCard: !!document.querySelector(".boarding-pass-static"),
      ticker: document.querySelector(".hero-ticker-route")?.textContent?.trim() ?? null,
    };
  });

  // ---- shot A: mid-orbit (trail crossing the globe) ----
  await page.evaluate(() => window.__ternReplay?.(0));
  await sleep(2400); // ENTRY 800 + ~1600ms into the 3600ms orbit
  await page.evaluate(() => window.__ternFreeze?.());
  await sleep(120);
  const stateOrbit = await page.evaluate(() => window.__ternState?.() ?? null);
  await page.screenshot({ path: `${OUT}/i12-diag-${label}-orbit.png` });

  // ---- shot B: settled boarding pass (Phase C) ----
  await page.evaluate(() => window.__ternReplay?.(6200));
  await sleep(700);
  await page.evaluate(() => window.__ternFreeze?.());
  await sleep(120);
  await page.screenshot({ path: `${OUT}/i12-diag-${label}-pass.png` });

  report.push({ label, width, height, dpr, http: res.status(), tierBefore, fps, ...geom, orbit: stateOrbit?.orbit ?? null });
  await ctx.close();
}

await browser.close();
fs.writeFileSync(`${OUT}/i12-diag-report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
