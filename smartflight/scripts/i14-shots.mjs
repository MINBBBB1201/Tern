/**
 * I14-1 verification: the TossPayments widget actually rendered, in all four
 * locales. `node scripts/i14-shots.mjs`
 *
 * "Rendered" is checked structurally, not by eye: the widget is an iframe Toss
 * injects into our container, so the probe counts iframes inside
 * #toss-payment-method / #toss-agreement and reports their sizes. A screenshot
 * alone cannot tell "widget rendered" from "empty container styled like a
 * panel" — and next-intl ships the whole message bundle in the HTML, so
 * grepping for copy proves nothing either (I11).
 *
 * Headful: the widget loads a cross-origin iframe and runs its own scripts;
 * headless is a different enough environment that a pass there would not be
 * evidence about the browser a customer uses.
 *
 * Accept-Language pinned per locale (I9) AND the locale is in the URL, so the
 * two cannot disagree.
 */
import puppeteer from "puppeteer-core";
import fs from "node:fs";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://localhost:3000";
const OUT = "docs/screenshots";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const LOCALES = [
  ["en", "", "en-US,en;q=0.9"],
  ["ko", "/ko", "ko-KR,ko;q=0.9"],
  ["ja", "/ja", "ja-JP,ja;q=0.9"],
  ["zh", "/zh", "zh-CN,zh;q=0.9"],
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: false,
  defaultViewport: null,
  protocolTimeout: 120000,
  args: ["--window-size=1400,1100", "--hide-scrollbars"],
});

const report = [];

for (const [locale, prefix, acceptLanguage] of LOCALES) {
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text().slice(0, 200));
  });
  await page.setExtraHTTPHeaders({ "Accept-Language": acceptLanguage });
  await page.setViewport({ width: 1280, height: 1000, deviceScaleFactor: 2 });
  const res = await page.goto(`${BASE}${prefix}/checkout`, { waitUntil: "networkidle0" });

  // The widget renders asynchronously after the SDK loads; wait for the
  // iframe rather than a fixed sleep.
  let rendered = true;
  try {
    await page.waitForSelector("#toss-payment-method iframe", { timeout: 25000 });
  } catch {
    rendered = false;
  }
  await sleep(1800); // let the iframe paint its content before the shot

  const probe = await page.evaluate(() => {
    const box = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height) };
    };
    const frames = (sel) => document.querySelectorAll(`${sel} iframe`).length;
    // Scope to the payment panel: .btn-sheen is also on the nav's Sign In
    // button, and querySelector was handing that back instead.
    const payBtn = document.querySelector("main button.btn-sheen");
    return {
      methodFrames: frames("#toss-payment-method"),
      agreementFrames: frames("#toss-agreement"),
      methodBox: box("#toss-payment-method"),
      agreementBox: box("#toss-agreement"),
      payButtonText: payBtn?.textContent?.trim() ?? null,
      payButtonDisabled: payBtn?.disabled ?? null,
      // The visible error slot, if the page put anything in it.
      alert: document.querySelector('[role="alert"]')?.textContent?.trim() ?? null,
      htmlLang: document.documentElement.lang,
    };
  });

  await page.screenshot({ path: `${OUT}/i14-${locale}-payment-widget.png`, fullPage: true });
  report.push({ locale, http: res.status(), rendered, ...probe, consoleErrors });
  console.log(
    locale,
    "http", res.status(),
    "| methodFrames", probe.methodFrames,
    "agreementFrames", probe.agreementFrames,
    "| method", JSON.stringify(probe.methodBox),
    "| payBtn", JSON.stringify(probe.payButtonText), "disabled:", probe.payButtonDisabled,
    "| alert", JSON.stringify(probe.alert)
  );
  if (consoleErrors.length) console.log("   console errors:", consoleErrors.slice(0, 3));
  await page.close();
}

await browser.close();
fs.writeFileSync(`${OUT}/i14-widget-report.json`, JSON.stringify(report, null, 2));
