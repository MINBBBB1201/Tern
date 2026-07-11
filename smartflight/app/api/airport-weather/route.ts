import { NextRequest, NextResponse } from "next/server";
import { fetchAirportWeather } from "../../../lib/airportWeather";

export async function GET(req: NextRequest) {
  const iata = req.nextUrl.searchParams.get("iata");

  if (!iata || iata.length !== 3) {
    return NextResponse.json({ error: "invalid iata code" }, { status: 400 });
  }

  const weather = await fetchAirportWeather(iata);

  if (!weather) {
    return NextResponse.json({ error: "no data" }, { status: 404 });
  }

  return NextResponse.json(weather);
}
