import puppeteer from "puppeteer-core";
import sharp from "sharp";
import path from "node:path";
const OUT = path.resolve("docs/screenshots");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const url = process.argv[2] || "http://localhost:3100";

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--enable-webgl", "--use-gl=angle"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: "networkidle2" });
await sleep(16000); // let signature sequence settle into Phase C/D
await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));

// Pause all CSS animations/transitions AND freeze the tern clock so the
// two captures differ ONLY by canvas visibility.
await page.addStyleTag({ content: "*,*::before,*::after{animation-play-state:paused!important;transition:none!important}" });
await page.evaluate(() => (window.__ternFreeze ? window.__ternFreeze() : null));
await sleep(300);

const clip = { x: 0, y: 471, width: 1440, height: 60 }; // CSS px: gap band y471..531
await page.screenshot({ path: path.join(OUT, "fz-on.png"), clip });
await page.evaluate(() => document.querySelectorAll("canvas").forEach((c) => (c.style.visibility = "hidden")));
await sleep(200);
await page.screenshot({ path: path.join(OUT, "fz-off.png"), clip });
await browser.close();

// Diff the gap band; boost 6x. Also report, per row, changed-col count for
// x>=1540 (2x of 770 → right of the globe+halo) so a real line stands out.
const onImg = sharp(path.join(OUT, "fz-on.png"));
const { width: W, height: H } = await onImg.metadata(); // device px (2x)
const on = await onImg.raw().toBuffer();
const off = await sharp(path.join(OUT, "fz-off.png")).raw().toBuffer();
const RIGHT = 770 * (W / clip.width); // CSS x=770 (right of globe+halo) in device px
const diff = Buffer.alloc(W * H * 3);
const rowRightCount = new Array(H).fill(0);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3;
    const m = (Math.abs(on[i] - off[i]) + Math.abs(on[i + 1] - off[i + 1]) + Math.abs(on[i + 2] - off[i + 2])) / 3;
    const boost = Math.min(255, m * 6);
    diff[i] = boost; diff[i + 1] = boost; diff[i + 2] = boost;
    if (x >= RIGHT && m > 8) rowRightCount[y]++;
  }
}
await sharp(diff, { raw: { width: W, height: H, channels: 3 } }).png().toFile(path.join(OUT, "fz-diff.png"));
const scale = W / clip.width;
console.log(`img ${W}x${H} (scale ${scale}). CSS-y | changed-cols where CSS-x>=770 [right of globe+halo]`);
for (let y = 0; y < H; y += Math.round(scale)) console.log((clip.y + y / scale).toFixed(0), rowRightCount[y]);
