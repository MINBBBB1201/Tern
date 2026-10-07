/**
 * I14-3 verification: the payment result screen, in each branch.
 * `node scripts/i14-result-shots.mjs`
 *
 * How each branch is reached — this matters for what the captures prove:
 *
 *  - `fail`   REAL. The page is loaded with a paymentKey Toss has never
 *             issued, so /api/payments/confirm really calls Toss and Toss
 *             really rejects it. The provider message on screen is Toss's own
 *             words from that live response, not a string we typed.
 *  - `cancel` SYNTHESIZED redirect. Toss appends `code`/`message` to failUrl
 *             when the payer closes the window; this reproduces that query
 *             string. It exercises our branch, and the report says so — a real
 *             cancel needs the payment window, which needs the widget key.
 *  - `none`   The bare URL, i.e. someone opening the result page directly.
 *
 * The success branch is NOT here: it needs a payment Toss actually approved.
 *
 * Headful + Accept-Language pinned per locale (I9).
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
];

const CASES = [
  ["fail", (n) => `?paymentKey=probe_no_such_payment_key&orderId=tern-probe-fail-${n}&amount=1000`],
  [
    "cancel",
    () =>
      `?code=PAY_PROCESS_CANCELED&message=${encodeURIComponent("사용자에 의해 결제가 취소되었습니다.")}&orderId=tern-probe-cancel`,
  ],
  ["none", () => ""],
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
  for (const [name, qs] of CASES) {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({ "Accept-Language": acceptLanguage });
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
    const url = `${BASE}${prefix}/checkout/result${qs(Date.now().toString(36))}`;
    const res = await page.goto(url, { waitUntil: "networkidle0" });
    await sleep(2500); // the fail case round-trips to Toss via our route

    const probe = await page.evaluate(() => {
      const main = document.querySelector("main");
      const h2 = main?.querySelector("h2")?.textContent?.trim() ?? null;
      const kicker = main?.querySelector("p.data-mono")?.textContent?.trim() ?? null;
      // The provider block is the only element with this border colour class.
      const providerBlock = main?.querySelector('[class*="rgba(248,113,113"]');
      return {
        heading: h2,
        kicker,
        providerMessage: providerBlock?.textContent?.trim().slice(0, 200) ?? null,
        bodyText: main?.textContent?.replace(/\s+/g, " ").trim().slice(0, 260) ?? null,
      };
    });

    await page.screenshot({ path: `${OUT}/i14-${locale}-result-${name}.png`, fullPage: true });
    report.push({ locale, case: name, http: res.status(), url, ...probe });
    console.log(`${locale}/${name}`, res.status(), "|", JSON.stringify(probe.kicker), "|", JSON.stringify(probe.heading));
    if (probe.providerMessage) console.log("   provider:", probe.providerMessage.replace(/\s+/g, " "));
    await page.close();
  }
}

await browser.close();
fs.writeFileSync(`${OUT}/i14-result-report.json`, JSON.stringify(report, null, 2));
