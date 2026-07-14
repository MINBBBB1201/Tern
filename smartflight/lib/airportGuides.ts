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

export type AccessibilityService = {
  label: string;
  detail: string;
};

export type AirportAccessibility = {
  summary: string;
  services: AccessibilityService[];
  officialLinks: { label: string; href: string }[];
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
  accessibility: AirportAccessibility;
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
  accessibility: {
    summary:
      "Contact your airline at least 48 hours before travel to arrange wheelchair or mobility assistance—airports provide the on-the-ground service, but airlines coordinate the request. Most major international airports offer free wheelchair loans, accessible restrooms, and staff assistance through security and to the gate.",
    services: [
      { label: "Wheelchair assistance", detail: "Request through your airline in advance; most airports also have loaner wheelchairs at information desks for walk-ups." },
      { label: "Accessible restrooms", detail: "Available throughout most terminals—ask any staff member or check terminal maps." },
      { label: "Assistance animals", detail: "Generally welcome; check your airline's and destination country's documentation requirements ahead of travel." },
    ],
    officialLinks: [],
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
    accessibility: {
      summary:
        "Rated among the world's most accessible airports. Free wheelchair rental (including power-assist and electric models), dedicated priority lanes for reduced-mobility travelers, and an electric shuttle between the long-term parking lot and terminal.",
      services: [
        { label: "Wheelchair rental", detail: "Free manual and electric wheelchairs near Exit 7 and Exit 8 (outside), 3rd floor, Terminal 1; help phones throughout connect directly to the nearest information desk." },
        { label: "Priority lane for reduced mobility", detail: "Verify eligibility at your airline's check-in counter to receive a Priority Card, then use the dedicated security lane." },
        { label: "Electric vehicle transport", detail: "Free EV shuttle for wheelchair users between long-term parking and the terminal." },
      ],
      officialLinks: [
        { label: "Incheon Airport accessibility services", href: "https://www.airport.kr/ap_en/1478/subview.do" },
      ],
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
    accessibility: {
      summary:
        "Free wheelchair loans at every terminal information counter, and dedicated assistance staff reachable 24/7 via help intercoms placed throughout the terminals.",
      services: [
        { label: "Wheelchair rental", detail: "Free at any terminal information counter; return to the nearest counter when finished." },
        { label: "24/7 assistance intercom", detail: "Intercoms throughout the terminals connect directly to staff who will escort you to check-in." },
        { label: "Taxi stand assistance", detail: "If you use a wheelchair, speak to staff at the taxi stand—they'll assist you into a waiting vehicle." },
      ],
      officialLinks: [
        { label: "Narita Airport — Customers Requiring Assistance", href: "https://www.narita-airport.jp/en/bf/" },
      ],
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
    accessibility: {
      summary:
        "Step-free access throughout all three terminals with elevators between every floor. 'Care-Fitter' trained staff provide special assistance, plus quiet 'Calm Down, Cool Down' spaces and free sunflower lanyards for non-visible disabilities.",
      services: [
        { label: "Special assistance reservation", detail: "Book online in advance or call +81-3-5757-8111; Care-Fitter staff assist with check-in, security, and boarding." },
        { label: "Hidden Disabilities Sunflower", detail: "Free lanyards available at Information Counters to signal staff that you may need extra help." },
        { label: "Calm Down, Cool Down spaces", detail: "Quiet retreat areas for travelers who are overwhelmed or need sensory relief—check the airport map for current locations." },
      ],
      officialLinks: [
        { label: "Haneda Airport — Customers Requiring Special Assistance", href: "https://tokyo-haneda.com/en/service/barrier-free_information/index.html" },
        { label: "Haneda Airport — Special Assistance Reservation", href: "https://tokyo-haneda.com/en/service/facilities/assist.html" },
      ],
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
    accessibility: {
      summary:
        "Wheelchair and mobility services must be requested through your airline (ideally 48–72h ahead) rather than the airport directly. All restrooms, AirTrain, and Service Animal Relief Areas are accessible; note user reports of long wheelchair-service wait times, especially at peak hours—build in buffer time.",
      services: [
        { label: "Wheelchair service", detail: "Request via your airline in advance; reconfirm at the check-in counter on arrival. Waits can exceed an hour at peak times per traveler reports." },
        { label: "TSA Cares", detail: "Request assistance getting through the security checkpoint by submitting the TSA Cares form in advance." },
        { label: "Service Animal Relief Areas (SARAs)", detail: "Indoor and outdoor relief areas available at all terminals, before and after security." },
      ],
      officialLinks: [
        { label: "JFK Airport accessibility services", href: "https://www.jfkairport.com/explore-jfk/accessibility-services" },
      ],
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
    accessibility: {
      summary:
        "Dedicated Assistance areas (staffed by 'Heathrow Helpers' in purple) in every terminal, free sunflower lanyards for non-visible disabilities, and accessible lifts throughout—escalators aren't suitable for wheelchairs or heavy bags. Licensed London black cabs are wheelchair accessible by law.",
      services: [
        { label: "Pre-book assistance", detail: "Tell your airline at least 48 hours before travel; Heathrow's Assistance team will meet you at dedicated areas in each terminal." },
        { label: "Sunflower lanyard", detail: "Free for non-visible disabilities—signals staff you may need extra help, available at Assistance areas." },
        { label: "Help points", detail: "Located throughout car parks, drop-off points, and transport stations; press to reach the Assistance team directly, or call +44 (0)20 8757 2700." },
      ],
      officialLinks: [
        { label: "Heathrow — Assistance and accessibility", href: "https://www.heathrow.com/at-the-airport/assistance-and-accessibility" },
        { label: "Heathrow — Assistance departure guide", href: "https://www.heathrow.com/at-the-airport/assistance-and-accessibility/assistance-departure-guide" },
        { label: "Heathrow — Help in the terminal", href: "https://www.heathrow.com/at-the-airport/assistance-and-accessibility/help-in-the-terminal" },
      ],
    },
  },
  SIN: {
    iata: "SIN",
    name: "Singapore Changi Airport",
    city: "Singapore",
    country: "Singapore",
    summary: "Consistently rated one of the world's best airports; Jewel Changi connects landside to Terminals 1, 2, and 3.",
    terminals: ["Terminals 1, 2, 3, 4"],
    beforeYouFly: [],
    afterYouLand: [
      "Arrivals are on Level 1 in every terminal — immigration, baggage claim, and customs all happen here.",
    ],
    // Taxi/bus/rail specifics (scam patterns, exact stands) weren't
    // independently researched for this airport the way ICN/NRT/HND/JFK/
    // LHR were — kept to safe, general guidance rather than fabricated
    // specifics. Revisit with real research before adding claims here.
    transit: {
      taxi: { title: "Taxi", bullets: ["Official taxi stands are at the arrival level of each terminal — use the marked queue, not touts."], avoidScams: [] },
      bus: { title: "Bus", bullets: ["Public buses and the airport shuttle serve all terminals — check the Changi Airport website for current routes."], avoidScams: [] },
      rail: { title: "Rail (MRT)", bullets: ["The MRT Airport Line connects Terminals 2 and 3 to central Singapore."], avoidScams: [] },
    },
    accessibility: {
      summary: "Contact your airline at least 48 hours before travel to arrange wheelchair or mobility assistance. Changi is widely regarded as one of the more accessible major airports, with wheelchair loans and accessible facilities throughout.",
      services: [
        { label: "Wheelchair assistance", detail: "Request through your airline in advance; ground staff meet you at the gate." },
        { label: "Accessible restrooms", detail: "Available throughout all terminals." },
      ],
      officialLinks: [
        { label: "Changi Airport — Special Assistance", href: "https://www.changiairport.com/en/at-changi/special-assistance.html" },
      ],
    },
    floorGuide: [
      { floor: "Level 1", label: "Arrivals in all terminals — immigration, baggage claim, customs" },
      { floor: "Level 2", label: "Terminal 1 & 2 departures — check-in, security" },
      { floor: "Level 2/3", label: "Terminal 3 departures — check-in, security" },
    ],
  },
  AMS: {
    iata: "AMS",
    name: "Amsterdam Airport Schiphol",
    city: "Amsterdam",
    country: "Netherlands",
    summary: "A single-terminal airport — everything is under one roof, organized into three departure halls (1, 2, 3) rather than separate terminal buildings.",
    terminals: ["Single terminal, Departure Halls 1–3"],
    beforeYouFly: [],
    afterYouLand: [
      "All arrivals lead into Schiphol Plaza, the central public area — trains, taxis, and buses are all accessible from here.",
    ],
    transit: {
      taxi: { title: "Taxi", bullets: ["The official taxi rank is directly outside Schiphol Plaza."], avoidScams: [] },
      bus: { title: "Bus", bullets: ["Regional and long-distance buses depart from the bus station outside Schiphol Plaza."], avoidScams: [] },
      rail: { title: "Rail", bullets: ["The train station is directly beneath the terminal — frequent trains to Amsterdam Centraal and beyond."], avoidScams: [] },
    },
    accessibility: {
      summary: "Contact your airline at least 48 hours before travel to arrange wheelchair or mobility assistance. Schiphol's single-terminal layout and short walking distances (apart from Piers H and M) make it relatively easy to navigate.",
      services: [
        { label: "Wheelchair assistance", detail: "Request through your airline in advance." },
        { label: "Accessible restrooms", detail: "Available throughout the terminal." },
      ],
      officialLinks: [
        { label: "Schiphol — Assistance", href: "https://www.schiphol.nl/en/assistance/" },
      ],
    },
    floorGuide: [
      { floor: "Ground floor", label: "Arrivals, baggage claim, Schiphol Plaza, train station access" },
      { floor: "Level 1", label: "Check-in and departures (Halls 1, 2, 3)" },
      { floor: "Level 2", label: "Security, lounges, restaurants, gates" },
      { floor: "Level 3", label: "Panorama Terrace" },
    ],
  },
  HKG: {
    iata: "HKG",
    name: "Hong Kong International Airport",
    city: "Hong Kong",
    country: "Hong Kong",
    summary: "Terminal 1 is Y-shaped and one of the world's largest enclosed spaces; an Automated People Mover (APM) connects distant gate areas.",
    terminals: ["Terminal 1, Terminal 2"],
    beforeYouFly: [],
    afterYouLand: [
      "Arrivals (immigration, baggage claim, customs) are on Level 5 of Terminal 1.",
    ],
    transit: {
      taxi: { title: "Taxi", bullets: ["Official taxi stands are outside the arrivals hall — look for the marked queue."], avoidScams: [] },
      bus: { title: "Bus", bullets: ["Airport buses serve Hong Kong Island, Kowloon, and the New Territories from outside the terminal."], avoidScams: [] },
      rail: { title: "Rail (Airport Express)", bullets: ["The Airport Express train runs every 10–12 minutes to Hong Kong Station in about 24 minutes."], avoidScams: [] },
    },
    accessibility: {
      summary: "Contact your airline at least 48 hours before travel to arrange wheelchair or mobility assistance. HKIA is fully physically accessible, with disabled toilets, wheelchair access, and Braille signage throughout.",
      services: [
        { label: "Wheelchair assistance", detail: "Request through your airline in advance." },
        { label: "Accessible restrooms", detail: "Available throughout both terminals." },
      ],
      officialLinks: [
        { label: "Hong Kong Airport — Special Needs Access", href: "https://www.hongkongairport.com/en/passenger-guide/airport-facilities-services/special-needs-access" },
      ],
    },
    floorGuide: [
      { floor: "Level 5", label: "Arrivals — immigration, baggage claim, customs" },
      { floor: "Level 6", label: "Security and departure gates, shops, lounges" },
      { floor: "Level 7", label: "Check-in hall — airline counters, self-service kiosks" },
    ],
  },
  DXB: {
    iata: "DXB",
    name: "Dubai International Airport",
    city: "Dubai",
    country: "United Arab Emirates",
    summary: "One of the world's busiest hubs; Emirates operates from Terminal 3, the world's largest airport terminal by floor area. Terminal 1 serves most other international airlines, Terminal 2 mainly regional/budget carriers.",
    terminals: ["Terminal 1", "Terminal 2", "Terminal 3 (Emirates)"],
    beforeYouFly: [],
    afterYouLand: [
      "Confirm your terminal before heading to the airport — Emirates uses Terminal 3, most other international carriers use Terminal 1.",
    ],
    transit: {
      taxi: { title: "Taxi", bullets: ["RTA-licensed taxis available 24/7 outside arrivals — use the official rank."], avoidScams: [] },
      bus: { title: "Bus", bullets: ["RTA bus routes connect the airport to Deira and Bur Dubai."], avoidScams: [] },
      rail: { title: "Metro", bullets: ["Dubai Metro Red Line serves Terminal 1 and Terminal 3 directly."], avoidScams: [] },
    },
    accessibility: {
      summary: "Contact your airline at least 48 hours before travel to arrange wheelchair or mobility assistance.",
      services: [
        { label: "Wheelchair assistance", detail: "Request through your airline in advance." },
        { label: "Accessible restrooms", detail: "Available throughout all terminals." },
      ],
      officialLinks: [
        { label: "Dubai Airports — Special Assistance", href: "https://dubaiairports.ae/information/special-assistance" },
      ],
    },
    floorGuide: [
      { floor: "Level 1", label: "Terminal 3 arrivals — immigration, baggage claim" },
      { floor: "Level 3", label: "Terminal 3 departures — check-in, security" },
      { floor: "Level 4", label: "Terminal 3 secondary arrivals area" },
    ],
  },
  BKK: {
    iata: "BKK",
    name: "Suvarnabhumi Airport",
    city: "Bangkok",
    country: "Thailand",
    summary: "Thailand's main international gateway; a single terminal building stacked over multiple levels, with a newer satellite terminal (SAT-1) reached by automated people mover.",
    terminals: ["Main Terminal", "Satellite Terminal SAT-1"],
    beforeYouFly: [],
    afterYouLand: [
      "Arrivals (immigration, baggage claim, customs) are on Level 2.",
    ],
    transit: {
      taxi: { title: "Taxi", bullets: ["Official public taxi queue is on Level 1 — use the ticket machine, not touts approaching you in the arrivals hall."], avoidScams: ["Unofficial drivers approaching arriving passengers directly in the terminal, especially quoting flat fares well above the metered rate."] },
      bus: { title: "Bus", bullets: ["Airport buses and interprovincial coaches depart from Level 1."], avoidScams: [] },
      rail: { title: "Rail (Airport Rail Link)", bullets: ["ARL to Phaya Thai (city center connection) departs from Level B (basement), one floor below arrivals."], avoidScams: [] },
    },
    accessibility: {
      summary: "Contact your airline at least 48 hours before travel to arrange wheelchair or mobility assistance.",
      services: [
        { label: "Wheelchair assistance", detail: "Request through your airline in advance." },
        { label: "Accessible restrooms", detail: "Available throughout the terminal." },
      ],
      officialLinks: [
        { label: "Suvarnabhumi Airport — Passenger Guide", href: "https://suvarnabhumi.airportthai.co.th/service/airport-guide" },
      ],
    },
    floorGuide: [
      { floor: "Level 1", label: "Bus lobby, public taxi queue" },
      { floor: "Level 2", label: "Arrivals — immigration, baggage claim, customs" },
      { floor: "Level 3", label: "Restaurants, shops, airline lounges" },
      { floor: "Level 4", label: "Departures — check-in, security, immigration" },
      { floor: "Level B", label: "Airport Rail Link (ARL) platform" },
    ],
  },
  IST: {
    iata: "IST",
    name: "Istanbul Airport",
    city: "Istanbul",
    country: "Turkey",
    summary: "A single massive terminal building (one of the largest in the world) with five concourses (A, B, D, F international; G domestic) — no internal train between them, all connected on foot.",
    terminals: ["Single terminal, Concourses A/B/D/F/G"],
    beforeYouFly: [],
    afterYouLand: [
      "Arrival gates are on Level 1; go down to Ground floor for immigration, baggage claim, and customs.",
    ],
    transit: {
      taxi: { title: "Taxi", bullets: ["Main taxi stands are outside the domestic and international exit doors — orange (cheapest), turquoise, and black (most expensive) taxis available."], avoidScams: [] },
      bus: { title: "Bus", bullets: ["Buses depart from the transportation floor (Level -2)."], avoidScams: [] },
      rail: { title: "Metro", bullets: ["M11 line connects to Gayrettepe, with onward connections to the wider Istanbul metro network."], avoidScams: [] },
    },
    accessibility: {
      summary: "Contact your airline at least 48 hours before travel to arrange wheelchair or mobility assistance. The terminal has elevators and ramps at all level changes, tactile floor strips, and accessible restrooms on every level.",
      services: [
        { label: "Wheelchair assistance", detail: "Request through your airline in advance." },
        { label: "Accessible restrooms", detail: "Available on every level." },
      ],
      officialLinks: [
        { label: "Istanbul Airport — iGA Cares (Accessibility)", href: "https://www.istairport.com/en/flights/airport-guides/iga-cares-accessibility/" },
      ],
    },
    floorGuide: [
      { floor: "Ground floor", label: "Arrivals — immigration, baggage claim, customs" },
      { floor: "Level 1", label: "Arrival gates" },
      { floor: "Level 2", label: "Departures — check-in, security, boarding gates" },
      { floor: "Level -2", label: "Bus station, some pick-up/drop-off" },
    ],
  },
  TPE: {
    iata: "TPE",
    name: "Taiwan Taoyuan International Airport",
    city: "Taipei",
    country: "Taiwan",
    summary: "Two terminals connected by Skytrain and MRT — Terminal 1 (mainly regional/low-cost carriers) and Terminal 2 (long-haul and premium airlines), both following the same basic floor pattern.",
    terminals: ["Terminal 1", "Terminal 2"],
    beforeYouFly: [],
    afterYouLand: [
      "Arrivals and baggage claim are on 1F in both terminals.",
    ],
    transit: {
      taxi: { title: "Taxi", bullets: ["Taxis available 24/7 at designated stands in both terminals."], avoidScams: [] },
      bus: { title: "Bus", bullets: ["Airport buses to Taipei depart from the arrivals level of each terminal."], avoidScams: [] },
      rail: { title: "Airport MRT", bullets: ["Boarding is on B2 (Terminal 2) or accessed via B1 (Terminal 1) — fastest way to central Taipei."], avoidScams: [] },
    },
    accessibility: {
      summary: "Contact your airline at least 48 hours before travel to arrange wheelchair or mobility assistance.",
      services: [
        { label: "Wheelchair assistance", detail: "Request through your airline in advance." },
        { label: "Accessible restrooms", detail: "Available throughout both terminals." },
      ],
      officialLinks: [
        { label: "Taoyuan Airport — Passenger Guide", href: "https://www.taoyuan-airport.com/" },
      ],
    },
    floorGuide: [
      { floor: "1F", label: "Arrivals — immigration, baggage claim, customs (both terminals)" },
      { floor: "2F", label: "Arrival concourses and transfers" },
      { floor: "3F", label: "Departures — check-in, security (both terminals)" },
      { floor: "B1/B2", label: "Airport MRT platform" },
    ],
  },
  SYD: {
    iata: "SYD",
    name: "Sydney Kingsford Smith Airport",
    city: "Sydney",
    country: "Australia",
    summary: "Terminal 1 (International) is physically separate from the domestic terminals (T2/T3) and requires a train, shuttle bus, or taxi to transfer between them — walking is not practical.",
    terminals: ["Terminal 1 (International)", "Terminal 2 (Domestic)", "Terminal 3 (Domestic, Qantas)"],
    beforeYouFly: [],
    afterYouLand: [
      "Arrivals (immigration, baggage claim, customs) are on Level 1 of Terminal 1.",
    ],
    transit: {
      taxi: { title: "Taxi", bullets: ["Taxi ranks are on the Arrivals level of Terminal 1, outside the terminal."], avoidScams: [] },
      bus: { title: "Bus", bullets: ["Free T-Bus shuttle connects all terminals landside."], avoidScams: [] },
      rail: { title: "Rail (Airport Link)", bullets: ["Airport Link train connects Terminal 1 to the domestic terminals in about 2 minutes, and onward to the Sydney CBD."], avoidScams: [] },
    },
    accessibility: {
      summary: "Contact your airline at least 48 hours before travel to arrange wheelchair or mobility assistance.",
      services: [
        { label: "Wheelchair assistance", detail: "Request through your airline in advance." },
        { label: "Accessible restrooms", detail: "Available throughout the terminal." },
      ],
      officialLinks: [
        { label: "Sydney Airport — Assistance", href: "https://www.sydneyairport.com.au/assistance" },
      ],
    },
    floorGuide: [
      { floor: "Level 1", label: "Terminal 1 arrivals — immigration, baggage claim, customs" },
      { floor: "Level 2", label: "Terminal 1 departures — check-in counters A–K, security" },
      { floor: "Level 3", label: "Airline offices, lounges" },
    ],
  },
  FRA: {
    iata: "FRA",
    name: "Frankfurt Airport",
    city: "Frankfurt",
    country: "Germany",
    summary: "Two terminals, each split into concourses with their own floor numbering — Terminal 1's concourses (A, B, C, Z) don't share a single 'arrivals is floor X' answer, so check your specific concourse below rather than assuming.",
    terminals: ["Terminal 1 (Concourses A, B, C, Z)", "Terminal 2 (Concourses D, E)"],
    beforeYouFly: [],
    afterYouLand: [
      "Your concourse determines your floor — see the terminal layout section below rather than assuming a single arrivals level applies airport-wide.",
    ],
    transit: {
      taxi: { title: "Taxi", bullets: ["Taxi stands are near the exits of both Terminal 1 and Terminal 2 arrival floors."], avoidScams: [] },
      bus: { title: "Bus", bullets: ["Airport buses to Frankfurt depart from the bus bay in front of Terminal 2's arrivals hall."], avoidScams: [] },
      rail: { title: "Rail", bullets: ["Terminal 1 has both a regional (S-Bahn) station and a long-distance (ICE/IC) station, both connected directly to the terminal. Terminal 2 requires the free SkyLine train to reach Terminal 1 for the stations."], avoidScams: [] },
    },
    accessibility: {
      summary: "Contact your airline at least 48 hours before travel to arrange wheelchair or mobility assistance.",
      services: [
        { label: "Wheelchair assistance", detail: "Request through your airline in advance." },
        { label: "Accessible restrooms", detail: "Available throughout both terminals." },
      ],
      officialLinks: [
        { label: "Frankfurt Airport — Special Needs", href: "https://www.frankfurt-airport.com/en/travel-planning/special-needs.html" },
      ],
    },
    // Deliberately concourse-qualified, not a single "arrivals is floor X"
    // claim — sources for this airport actively conflict when generalized
    // across the whole terminal, because each concourse genuinely uses a
    // different scheme (confirmed across airport-fra.com, ANA's official
    // airport guide, and thepointsanalyst.com's concourse-by-concourse
    // breakdown).
    floorGuide: [
      { floor: "T1 Concourse B, Level 1", label: "Arrivals — baggage claim, customs" },
      { floor: "T1 Concourse B, Level 2", label: "Departures — check-in, lounges" },
      { floor: "T1 Concourse B, Level 3", label: "Immigration, priority security lane" },
      { floor: "T1 Concourse A, Level 2", label: "Schengen departures" },
      { floor: "T1 Concourse Z, Level 3", label: "Non-Schengen departures (directly above Concourse A, same pier)" },
      { floor: "T2 Concourse D/E, Level 2", label: "Arrivals — baggage claim, customs" },
      { floor: "T2 Concourse D/E, Level 3", label: "Departures — check-in, security" },
    ],
  },
  MUC: {
    iata: "MUC",
    name: "Munich Airport",
    city: "Munich",
    country: "Germany",
    summary: "Terminal 1 is split into six largely-independent modules (A–F) that don't share one floor scheme — some handle both arrivals and departures, one (E) is arrivals-only, one (F) is a separate high-security building. Terminal 2 is simpler and mainly serves Lufthansa/Star Alliance.",
    terminals: ["Terminal 1 (Modules A–F)", "Terminal 2 (Gates G, H + Satellite Gates K, L)"],
    beforeYouFly: [],
    afterYouLand: [
      "Your module (Terminal 1) or terminal determines your floor and process — see the terminal layout section below.",
    ],
    transit: {
      taxi: { title: "Taxi", bullets: ["Taxi ranks are at the arrivals curbside of both terminals."], avoidScams: [] },
      bus: { title: "Bus", bullets: ["Lufthansa Airport Bus to the main train station departs from Terminal 1 (Arrivals A), the Munich Airport Center, and Terminal 2's arrivals level."], avoidScams: [] },
      rail: { title: "Rail (S-Bahn)", bullets: ["S1 and S8 S-Bahn trains run every 10 minutes from the Munich Airport Center station to the city center."], avoidScams: [] },
    },
    accessibility: {
      summary: "Contact your airline at least 48 hours before travel to arrange wheelchair or mobility assistance.",
      services: [
        { label: "Wheelchair assistance", detail: "Munich Airport's Mobility Service offers free help — request through your airline at least 48 hours ahead." },
        { label: "Accessible restrooms", detail: "Available throughout both terminals." },
      ],
      officialLinks: [
        { label: "Munich Airport — Barrier-free Travel", href: "https://www.munich-airport.com/accessible-travel-260945" },
      ],
    },
    floorGuide: [
      { floor: "T1 Modules A–D, Level 04", label: "Arrivals and departures (both handled on this level in these modules)" },
      { floor: "T1 Modules B/C", label: "Non-Schengen arrivals — passport control before baggage claim" },
      { floor: "T1 Module E", label: "Arrivals only" },
      { floor: "T2, Level 04 (Gates G)", label: "Schengen departures; Schengen arrivals baggage claim" },
      { floor: "T2, Level 05 (Gates H)", label: "Non-Schengen departures" },
    ],
  },
  CDG: {
    iata: "CDG",
    name: "Paris Charles de Gaulle Airport",
    city: "Paris",
    country: "France",
    summary: "A genuinely complex airport — Terminal 2 alone splits into seven sub-terminals (2A–2G) with their own layouts, Terminal 1 has an unusual circular design, and Terminal 3 is a single small building. Confirm your specific sub-terminal, not just 'Terminal 2'.",
    terminals: ["Terminal 1", "Terminal 2 (sub-terminals 2A–2G)", "Terminal 3"],
    beforeYouFly: [],
    afterYouLand: [
      "Your sub-terminal (e.g. 2E vs 2C) determines your layout — see the terminal layout section below.",
    ],
    transit: {
      taxi: { title: "Taxi", bullets: ["Taxi stands are at the Arrivals level of each terminal."], avoidScams: [] },
      bus: { title: "Bus", bullets: ["Roissybus and RATP lines 350/351 connect to central Paris; free CDGVAL shuttle connects Terminals 1, 2, and 3."], avoidScams: [] },
      rail: { title: "Rail (RER B / TGV)", bullets: ["RER B to central Paris departs from stations at both Terminal 2 and Terminal 3/Roissypôle — confirm you're at the right one, a common mix-up.", "TGV high-speed trains depart from the station beneath Terminal 2."], avoidScams: [] },
    },
    accessibility: {
      summary: "Contact your airline at least 48 hours before travel to arrange wheelchair or mobility assistance.",
      services: [
        { label: "Wheelchair assistance", detail: "Request through your airline in advance." },
        { label: "Accessible restrooms", detail: "Available throughout all terminals." },
      ],
      officialLinks: [
        { label: "Paris Aéroport — Reduced Mobility", href: "https://www.parisaeroport.fr/en/passengers/flight-preparation/specific-assistance/people-with-reduced-mobility" },
      ],
    },
    // Terminal-by-terminal, not a single answer — CDG's own layout varies
    // this much even within Terminal 2's sub-terminals.
    floorGuide: [
      { floor: "T1", label: "Unusual circular design — CDGVAL shuttle arrives on the lower level; departures check-in/security are on the levels above; arrivals is on the top floor" },
      { floor: "T2A/2B/2C/2D, Level 1", label: "Arrivals" },
      { floor: "T2C/2D, Level 2", label: "Departures — boarding gates" },
      { floor: "T2E/2F", label: "Departures level (check-in, security) and a separate Arrivals level (baggage claim) in the main building; some gates (2E Halls L/M) require a shuttle train" },
      { floor: "T3", label: "Single small building — arrivals on the north side, departures (Halls A/B) on the south side, not a floor split" },
    ],
  },
  LAX: {
    iata: "LAX",
    name: "Los Angeles International Airport",
    city: "Los Angeles",
    country: "United States",
    summary: "A U-shaped airport — 9 terminals (1–8 plus Tom Bradley International, 'Terminal B') around a two-level central roadway. The upper/lower split is consistent across all terminals except TBIT, which has its own multi-level scheme.",
    terminals: ["Terminals 1–8", "Tom Bradley International Terminal (Terminal B)"],
    beforeYouFly: [],
    afterYouLand: [
      "Arrivals and baggage claim are on the lower level at every terminal (except TBIT, which uses Level 1).",
    ],
    transit: {
      taxi: { title: "Taxi", bullets: ["Taxis can only be picked up at LAX-it, a dedicated pickup lot near Terminal 1 — reached by free shuttle from any terminal's lower level. Taxis and rideshares drop off at the upper/departures level curb directly."], avoidScams: [] },
      bus: { title: "Bus", bullets: ["FlyAway non-stop buses to Union Station and Van Nuys depart from the upper/departures level."], avoidScams: [] },
      rail: { title: "Metro / Light Rail", bullets: ["Free shuttle to the LAX/Metro Transit Center connects to Los Angeles Metro rail and bus lines."], avoidScams: [] },
    },
    accessibility: {
      summary: "Contact your airline at least 48 hours before travel to arrange wheelchair or mobility assistance.",
      services: [
        { label: "Wheelchair assistance", detail: "Request through your airline in advance." },
        { label: "Accessible restrooms", detail: "Available throughout all terminals." },
      ],
      officialLinks: [
        { label: "LAX — Accessibility", href: "https://www.flylax.com/lax-accessibility" },
      ],
    },
    floorGuide: [
      { floor: "Terminals 1–8, Upper Level", label: "Departures — check-in, curbside drop-off" },
      { floor: "Terminals 1–8, Lower Level", label: "Arrivals — baggage claim, pickup" },
      { floor: "TBIT (Terminal B), Level 1", label: "Baggage claim, customs" },
      { floor: "TBIT (Terminal B), Level 3", label: "Check-in" },
      { floor: "TBIT (Terminal B), Level 4", label: "Security, departures" },
    ],
  },
  ORD: {
    iata: "ORD",
    name: "Chicago O'Hare International Airport",
    city: "Chicago",
    country: "United States",
    summary: "Terminals 1, 2, and 3 (domestic) are physically connected by walkways and share the same simple upper/lower pattern. Terminal 5 (international) is about a mile away with no walkway — a free Airport Transit System (ATS) train is required to reach it.",
    terminals: ["Terminal 1", "Terminal 2", "Terminal 3", "Terminal 5 (International)"],
    beforeYouFly: [],
    afterYouLand: [
      "International arrivals almost always land at Terminal 5, even if your onward domestic flight departs from a different terminal — always check both your arrival and departure terminal.",
    ],
    transit: {
      taxi: { title: "Taxi", bullets: ["Taxis are available at the lower/arrivals level curb of each terminal."], avoidScams: [] },
      bus: { title: "Bus", bullets: ["Pace regional buses depart from the Multi-Modal Facility, reached via the ATS."], avoidScams: [] },
      rail: { title: "Rail (CTA Blue Line)", bullets: ["The Blue Line train to downtown Chicago is accessible directly from Terminal 1/2/3's pedestrian tunnels, or via ATS from Terminal 5."], avoidScams: [] },
    },
    accessibility: {
      summary: "Contact your airline at least 48 hours before travel to arrange wheelchair or mobility assistance.",
      services: [
        { label: "Wheelchair assistance", detail: "Request through your airline in advance." },
        { label: "Accessible restrooms", detail: "Available throughout all terminals." },
      ],
      officialLinks: [
        { label: "Chicago Department of Aviation — Accessibility", href: "https://www.flychicago.com/ohare/ServicesAmenities/accessibility/Pages/default.aspx" },
      ],
    },
    floorGuide: [
      { floor: "Terminals 1/2/3, Upper Level", label: "Departures — check-in, security" },
      { floor: "Terminals 1/2/3, Lower Level", label: "Arrivals — baggage claim, ground transport" },
      { floor: "Terminal 5, Lower Level", label: "Arrivals, baggage claim, ATS station, ground transport" },
      { floor: "Terminal 5, Level 2", label: "Check-in, departures" },
    ],
  },
  MAD: {
    iata: "MAD",
    name: "Adolfo Suárez Madrid–Barajas Airport",
    city: "Madrid",
    country: "Spain",
    summary: "Terminals 1, 2, and 3 are grouped together (walkable, no immigration/customs between them) — Terminal 4 and its satellite T4S are a separate complex, connected only by a free shuttle bus or underground train (APM).",
    terminals: ["Terminal 1", "Terminal 2", "Terminal 3", "Terminal 4", "Terminal 4S (Satellite)"],
    beforeYouFly: [],
    afterYouLand: [
      "Confirm whether your flight uses T1/T2/T3 or T4/T4S — they're not within walking distance of each other and require the shuttle.",
    ],
    transit: {
      taxi: { title: "Taxi", bullets: ["Official taxi ranks are at the Arrivals level curb of each terminal."], avoidScams: [] },
      bus: { title: "Bus", bullets: ["Airport Express bus to central Madrid runs 24/7, with stops at T1, T2, and T4."], avoidScams: [] },
      rail: { title: "Rail (Metro)", bullets: ["Metro Line 8 connects T1/T2/T3 (Aeropuerto T1-T2-T3 station) and T4 (Aeropuerto T4 station) to central Madrid."], avoidScams: [] },
    },
    accessibility: {
      summary: "Contact your airline at least 48 hours before travel to arrange wheelchair or mobility assistance.",
      services: [
        { label: "Wheelchair assistance", detail: "Request through your airline in advance." },
        { label: "Accessible restrooms", detail: "Available throughout all terminals." },
      ],
      officialLinks: [
        { label: "Aena — Barrier-Free Assistance Service", href: "https://www.aena.es/en/passengers/travellers/passengers-with-medical-needs/barrier-free-assistance-service.html" },
      ],
    },
    floorGuide: [
      { floor: "T1, Ground floor", label: "Arrivals — baggage claim" },
      { floor: "T1, Level 1", label: "Departures — check-in" },
      { floor: "T4, Level 0", label: "Arrivals — baggage claim, customs" },
      { floor: "T4, Level 2", label: "Departures — check-in" },
      { floor: "T4S, Ground floor", label: "Arrivals" },
      { floor: "T4S, Level 1", label: "Departures, shops, dining" },
      { floor: "T4S, Underground", label: "APM (people mover) to T4" },
    ],
  },
  ZRH: {
    iata: "ZRH",
    name: "Zurich Airport",
    city: "Zurich",
    country: "Switzerland",
    summary: "Effectively a single terminal (the old separate terminals were merged, with one shared security checkpoint), organized as Check-in 1/Arrivals 1 and Check-in 2/Arrivals 2 within the same building, plus a separate Dock E for most international/non-Schengen flights reached by an underground SkyMetro train.",
    terminals: ["Main terminal (Check-in/Arrivals 1 & 2)", "Dock E (non-Schengen, via SkyMetro)"],
    beforeYouFly: [],
    afterYouLand: [
      "Signage refers to 'Arrival 1' or 'Arrival 2' rather than terminal numbers — check your boarding pass/flight info for which one applies.",
    ],
    transit: {
      taxi: { title: "Taxi", bullets: ["Official taxis can be hailed from the inside curbs of Arrival Halls 1 and 2."], avoidScams: [] },
      bus: { title: "Bus", bullets: ["Local and intercity buses (including Flixbus) stop at Level 0, outside the Airport Centre."], avoidScams: [] },
      rail: { title: "Rail (SBB)", bullets: ["Direct trains to Zürich Hauptbahnhof (main station) take about 10-12 minutes, departing roughly every 6-12 minutes from the station beneath the Airport Centre."], avoidScams: [] },
    },
    accessibility: {
      summary: "Contact your airline at least 48 hours before travel to arrange wheelchair or mobility assistance.",
      services: [
        { label: "Wheelchair assistance", detail: "Request through your airline in advance." },
        { label: "Accessible restrooms", detail: "Available throughout the terminal." },
      ],
      officialLinks: [
        { label: "Zurich Airport — Travelling with Reduced Mobility", href: "https://www.flughafen-zuerich.ch/en/passengers/fly/assistance/travelling-with-reduced-mobility" },
      ],
    },
    floorGuide: [
      { floor: "Level 0", label: "Ground transport (tram, bus), Arrival 1 information center" },
      { floor: "Level 1", label: "Check-in 1 & 2, Arrivals 1 & 2, gates A/B/D" },
      { floor: "Level 2", label: "Additional gates, shops, airport services" },
      { floor: "Dock E (via SkyMetro)", label: "Non-Schengen international departures/arrivals — separate building" },
    ],
  },
};

export function getAirportGuide(iata: string): AirportGuide {
  const code = iata.trim().toUpperCase();
  return GUIDES[code] ?? DEFAULT_GUIDE(code);
}
