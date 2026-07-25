import { getAirport } from "./airportData";

export type AirportWeather = {
  tempC: number;
  condition: string;
  icon: string;
  windKph: number;
};

/**
 * Requires OPENWEATHER_API_KEY in env (server-side only — no NEXT_PUBLIC_
 * prefix, never exposed to the client).
 */
/** Our locale codes → OpenWeather's `lang` codes (ours match except zh). */
const OWM_LANG: Record<string, string> = { en: "en", ko: "kr", ja: "ja", zh: "zh_cn" };

export async function fetchAirportWeather(
  iataCode: string,
  locale = "en"
): Promise<AirportWeather | null> {
  const airport = getAirport(iataCode);
  if (!airport) return null;

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.error("OPENWEATHER_API_KEY missing");
    return null;
  }

  // `lang` localizes the condition text, which is the chip's alt text.
  const lang = OWM_LANG[locale] ?? "en";
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${airport.lat}&lon=${airport.lon}&units=metric&lang=${lang}&appid=${apiKey}`;

  const res = await fetch(url, { next: { revalidate: 1800 } }); // 30 min cache
  if (!res.ok) return null;

  const data = await res.json();

  return {
    tempC: Math.round(data.main?.temp ?? 0),
    // `description` is the field OpenWeather localizes; `main` is always English.
    condition: data.weather?.[0]?.description ?? data.weather?.[0]?.main ?? "",
    icon: data.weather?.[0]?.icon ?? "01d",
    windKph: Math.round((data.wind?.speed ?? 0) * 3.6),
  };
}
