import puppeteer from "puppeteer-core";
import path from "node:path";
const OUT = path.resolve("docs/screenshots");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const base = process.argv[2] || "http://localhost:3000";
const tag = process.argv[3] || "before";

const IOS_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

const devices = [
  { name: "iphone390", w: 390, h: 844, ua: IOS_UA },
  { name: "ipadport820", w: 820, h: 1180, ua: IOS_UA },
  { name: "ipadland1180", w: 1180, h: 820, ua: IOS_UA },
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--enable-webgl", "--use-gl=angle"],
});

async function run(url, label) {
  for (const d of devices) {
    const page = await browser.newPage();
    await page.setUserAgent(d.ua);
    await page.setViewport({ width: d.w, height: d.h, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(url, { waitUntil: "networkidle2" });
    await sleep(4000);
    // Scroll to the problem zone (past the hero, into the sections below).
    await page.evaluate(() => window.scrollTo({ top: Math.round(window.innerHeight * 1.2), behavior: "instant" }));
    await sleep(900);

    const info = await page.evaluate(() => {
      const out = {
        scrollY: Math.round(window.scrollY),
        vh: window.innerHeight,
        coarse: window.matchMedia("(pointer: coarse)").matches,
      };
      const nav = document.querySelector("nav, header");
      if (nav) {
        const ncs = getComputedStyle(nav);
        out.navBg = ncs.backgroundColor;
        out.navBf = ncs.backdropFilter || ncs.webkitBackdropFilter || "none";
      }
      // Collect every fixed/sticky element and its on-screen rect.
      out.fixedEls = [];
      for (const el of document.querySelectorAll("*")) {
        const cs = getComputedStyle(el);
        if (cs.position === "fixed" || cs.position === "sticky") {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.height > 0 && r.height < 200) {
            out.fixedEls.push({
              tag: el.tagName,
              cls: (el.className?.toString?.() || "").slice(0, 48),
              pos: cs.position,
              z: cs.zIndex,
              top: Math.round(r.top),
              left: Math.round(r.left),
              w: Math.round(r.width),
              h: Math.round(r.height),
              bf: cs.backdropFilter || cs.webkitBackdropFilter || "none",
            });
          }
        }
      }
      const nr = nav?.getBoundingClientRect();
      out.navTop = nr ? Math.round(nr.top) : null;
      out.navPos = nav ? getComputedStyle(nav).position : null;
      return out;
    });
    console.log(`\n[${label} · ${d.name} @${d.w}x${d.h}] scrollY=${info.scrollY} navTop=${info.navTop} navPos=${info.navPos} coarse=${info.coarse}`);
    console.log(`   nav bg=${info.navBg} backdrop-filter=${info.navBf}`);
    info.fixedEls.forEach((e) =>
      console.log(`   ${e.pos} z${e.z} ${e.tag}.${e.cls} top=${e.top} h=${e.h} w=${e.w} bf=${e.bf.slice(0, 20)}`)
    );

    await page.screenshot({ path: path.join(OUT, `nav-${tag}-${label}-${d.name}.png`) });
    await page.close();
  }
}

await run(`${base}/`, "home");
await run(`${base}/booking?from=ICN&to=NRT&departureDate=2026-09-15`, "booking");
await browser.close();
console.log("\ndone");
