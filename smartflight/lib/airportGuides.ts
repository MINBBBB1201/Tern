/**
 * Curated airport arrival/departure guides. Real-time APIs are not wired;
 * copy is practical guidance for travelers. Falls back to a generic template.
 */

export type TransitMode = "taxi" | "bus" | "rail";

export type AirportTransitSection = {
  title: string;
  bullets: string[];
  avoidScams: string[];
  officialLinks?: { label: string; href: string }[];
};

export type AirportGuide = {
  iata: string;
  name: string;
  city: string;
  country: string;
  summary: string;
  terminals: string[];
  beforeYouFly: string[];
  afterYouLand: string[];
  transit: Record<TransitMode, AirportTransitSection>;
};

const DEFAULT_GUIDE = (iata: string): AirportGuide => ({
  iata: iata.toUpperCase(),
  name: `${iata.toUpperCase()} Airport`,
  city: "",
  country: "",
  summary:
    "Practical rules of thumb: follow official airport signage, prefer official taxi ranks or app pricing before you get in the car, and check the airport website for the latest bus or train maps.",
  terminals: ["Check the airport site for your airline’s terminal—assignments can change."],
  beforeYouFly: [
    "Arrive 2h early for international flights (3h in peak season if the airport recommends it).",
    "Save offline maps for the city and the airport in case of spotty Wi‑Fi.",
  ],
  afterYouLand: [
    "Withdraw a small amount of local cash if needed, but many cities are card-friendly.",
    "Open your ride-hailing or rail app only on official airport Wi‑Fi or mobile data to avoid fake hotspot pages.",
  ],
  transit: {
    taxi: {
      title: "Taxi",
      bullets: [
        "Use the official airport taxi stand or a licensed queue—avoid unsolicited drivers in the baggage hall.",
        "Before you enter the vehicle, confirm the driver will use the meter or that the app/flat fare matches the sign.",
        "Take a photo of the license plate and share your live location with someone you trust for late-night rides.",
      ],
      avoidScams: [
        "“Fixed price” that is 2–3× what ride apps show for the same route.",
        "Drivers who refuse the meter or claim the main rank is “closed.”",
        "Unofficial “airport transfer” desks with pressure sales in the arrivals hallway.",
      ],
    },
    bus: {
      title: "Bus",
      bullets: [
        "Airport buses usually leave from clearly marked bays outside arrivals—verify route number on the vehicle.",
        "Buy tickets from official machines, counters, or apps linked from the airport website.",
      ],
      avoidScams: [
        "Buy tickets only from machines or official counters—avoid strangers selling “discount” tickets.",
      ],
    },
    rail: {
      title: "Train / subway",
      bullets: [
        "Follow signs for “Train”, “Rail”, or “Metro”—often a separate building from the taxi area.",
        "Check last train times if you land late; sometimes airport buses replace trains after midnight.",
      ],
      avoidScams: [
        "Fake information booths pushing unnecessary shuttle packages.",
      ],
    },
  },
});

