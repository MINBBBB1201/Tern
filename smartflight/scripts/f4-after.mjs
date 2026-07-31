import puppeteer from "puppeteer-core";
import path from "node:path";
const OUT = path.resolve("docs/screenshots");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const base = process.argv[2] || "http://localhost:3100";
const suffix = process.argv[3] || "after"; // "after" | "before"

const AIRLINES = [
  { airline: "Korean Air", airlineIata: "KE", logo: "https://images.kiwi.com/airlines/64/KE.png" },
  { airline: "Asiana Airlines", airlineIata: "OZ", logo: "https://images.kiwi.com/airlines/64/OZ.png" },
  { airline: "Turkish Airlines", airlineIata: "TK", logo: "https://images.kiwi.com/airlines/64/TK.png" },
  { airline: "Singapore Airlines", airlineIata: "SQ", logo: "https://images.kiwi.com/airlines/64/SQ.png" },
];

function offersFor(dateStr) {
  const day = Number((dateStr || "2026-09-15").slice(8, 10)) || 15;
  // Deterministic price spread with a clear minimum, so the trend line + "Best" dot render.
  const basePrice = 400 + ((day * 37) % 190);
  return AIRLINES.map((a, i) => {
    const dep = `${dateStr}T${String(8 + i * 3).padStart(2, "0")}:30:00`;
    const arrH = 8 + i * 3 + 2 + i; // varying durations
    const arr = `${dateStr}T${String(Math.min(23, arrH)).padStart(2, "0")}:05:00`;
    const stops = i % 3 === 2 ? 1 : 0;
    return {
      id: `mock-${dateStr}-${i}`,
      price: String(basePrice + i * 60 + stops * 40),
      currency: "USD",
      airline: a.airline,
      airlineIata: a.airlineIata,
      airlineLogo: a.logo,
      departure: dep,
      arrival: arr,
      stops,
      duration: `PT${2 + i}H${(i * 15) % 60}M`,
      originAirport: "ICN",
      destinationAirport: "NRT",
      aircraftIata: "788",
      cabinClass: "economy",
      segments: [
        { departing_at: dep, arriving_at: arr, origin: "ICN", destination: "NRT", duration: `PT${2 + i}H`, marketing_carrier: a.airline },
      ],
    };
  });
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--enable-webgl", "--use-gl=angle"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
await page.setRequestInterception(true);
page.on("request", (req) => {
  const url = req.url();
  if (url.includes("/api/search") && req.method() === "POST") {
    let dateStr = "2026-09-15";
    try { dateStr = JSON.parse(req.postData() || "{}").departureDate || dateStr; } catch {}
    return req.respond({ status: 200, contentType: "application/json", body: JSON.stringify({ offers: offersFor(dateStr) }) });
  }
  req.continue();
});

async function shoot(url, name, { full = true, waitMs = 4000, clickTrend = false } = {}) {
  await page.goto(url, { waitUntil: "networkidle2" });
  await sleep(waitMs);
  if (clickTrend) {
    const clicked = await page.evaluate(() => {
      const b = [...document.querySelectorAll("button")].find((x) => /trend|load/i.test(x.textContent || ""));
      if (b) { b.click(); return true; } return false;
    });
    if (clicked) await sleep(3500);
  }
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: full });
  console.log("shot", name, "trendClicked?", clickTrend);
}

const bookingUrl = `${base}/booking?from=ICN&to=NRT&fromCity=Seoul&toCity=Tokyo&departureDate=2026-09-15&adults=1&cabinClass=economy`;
await shoot(bookingUrl, `f4-booking-${suffix}`);
await shoot(bookingUrl, `f4-pricetrend-${suffix}`, { clickTrend: true });
await shoot(`${base}/guide/airport/ICN`, `f4-guide-${suffix}`);

await browser.close();
