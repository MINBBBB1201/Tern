import puppeteer from "puppeteer-core";
import path from "node:path";
const OUT = path.resolve("docs/screenshots");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--enable-webgl", "--use-gl=angle"] });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 900 });
await p.goto("http://localhost:3000", { waitUntil: "networkidle2" });
await sleep(5500);

const scrollToH2 = (re) => p.evaluate((r) => {
  const h = [...document.querySelectorAll("h2")].find((e) => new RegExp(r, "i").test(e.textContent || ""));
  if (h) h.scrollIntoView({ block: "center", behavior: "instant" });
  return !!h;
}, re);

// trail element location + geometry check
const info = await p.evaluate(() => {
  const t = document.querySelector(".scroll-trail");
  return {
    parentClass: t?.parentElement?.className || null,
    position: t ? getComputedStyle(t).position : null,
    insideHero: !!t?.closest(".hero-twilight"),
  };
});
console.log("trail:", JSON.stringify(info));

// 1) hero (scroll 0) — trail present in left gutter
await p.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
await sleep(700);
await p.screenshot({ path: path.join(OUT, "trailfix-hero.png") });

// 2) Airline Deals — must show NO trail
await scrollToH2("Airline Deals");
await sleep(1000);
await p.screenshot({ path: path.join(OUT, "trailfix-deals-clean.png") });

// 3) Explore Top Destinations — the reported leak spot — must show NO trail
await scrollToH2("Top Destinations");
await sleep(1000);
await p.screenshot({ path: path.join(OUT, "trailfix-destinations-clean.png") });

// numeric: once scrolled past the hero, is the trail off-screen / clipped?
const past = await p.evaluate(() => {
  const t = document.querySelector(".scroll-trail");
  if (!t) return { present: false };
  const r = t.getBoundingClientRect();
  return { present: true, top: Math.round(r.top), bottom: Math.round(r.bottom), belowViewport: r.bottom <= 0 };
});
console.log("trail bounds at Destinations scroll:", JSON.stringify(past));
await b.close();
