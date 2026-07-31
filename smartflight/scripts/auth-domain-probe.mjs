import puppeteer from "puppeteer-core";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox"],
});
const page = await browser.newPage();

const targets = [
  "https://auth.flytern.site/__/auth/handler",
  "https://smartflight-70ae5.firebaseapp.com/__/auth/handler",
];

for (const url of targets) {
  const out = { url, status: null, error: null, security: null };
  try {
    const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    out.status = resp ? resp.status() : "no-response";
    try {
      const sd = resp.securityDetails?.();
      if (sd) out.security = { protocol: sd.protocol(), issuer: sd.issuer(), subjectName: sd.subjectName(), san: (sd.subjectAlternativeNames?.() || []).slice(0, 8) };
    } catch {}
  } catch (e) {
    out.error = e.message;
  }
  console.log(JSON.stringify(out, null, 2));
}

await browser.close();
