import puppeteer from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });
await sleep(3000);
const state = await page.evaluate(() => ({
  canvasCount: document.querySelectorAll("canvas").length,
  staticPass: !!document.querySelector(".boarding-pass-static"),
}));
console.log("REDUCED MOTION:", JSON.stringify(state));
await browser.close();
