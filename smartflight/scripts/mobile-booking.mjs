import puppeteer from "puppeteer-core";
import path from "node:path";

const OUT = process.argv[2] ?? ".";
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
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.goto(BASE + "/booking?from=ICN&to=LHR&fromCity=Seoul&toCity=London", {
  waitUntil: "networkidle2", timeout: 90000,
});
await page.waitForFunction(
  () => [...document.querySelectorAll("button")].some((b) => b.textContent?.trim() === "Select"),
  { timeout: 60000 }
);
await sleep(800);
await page.screenshot({ path: path.join(OUT, "mobile-booking.png") });

// Tap Select: the modal must open and be usable at mobile width
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => x.textContent?.trim() === "Select");
  b?.scrollIntoView({ block: "center" });
});
await sleep(400);
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => x.textContent?.trim() === "Select");
  b?.click();
});
await sleep(700);
await page.screenshot({ path: path.join(OUT, "mobile-modal.png") });
const modalOpen = await page.evaluate(() =>
  [...document.querySelectorAll("p")].some((p) => p.textContent?.includes("Review your flight"))
);
console.log("MOBILE MODAL OPEN:", modalOpen);
console.log("CONSOLE ERRORS:", errors.length ? JSON.stringify(errors) : "none");
await browser.close();
