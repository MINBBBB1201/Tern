import puppeteer from "puppeteer-core";
import path from "node:path";

const OUT = process.argv[2] ?? ".";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
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
await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
await sleep(1600); // mid-flight (flight phase is 0-2600ms from scene mount)
await page.screenshot({ path: path.join(OUT, "hero-flight.png") });
await sleep(1600); // hand-off window
await page.screenshot({ path: path.join(OUT, "hero-handoff.png") });
await sleep(2500); // settled
await page.screenshot({ path: path.join(OUT, "hero-settled.png") });

// scroll continuation: pass should drift up + dim as hero leaves
await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 0.55 }));
await sleep(800);
await page.screenshot({ path: path.join(OUT, "hero-scrollout.png") });

console.log("CONSOLE ERRORS:", errors.length ? JSON.stringify(errors) : "none");
await browser.close();
