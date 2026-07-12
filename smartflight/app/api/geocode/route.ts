import { NextRequest, NextResponse } from "next/server";
import { geocodeAddress } from "../../../lib/geocode";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  const country = req.nextUrl.searchParams.get("country") || undefined;
  const results = await geocodeAddress(q, country);
  return NextResponse.json({ results });
}
