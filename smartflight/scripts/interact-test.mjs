import puppeteer from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });
await sleep(2500);

// Click the real Search flights button through the fixed canvas layers
const btn = await page.$$eval("button", (els) => {
  const b = els.find((e) => e.textContent?.includes("Search flights"));
  if (!b) return null;
  const r = b.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
});
if (!btn) {
  console.log("FAIL: Search flights button not found");
} else {
  const hit = await page.evaluate(({ x, y }) => {
    const el = document.elementFromPoint(x, y);
    return { tag: el?.tagName, text: el?.textContent?.slice(0, 30) };
  }, btn);
  console.log("elementFromPoint at button:", JSON.stringify(hit));
  await page.mouse.click(btn.x, btn.y);
  await sleep(4000);
  console.log("URL after click:", page.url());
}

// Keyboard path: Tab focus must reach interactive controls
await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });
await sleep(1500);
const focusChain = [];
for (let i = 0; i < 8; i++) {
  await page.keyboard.press("Tab");
  focusChain.push(
    await page.evaluate(() => {
      const a = document.activeElement;
      return a?.tagName + (a?.textContent ? ":" + a.textContent.slice(0, 20).trim() : "");
    })
  );
}
console.log("TAB CHAIN:", JSON.stringify(focusChain));
await browser.close();
