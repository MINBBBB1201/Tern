import puppeteer from "puppeteer-core";
import path from "node:path";
const OUT = path.resolve("docs/screenshots");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--enable-webgl", "--use-gl=angle"] });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 900 });

// About page: corrected "delay-risk" honesty copy (diff3)
await p.goto("http://localhost:3000/about", { waitUntil: "networkidle2" });
await sleep(2500);
await p.evaluate(() => {
  const el = [...document.querySelectorAll("li,p")].find((e) => /delay-risk|risk signals/i.test(e.textContent || ""));
  el?.scrollIntoView({ block: "center", behavior: "instant" });
});
await sleep(600);
await p.screenshot({ path: path.join(OUT, "h3-about-honest-copy.png") });
const diff3 = await p.evaluate(() => {
  const el = [...document.querySelectorAll("li,p")].find((e) => /delay-risk score|risk signals/i.test(e.textContent || ""));
  return el?.textContent?.trim().slice(0, 140) || null;
});
console.log("H3 About delay-risk copy:", diff3);
console.log("H3 About mentions 'historical patterns'?", /historical patterns/i.test(diff3 || ""));

// Booking: risk badge tooltip present
await p.goto("http://localhost:3000/booking?tripType=oneway&from=ICN&fromCity=Seoul&to=NRT&toCity=Tokyo&departureDate=2026-08-15&adults=1&cabinClass=economy", { waitUntil: "networkidle2" });
await p.waitForFunction(() => document.body.innerText.includes("Risk"), { timeout: 60000 }).catch(() => {});
await sleep(1500);
const badge = await p.evaluate(() => {
  const el = [...document.querySelectorAll("span")].find((e) => /Risk\s*\d+\/98/.test(e.textContent || ""));
  return el ? { text: el.textContent.trim(), title: el.getAttribute("title") } : null;
});
console.log("H3 risk badge:", JSON.stringify(badge));
await b.close();
