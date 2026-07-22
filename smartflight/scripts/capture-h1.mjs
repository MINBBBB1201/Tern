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

await page.goto("http://localhost:3000/deals", { waitUntil: "networkidle2" });
await sleep(2500);
await page.evaluate(() => window.scrollTo({ top: 300, behavior: "instant" }));
await sleep(600);

// rest
await page.mouse.move(10, 10);
await sleep(300);
await shot("h1-deals-rest.png");

// hover the 2nd card (Turkish Airlines — red brand accent) off-centre
const box = await page.evaluate(() => {
  const cards = document.querySelectorAll(".deal-card");
  const c = cards[1] || cards[0];
  const r = c.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
});
await page.mouse.move(box.x + box.w * 0.82, box.y + box.h * 0.2);
await sleep(450);
await shot("h1-deals-hover.png");

// brand vars present?
const brands = await page.evaluate(() =>
  [...document.querySelectorAll(".deal-card")].map((c) => c.style.getPropertyValue("--brand"))
);
console.log("H1 per-card --brand:", JSON.stringify(brands));
console.log("PAGEERRORS:", errors.length ? JSON.stringify(errors) : "none");
await browser.close();
