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

const shot = (name) => page.screenshot({ path: path.join(OUT, name) });
const scrollTo = (y) => page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);

await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });
await sleep(5500); // hero 3D settles

// ── G1: globe recede on scroll ──
await scrollTo(0);
await sleep(700);
await shot("g1-globe-rest.png");
await scrollTo(230);
await sleep(900);
await shot("g1-globe-recede.png");

// ── G2: scroll-trail drawn in ──
await scrollTo(0);
await sleep(500);
await shot("g2-trail-top.png");
// full-page: scroll to bottom so the whole trail is drawn
await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight * 0.5, behavior: "instant" }));
await sleep(900);
await shot("g2-trail-mid.png");
await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
await sleep(900);
await shot("g2-trail-bottom.png");

// ── G3: card hover tilt (Airline Deals card on the homepage) ──
// Bring the Airline Deals grid into view, then hover a card off-center.
await page.evaluate(() => {
  const h = [...document.querySelectorAll("h2")].find((e) => /Airline Deals/i.test(e.textContent || ""));
  h?.scrollIntoView({ block: "center", behavior: "instant" });
});
await sleep(1200); // entrance settles
const cardBox = await page.evaluate(() => {
  const card = document.querySelector(".tilt-card.glass-panel");
  if (!card) return null;
  const r = card.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
});
if (cardBox) {
  // rest
  await page.mouse.move(10, 10);
  await sleep(300);
  await shot("g3-card-rest.png");
  // tilt: move to upper-right of the card so rotateX/Y are both non-zero
  await page.mouse.move(cardBox.x + cardBox.w * 0.82, cardBox.y + cardBox.h * 0.2);
  await sleep(400);
  const t = await page.evaluate(() => document.querySelector(".tilt-card.glass-panel")?.style.transform || "");
  console.log("G3 tilt transform:", t);
  await shot("g3-card-tilt.png");
}

// ── G4: night-stars opacity across scroll (numeric + captures) ──
const starReadings = await page.evaluate(async () => {
  const stars = document.querySelector(".night-stars");
  if (!stars) return { supported: false };
  const sec = stars.closest("section");
  const readAt = (y) =>
    new Promise((res) => {
      window.scrollTo({ top: y, behavior: "instant" });
      requestAnimationFrame(() =>
        requestAnimationFrame(() => res(Number(getComputedStyle(stars).opacity)))
      );
    });
  const top = sec.getBoundingClientRect().top + window.scrollY;
  const edge = await readAt(top - window.innerHeight * 0.45); // section entering (edge)
  const center = await readAt(top - window.innerHeight * 0.15 + sec.offsetHeight * 0.3); // section mid-viewport
  return { supported: true, edge: +edge.toFixed(3), center: +center.toFixed(3) };
});
console.log("G4 night-stars opacity:", JSON.stringify(starReadings));

console.log("PAGEERRORS:", errors.length ? JSON.stringify(errors) : "none");
await browser.close();
