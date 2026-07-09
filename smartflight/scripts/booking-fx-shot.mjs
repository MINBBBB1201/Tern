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
await page.goto("http://localhost:3000/booking?from=ICN&to=LHR&fromCity=Seoul&toCity=London", {
  waitUntil: "networkidle2", timeout: 90000,
});

// Wait for offers to render
await page.waitForFunction(
  () => [...document.querySelectorAll("button")].some((b) => b.textContent?.trim() === "Select"),
  { timeout: 60000 }
);
// Offer cards must NOT be entrance-animated: check opacity immediately
const offerOpacity = await page.evaluate(() => {
  const sel = [...document.querySelectorAll("button")].find((b) => b.textContent?.trim() === "Select");
  const card = sel?.closest("article") ?? sel?.closest("div[id^='flight-card']") ?? sel?.parentElement;
  return card ? getComputedStyle(card).opacity : "no card";
});
console.log("OFFER CARD OPACITY right after render:", offerOpacity);

await sleep(800);
await page.screenshot({ path: path.join(OUT, "bk-top.png") });

// Open checkout modal
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => x.textContent?.trim() === "Select");
  b?.click();
});
await sleep(150);
await page.screenshot({ path: path.join(OUT, "bk-modal-mid.png") });
await sleep(600);
await page.screenshot({ path: path.join(OUT, "bk-modal-open.png") });

// Advance to book step
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => x.textContent?.includes("Continue to booking"));
  b?.click();
});
await sleep(500);
await page.screenshot({ path: path.join(OUT, "bk-modal-book.png") });

// Close and verify a filter still works (checkbox toggle)
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => x.textContent?.trim() === "Close");
  b?.click();
});
await sleep(400);
const checkboxWorks = await page.evaluate(() => {
  const cb = document.querySelector('input[type="checkbox"]');
  if (!cb) return "no checkbox";
  const before = cb.checked;
  cb.click();
  const after = cb.checked;
  cb.click(); // restore
  return before !== after ? "toggles OK" : "STUCK";
});
console.log("FILTER CHECKBOX:", checkboxWorks);
console.log("CONSOLE ERRORS:", errors.length ? JSON.stringify(errors) : "none");
await browser.close();
