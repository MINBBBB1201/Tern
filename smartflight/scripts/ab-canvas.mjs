import puppeteer from "puppeteer-core";
import path from "node:path";

const OUT = process.argv[2] ?? ".";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto("http://localhost:3000/booking?from=ICN&to=LHR", { waitUntil: "networkidle2" });
await sleep(3000);
await page.screenshot({ path: path.join(OUT, "ab-canvas-on.png") });
await page.evaluate(() => {
  // hide only the global R3F canvas (fixed, not inside the hero section)
  document.querySelectorAll("canvas").forEach((c) => {
    c.style.display = "none";
  });
});
await sleep(300);
await page.screenshot({ path: path.join(OUT, "ab-canvas-off.png") });
await browser.close();
console.log("done");
