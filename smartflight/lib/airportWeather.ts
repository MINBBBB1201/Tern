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
export async function fetchAirportWeather(iataCode: string): Promise<AirportWeather | null> {
  const airport = getAirport(iataCode);
  if (!airport) return null;

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.error("OPENWEATHER_API_KEY missing");
    return null;
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${airport.lat}&lon=${airport.lon}&units=metric&appid=${apiKey}`;

  const res = await fetch(url, { next: { revalidate: 1800 } }); // 30 min cache
  if (!res.ok) return null;

  const data = await res.json();

  return {
    tempC: Math.round(data.main?.temp ?? 0),
    condition: data.weather?.[0]?.main ?? "Unknown",
    icon: data.weather?.[0]?.icon ?? "01d",
    windKph: Math.round((data.wind?.speed ?? 0) * 3.6),
  };
}
