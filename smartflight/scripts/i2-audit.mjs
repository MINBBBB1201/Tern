import puppeteer from "puppeteer-core";
import path from "node:path";
import fs from "node:fs";

const OUT = path.resolve("docs/screenshots");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const base = process.argv[2] || "http://localhost:3000";
const tag = process.argv[3] || "before"; // before | after

const IOS_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const IPAD_UA =
  "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

const devices = [
  { name: "iphone390", w: 390, h: 844, ua: IOS_UA },
  { name: "ipadport820", w: 820, h: 1180, ua: IPAD_UA },
  { name: "ipadland1180", w: 1180, h: 820, ua: IPAD_UA },
];

const bookingUrl = `${base}/booking?from=ICN&to=NRT&departureDate=2026-09-15&adults=2&cabinClass=business`;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--enable-webgl", "--use-gl=angle"],
});

async function newPage(d) {
  const page = await browser.newPage();
  await page.setUserAgent(d.ua);
  await page.setViewport({ width: d.w, height: d.h, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  return page;
}

function shot(page, name, d) {
  return page.screenshot({ path: path.join(OUT, `i2-${tag}-${name}-${d.name}.png`) });
}

// Report horizontal overflow + measure a set of tap targets
async function measure(page, label) {
  const info = await page.evaluate(() => {
    const docW = document.documentElement.clientWidth;
    const scrollW = document.documentElement.scrollWidth;
    const out = { docW, scrollW, overflow: scrollW - docW, small: [] };
    const sel = [
      ".vol-pill-option", ".vol-swap", ".vol-stepper-btn", ".vol-done-btn",
      ".vol-search-btn", ".glass-chip.rounded-full", ".brand-range",
    ];
    const seen = new Set();
    for (const s of sel) {
      for (const el of document.querySelectorAll(s)) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        const key = `${s}@${Math.round(r.top)},${Math.round(r.left)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        if (r.height < 44 || r.width < 44) {
          out.small.push({ sel: s, w: Math.round(r.width), h: Math.round(r.height), txt: (el.textContent || "").trim().slice(0, 18) });
        }
      }
    }
    return out;
  });
  console.log(`  [${label}] docW=${info.docW} scrollW=${info.scrollW} hOverflow=${info.overflow}px  under-44 targets=${info.small.length}`);
  info.small.slice(0, 12).forEach((s) => console.log(`      ${s.sel} ${s.w}x${s.h} "${s.txt}"`));
}

for (const d of devices) {
  console.log(`\n===== ${d.name} (${d.w}x${d.h}) =====`);

  // ---------- HOMEPAGE HERO ----------
  let page = await newPage(d);
  await page.goto(`${base}/`, { waitUntil: "networkidle2" });
  await sleep(3500);
  // Bring the search widget into view
  await page.evaluate(() => document.querySelector(".vol-shell")?.scrollIntoView({ block: "center" }));
  await sleep(600);
  await shot(page, "hero-default", d);
  await measure(page, "hero-default");

  // Passenger popover open
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll(".vol-shell button")];
    const pax = btns.find((b) => /Passenger|승객|passenger/i.test(b.textContent || "") || b.querySelector('svg') && /Adult|Passenger/i.test(b.textContent||''));
    // fallback: the passenger field is the button that contains a ChevronDown + label "Passengers"
  });
  // Click the passengers field directly by locating its label text via evaluate
  await page.evaluate(() => {
    const fields = [...document.querySelectorAll(".vol-shell button.vol-field")];
    // passenger button is the .vol-field button that is NOT an airport field (has Users icon). It's the last vol-field button.
    const target = fields[fields.length - 1];
    target?.click();
  });
  await sleep(500);
  await shot(page, "hero-passengers", d);
  await measure(page, "hero-passengers");

  // Airport field editing + suggestions
  await page.evaluate(() => {
    const fields = [...document.querySelectorAll(".vol-shell button.vol-field")];
    fields[0]?.click(); // FROM
  });
  await sleep(300);
  await page.evaluate(() => {
    const inp = document.querySelector(".vol-inline-input");
    if (inp) { inp.focus(); }
  });
  await page.keyboard.type("Tok", { delay: 60 });
  await sleep(700);
  await shot(page, "hero-airport-edit", d);
  await measure(page, "hero-airport-edit");
  await page.close();

  // ---------- BOOKING ----------
  page = await newPage(d);
  await page.goto(bookingUrl, { waitUntil: "networkidle2" });
  await sleep(3500);
  await shot(page, "booking-top", d);
  await measure(page, "booking-top");

  // Scroll a bit so the filters bar is visible near top
  await page.evaluate(() => {
    const el = [...document.querySelectorAll("button")].find((b) => /Airlines|항공사/i.test(b.textContent || ""));
    el?.scrollIntoView({ block: "center" });
  });
  await sleep(400);
  await shot(page, "booking-filters", d);

  // Open Airlines panel
  await page.evaluate(() => {
    const el = [...document.querySelectorAll("button")].find((b) => /Airlines|항공사/i.test(b.textContent || ""));
    el?.click();
  });
  await sleep(400);
  await shot(page, "booking-airlines-panel", d);
  await measure(page, "booking-airlines-panel");

  // Close, open Times panel (dual sliders)
  await page.evaluate(() => {
    const el = [...document.querySelectorAll("button")].find((b) => /Airlines|항공사/i.test(b.textContent || ""));
    el?.click();
    const t = [...document.querySelectorAll("button")].find((b) => /^Times|시간/i.test(b.textContent || ""));
    t?.click();
  });
  await sleep(400);
  await shot(page, "booking-times-panel", d);
  await measure(page, "booking-times-panel");

  await page.close();
}

await browser.close();
console.log("\ndone");
