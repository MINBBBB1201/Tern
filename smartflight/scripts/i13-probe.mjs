/**
 * I13-0 measurement. `node scripts/i13-probe.mjs [width]`
 *
 * Two questions, both answered in numbers rather than by eye:
 *
 *  (a) what the orbit does on the way round — sampled densely through one
 *      whole revolution, with the tern's SCREEN BOX (not just its centre)
 *      against the hero copy's DOM boxes, so "the lower part of the orbit
 *      looks wrong" becomes a list of frames and an overlap in pixels.
 *  (b) the settled boarding pass against the globe's silhouette, in the same
 *      NDC space, so "slightly overlapping" is a signed distance.
 *
 * One continuous run, polled — no per-sample replay. Freezing between samples
 * would hand back a scene whose wingtrail has a hole where the screenshot
 * pause was, and re-replaying per sample costs a run per frame.
 *
 * Headful (I6-b/I12): headless SwiftShader renders this scene at 2-4fps and
 * the frame governor then demotes the whole hero to the static card mid-run.
 * Accept-Language pinned (I9).
 */
import puppeteer from "puppeteer-core";
import fs from "node:fs";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://localhost:3000";
const OUT = "docs/screenshots";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const WIDTHS = { 390: [390, 844, 3], 360: [360, 800, 3], 414: [414, 896, 2], 1440: [1440, 900, 1] };
const key = process.argv[2] ?? "390";
const [W, H, DPR] = WIDTHS[key];

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

const page = await browser.newPage();
await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
await page.setViewport({ width: W, height: H, deviceScaleFactor: DPR, isMobile: W < 768, hasTouch: W < 768 });
const res = await page.goto(BASE + "/", { waitUntil: "networkidle0" });
await sleep(2500);
await page.evaluate(() => window.__ternQuality?.set?.("full"));
await sleep(400);

const dom = await page.evaluate(() => {
  const r = (sel) => {
    const b = document.querySelector(sel)?.getBoundingClientRect();
    return b ? { l: +b.left.toFixed(1), t: +b.top.toFixed(1), r: +b.right.toFixed(1), b: +b.bottom.toFixed(1) } : null;
  };
  const stage = document.querySelector(".hero-twilight > div.hero-stage")?.getBoundingClientRect();
  return {
    innerH: window.innerHeight,
    stage: stage ? { l: +stage.left.toFixed(1), t: +stage.top.toFixed(1), w: +stage.width.toFixed(1), h: +stage.height.toFixed(1), aspect: +(stage.width / stage.height).toFixed(3) } : null,
    heroH: +(document.querySelector(".hero-twilight")?.getBoundingClientRect().height ?? 0).toFixed(1),
    headline: r("h1.hero-headline"),
    sub: r(".hero-copy p"),
    ticker: r(".hero-copy .route-ticker") ?? r(".route-ticker"),
    search: r(".hero-content form") ?? r("form"),
  };
});

// NDC -> stage pixels. Same conversion I12 used for passNdc.
const S = dom.stage;
const px = (nx, ny) => ({ x: (nx * 0.5 + 0.5) * S.w + S.l, y: (0.5 - ny * 0.5) * S.h + S.t });

// ── (a) one revolution, polled ──
await page.evaluate(() => window.__ternReplay?.(0));
const t0 = Date.now();
const trace = [];
while (Date.now() - t0 < 4600) {
  const st = await page.evaluate(() => {
    const s = window.__ternState?.();
    return s ? { e: s.elapsedMs, orbit: s.orbit, ternNdc: s.ternNdc, globeNdc: s.globeNdc, vis: s.visible, scale: s.scale, q: window.__ternQuality?.get?.() } : null;
  });
  if (st) trace.push(st);
  await sleep(45);
}

