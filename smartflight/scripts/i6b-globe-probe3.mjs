/**
 * I6-b 재현성 확인. probe1의 B는 40.2fps, probe2는 59.9fps를 냈다.
 * 원인 가설: 샘플 창이 tern 진입 시퀀스(ENTRY 800 + ORBIT 3600 + HANDOFF 1400
 * ≈ 5.8s, 이후 AMBIENT_DELAY 1200)에 걸렸는지 여부. 부하가 다른 두 국면을
 * 한 숫자로 뭉갠 것이 문제일 수 있다.
 *
 * → 각 구성마다 6초 창 3개를 연속으로 재고(진입 → 정착), 3회 반복해 분산을 본다.
 */
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://localhost:3000";
const REPS = 3;
const WIN_MS = 6000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function instrument(forceFull) {
  if (forceFull) Object.defineProperty(window, "innerWidth", { get: () => 768, configurable: true });
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

async function once({ forceFull, cpu, dpr }) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  const cdp = await page.createCDPSession();
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: dpr, mobile: true });
  await page.setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1");
  await page.setCookie({ name: "TERN_LOCALE", value: "en", domain: "localhost", path: "/" });
  await page.evaluateOnNewDocument(instrument, forceFull);
  await page.bringToFront();
  await page.goto(`${BASE}/`, { waitUntil: "load", timeout: 120000 });

  for (let i = 0; i < 60; i++) {
    const s = await page.evaluate(() => ({ d: window.__probe.draws, m: document.querySelector(".hero-twilight")?.getAttribute("data-hero-static") }));
    if (s.m === "1" || s.d > 30) break;
    await sleep(300);
  }
  if (cpu > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
  await sleep(300);

  const wins = [];
  for (let w = 0; w < 3; w++) {
    await page.evaluate(() => { const P = window.__probe; P.frames = []; P.draws = 0; P.sampling = true; });
    await sleep(WIN_MS);
    const r = await page.evaluate(() => {
      const P = window.__probe; P.sampling = false;
      const f = P.frames.filter((x) => x > 0 && x < 5000).sort((a, b) => a - b);
      const q = (p) => f[Math.floor(f.length * p)];
      return { fps: q(0.5) ? +(1000 / q(0.5)).toFixed(1) : null, p95: q(0.95) ? +(1000 / q(0.95)).toFixed(1) : null, draws: f.length ? +(P.draws / f.length).toFixed(1) : 0 };
    });
    wins.push(r);
  }
  const canvasPx = await page.evaluate(() => { const c = document.querySelector("canvas"); return c ? `${c.width}x${c.height}` : null; });
  await ctx.close();
  return { wins, canvasPx };
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: false, args: ["--no-sandbox", "--window-size=520,980"] });

const configs = [
  { name: "A. static (현행 모바일)", forceFull: false, cpu: 1, dpr: 3 },
  { name: "B. globe ON, CPU 1x", forceFull: true, cpu: 1, dpr: 3 },
  { name: "C. globe ON, CPU 4x", forceFull: true, cpu: 4, dpr: 3 },
  { name: "E. globe ON, dpr1.5, CPU 4x", forceFull: true, cpu: 4, dpr: 1.5 },
];

for (const c of configs) {
  console.log(`\n══ ${c.name} ══`);
  const all = [[], [], []];
  let px = null;
  for (let r = 0; r < REPS; r++) {
    const { wins, canvasPx } = await once(c);
    px = canvasPx;
    wins.forEach((w, i) => all[i].push(w));
    console.log(`  rep${r + 1}: ` + wins.map((w, i) => `w${i + 1} ${w.fps}fps(p95 ${w.p95}, draws ${w.draws})`).join(" | "));
  }
  console.log(`  canvas=${px}`);
  all.forEach((ws, i) => {
    const f = ws.map((w) => w.fps).filter(Boolean);
    const lo = Math.min(...f), hi = Math.max(...f);
    const avg = (f.reduce((a, b) => a + b, 0) / f.length).toFixed(1);
    console.log(`  창${i + 1} (${i === 0 ? "진입 시퀀스" : i === 1 ? "핸드오프~정착" : "정착 후 ambient"}): FPS ${avg} 평균 (범위 ${lo}–${hi})`);
  });
}
await browser.close();
