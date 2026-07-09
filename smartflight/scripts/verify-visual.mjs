import puppeteer from "puppeteer-core";
import path from "node:path";

const OUT = process.argv[2] ?? ".";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3000";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu-sandbox", "--enable-webgl", "--use-gl=angle"],
});

const consoleErrors = [];
const page = await browser.newPage();
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => consoleErrors.push("PAGEERROR: " + err.message));

async function shot(name) {
  await page.screenshot({ path: path.join(OUT, name) });
  console.log("saved", name);
}

// ── Desktop ──
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(BASE, { waitUntil: "networkidle2", timeout: 60000 });
await sleep(5000); // let hero sequence settle + motes drift

// WebGL canvas presence + geometry
const canvasInfo = await page.evaluate(() => {
  const canvases = [...document.querySelectorAll("canvas")].map((c) => {
    const r = c.getBoundingClientRect();
    const s = getComputedStyle(c.parentElement ?? c);
    return {
      w: r.width, h: r.height, top: r.top, left: r.left,
      parentPosition: s.position, parentZ: s.zIndex, parentPE: s.pointerEvents,
    };
  });
  return canvases;
});
console.log("CANVASES:", JSON.stringify(canvasInfo, null, 2));

// Pointer-events: what does a click at a visible search input location hit?
const hitTest = await page.evaluate(() => {
  const inputs = [...document.querySelectorAll("input")];
  const input = inputs.find((i) => {
    const r = i.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.top >= 0 && r.bottom <= innerHeight;
  });
  if (!input) return { ok: false, reason: "no visible input found" };
  const r = input.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const el = document.elementFromPoint(cx, cy);
  return {
    ok: el === input || input.contains(el) || el?.contains(input) === true,
    hitTag: el?.tagName, hitClass: el?.className?.toString?.().slice(0, 60),
    cx, cy,
  };
});
console.log("HIT TEST (search input reachable):", JSON.stringify(hitTest));

// Focus via a real mouse click at that point
if (hitTest.cx) {
  await page.mouse.click(hitTest.cx, hitTest.cy);
  const focused = await page.evaluate(() => document.activeElement?.tagName);
  console.log("AFTER CLICK, activeElement:", focused);
}

await shot("desktop-top.png");
await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 1.5 }));
await sleep(1200);
await shot("desktop-mid.png");
await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight * 0.7 }));
await sleep(1200);
await shot("desktop-low.png");

// ── /booking sanity (global canvas mounts there too) ──
await page.goto(BASE + "/booking?from=ICN&to=LHR&fromCity=Seoul&toCity=London", {
  waitUntil: "networkidle2", timeout: 60000,
});
await sleep(3500);
await shot("desktop-booking.png");

// ── Mobile ──
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.goto(BASE, { waitUntil: "networkidle2", timeout: 60000 });
await sleep(3000);
await shot("mobile-top.png");

console.log("CONSOLE ERRORS:", consoleErrors.length ? JSON.stringify(consoleErrors, null, 2) : "none");
await browser.close();