const rows = trace
  .filter((s) => s.ternNdc && s.globeNdc)
  .map((s) => {
    const a = px(s.ternNdc.x0, s.ternNdc.y1); // top-left
    const b = px(s.ternNdc.x1, s.ternNdc.y0); // bottom-right
    const gC = px(s.globeNdc.cx, s.globeNdc.cy);
    const gR = { x: s.globeNdc.rx * 0.5 * S.w, y: s.globeNdc.ry * 0.5 * S.h };
    const box = { l: +a.x.toFixed(1), t: +a.y.toFixed(1), r: +b.x.toFixed(1), b: +b.y.toFixed(1) };
    const over = (t) =>
      t && box.r > t.l && box.l < t.r && box.b > t.t && box.t < t.b
        ? +((Math.min(box.r, t.r) - Math.max(box.l, t.l)) * (Math.min(box.b, t.b) - Math.max(box.t, t.t))).toFixed(0)
        : 0;
    return {
      e: s.e,
      ratio: s.orbit?.ratio ?? null,
      box,
      w: +(box.r - box.l).toFixed(1),
      h: +(box.b - box.t).toFixed(1),
      offStageLeft: +Math.max(0, S.l - box.l).toFixed(1),
      offStageRight: +Math.max(0, box.r - (S.l + S.w)).toFixed(1),
      globe: { cx: +gC.x.toFixed(1), cy: +gC.y.toFixed(1), rx: +gR.x.toFixed(1), ry: +gR.y.toFixed(1) },
      onHeadline: over(dom.headline),
      onSub: over(dom.sub),
      onTicker: over(dom.ticker),
      onSearch: over(dom.search),
    };
  });

// ── (b) settled pass vs globe silhouette ──
await page.evaluate(() => window.__ternReplay?.(6200));
await sleep(1200);
await page.evaluate(() => window.__ternFreeze?.());
await sleep(150);
const settled = await page.evaluate(() => window.__ternState?.() ?? null);
await page.screenshot({ path: `${OUT}/i13-diag-${key}-pass.png` });

let passVsGlobe = null;
if (settled?.passNdc && settled?.globeNdc) {
  const g = settled.globeNdc;
  const gC = px(g.cx, g.cy);
  const gRx = g.rx * 0.5 * S.w;
  const gRy = g.ry * 0.5 * S.h;
  const corners = settled.passNdc.map(([x, y]) => px(x, y));
  // Ellipse-normalised radius: <1 is inside the silhouette. The pixel gap is
  // measured along the ray from the globe centre through the corner, which is
  // the direction the eye judges "how close is it to the limb".
  const per = corners.map((c) => {
    const dx = c.x - gC.x;
    const dy = c.y - gC.y;
    const k = Math.hypot(dx / gRx, dy / gRy); // 1 = exactly on the limb
    const rLimb = k > 0 ? Math.hypot(dx, dy) / k : 0;
    return { x: +c.x.toFixed(1), y: +c.y.toFixed(1), k: +k.toFixed(3), gapPx: +(Math.hypot(dx, dy) - rLimb).toFixed(1) };
  });
  const xs = corners.map((c) => c.x);
  const ys = corners.map((c) => c.y);
  passVsGlobe = {
    globe: { cx: +gC.x.toFixed(1), cy: +gC.y.toFixed(1), rx: +gRx.toFixed(1), ry: +gRy.toFixed(1) },
    passBox: { l: +Math.min(...xs).toFixed(1), t: +Math.min(...ys).toFixed(1), r: +Math.max(...xs).toFixed(1), b: +Math.max(...ys).toFixed(1) },
    corners: per,
    minGapPx: +Math.min(...per.map((p) => p.gapPx)).toFixed(1),
    // Closest approach of the whole pass EDGE (not just its corners) to the
    // limb — a rectangle can clear at all four corners and still cut the arc.
    minEdgeGapPx: (() => {
      let best = Infinity;
      for (let i = 0; i < 4; i++) {
        const a = corners[i];
        const b = corners[(i + 1) % 4];
        for (let s = 0; s <= 1; s += 0.01) {
          const x = a.x + (b.x - a.x) * s;
          const y = a.y + (b.y - a.y) * s;
          const dx = x - gC.x;
          const dy = y - gC.y;
          const k = Math.hypot(dx / gRx, dy / gRy);
          const rLimb = k > 0 ? Math.hypot(dx, dy) / k : 0;
          best = Math.min(best, Math.hypot(dx, dy) - rLimb);
        }
      }
      return +best.toFixed(1);
    })(),
  };
}

await browser.close();
const out = { key, viewport: [W, H, DPR], http: res.status(), dom, orbit: rows, passVsGlobe };
fs.writeFileSync(`${OUT}/i13-probe-${key}.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify({ dom, passVsGlobe, samples: rows.length }, null, 2));
