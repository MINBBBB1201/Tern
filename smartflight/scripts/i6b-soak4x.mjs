/**
 * 4x 스로틀 장시간 관찰. 짧은 창에서는 60fps 였는데 14초 뒤 5초 창에서는
 * 40fps 였고 draws/frame 이 7.7 → 30 으로 늘었다. 씬이 시간이 지나며
 * 무거워지는 것으로 보이므로, 거버너가 결국 내려오는지 45초간 지켜본다.
 */
import puppeteer from "puppeteer-core";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function instrument() {
  const P = { draws: 0, frames: [], sampling: false };
  window.__probe = P;
  const hook = (p) => { if (!p) return; for (const n of ["drawElements","drawArrays","drawElementsInstanced","drawArraysInstanced"]) { const o=p[n]; if(o) p[n]=function(...a){P.draws++;return o.apply(this,a);}; } };
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
await page.setCookie({ name: "TERN_LOCALE", value: "en", domain: "localhost", path: "/" });
await page.evaluateOnNewDocument(instrument);
await page.bringToFront();
await page.goto("http://localhost:3000/", { waitUntil: "load", timeout: 120000 });
for (let i = 0; i < 60; i++) { if ((await page.evaluate(() => window.__probe.draws)) > 30) break; await sleep(300); }
await sleep(3000);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
console.log("4x 스로틀 인가. 3초 간격 관찰 (t=경과초):");

for (let t = 0; t < 15; t++) {
  await page.evaluate(() => { const P = window.__probe; P.frames = []; P.draws = 0; P.sampling = true; });
  await sleep(3000);
  const r = await page.evaluate(() => {
    const P = window.__probe; P.sampling = false;
    const f = P.frames.filter((x) => x > 0 && x < 5000).sort((a, b) => a - b);
    const med = f[Math.floor(f.length / 2)];
    return {
      fps: med ? +(1000 / med).toFixed(1) : null,
      draws: f.length ? +(P.draws / f.length).toFixed(1) : 0,
      tier: window.__ternQuality?.get?.() ?? "?",
      heroStatic: document.querySelector(".hero-twilight")?.getAttribute("data-hero-static") ?? null,
    };
  });
  console.log(`  t=${(t + 1) * 3}s  tier=${r.tier}  fps=${r.fps}  draws/frame=${r.draws}  heroStatic=${r.heroStatic}`);
  if (r.tier === "static") break;
}
await browser.close();
