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
const toH2 = (re) => p.evaluate((r) => {
  const h = [...document.querySelectorAll("h2")].find((e) => new RegExp(r, "i").test(e.textContent || ""));
  if (h) h.scrollIntoView({ block: "center", behavior: "instant" });
  return !!h;
}, re);

// hero — ScrollTrail still in the gutter, contained
await p.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
await sleep(700);
await p.screenshot({ path: path.join(OUT, "arcfix-hero.png") });

// Airline Deals — confirm NO ScrollTrail line
await toH2("Airline Deals");
await sleep(1000);
await p.screenshot({ path: path.join(OUT, "arcfix-deals-confirm.png") });

// Explore Top Destinations — the dashed arc + plane must be GONE
await toH2("Top Destinations");
await sleep(1000);
await p.screenshot({ path: path.join(OUT, "arcfix-destinations-after.png") });

// how many View canvases / holders exist (RouteArcView had its own holder div)
const diag = await p.evaluate(() => ({
  scrollTrailInsideHero: !!document.querySelector(".hero-twilight .scroll-trail"),
  scrollTrailBottomAtDest: (() => { const t = document.querySelector(".scroll-trail"); return t ? Math.round(t.getBoundingClientRect().bottom) : "none"; })(),
  // RouteArcView holder was an aria-hidden div height:110 with a View; count leftover drei View portals in the destinations area
  destinationSection: !!document.querySelector("h2"),
}));
console.log("diag:", JSON.stringify(diag));
await b.close();
