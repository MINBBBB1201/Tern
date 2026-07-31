import puppeteer from "puppeteer-core";
import path from "node:path";
const OUT = path.resolve("docs/screenshots");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const url = process.argv[2] || "http://localhost:3000";
const tag = process.argv[3] || "prod";

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--enable-webgl", "--use-gl=angle"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: "networkidle2" });
await sleep(5500);
await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
await sleep(600);

// full hero
await page.screenshot({ path: path.join(OUT, `lines-${tag}-hero.png`) });
// tight crop of the very top edge (y 0..40)
await page.screenshot({ path: path.join(OUT, `lines-${tag}-topedge.png`), clip: { x: 0, y: 0, width: 1440, height: 46 } });

const describe = (el) => {
  if (!el) return null;
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return {
    tag: el.tagName, cls: (el.className && el.className.toString ? el.className.toString() : "").slice(0, 60),
    id: el.id || null,
    rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
    pos: cs.position, z: cs.zIndex,
    bg: cs.backgroundColor, bgImg: cs.backgroundImage.slice(0, 40),
    borderTop: cs.borderTopWidth + " " + cs.borderTopColor,
    borderBottom: cs.borderBottomWidth + " " + cs.borderBottomColor,
    boxShadow: cs.boxShadow.slice(0, 80),
    outline: cs.outline,
  };
};

const info = await page.evaluate((describeStr) => {
  const describe = eval("(" + describeStr + ")");
  const out = {};
  // #1: top edge — stack at several x across the top 3px
  out.topEdge = [];
  for (const x of [3, 360, 720, 1080, 1437]) {
    for (const y of [0, 1, 2]) {
      const els = document.elementsFromPoint(x, y).slice(0, 3).map(describe);
      out.topEdge.push({ x, y, stack: els.map((e) => `${e.tag}.${e.cls}|${e.pos}|z${e.z}|bt:${e.borderTop}|bb:${e.borderBottom}`) });
    }
  }
  // #2: gap between the popular-route ticker and the search bar
  const ticker = document.querySelector(".hero-ticker") || [...document.querySelectorAll("*")].find((e) => /POPULAR ROUTE/i.test(e.textContent || "") && e.children.length < 6);
  const shell = document.querySelector(".vol-shell") || document.querySelector("form");
  const tr = ticker?.getBoundingClientRect();
  const sr = shell?.getBoundingClientRect();
  out.tickerRect = tr ? { y: Math.round(tr.y), b: Math.round(tr.bottom) } : null;
  out.shellRect = sr ? { y: Math.round(sr.y), b: Math.round(sr.bottom) } : null;
  out.gapProbe = [];
  if (tr && sr) {
    const gy0 = Math.round(tr.bottom), gy1 = Math.round(sr.top);
    for (let y = gy0; y <= gy1; y += 3) {
      for (const x of [200, 720, 1240]) {
        const els = document.elementsFromPoint(x, y).slice(0, 4).map(describe);
        out.gapProbe.push({ x, y, stack: els.map((e) => `${e.tag}.${e.cls}|${e.pos}|z${e.z}|bt:${e.borderTop}|bb:${e.borderBottom}|bs:${e.boxShadow}`) });
      }
    }
  }
  // any full-width thin element anywhere in the hero (h<=4, w>=1200)
  out.thinFullWidth = [...document.querySelectorAll("div,section,span,hr,canvas")].map(describe)
    .filter((e) => e && e.rect.w >= 1200 && e.rect.h <= 4 && e.rect.y < 900)
    .map((e) => `${e.tag}.${e.cls} y=${e.rect.y} h=${e.rect.h} bg=${e.bg} bt=${e.borderTop} bs=${e.boxShadow}`);
  // canvas boundaries
  out.canvases = [...document.querySelectorAll("canvas")].map((c) => { const r = c.getBoundingClientRect(); return { y: Math.round(r.y), h: Math.round(r.height), w: Math.round(r.width) }; });
  // any lime/green colored element
  out.greenish = [...document.querySelectorAll("*")].map(describe).filter((e) => e && /(?:lime|green|rgb\(\s*\d{0,2},\s*(?:1[5-9]\d|2\d\d),\s*\d{0,2}\s*\))/i.test(e.bg + e.borderTop + e.borderBottom + e.boxShadow)).slice(0, 5)
    .map((e) => `${e.tag}.${e.cls} bg=${e.bg} bt=${e.borderTop} bs=${e.boxShadow}`);
  return out;
}, describe.toString());

console.log(JSON.stringify(info, null, 1));
await browser.close();
