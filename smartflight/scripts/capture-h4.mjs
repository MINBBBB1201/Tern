import puppeteer from "puppeteer-core";
import path from "node:path";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox"] });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 900 });
await p.goto("http://localhost:3000/about", { waitUntil: "networkidle2" });
await sleep(2500);
const found = await p.evaluate(() => {
  const el = document.querySelector("#money");
  if (el) el.scrollIntoView({ block: "center", behavior: "instant" });
  return !!el;
});
await sleep(700);
await p.screenshot({ path: path.resolve("docs/screenshots/h4-how-we-make-money.png") });
const txt = await p.evaluate(() => document.querySelector("#money")?.innerText.replace(/\n+/g, " ").slice(0, 200));
const links = await p.evaluate(() =>
  [...document.querySelectorAll("#money a")].map((a) => ({ label: a.textContent.trim(), href: a.getAttribute("href") }))
);
console.log("money section present:", found);
console.log("text:", txt);
console.log("links:", JSON.stringify(links));
await b.close();
