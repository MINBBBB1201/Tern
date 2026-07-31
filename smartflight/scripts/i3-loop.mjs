import puppeteer from "puppeteer-core";
import path from "node:path";

const OUT = path.resolve("docs/screenshots");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const base = process.argv[2] || "http://localhost:3000";
const EMAIL = "i3-audit-tern@example.com";
const PASSWORD = "Tern-i3-Audit-9271";
const IOS_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const bookingUrl = `${base}/booking?from=ICN&to=NRT&departureDate=2026-09-15&adults=1&cabinClass=economy`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--enable-webgl", "--use-gl=angle"] });
const shot = (p, name) => p.screenshot({ path: path.join(OUT, `i3-after-${name}.png`) });

async function mkPage(ctx, mobile) {
  const p = await ctx.newPage();
  if (mobile) { await p.setUserAgent(IOS_UA); await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); }
  else { await p.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 }); }
  return p;
}
async function clickSelect(p) {
  await p.evaluate(() => { const b = [...document.querySelectorAll("button")].find(x => /^Select$/i.test((x.textContent||"").trim())); b?.scrollIntoView({block:"center"}); });
  await sleep(500);
  return p.evaluate(() => { const b = [...document.querySelectorAll("button")].find(x => /^Select$/i.test((x.textContent||"").trim())); if (b){b.click(); return true;} return false; });
}
async function openHamburger(p) {
  return p.evaluate(() => { const b = document.querySelector('[aria-label="Menu"]'); if (b){b.click(); return true;} return false; });
}
async function detect(p) {
  return p.evaluate(() => ({
    gate: !!document.querySelector('input[type="email"]') && /Sign in to book|로그인|ログイン|登录/.test(document.body.innerText),
    checkout: /Review your flight|Continue to booking|검토|レビュー|预订/.test(document.body.innerText) && !document.querySelector('input[type="email"]'),
  }));
}

// ========== MOBILE: full gate loop ==========
const m = await browser.createBrowserContext();
let p = await mkPage(m, true);

// signed-out nav (hamburger present)
await p.goto(`${base}/`, { waitUntil: "networkidle2" }); await sleep(2500);
await shot(p, "nav-home-signedout-mobile");
await openHamburger(p); await sleep(500);
await shot(p, "menu-home-signedout-mobile");
await p.close();

// signed-out Select -> gate
p = await mkPage(m, true);
await p.goto(bookingUrl, { waitUntil: "networkidle2" }); await sleep(3500);
await shot(p, "nav-booking-signedout-mobile");
const clicked = await clickSelect(p); await sleep(1200);
let st = await detect(p);
await shot(p, "select-signedout-mobile");
console.log(`MOBILE signed-out Select clicked=${clicked} -> gate=${st.gate} checkout=${st.checkout}`);

// sign in inside the gate (login mode is default)
await p.type('input[type="email"]', EMAIL, { delay: 25 });
await p.type('input[type="password"]', PASSWORD, { delay: 25 });
await p.evaluate(() => { const f = document.querySelector("form"); (f?.requestSubmit ? f.requestSubmit() : document.querySelector('button[type="submit"]')?.click()); });
await sleep(5000);
st = await detect(p);
await shot(p, "gate-continue-mobile");
console.log(`MOBILE after gate sign-in -> gate=${st.gate} checkout=${st.checkout} (checkout=true means auto-resumed)`);
await p.close();

// signed-in nav + hamburger (session persists in context m)
p = await mkPage(m, true);
await p.goto(`${base}/`, { waitUntil: "networkidle2" }); await sleep(2800);
await shot(p, "nav-home-signedin-mobile");
await openHamburger(p); await sleep(500);
await shot(p, "menu-home-signedin-mobile");
await p.close();

p = await mkPage(m, true);
await p.goto(bookingUrl, { waitUntil: "networkidle2" }); await sleep(3500);
await openHamburger(p); await sleep(500);
await shot(p, "menu-booking-signedin-mobile");
await p.close();

// signed-in Select -> straight to checkout (no gate)
p = await mkPage(m, true);
await p.goto(bookingUrl, { waitUntil: "networkidle2" }); await sleep(3500);
await clickSelect(p); await sleep(1200);
st = await detect(p);
await shot(p, "select-signedin-mobile");
console.log(`MOBILE signed-in Select -> gate=${st.gate} checkout=${st.checkout} (checkout=true, no gate expected)`);
await p.close();
await m.close();

// ========== DESKTOP: gate loop ==========
const d = await browser.createBrowserContext();
p = await mkPage(d, false);
await p.goto(bookingUrl, { waitUntil: "networkidle2" }); await sleep(3500);
const dClicked = await clickSelect(p); await sleep(1200);
st = await detect(p);
await shot(p, "select-signedout-desktop");
console.log(`DESKTOP signed-out Select clicked=${dClicked} -> gate=${st.gate} checkout=${st.checkout}`);
await p.type('input[type="email"]', EMAIL, { delay: 20 });
await p.type('input[type="password"]', PASSWORD, { delay: 20 });
await p.evaluate(() => { const f = document.querySelector("form"); (f?.requestSubmit ? f.requestSubmit() : document.querySelector('button[type="submit"]')?.click()); });
await sleep(5000);
st = await detect(p);
await shot(p, "gate-continue-desktop");
console.log(`DESKTOP after gate sign-in -> gate=${st.gate} checkout=${st.checkout}`);
await p.close();

p = await mkPage(d, false);
await p.goto(`${base}/`, { waitUntil: "networkidle2" }); await sleep(2500);
await shot(p, "nav-home-signedin-desktop");
await p.close();
await d.close();

await browser.close();
console.log("done");
