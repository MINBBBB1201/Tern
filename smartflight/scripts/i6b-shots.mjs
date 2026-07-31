/**
 * I6-b2 전/후 캡처. `node scripts/i6b-shots.mjs before|after`
 *   - mobile-hero  390x844  : globe 가 뜨는가 (핵심 변경)
 *   - desktop-hero 1440x900 : 텍스처 2048->1024 축소로 globe 가 뭉개지지
 *                             않았는지 (데스크톱이 가장 크게 렌더된다)
 */
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.env.TERN_BASE ?? "http://localhost:3000";
const OUT = "docs/screenshots";
const LABEL = process.argv[2];
if (!["before", "after"].includes(LABEL)) { console.error("usage: i6b-shots.mjs before|after"); process.exit(1); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: false, args: ["--no-sandbox", "--window-size=1500,1000"] });

async function shot(name, { width, height, dpr }) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  const cdp = await page.createCDPSession();
  await cdp.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: dpr, mobile: width < 768 });
  await page.setCookie({ name: "TERN_LOCALE", value: "en", domain: "localhost", path: "/" });
  await page.bringToFront();
  await page.goto(`${BASE}/`, { waitUntil: "load", timeout: 120000 });
  await sleep(11000); // 진입 시퀀스 + globe 텍스처 도착까지
  const s = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    return {
      heroStatic: document.querySelector(".hero-twilight")?.getAttribute("data-hero-static") ?? null,
      canvas: c ? `${c.width}x${c.height}` : null,
    };
  });
  const path = `${OUT}/i6b-${LABEL}-${name}.png`;
  await page.screenshot({ path });
  console.log(`  ${name}: globe=${s.heroStatic === null ? "표시" : "없음(static)"} canvas=${s.canvas} → ${path}`);
  await ctx.close();
}

console.log(`[${LABEL}]`);
await shot("mobile-hero", { width: 390, height: 844, dpr: 3 });
await shot("ipadport-hero", { width: 820, height: 1180, dpr: 2 }); // 보간 중간값 (aspect 0.69)
await shot("desktop-hero", { width: 1440, height: 900, dpr: 2 });
await browser.close();
