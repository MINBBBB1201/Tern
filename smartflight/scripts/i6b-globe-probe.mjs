/**
 * I6-b 진단: 모바일에서 히어로 3D globe를 켰을 때의 실제 비용 측정.
 * 코드는 건드리지 않는다 — 게이트만 페이지 컨텍스트에서 우회한다.
 *
 * 게이트 우회: HeroTernView / GlobalCanvasInner 는 둘 다
 * `window.innerWidth < 768` 만 본다. innerWidth 게터를 768로 덮으면 분기는
 * "full"로 가고, 실제 렌더 표면은 진짜 아이폰 뷰포트(390×844 @dpr3) 그대로
 * 남는다 (캔버스 크기는 요소 bounding rect에서 오므로 오염되지 않음).
 *
 * 1차 시도에서 틀린 것 — 고친 내용:
 *   1) 로딩 중에 샘플링했다. CPU 스로틀을 걸면 12초 안에 hydration이 안 끝나
 *      "애니메이션"이 아니라 "로딩"을 측정하고 있었다.
 *      → 씬이 실제로 그려지기 시작한 뒤(draw call > 0) 카운터를 리셋하고,
 *        스로틀은 그 다음에 건다.
 *   2) 백그라운드 페이지는 rAF가 정지/스로틀된다. → bringToFront().
 *   3) three.js 는 WebGL2에서 texStorage2D + texSubImage2D 를 쓴다.
 *      texImage2D 만 후킹해서 텍스처 바이트가 전부 0으로 나왔다. → 전부 후킹.
 *   4) data-hero-static 부재를 "3D"로 읽었다. 미hydration과 구분 안 됨.
 *      → 분기 판정을 draw call 수와 함께 본다.
 */
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://localhost:3000";
const SAMPLE_MS = 10000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function instrument(forceFull) {
  if (forceFull) {
    Object.defineProperty(window, "innerWidth", { get: () => 768, configurable: true });
  }
  const P = { draws: 0, verts: 0, texBytes: 0, frames: [], long: 0, longN: 0, sampling: false };
  window.__probe = P;

  const fmtBytes = (w, h) => (w || 0) * (h || 0) * 4;
  const hook = (proto) => {
    if (!proto) return;
    const wrapDraw = (name, countArgIdx, instIdx) => {
      const orig = proto[name];
      if (!orig) return;
      proto[name] = function (...a) {
        P.draws++;
        const c = a[countArgIdx] || 0;
        P.verts += instIdx != null ? c * (a[instIdx] || 1) : c;
        return orig.apply(this, a);
      };
    };
    wrapDraw("drawElements", 1);
    wrapDraw("drawArrays", 2);
    wrapDraw("drawElementsInstanced", 1, 4);
    wrapDraw("drawArraysInstanced", 2, 3);

    for (const n of ["texImage2D", "texSubImage2D", "compressedTexImage2D"]) {
      const orig = proto[n];
      if (!orig) continue;
      proto[n] = function (...a) {
        const src = a[a.length - 1];
        if (src && typeof src === "object" && src.width) P.texBytes += fmtBytes(src.width, src.height);
        else {
          const nums = a.filter((x) => typeof x === "number");
          if (nums.length >= 4) P.texBytes += fmtBytes(nums[2], nums[3]);
        }
        return orig.apply(this, a);
      };
    }
    const ts = proto.texStorage2D;
    if (ts) proto.texStorage2D = function (t, l, f, w, h) { P.texBytes += fmtBytes(w, h); return ts.call(this, t, l, f, w, h); };
  };
  hook(window.WebGLRenderingContext && WebGLRenderingContext.prototype);
  hook(window.WebGL2RenderingContext && WebGL2RenderingContext.prototype);

  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (P.sampling) { P.long += e.duration; P.longN++; }
    }).observe({ entryTypes: ["longtask"] });
  } catch {}

  let last = performance.now();
  const tick = (t) => { if (P.sampling) P.frames.push(t - last); last = t; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}

