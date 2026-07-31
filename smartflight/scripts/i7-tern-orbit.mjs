/**
 * I7 검증: 세로에서 tern 이 globe 궤도를 타는가.
 * `node scripts/i7-tern-orbit.mjs before|after`
 *
 * 통과 기준: 궤도 구간(ENTRY 800ms 이후 ~ FLIGHT 4400ms 이전)에서
 *   ratio = |tern_world - globe_center_world| / globe_radius_world  ≈ ORBIT_ALT (1.16)
 * 이 값은 aspect 와 무관한 불변량이다. 세로에서 1.16 을 벗어나면 tern 이
 * globe/route 와 분리돼 떠 있다는 뜻 — 로컬 좌표만 봐서는 판별할 수 없다.
 */
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.env.TERN_BASE ?? "http://localhost:3000";
const OUT = "docs/screenshots";
const LABEL = process.argv[2];
if (!["before", "after"].includes(LABEL)) { console.error("usage: i7-tern-orbit.mjs before|after"); process.exit(1); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ORBIT_ALT = 1.16;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: false, args: ["--no-sandbox", "--window-size=1500,1000"] });

async function probe(name, { width, height, dpr }) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  const cdp = await page.createCDPSession();
  await cdp.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: dpr, mobile: width < 768 });
  await page.setCookie({ name: "TERN_LOCALE", value: "en", domain: "localhost", path: "/" });
  await page.bringToFront();
  await page.goto(`${BASE}/`, { waitUntil: "load", timeout: 120000 });

  // globe 텍스처·spin 등록까지 대기
  for (let i = 0; i < 60; i++) {
    const ok = await page.evaluate(() => !!window.__ternState?.()?.spinRegistered);
    if (ok) break;
    await sleep(500);
  }
  await sleep(1500);

  console.log(`\n── ${LABEL} / ${name} (${width}x${height}, aspect ${(width / height).toFixed(2)}) ──`);
  const rows = [];
  for (const at of [1600, 2500, 3400, 4200]) {
    const s = await page.evaluate(async (ms) => {
      window.__ternReplay?.(ms, true); // seek + freeze
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      return window.__ternState?.();
    }, at);
    const o = s?.orbit;
    rows.push({ at, ratio: o?.ratio ?? null });
    const ok = o?.ratio != null && Math.abs(o.ratio - ORBIT_ALT) < 0.12;
    console.log(
      `  t=${at}ms  ratio=${o?.ratio ?? "n/a"} ${ok ? "OK" : "← 이탈"}` +
      `  dist=${o?.dist ?? "?"} r=${o?.radius ?? "?"}  ternWorld=[${o?.world ?? "?"}] center=[${o?.center ?? "?"}]`
    );
  }
  // 캡처는 궤도 중간에서
  await page.evaluate(async () => {
    window.__ternReplay?.(2500, true);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
  await sleep(600);
  const path = `${OUT}/i7-${LABEL}-${name}.png`;
  await page.screenshot({ path });
  console.log(`  캡처: ${path}`);
  await ctx.close();
  return rows;
}

await probe("mobile-orbit", { width: 390, height: 844, dpr: 3 });
await probe("desktop-orbit", { width: 1440, height: 900, dpr: 2 });
await browser.close();
