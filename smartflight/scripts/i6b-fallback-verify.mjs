/**
 * I6-b2 검증: 적응형 품질 폴백이 실제로 작동하는가.
 *
 *  1) 모바일(390x844)에서 globe 가 실제로 뜨는가 — 하드 컷오프 제거 확인
 *  2) dpr 캡 1.5 가 캔버스 픽셀에 반영됐는가
 *  3) CPU 스로틀을 걸면 PerformanceMonitor 가 티어를 떨어뜨리는가
 *       4x → lite 이하,  6x → static 까지
 *  4) static 으로 떨어지면 히어로가 보딩패스 카드로 폴백하는가
 *  5) prefers-reduced-motion 은 여전히 WebGL 자체를 끄는가
 *
 * usage: node scripts/i6b-fallback-verify.mjs
 */
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://localhost:3000";
const OUT = "docs/screenshots";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function instrument() {
  const P = { draws: 0, frames: [], sampling: false };
  window.__probe = P;
  const hook = (proto) => {
    if (!proto) return;
    for (const n of ["drawElements", "drawArrays", "drawElementsInstanced", "drawArraysInstanced"]) {
      const o = proto[n];
      if (o) proto[n] = function (...a) { P.draws++; return o.apply(this, a); };
    }
  };
  hook(window.WebGLRenderingContext && WebGLRenderingContext.prototype);
  hook(window.WebGL2RenderingContext && WebGL2RenderingContext.prototype);
  let last = performance.now();
  const tick = (t) => { if (P.sampling) P.frames.push(t - last); last = t; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}

async function mkPage(browser, { reduced = false, dpr = 3, width = 390, height = 844 } = {}) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  const cdp = await page.createCDPSession();
  await cdp.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: dpr, mobile: width < 768 });
  if (reduced) await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await page.setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1");
  await page.setCookie({ name: "TERN_LOCALE", value: "en", domain: "localhost", path: "/" });
  await page.evaluateOnNewDocument(instrument);
  await page.bringToFront();
  return { ctx, page, cdp };
}

async function state(page) {
  return page.evaluate(() => {
    const c = document.querySelector("canvas");
    return {
      tier: window.__ternQuality?.get?.() ?? "n/a",
      mon: window.__ternQuality?.monitor?.() ?? null,
      heroStatic: document.querySelector(".hero-twilight")?.getAttribute("data-hero-static") ?? null,
      staticCard: !!document.querySelector(".boarding-pass-static-wrap"),
      canvas: c ? `${c.width}x${c.height}` : null,
      canvasCss: c ? `${Math.round(c.getBoundingClientRect().width)}x${Math.round(c.getBoundingClientRect().height)}` : null,
    };
  });
}

async function sample(page, ms) {
  await page.evaluate(() => { const P = window.__probe; P.frames = []; P.draws = 0; P.sampling = true; });
  await sleep(ms);
  return page.evaluate(() => {
    const P = window.__probe; P.sampling = false;
    const f = P.frames.filter((x) => x > 0 && x < 5000).sort((a, b) => a - b);
    const med = f[Math.floor(f.length / 2)];
    return { fps: med ? +(1000 / med).toFixed(1) : null, draws: f.length ? +(P.draws / f.length).toFixed(1) : 0, n: f.length };
  });
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: false, args: ["--no-sandbox", "--window-size=520,980"] });

// ── 1+2: 모바일에서 globe 가 뜨는가 / dpr 캡 ─────────────────────────
{
  const { ctx, page } = await mkPage(browser);
  await page.goto(`${BASE}/`, { waitUntil: "load", timeout: 120000 });
  for (let i = 0; i < 60; i++) { if ((await page.evaluate(() => window.__probe.draws)) > 30) break; await sleep(300); }
  await sleep(4000);
  const s = await state(page);
  const m = await sample(page, 6000);
  console.log("\n[1] 모바일 390x844 (CPU 1x, 스로틀 없음)");
  console.log(`   tier=${s.tier}  heroStatic=${s.heroStatic}  globe=${s.heroStatic === null ? "표시됨" : "없음"}`);
  console.log(`   canvas=${s.canvas} (css ${s.canvasCss})  → dpr 실효 ${s.canvas ? (parseInt(s.canvas) / parseInt(s.canvasCss)).toFixed(2) : "?"}`);
  console.log(`   FPS ${m.fps}  draws/frame ${m.draws}`);
  await page.screenshot({ path: `${OUT}/i6b-after-mobile-globe.png` });
  await ctx.close();
}

// ── 3+4: 스로틀 → 폴백 ────────────────────────────────────────────────
for (const rate of [4, 6]) {
  const { ctx, page, cdp } = await mkPage(browser);
  await page.goto(`${BASE}/`, { waitUntil: "load", timeout: 120000 });
  for (let i = 0; i < 60; i++) { if ((await page.evaluate(() => window.__probe.draws)) > 30) break; await sleep(300); }
  await sleep(3000);
  const before = await state(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate });

  // onChange 는 factor 가 바뀔 때만 불린다. 그래서 mon.fps 는 "마지막 변화
  // 시점"의 값이지 현재값이 아니다 — 현재 fps 는 자체 rAF 샘플러로 잰다.
  const timeline = [];
  for (let t = 0; t < 14; t++) {
    const live = await sample(page, 900);
    const s = await state(page);
    timeline.push(`${s.tier}@${live.fps}fps`);
    if (s.tier === "static") break;
  }
  const after = await state(page);
  const m = await sample(page, 5000);
  console.log(`\n[3] CPU ${rate}x 스로틀`);
  console.log(`   스로틀 전 tier=${before.tier}`);
  console.log(`   티어 추이: ${timeline.join(" → ")}`);
  console.log(`   최종 tier=${after.tier}  heroStatic=${after.heroStatic}  보딩패스카드=${after.staticCard}`);
  console.log(`   canvas=${after.canvas}  폴백 후 FPS ${m.fps}  draws/frame ${m.draws}`);
  await page.screenshot({ path: `${OUT}/i6b-after-fallback-cpu${rate}x.png` });
  await ctx.close();
}

// ── 5: reduced-motion 안전망 ──────────────────────────────────────────
{
  const { ctx, page } = await mkPage(browser, { reduced: true });
  await page.goto(`${BASE}/`, { waitUntil: "load", timeout: 120000 });
  await sleep(6000);
  const s = await state(page);
  const m = await sample(page, 4000);
  console.log("\n[5] prefers-reduced-motion: reduce");
  console.log(`   canvas=${s.canvas ?? "없음(WebGL 미생성)"}  heroStatic=${s.heroStatic}  보딩패스카드=${s.staticCard}  draws/frame ${m.draws}`);
  await ctx.close();
}

await browser.close();
