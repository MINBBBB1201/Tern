import puppeteer from "puppeteer-core";
import path from "node:path";

const OUT = path.resolve("docs/screenshots");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--enable-webgl", "--use-gl=angle"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
const errors = [];
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

const shot = (n) => page.screenshot({ path: path.join(OUT, n) });
const scrollTo = (y) => page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);

await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });
await sleep(5500);

// ── G5 trail visible on the FIRST screen (no scroll) ──
await scrollTo(0);
await sleep(700);
await shot("g5-trail-firstscreen.png");

// ── G5 card tilt: rest vs active (Airline Deals card) ──
await page.evaluate(() => {
  const h = [...document.querySelectorAll("h2")].find((e) => /Airline Deals/i.test(e.textContent || ""));
  h?.scrollIntoView({ block: "center", behavior: "instant" });
});
await sleep(1200);
const box = await page.evaluate(() => {
  const c = document.querySelector(".tilt-card.glass-panel");
  const r = c.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
});
await page.mouse.move(10, 10);
await sleep(300);
await shot("g5-tilt-rest.png");
await page.mouse.move(box.x + box.w * 0.85, box.y + box.h * 0.16);
await sleep(400);
const tf = await page.evaluate(() => document.querySelector(".tilt-card.glass-panel")?.style.transform || "");
console.log("G5 tilt transform:", tf);
await shot("g5-tilt-active.png");

// ── G5 stagger on Most Popular Airlines (mid-entrance) ──
// Park the section just below the trigger, then reveal and grab a frame
// while the cards are still rising in sequence.
await page.evaluate(() => {
  const h = [...document.querySelectorAll("h2")].find((e) => /Most Popular Airlines/i.test(e.textContent || ""));
  const r = h.getBoundingClientRect();
  window.scrollTo({ top: window.scrollY + r.top - window.innerHeight * 1.05, behavior: "instant" });
});
await sleep(500);
// nudge it across the "top 92%" trigger
await page.evaluate(() => window.scrollBy({ top: window.innerHeight * 0.5, behavior: "instant" }));
await sleep(260); // mid-stagger
await shot("g5-stagger-mid.png");
await sleep(1200); // settled
await shot("g5-stagger-settled.png");
const staggerCells = await page.evaluate(
  () => document.querySelectorAll(".grid [data-fx-card] > .tilt-card.glass-row").length
);
console.log("G5 per-card stagger cells (airline picker):", staggerCells);

console.log("PAGEERRORS:", errors.length ? JSON.stringify(errors) : "none");
await browser.close();