async function run(browser, { name, forceFull, cpu, dpr = 3 }) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  const cdp = await page.createCDPSession();

  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: dpr, mobile: true });
  await page.setUserAgent(
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
  );
  await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
  await page.setCookie({ name: "TERN_LOCALE", value: "en", domain: "localhost", path: "/" });
  await page.evaluateOnNewDocument(instrument, forceFull);

  await page.bringToFront(); // 백그라운드면 rAF가 멈춘다
  await page.goto(`${BASE}/`, { waitUntil: "load", timeout: 120000 });

  // 안정 상태 대기: 3D 분기면 draw call 이 붙기를, static 분기면 마커가 붙기를.
  let ready = "timeout";
  for (let i = 0; i < 60; i++) {
    const s = await page.evaluate(() => ({
      draws: window.__probe.draws,
      marker: document.querySelector(".hero-twilight")?.getAttribute("data-hero-static"),
      canvas: (() => { const c = document.querySelector("canvas"); return c ? `${c.width}x${c.height}` : null; })(),
    }));
    if (s.marker === "1") { ready = "static"; break; }
    if (s.draws > 30 && s.canvas && s.canvas !== "300x150") { ready = "3d"; break; }
    await sleep(500);
  }
  await sleep(2500); // 진입 애니메이션 정착

  if (cpu > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu }); // 로드 끝난 뒤에 스로틀
  await sleep(500);

  await page.evaluate(() => {
    const P = window.__probe;
    P.draws = 0; P.verts = 0; P.frames = []; P.long = 0; P.longN = 0; P.sampling = true;
  });
  await sleep(SAMPLE_MS);
  await page.evaluate(() => { window.__probe.sampling = false; });

  const r = await page.evaluate((sampleMs) => {
    const P = window.__probe;
    const gl = document.createElement("canvas").getContext("webgl");
    const dbg = gl && gl.getExtension("WEBGL_debug_renderer_info");
    const f = P.frames.filter((d) => d > 0 && d < 5000).sort((a, b) => a - b);
    const q = (p) => (f.length ? f[Math.floor(f.length * p)] : null);
    const canvas = document.querySelector("canvas");
    return {
      renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : "n/a",
      marker: document.querySelector(".hero-twilight")?.getAttribute("data-hero-static") ?? null,
      canvasPx: canvas ? `${canvas.width}x${canvas.height}` : null,
      cssVp: `${window.innerWidth}x${window.innerHeight}`,
      dpr: window.devicePixelRatio,
      frames: f.length,
      medianMs: q(0.5), p95Ms: q(0.95), worstMs: f[f.length - 1],
      fps: q(0.5) ? +(1000 / q(0.5)).toFixed(1) : null,
      fpsP95: q(0.95) ? +(1000 / q(0.95)).toFixed(1) : null,
      jank: f.filter((d) => d > 20).length,
      draws: f.length ? +(P.draws / f.length).toFixed(1) : null,
      verts: f.length ? Math.round(P.verts / f.length) : null,
      texMB: +(P.texBytes / 1048576).toFixed(1),
      busyPct: +((P.long / sampleMs) * 100).toFixed(1),
      longN: P.longN,
      heapMB: performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null,
    };
  }, SAMPLE_MS);

  r.name = name;
  r.ready = ready;
  r.branch = r.marker === "1" ? "STATIC" : r.draws > 1 ? "3D" : "불명(draw 없음)";
  console.log(`\n── ${name} ──`);
  console.log(`  ready=${ready} branch=${r.branch} canvas=${r.canvasPx} cssVp=${r.cssVp} dpr=${r.dpr}`);
  console.log(`  FPS median ${r.fps} / p95 ${r.fpsP95}  (frame ${r.medianMs?.toFixed(1)}ms, p95 ${r.p95Ms?.toFixed(1)}ms, worst ${r.worstMs?.toFixed(0)}ms)`);
  console.log(`  jank>20ms ${r.jank}/${r.frames}  draws/frame ${r.draws}  verts/frame ${r.verts}`);
  console.log(`  texture ${r.texMB}MB  heap ${r.heapMB}MB  longtask ${r.busyPct}% (${r.longN}회)`);

  await ctx.close();
  return r;
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: false, // headless 는 SwiftShader 로 떨어져 FPS가 무의미
  args: ["--no-sandbox", "--window-size=520,980"],
});

const rows = [];
rows.push(await run(browser, { name: "A. 현행 모바일 (static, globe 없음)", forceFull: false, cpu: 1 }));
rows.push(await run(browser, { name: "B. globe ON, dpr3, CPU 1x", forceFull: true, cpu: 1 }));
rows.push(await run(browser, { name: "C. globe ON, dpr3, CPU 4x", forceFull: true, cpu: 4 }));
rows.push(await run(browser, { name: "D. globe ON, dpr3, CPU 6x", forceFull: true, cpu: 6 }));
rows.push(await run(browser, { name: "E. globe ON, dpr1.5, CPU 4x", forceFull: true, cpu: 4, dpr: 1.5 }));
rows.push(await run(browser, { name: "F. 현행 모바일, CPU 4x (대조군)", forceFull: false, cpu: 4 }));

console.log("\n\n=== 요약 (탭 = TSV) ===");
console.log("config\tbranch\tFPS_med\tFPS_p95\tjank\tdraws\tverts\ttexMB\tbusy%");
for (const r of rows) {
  console.log([r.name, r.branch, r.fps, r.fpsP95, `${r.jank}/${r.frames}`, r.draws, r.verts, r.texMB, r.busyPct].join("\t"));
}
await browser.close();
