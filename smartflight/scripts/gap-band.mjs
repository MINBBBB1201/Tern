import puppeteer from "puppeteer-core";
import path from "node:path";
const OUT = path.resolve("docs/screenshots");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Capture identical crops from two URLs for a clean dev-vs-prod diff.
async function grab(url, tag) {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--enable-webgl", "--use-gl=angle"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: "networkidle2" });
  await sleep(6000);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await sleep(500);

  // Measure the real ticker/searchbar rects, crop the band between them full-width.
  const band = await page.evaluate(() => {
    const ticker = document.querySelector(".hero-ticker");
    const shell = document.querySelector(".vol-shell");
    const tr = ticker?.getBoundingClientRect();
    const sr = shell?.getBoundingClientRect();
    return {
      tickerBottom: tr ? Math.round(tr.bottom) : null,
      shellTop: sr ? Math.round(sr.top) : null,
    };
  });
  const y0 = Math.max(0, (band.tickerBottom ?? 480) - 14);
  const h = ((band.shellTop ?? 520) - (band.tickerBottom ?? 480)) + 28;
  await page.screenshot({ path: path.join(OUT, `gap-${tag}.png`), clip: { x: 0, y: y0, width: 1440, height: Math.max(20, h) } });
  // top edge too (y 0..30) at 2x
  await page.screenshot({ path: path.join(OUT, `topedge-${tag}.png`), clip: { x: 0, y: 0, width: 1440, height: 30 } });
  console.log(tag, JSON.stringify(band), "-> band y", y0, "h", Math.max(20, h));
  await browser.close();
}

const which = process.argv[2];
if (which === "prod") await grab("http://localhost:3100", "prod");
else if (which === "dev") await grab("http://localhost:3000", "dev");
else { await grab("http://localhost:3100", "prod"); await grab("http://localhost:3000", "dev"); }
