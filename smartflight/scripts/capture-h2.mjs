import puppeteer from "puppeteer-core";
import path from "node:path";

const OUT = path.resolve("docs/screenshots");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--enable-webgl", "--use-gl=angle"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1400, deviceScaleFactor: 1 });
const errors = [];
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

const url = "http://localhost:3000/booking?tripType=oneway&from=ICN&fromCity=Seoul&to=NRT&toCity=Tokyo&departureDate=2026-08-15&adults=1&cabinClass=economy";
await page.goto(url, { waitUntil: "networkidle2" });

// wait for real results to arrive
await page.waitForFunction(() => document.body.innerText.includes("$") , { timeout: 60000 }).catch(() => {});
await sleep(3000);

// find + click the price-trend "load" button (in the PriceTrendChart card)
const clicked = await page.evaluate(() => {
  const btns = [...document.querySelectorAll("button")];
  const b = btns.find((x) => /trend|추이|傾向|趋势|load|show/i.test(x.textContent || ""));
  if (b) { b.scrollIntoView({ block: "center" }); b.click(); return b.textContent?.trim(); }
  return null;
});
console.log("H2 trend button clicked:", clicked);

// wait for the recharts line path to render (±5d = 11 sequential Duffel calls)
const ok = await page.waitForFunction(
  () => !!document.querySelector(".recharts-line-curve, path.recharts-curve, .recharts-line path"),
  { timeout: 90000 }
).then(() => true).catch(() => false);
console.log("H2 chart rendered:", ok);
await sleep(1200);

// scroll the chart into view and shoot it
await page.evaluate(() => {
  const c = document.querySelector(".recharts-responsive-container");
  (c?.closest(".glass-panel") || c)?.scrollIntoView({ block: "center", behavior: "instant" });
});
await sleep(800);
await page.screenshot({ path: path.join(OUT, "h2-price-trend.png") });

const pts = await page.evaluate(() => document.querySelectorAll(".recharts-line-dot, .recharts-dot").length);
console.log("H2 chart data points rendered:", pts);
console.log("PAGEERRORS:", errors.length ? JSON.stringify(errors) : "none");
await browser.close();
