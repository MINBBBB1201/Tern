import puppeteer from "puppeteer-core";
import path from "node:path";

const OUT = path.resolve("docs/screenshots");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const base = process.argv[2] || "http://localhost:3000";
const tag = process.argv[3] || "before"; // before | after
const EMAIL = "i3-audit-tern@example.com";
const PASSWORD = "Tern-i3-Audit-9271";
const IOS_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const bookingUrl = `${base}/booking?from=ICN&to=NRT&departureDate=2026-09-15&adults=1&cabinClass=economy`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--enable-webgl", "--use-gl=angle"] });

async function phone() {
  const p = await browser.newPage();
  await p.setUserAgent(IOS_UA);
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  return p;
}
async function desktop() {
  const p = await browser.newPage();
  await p.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
  return p;
}
const shot = (p, name) => p.screenshot({ path: path.join(OUT, `i3-${tag}-${name}.png`) });

async function clickByText(page, selector, re) {
  return page.evaluate((selector, reStr) => {
    const rx = new RegExp(reStr, "i");
    const el = [...document.querySelectorAll(selector)].find((e) => rx.test(e.textContent || ""));
    if (el) { el.click(); return true; }
    return false;
  }, selector, re.source);
}

async function openHamburger(page) {
  // new hamburger exposes aria-label "Open menu"
  return page.evaluate(() => {
    const b = document.querySelector('[aria-label="Open menu"],[data-menu-btn]');
    if (b) { b.click(); return true; }
    return false;
  });
}

// ---- context 1: SIGNED OUT ----
let p = await phone();
await p.goto(`${base}/`, { waitUntil: "networkidle2" }); await sleep(2500);
await shot(p, "nav-home-signedout-mobile");
const hb1 = await openHamburger(p); await sleep(500);
if (hb1) await shot(p, "menu-home-signedout-mobile");
await p.close();

p = await phone();
await p.goto(bookingUrl, { waitUntil: "networkidle2" }); await sleep(3500);
await shot(p, "nav-booking-signedout-mobile");
// scroll to results, click first Select -> before: modal opens (no gate); after: gate opens
await p.evaluate(() => { const b = [...document.querySelectorAll("button")].find(x => /^Select$/i.test((x.textContent||"").trim())); b?.scrollIntoView({block:"center"}); });
await sleep(600);
const sel1 = await clickByText(p, "button", /^Select$/);
await sleep(1200);
await shot(p, "select-signedout-mobile");
console.log(`signed-out Select clicked=${sel1}`);
await p.close();

// desktop signed-out select
p = await desktop();
await p.goto(bookingUrl, { waitUntil: "networkidle2" }); await sleep(3500);
await p.evaluate(() => { const b = [...document.querySelectorAll("button")].find(x => /^Select$/i.test((x.textContent||"").trim())); b?.scrollIntoView({block:"center"}); });
await sleep(500);
await clickByText(p, "button", /^Select$/);
await sleep(1200);
await shot(p, "select-signedout-desktop");
await p.close();

// ---- context 2: SIGN IN, then signed-in states (shared browser context) ----
const ctx = await phone();
await ctx.goto(`${base}/signin`, { waitUntil: "networkidle2" }); await sleep(1500);
await ctx.type('input#email', EMAIL, { delay: 20 });
await ctx.type('input#password', PASSWORD, { delay: 20 });
await Promise.all([
  ctx.evaluate(() => { const f = document.querySelector("form"); f?.requestSubmit ? f.requestSubmit() : f?.submit(); }),
]);
await sleep(4000); // wait for auth + redirect to /
const signedIn = await ctx.evaluate(() => !!window.localStorage || true);
console.log(`after signin url=${ctx.url()}`);
await ctx.close();

// reuse a fresh phone page in same browser (session persists via IndexedDB in the browser, but each page is new context-less; Firebase persists in IndexedDB per-origin so it's shared)
p = await phone();
await p.goto(`${base}/`, { waitUntil: "networkidle2" }); await sleep(3000);
await shot(p, "nav-home-signedin-mobile");
const hb2 = await openHamburger(p); await sleep(500);
if (hb2) await shot(p, "menu-home-signedin-mobile");
await p.close();

p = await phone();
await p.goto(bookingUrl, { waitUntil: "networkidle2" }); await sleep(3500);
await shot(p, "nav-booking-signedin-mobile");
const hb3 = await openHamburger(p); await sleep(500);
if (hb3) await shot(p, "menu-booking-signedin-mobile");
await p.close();

// signed-in desktop nav
p = await desktop();
await p.goto(`${base}/`, { waitUntil: "networkidle2" }); await sleep(2500);
await shot(p, "nav-home-signedin-desktop");
await p.close();

// signed-in: Select should go straight to checkout (no gate)
p = await phone();
await p.goto(bookingUrl, { waitUntil: "networkidle2" }); await sleep(3500);
await p.evaluate(() => { const b = [...document.querySelectorAll("button")].find(x => /^Select$/i.test((x.textContent||"").trim())); b?.scrollIntoView({block:"center"}); });
await sleep(500);
await clickByText(p, "button", /^Select$/);
await sleep(1200);
await shot(p, "select-signedin-mobile");
await p.close();

await browser.close();
console.log("done");
