import puppeteer from "puppeteer-core";
import path from "node:path";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--enable-webgl", "--use-gl=angle"] });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 900 });
await p.goto("http://localhost:3000", { waitUntil: "networkidle2" });
await sleep(5500);
await p.evaluate(() => {
  const h = [...document.querySelectorAll("h2")].find((e) => /Airline Deals/i.test(e.textContent || ""));
  h.scrollIntoView({ block: "start", behavior: "instant" });
  window.scrollBy(0, -90);
});
await sleep(1200);
await p.screenshot({ path: path.resolve("docs/screenshots/h1-home-deals-seeall.png") });
const seeAll = await p.evaluate(() =>
  [...document.querySelectorAll("a")].some((a) => a.getAttribute("href") === "/deals" && /see all|전체|すべて|查看全部/i.test(a.textContent || ""))
);
console.log("See-all link → /deals present:", seeAll);
await b.close();
