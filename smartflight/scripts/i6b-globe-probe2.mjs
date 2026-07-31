/**
 * I6-b 추가 진단 2건.
 *  1) 텍스처 35.8MB가 일회성 업로드인가, 매 프레임 재업로드인가?
 *     → 10초 창을 두 번 연속 재서 2번째 창의 증가분을 본다.
 *  2) frameloop="always" 라서 히어로를 지나쳐 스크롤한 뒤에도 계속 그리는가?
 *     → 페이지 최하단으로 스크롤한 뒤 draw call / FPS 재측정.
 *     (배터리 관점에서 이게 히어로 자체 비용보다 클 수 있다)
 */
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://localhost:3000";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function instrument() {
  Object.defineProperty(window, "innerWidth", { get: () => 768, configurable: true });
  const P = { draws: 0, texBytes: 0, frames: [], sampling: false };
  window.__probe = P;
  const hook = (proto) => {
    if (!proto) return;
    for (const [n, ci] of [["drawElements", 1], ["drawArrays", 2], ["drawElementsInstanced", 1], ["drawArraysInstanced", 2]]) {
      const o = proto[n];
      if (o) proto[n] = function (...a) { P.draws++; return o.apply(this, a); };
    }
    for (const n of ["texImage2D", "texSubImage2D", "compressedTexImage2D"]) {
      const o = proto[n];
      if (o) proto[n] = function (...a) {
        const s = a[a.length - 1];
        if (s && typeof s === "object" && s.width) P.texBytes += s.width * s.height * 4;
        else { const nu = a.filter((x) => typeof x === "number"); if (nu.length >= 4) P.texBytes += nu[2] * nu[3] * 4; }
        return o.apply(this, a);
      };
    }
    const ts = proto.texStorage2D;
    if (ts) proto.texStorage2D = function (t, l, f, w, h) { P.texBytes += w * h * 4; return ts.call(this, t, l, f, w, h); };
  };
  hook(window.WebGLRenderingContext && WebGLRenderingContext.prototype);
  hook(window.WebGL2RenderingContext && WebGL2RenderingContext.prototype);
  let last = performance.now();
  const tick = (t) => { if (P.sampling) P.frames.push(t - last); last = t; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: false, args: ["--no-sandbox", "--window-size=520,980"] });
const ctx = await browser.createBrowserContext();
const page = await ctx.newPage();
const cdp = await page.createCDPSession();
await cdp.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
await page.setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1");
await page.setCookie({ name: "TERN_LOCALE", value: "en", domain: "localhost", path: "/" });
await page.evaluateOnNewDocument(instrument);
await page.bringToFront();
await page.goto(`${BASE}/`, { waitUntil: "load", timeout: 120000 });

for (let i = 0; i < 60; i++) {
  const d = await page.evaluate(() => window.__probe.draws);
  if (d > 30) break;
  await sleep(500);
}
await sleep(3000);

async function window10(label, before) {
  await page.evaluate(() => { const P = window.__probe; P.frames = []; P.sampling = true; });
  const t0 = await page.evaluate(() => window.__probe.texBytes);
  const d0 = await page.evaluate(() => window.__probe.draws);
  await sleep(10000);
  const r = await page.evaluate(() => {
    const P = window.__probe; P.sampling = false;
    const f = P.frames.filter((x) => x > 0 && x < 5000).sort((a, b) => a - b);
    return { tex: P.texBytes, draws: P.draws, n: f.length, med: f[Math.floor(f.length / 2)] };
  });
  console.log(`${label}: ΔtexMB=${((r.tex - t0) / 1048576).toFixed(2)}  draws/frame=${((r.draws - d0) / Math.max(r.n, 1)).toFixed(1)}  FPS=${r.med ? (1000 / r.med).toFixed(1) : "n/a"}  frames=${r.n}`);
  return r;
}

console.log("\n[1] 텍스처 업로드가 일회성인지");
await window10("  창1 (히어로 화면)");
await window10("  창2 (같은 화면, 연속)");

console.log("\n[2] 히어로를 지나쳐 스크롤한 뒤에도 계속 그리는지");
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await sleep(2500);
const scrolled = await page.evaluate(() => ({
  scrollY: Math.round(window.scrollY),
  heroInView: (() => { const h = document.querySelector(".hero-twilight"); if (!h) return null; const r = h.getBoundingClientRect(); return r.bottom > 0 && r.top < window.innerHeight; })(),
  canvasStyle: (() => { const c = document.querySelector("canvas"); return c ? getComputedStyle(c).display + "/" + getComputedStyle(c).visibility : null; })(),
}));
console.log(`  scrollY=${scrolled.scrollY} heroInView=${scrolled.heroInView} canvas=${scrolled.canvasStyle}`);
await window10("  최하단 스크롤 상태");

await browser.close();
