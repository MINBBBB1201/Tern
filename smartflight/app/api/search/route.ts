import { NextRequest, NextResponse } from "next/server";

const getAirlineLogoByIata = (iataCode?: string) => {
  if (!iataCode) return undefined;
  return `https://images.kiwi.com/airlines/64/${iataCode.toUpperCase()}.png`;
};

const BOOKABLE_AIRLINE_IATA = new Set([
  "KE", "OZ", "TK", "UA", "DL", "AF", "KL", "LH", "NH", "AA", "BA", "QR", "EK",
  "SQ", "CX", "EY", "AC", "JL", "BR", "AY", "LX", "OS", "LO", "VN", "TG", "MH", "GA",
  "7C", "YP",
]);

const isBookableAirline = (name?: string, iata?: string) => {
  const normalizedName = (name || "").toLowerCase().trim();
  const normalizedIata = (iata || "").toUpperCase().trim();
  if (!normalizedName || !normalizedIata) return false;
  if (
    normalizedName.includes("duffel") ||
    normalizedName.includes("dummy") ||
    normalizedName.includes("test") ||
    normalizedName.includes("sample")
  ) {
    return false;
  }
  return BOOKABLE_AIRLINE_IATA.has(normalizedIata);
};

type DuffelSegment = {
  departing_at?: string;
  arriving_at?: string;
  duration?: string;
  origin?: { iata_code?: string };
  destination?: { iata_code?: string };
  marketing_carrier?: { name?: string; iata_code?: string };
  operating_carrier?: { name?: string; iata_code?: string };
  aircraft?: { name?: string; iata_code?: string };
};

type DuffelOffer = {
  id: string;
  total_amount: string;
  total_currency: string;
  slices?: Array<{
    duration?: string;
    segments?: DuffelSegment[];
  }>;
};

export async function POST(req: NextRequest) {
  const {
    origin,
    destination,
    departureDate,
    adults = 1,
    children = 0,
    infants = 0,
    cabinClass = "economy",
  } = await req.json();

  const token = process.env.DUFFEL_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json({ error: "No token" }, { status: 500 });
  }

  try {
    const offerRes = await fetch("https://api.duffel.com/air/offer_requests", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Duffel-Version": "v2",
        Accept: "application/json",
      },
      body: JSON.stringify({
        data: {
          slices: [
            {
              origin,
              destination,
              departure_date: departureDate,
            },
          ],
          passengers: [
            ...Array(Math.max(1, Number(adults) || 1)).fill({ type: "adult" }),
            ...Array(Math.max(0, Number(children) || 0)).fill({ type: "child" }),
            ...Array(Math.max(0, Number(infants) || 0)).fill({ type: "infant_without_seat" }),
          ],
          cabin_class: cabinClass,
        },
      }),
    });

    const offerData = await offerRes.json();

    if (!offerRes.ok) {
      console.error("Duffel error:", offerData);
      return NextResponse.json({ error: offerData }, { status: 500 });
    }

    const rawOffers = ((offerData as { data?: { offers?: DuffelOffer[] } })?.data?.offers ?? []).slice(0, 50);

    const offers = rawOffers.map((offer) => {
      const firstSlice = offer.slices?.[0];
      const segments = firstSlice?.segments ?? [];
      const firstSegment = segments?.[0];
      const lastSegment = segments?.[segments?.length - 1];
      const carrier = firstSegment?.operating_carrier ?? firstSegment?.marketing_carrier;
      const carrierIata = carrier?.iata_code;
      const firstAircraft = firstSegment?.aircraft;

      return {
        id: offer.id,
        price: offer.total_amount,
        currency: offer.total_currency,
        airline: carrier?.name,
        airlineIata: carrierIata,
        airlineLogo: getAirlineLogoByIata(carrierIata),
        departure: firstSegment?.departing_at,
        arrival: lastSegment?.arriving_at,
        stops: segments.length - 1,
        duration: firstSlice?.duration,
        originAirport: firstSegment?.origin?.iata_code,
        destinationAirport: lastSegment?.destination?.iata_code,
        aircraftType: firstAircraft?.name,
        aircraftIata: firstAircraft?.iata_code,
        cabinClass,
        segments: segments.map((segment) => ({
          departing_at: segment?.departing_at,
          arriving_at: segment?.arriving_at,
          origin: segment?.origin?.iata_code,
          destination: segment?.destination?.iata_code,
          duration: segment?.duration,
          marketing_carrier: segment?.marketing_carrier?.name,
          operating_carrier: segment?.operating_carrier?.name,
          aircraft: segment?.aircraft?.name,
        })),
      };
    }).filter((offer) => isBookableAirline(offer.airline, offer.airlineIata)).slice(0, 20);

    return NextResponse.json({ offers });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
