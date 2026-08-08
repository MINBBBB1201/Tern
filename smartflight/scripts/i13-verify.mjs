/**
 * I13 pass criteria. `node scripts/i13-verify.mjs <before|after>`
 *
 * Runs every width in one pass and writes the two tables the round is judged
 * on:
 *
 *  - boarding pass vs the globe's silhouette: the signed gap in px from the
 *    nearest point of the pass's outline to the limb, plus the margins that
 *    constrain it (stage edge, nav bar). Negative = drawn over the globe.
 *  - the orbit against the hero copy: the tern's screen box through one
 *    pinned revolution, how much of the headline/paragraph it covers, and
 *    how bright it is while it is there.
 *
 * Headful (I6-b/I12), Accept-Language pinned (I9), globe spin pinned so the
 * before/after revolutions are the same flight.
 */
import puppeteer from "puppeteer-core";
import fs from "node:fs";

const PHASE = process.argv[2] === "after" ? "after" : "before";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://localhost:3000";
const OUT = "docs/screenshots";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SPIN_PIN = -1.02;

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
  protocolTimeout: 180000,
  args: [
    "--window-size=1500,1000",
    "--hide-scrollbars",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
    "--disable-background-timer-throttling",
  ],
});

const report = [];

for (const [W, H, DPR, label] of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
  await page.setViewport({ width: W, height: H, deviceScaleFactor: DPR, isMobile: W < 768, hasTouch: W < 768 });
  const res = await page.goto(BASE + "/", { waitUntil: "networkidle0" });
  await sleep(2500);
  // Hold the tier for the whole run. Each freeze+screenshot stalls the
  // renderer for ~200ms, the frame governor reads that as a decline, and
  // three of them fire onFallback -> static, which UNMOUNTS the scene and
  // takes __ternState with it. The first cut of this script lost the second
  // half of two viewports that way: the probe's own cost demoting the thing
  // it was measuring (I6-b, again). Re-asserting is cheap — __setQuality only
  // emits when the value actually changed.
  await page.evaluate(() => {
    window.__ternQuality?.set?.("full");
    window.__ternHoldFull = setInterval(() => window.__ternQuality?.set?.("full"), 150);
  });
  await sleep(400);

  const dom = await page.evaluate(() => {
    const r = (sel) => {
      const b = document.querySelector(sel)?.getBoundingClientRect();
      return b ? { l: +b.left.toFixed(1), t: +b.top.toFixed(1), r: +b.right.toFixed(1), b: +b.bottom.toFixed(1) } : null;
    };
    const s = document.querySelector(".hero-twilight > div.hero-stage")?.getBoundingClientRect();
    return {
      stage: s ? { l: +s.left.toFixed(1), t: +s.top.toFixed(1), w: +s.width.toFixed(1), h: +s.height.toFixed(1), aspect: +(s.width / s.height).toFixed(3) } : null,
      nav: r("nav") ?? r("header"),
      copy: r(".hero-copy"),
      headline: r("h1.hero-headline"),
      sub: r(".hero-copy p"),
    };
  });
  const S = dom.stage;
  const px = (nx, ny) => ({ x: (nx * 0.5 + 0.5) * S.w + S.l, y: (0.5 - ny * 0.5) * S.h + S.t });
  const pinSpin = () =>
    page.evaluate((v) => {
      const s = window.__ternGlobeSpin;
      if (s) s.rotation.y = v;
    }, SPIN_PIN);

  // ── settled pass vs globe ──
  // Retried: a tier change remounts TernSequence, and __ternState is absent
  // for the frame in between.
  let settled = null;
  for (let attempt = 0; attempt < 4 && !settled?.passNdc; attempt++) {
    await page.evaluate(() => window.__ternFreeze?.(-1));
    await page.evaluate(() => window.__ternReplay?.(6200));
    await sleep(1200);
    await page.evaluate(() => window.__ternFreeze?.());
    await pinSpin();
    await sleep(200);
    settled = await page.evaluate(() => window.__ternState?.() ?? null);
  }
  await page.screenshot({ path: `${OUT}/i13-${label}-pass-${PHASE}.png` });

  let pass = null;
  if (settled?.passNdc && settled?.globeNdc) {
    const g = settled.globeNdc;
    const gC = px(g.cx, g.cy);
    const gRx = g.rx * 0.5 * S.w;
    const gRy = g.ry * 0.5 * S.h;
    const corners = settled.passNdc.map(([x, y]) => px(x, y));
    // Closest approach of the pass OUTLINE (sampled along all four edges) to
    // the limb: a rectangle can clear at every corner and still cut the arc.
    let minGap = Infinity;
    for (let i = 0; i < 4; i++) {
      const A = corners[i];
      const B = corners[(i + 1) % 4];
      for (let s = 0; s <= 1; s += 0.005) {
        const x = A.x + (B.x - A.x) * s;
        const y = A.y + (B.y - A.y) * s;
        const dx = x - gC.x;
        const dy = y - gC.y;
        const k = Math.hypot(dx / gRx, dy / gRy);
        if (k > 0) minGap = Math.min(minGap, Math.hypot(dx, dy) - Math.hypot(dx, dy) / k);
      }
    }
    const xs = corners.map((c) => c.x);
    const ys = corners.map((c) => c.y);
    const box = { l: +Math.min(...xs).toFixed(1), t: +Math.min(...ys).toFixed(1), r: +Math.max(...xs).toFixed(1), b: +Math.max(...ys).toFixed(1) };
    pass = {
      globe: { cx: +gC.x.toFixed(1), cy: +gC.y.toFixed(1), r: +gRx.toFixed(1) },
      box,
      w: +(box.r - box.l).toFixed(1),
      h: +(box.b - box.t).toFixed(1),
      gapToLimbPx: +minGap.toFixed(1),
      marginRightPx: +(S.l + S.w - box.r).toFixed(1),
      marginLeftPx: +(box.l - S.l).toFixed(1),
      belowNavPx: dom.nav ? +(box.t - dom.nav.b).toFixed(1) : null,
      aboveHeadlinePx: dom.headline ? +(dom.headline.t - box.b).toFixed(1) : null,
      onScreen: box.l >= S.l && box.r <= S.l + S.w && box.t >= S.t,
    };
  }

  // ── one pinned revolution vs the hero copy ──
  await page.evaluate(() => window.__ternFreeze?.(-1));
  await page.evaluate(() => window.__ternReplay?.(0));
  const steps = [];
  for (let i = 0; i <= 15; i++) steps.push(Math.round((i / 15) * 4400));
  const orbit = [];
  for (const t of steps) {
    // Run forward to t. A remount (tier flip) restarts the sequence, and an
    // overshoot means the clock ran on while the probe was not looking — both
    // are recovered by replaying rather than photographing the wrong frame.
    for (let guard = 0; guard < 200; guard++) {
      const e = await page.evaluate(() => window.__ternState?.()?.elapsedMs ?? -1);
      if (e < 0) {
        await sleep(150);
        continue;
      }
      if (e > t + 500) {
        await page.evaluate(() => window.__ternReplay?.(0));
        await sleep(60);
        continue;
      }
      if (e >= t) break;
      await sleep(Math.min(120, t - e + 10));
    }
    await page.evaluate(() => window.__ternFreeze?.());
    await pinSpin();
    await sleep(170);
    const st = await page.evaluate(() => window.__ternState?.() ?? null);
    const idx = steps.indexOf(t);
    if (label !== "desktop") {
      await page.screenshot({ path: `${OUT}/i13-${label}-orbit-cycle-${String(idx).padStart(2, "0")}-${PHASE}.png` });
    }
    let box = null;
    if (st?.ternNdc) {
      const A = px(st.ternNdc.x0, st.ternNdc.y1);
      const B = px(st.ternNdc.x1, st.ternNdc.y0);
      box = { l: +A.x.toFixed(1), t: +A.y.toFixed(1), r: +B.x.toFixed(1), b: +B.y.toFixed(1) };
    }
    const over = (tg) =>
      box && tg && box.r > tg.l && box.l < tg.r && box.b > tg.t && box.t < tg.b
        ? +((Math.min(box.r, tg.r) - Math.max(box.l, tg.l)) * (Math.min(box.b, tg.b) - Math.max(box.t, tg.t))).toFixed(0)
        : 0;
    const area = (tg) => (tg ? (tg.r - tg.l) * (tg.b - tg.t) : 1);
    orbit.push({
      step: idx,
      t,
      ratio: st?.orbit?.ratio ?? null,
      box,
      // What the eye actually judges: how much of the text box the bird
      // covers, and how bright the bird is while it is covering it.
      headlinePct: +((100 * over(dom.headline)) / area(dom.headline)).toFixed(1),
      subPct: +((100 * over(dom.sub)) / area(dom.sub)).toFixed(1),
      birdOpacity: st?.glassOpacity != null ? +(st.glassOpacity / 0.62).toFixed(3) : null,
    });
    await page.evaluate(() => window.__ternFreeze?.(-1));
  }

  report.push({ label, viewport: [W, H, DPR], http: res.status(), dom, pass, orbit });
  console.log(
    label,
    "gapToLimb", pass?.gapToLimbPx,
    "passW", pass?.w,
    "marginR", pass?.marginRightPx,
    "belowNav", pass?.belowNavPx,
    "| worst headline%", Math.max(...orbit.map((o) => o.headlinePct)),
    "worst sub%", Math.max(...orbit.map((o) => o.subPct)),
    "| min birdOpacity over copy",
    Math.min(...orbit.filter((o) => o.subPct > 5 || o.headlinePct > 5).map((o) => o.birdOpacity ?? 1))
  );
  await page.close();
}

await browser.close();
fs.writeFileSync(`${OUT}/i13-verify-${PHASE}.json`, JSON.stringify(report, null, 2));
