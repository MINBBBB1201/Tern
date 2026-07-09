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
await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });
await sleep(5200); // hero settles

// Scroll to each section by its heading text, screenshot after entrance
const targets = [
  ["coupons", "Exclusive Flight Coupons"],
  ["destinations", "Explore Top Destinations"],
  ["airlines", "Most Popular Airlines"],
  ["flights", "Choose Your Perfect Flight"],
];
for (const [name, text] of targets) {
  await page.evaluate((t) => {
    const h = [...document.querySelectorAll("h2")].find((e) => e.textContent?.includes(t));
    h?.scrollIntoView({ block: "center", behavior: "instant" });
  }, text);
  await sleep(1100); // entrance plays
  await page.screenshot({ path: path.join(OUT, `fx-${name}.png`) });
}

// Arc scrub: position destinations section partially in view (early scrub)
await page.evaluate(() => {
  const h = [...document.querySelectorAll("h2")].find((e) => e.textContent?.includes("Explore Top Destinations"));
  const r = h.getBoundingClientRect();
  window.scrollTo({ top: window.scrollY + r.top - window.innerHeight * 0.72, behavior: "instant" });
});
await sleep(900);
await page.screenshot({ path: path.join(OUT, "fx-arc-early.png") });

// Sanity: no [data-fx-card] left invisible after full scroll
await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
await sleep(1500);
const hidden = await page.evaluate(() =>
  [...document.querySelectorAll("[data-fx-card],[data-fx-head]")]
    .filter((el) => {
      const s = getComputedStyle(el);
      return Number(s.opacity) < 0.9 || s.visibility === "hidden";
    })
    .map((el) => el.textContent?.slice(0, 40) ?? el.className)
);
console.log("STILL HIDDEN AFTER FULL SCROLL:", JSON.stringify(hidden));
console.log("CONSOLE ERRORS:", errors.length ? JSON.stringify(errors) : "none");
await browser.close();
