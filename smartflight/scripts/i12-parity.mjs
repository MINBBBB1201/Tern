/**
 * I12-3: is anything in the hero structurally MISSING on mobile (not merely
 * smaller)? Presence + a non-zero painted box, mobile vs desktop.
 * `node scripts/i12-parity.mjs`
 */
import puppeteer from "puppeteer-core";
import fs from "node:fs";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const TARGETS = [
  ["globe canvas (3D layer)", "canvas"],
  ["hero stage <View>", '.hero-twilight > div.hero-stage'],
  ["ambient star layer", ".hero-stars"],
  ["scroll trail (G2)", ".hero-twilight svg, .hero-twilight .scroll-trail"],
  ["headline", "h1.hero-headline"],
  ["subtitle", ".hero-copy p"],
  ["popular-route ticker", ".hero-ticker"],
  ["search bar", ".vol-shell, form"],
  ["smartpicks strip", ".hero-content .glass-chip, .hero-content [class*='pick']"],
  ["airline logos strip", ".hero-content img"],
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: false,
  defaultViewport: null,
  protocolTimeout: 120000,
  args: ["--window-size=1500,1000", "--hide-scrollbars", "--disable-backgrounding-occluded-windows", "--disable-renderer-backgrounding"],
});

const out = {};
for (const [label, w, h, dpr] of [["desktop", 1440, 900, 1], ["mobile390", 390, 844, 3]]) {
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
  await page.setViewport({ width: w, height: h, deviceScaleFactor: dpr, isMobile: w < 768, hasTouch: w < 768 });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle0" });
  await sleep(2500);
  out[label] = await page.evaluate((targets) => {
    const r = {};
    for (const [name, sel] of targets) {
      const els = [...document.querySelectorAll(sel)];
      const painted = els.filter((e) => {
        const b = e.getBoundingClientRect();
        const cs = getComputedStyle(e);
        return b.width > 0 && b.height > 0 && cs.display !== "none" && cs.visibility !== "hidden" && +cs.opacity > 0;
      });
      r[name] = { found: els.length, painted: painted.length };
    }
    r.__heroHeight = +document.querySelector(".hero-twilight").getBoundingClientRect().height.toFixed(0);
    return r;
  }, TARGETS);
  await page.close();
}
await browser.close();

const names = Object.keys(out.desktop);
console.log("element".padEnd(30) + "desktop".padEnd(14) + "mobile390");
for (const n of names) {
  const d = out.desktop[n];
  const m = out.mobile390[n];
  const fmt = (v) => (typeof v === "object" ? `${v.painted}/${v.found}` : String(v));
  const gap = typeof d === "object" && d.painted > 0 && m.painted === 0 ? "   <== MISSING ON MOBILE" : "";
  console.log(n.padEnd(30) + fmt(d).padEnd(14) + fmt(m) + gap);
}
fs.writeFileSync("docs/screenshots/i12-parity.json", JSON.stringify(out, null, 2));