const GUIDES: Record<string, AirportGuide> = {
  ICN: {
    iata: "ICN",
    name: "Incheon International Airport",
    city: "Seoul",
    country: "South Korea",
    summary:
      "Main gateway to Seoul with clear signage in Korean and English. AREX trains and airport buses connect to the city; taxis use meter or flat fares from official ranks.",
    terminals: ["Terminal 1", "Terminal 2"],
    beforeYouFly: [
      "Verify whether your airline uses T1 or T2—some carriers moved terminals.",
      "Leave buffer time for security; peak periods can queue longer at immigration.",
    ],
    afterYouLand: [
      "AREX (Airport Railroad): Express and All-stop trains connect to Seoul Station—follow signs after baggage claim.",
      "Airport limousine buses stop outside arrivals with routes across Seoul.",
    ],
    transit: {
      taxi: {
        title: "Taxi",
        bullets: [
          "Use official taxi stands outside arrivals—queues are organized by vehicle type (regular, deluxe, jumbo).",
          "International taxis often have fixed-ish fares to major districts—confirm on the posted chart.",
          "Ride apps (e.g. Kakao T) work well—set pickup at the designated app zone if the airport posts one.",
        ],
        avoidScams: [
          "Unofficial offers in the hall; always go to the official rank or use a known app.",
        ],
        officialLinks: [
          { label: "IIAC passenger guide", href: "https://www.airport.kr/" },
        ],
      },
      bus: {
        title: "Airport bus",
        bullets: [
          "Limousine buses serve Gangnam, Myeongdong, Hongdae, and other hubs—buy tickets at counters near exits.",
          "Digital displays show route numbers and wait times at each bay.",
        ],
        avoidScams: [],
      },
      rail: {
        title: "AREX / subway",
        bullets: [
          "AREX Express: faster to Seoul Station; All-stop: more stops including Hongdae.",
          "Transfer to Seoul Metro lines at Seoul Station or Hongdae depending on your hotel.",
        ],
        avoidScams: [],
      },
    },
  },
  NRT: {
    iata: "NRT",
    name: "Narita International Airport",
    city: "Tokyo",
    country: "Japan",
    summary:
      "Major Tokyo gateway. Narita Express (N’EX), Keisei Skyliner, and airport buses compete with taxis at different price/speed tradeoffs.",
    terminals: ["Terminal 1", "Terminal 2", "Terminal 3"],
    beforeYouFly: [
      "Terminal 3 is mainly LCC—double-check walking distance and shuttle buses between terminals.",
    ],
    afterYouLand: [
      "Rail tickets: JR for N’EX, Keisei for Skyliner—different ticket machines; follow floor decals.",
      "IC cards (Suica/PASMO) help for trains and local buses after you reach the city.",
    ],
    transit: {
      taxi: {
        title: "Taxi",
        bullets: [
          "Fixed-fare taxis exist for major zones—ask at the official taxi information desk before queuing.",
          "Tokyo taxis are metered; highway tolls are usually added—confirm if unsure.",
        ],
        avoidScams: ["Avoid drivers soliciting inside baggage claim."],
      },
      bus: {
        title: "Airport bus",
        bullets: [
          "Limousine buses serve major hotels and stations—often easiest with heavy luggage.",
        ],
        avoidScams: [],
      },
      rail: {
        title: "Rail",
        bullets: [
          "N’EX to Tokyo/Shinjuku area on JR lines.",
          "Skyliner to Ueno/Nippori—fast for eastern Tokyo.",
        ],
        avoidScams: [],
      },
    },
  },
  HND: {
    iata: "HND",
    name: "Haneda Airport",
    city: "Tokyo",
    country: "Japan",
    summary:
      "Closer to central Tokyo than Narita; strong rail links (Tokyo Monorail, Keikyu) and taxi ranks by terminal.",
    terminals: ["Terminal 1", "Terminal 2", "Terminal 3"],
    beforeYouFly: ["Haneda is dense—allow time for domestic→international connections."],
    afterYouLand: [
      "Keikyu and Monorail serve different parts of Tokyo—pick based on your hotel district.",
    ],
    transit: {
      taxi: {
        title: "Taxi",
        bullets: [
          "Official taxi stands per terminal; shorter hops to central Tokyo than from Narita.",
        ],
        avoidScams: [],
      },
      bus: {
        title: "Bus",
        bullets: ["Airport buses connect to major hubs if you prefer no train transfers."],
        avoidScams: [],
      },
      rail: {
        title: "Rail",
        bullets: [
          "Tokyo Monorail to Hamamatsucho for JR Yamanote transfers.",
          "Keikyu Line toward Shinagawa and Yokohama.",
        ],
        avoidScams: [],
      },
    },
  },
  JFK: {
    iata: "JFK",
    name: "John F. Kennedy International Airport",
    city: "New York",
    country: "USA",
    summary:
      "Large multi-terminal airport; AirTrain connects terminals and links to NYC subway and LIRR at Jamaica or Howard Beach.",
    terminals: ["Terminals 1, 4, 5, 7, 8 (check airline)"],
    beforeYouFly: ["AirTrain is free between terminals; fare applies when exiting to subway/LIRR."],
    afterYouLand: [
      "Yellow taxi stands have dispatchers; rideshare has designated pickup zones per terminal.",
    ],
    transit: {
      taxi: {
        title: "Taxi",
        bullets: [
          "Use yellow cab stands with uniformed dispatchers—flat fares apply to Manhattan from JFK.",
          "For rideshare, follow airport signage to the specific pickup area—ignore solicitors.",
        ],
        avoidScams: [
          "Anyone offering rides inside the terminal away from official queues.",
        ],
      },
      bus: {
        title: "Bus",
        bullets: ["MTA buses connect nearby; most travelers use AirTrain + subway/LIRR instead."],
        avoidScams: [],
      },
      rail: {
        title: "AirTrain + rail",
        bullets: [
          "AirTrain to Jamaica → LIRR or subway E/J/Z lines.",
          "AirTrain to Howard Beach → subway A line.",
        ],
        avoidScams: [],
      },
    },
  },
  LHR: {
    iata: "LHR",
    name: "Heathrow Airport",
    city: "London",
    country: "UK",
    summary:
      "Heathrow Express and Elizabeth Line offer fast central London links; black cabs and licensed minicabs use regulated pricing.",
    terminals: ["Terminals 2, 3, 4, 5"],
    beforeYouFly: [],
    afterYouLand: [
      "Follow signs for Underground, Elizabeth Line, Heathrow Express, or Central Bus Station.",
    ],
    transit: {
      taxi: {
        title: "Taxi",
        bullets: [
          "Official black cab rank outside each terminal—metered with regulated tariffs.",
          "Pre-booked private hire must be with a licensed operator—never accept street hawkers.",
        ],
        avoidScams: ["Unlicensed drivers quoting inflated flat rates in arrivals."],
      },
      bus: {
        title: "Coach / bus",
        bullets: ["National Express and other coaches leave from the Central Bus Station."],
        avoidScams: [],
      },
      rail: {
        title: "Rail",
        bullets: [
          "Elizabeth Line to central London often balances speed and price.",
          "Heathrow Express is fastest to Paddington.",
          "Piccadilly Line is economical but slower with many stops.",
        ],
        avoidScams: [],
      },
    },
  },
};

export function getAirportGuide(iata: string): AirportGuide {
  const code = iata.trim().toUpperCase();
  return GUIDES[code] ?? DEFAULT_GUIDE(code);
}
