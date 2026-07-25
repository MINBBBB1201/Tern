import { NextRequest, NextResponse } from "next/server";
import { getLocale } from "next-intl/server";
import { fetchAirportWeather } from "../../../lib/airportWeather";

export async function GET(req: NextRequest) {
  const iata = req.nextUrl.searchParams.get("iata");

  if (!iata || iata.length !== 3) {
    return NextResponse.json({ error: "invalid iata code" }, { status: 400 });
  }

  // The condition string is rendered as the chip's alt text, so it follows
  // the caller's locale cookie like the rest of the UI.
  const weather = await fetchAirportWeather(iata, await getLocale());

  if (!weather) {
    return NextResponse.json({ error: "no data" }, { status: 404 });
  }

  return NextResponse.json(weather);
}
