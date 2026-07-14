import { NextResponse } from "next/server";
import { getFxRates } from "../../../lib/currency";

export async function GET() {
  const rates = await getFxRates();
  if (!rates) {
    return NextResponse.json({ error: "rates unavailable" }, { status: 503 });
  }
  return NextResponse.json(rates);
}
