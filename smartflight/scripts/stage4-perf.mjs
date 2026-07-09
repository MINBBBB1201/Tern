import puppeteer from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--enable-webgl", "--use-gl=angle"],
});
const page = await browser.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));
await page.setViewport({ width: 1440, height: 900 });
await page.goto(BASE, { waitUntil: "networkidle2" });
await sleep(5000); // hero settles

// 1. Frame-rate during a full-page 4s scroll
const fps = await page.evaluate(async () => {
  const deltas = [];
  let last = performance.now();
  let running = true;
  const tick = (now) => {
    deltas.push(now - last);
    last = now;
    if (running) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  const H = document.body.scrollHeight - innerHeight;
  const t0 = performance.now();
  const DUR = 4000;
  await new Promise((done) => {
    const step = (now) => {
      const p = Math.min((now - t0) / DUR, 1);
      window.scrollTo(0, H * p);
      if (p < 1) requestAnimationFrame(step);
      else done();
    };
    requestAnimationFrame(step);
  });
  running = false;

  deltas.shift();
  const sorted = [...deltas].sort((a, b) => a - b);
  const avg = deltas.reduce((a, b) => a + b, 0) / deltas.length;
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  return {
    frames: deltas.length,
    avgMs: +avg.toFixed(2),
    avgFps: +(1000 / avg).toFixed(1),
    p95Ms: +p95.toFixed(2),
    p95Fps: +(1000 / p95).toFixed(1),
    worstMs: +sorted[sorted.length - 1].toFixed(2),
    longFrames: deltas.filter((d) => d > 33.4).length,
  };
});
console.log("SCROLL FPS:", JSON.stringify(fps));

// 2. Background-tab render loop must pause (rAF-driven)
await page.evaluate(() => {
  window.__bgFrames = 0;
  const count = () => {
    window.__bgFrames++;
    requestAnimationFrame(count);
  };
  requestAnimationFrame(count);
});
const front = await browser.newPage();
await front.goto("about:blank");
await front.bringToFront();
await sleep(2500);
const bgFrames = await page.evaluate(() => window.__bgFrames);
await front.close();
await page.bringToFront();
console.log("FRAMES WHILE TAB HIDDEN (2.5s):", bgFrames, bgFrames < 10 ? "(render loop pauses OK)" : "(STILL RENDERING - BAD)");

// 3. SPA navigation: canvas must survive home -> booking -> back
await page.evaluate(() => window.scrollTo(0, 0));
await sleep(300);
await page.evaluate(() => {
  const a = [...document.querySelectorAll("a")].find((x) => x.getAttribute("href")?.startsWith("/booking"));
  a?.click();
});
await sleep(3500);
const onBooking = page.url().includes("/booking");
await page.goBack();
await sleep(5000);
const canvases = await page.evaluate(() => document.querySelectorAll("canvas").length);
console.log("SPA NAV home->booking->home:", JSON.stringify({ onBooking, canvasesAfterReturn: canvases }));

console.log("CONSOLE ERRORS:", errors.length ? JSON.stringify(errors) : "none");
await browser.close();
