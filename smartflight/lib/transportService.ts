/**
 * Transport Service - Mock Data Provider
 *
 * ⚠️ UNUSED: nothing in app/components/hooks imports this file (verified
 * 2026-07-11). It predates real research into ride-hailing integration
 * options — see lib/rideDeepLinks.ts for the actual working feature
 * (Uber's genuinely public deep-link API, wired into the airport guide
 * page). Kakao T, Grab, and Bolt do NOT have public/self-serve booking
 * APIs or affiliate programs as of this research — the "SMARTFLIGHT_KR"
 * / "SMARTFLIGHT_UBER" affiliateTracking blocks below were placeholders
 * invented before that was confirmed, not real partner IDs. Left in
 * place as illustrative mock data structure only; do not wire this into
 * the UI without replacing affiliateTracking with real data (or removing
 * it, since no real program currently exists to attach one to).
 */

import type {
  Airport,
  TransitRoute,
  RideHailingProvider,
  OfficialTaxiInfo,
  TransportOption,
  TransportSearchParams,
  TransportSearchResult,
  Recommendation,
} from "./types/transport";

// ============= Mock Data: Incheon Airport (ICN) =============

export const ICN_AIRPORT: Airport = {
  iataCode: "ICN",
  name: "Incheon International Airport",
  city: "Seoul",
  country: "South Korea",
  timezone: "Asia/Seoul",
  coordinates: { lat: 37.4602, lng: 126.4407 },
  terminals: [
    {
      id: "T1",
      name: "Terminal 1",
      transportAccess: {
        subway: ["AREX", "Line9"],
        bus: ["6001", "6002", "6005", "6015"],
        taxi: ["Regular", "Deluxe", "International"],
      },
    },
    {
      id: "T2",
      name: "Terminal 2",
      transportAccess: {
        subway: ["AREX"],
        bus: ["6002", "6006", "6016"],
        taxi: ["Regular", "Deluxe", "International"],
      },
    },
  ],
  transportHub: {
    subwayStations: ["Incheon Airport T1", "Incheon Airport T2"],
    busStops: ["T1 1F Gate 4", "T1 1F Gate 9", "T2 1F Gate 3"],
    railStations: ["AREX Incheon Airport"],
    taxiStands: ["T1 1F Gate 4-6", "T2 1F Gate 1-3"],
  },
};

export const ICN_TRANSIT_ROUTES: TransitRoute[] = [
  {
    id: "AREX_EXPRESS",
    name: "Airport Railroad Express (AREX)",
    type: "rail",
    operator: "Korea Railroad Corporation",
    color: "#0090D2",
    stations: [
      {
        id: "ICN_T1",
        name: "Incheon Airport Terminal 1",
        nameLocal: "인천공항 1터미널",
        order: 1,
        coordinates: { lat: 37.4602, lng: 126.4407 },
        facilities: ["Elevator", "Escalator", "Restroom", "WiFi"],
        connections: [],
      },
      {
        id: "ICN_T2",
        name: "Incheon Airport Terminal 2",
        nameLocal: "인천공항 2터미널",
        order: 2,
        coordinates: { lat: 37.4691, lng: 126.4505 },
        facilities: ["Elevator", "Escalator", "Restroom", "WiFi"],
        connections: [],
      },
      {
        id: "SEOUL_STATION",
        name: "Seoul Station",
        nameLocal: "서울역",
        order: 3,
        coordinates: { lat: 37.5547, lng: 126.9707 },
        facilities: ["Elevator", "Escalator", "Restroom", "WiFi", "Shops"],
        connections: ["Line1", "Line4", "KTX"],
      },
    ],
    schedule: {
      weekday: [
        {
          startTime: "05:20",
          endTime: "22:40",
          frequency: 30,
          firstTrain: "05:20",
          lastTrain: "22:40",
        },
      ],
      weekend: [
        {
          startTime: "05:20",
          endTime: "22:40",
          frequency: 40,
          firstTrain: "05:20",
          lastTrain: "22:40",
        },
      ],
      holiday: [
        {
          startTime: "05:20",
          endTime: "22:40",
          frequency: 40,
          firstTrain: "05:20",
          lastTrain: "22:40",
        },
      ],
    },
    fare: {
      currency: "KRW",
      adult: 10300,
      child: 7500,
      senior: 7500,
      discounts: [
        {
          type: "roundtrip",
          name: "Round Trip Discount",
          description: "Save 1,000 KRW on round trip tickets",
          savings: "1000 KRW",
        },
      ],
      paymentMethods: [
        { type: "cash", name: "Cash", supported: true },
        { type: "card", name: "Credit/Debit Card", supported: true },
        { type: "transit_card", name: "T-Money / Cashbee", supported: true },
        { type: "mobile", name: "Mobile Payment", supported: true },
      ],
    },
    travelTime: 43,
    accessibility: {
      wheelchairAccessible: true,
      elevator: true,
      escalator: true,
      tactilePaving: true,
      audioAnnouncements: true,
    },
  },
  {
    id: "AREX_ALL_STOP",
    name: "Airport Railroad All-Stop (AREX)",
    type: "rail",
    operator: "Korea Railroad Corporation",
    color: "#0090D2",
    stations: [
      {
        id: "ICN_T1",
        name: "Incheon Airport Terminal 1",
        nameLocal: "인천공항 1터미널",
        order: 1,
        coordinates: { lat: 37.4602, lng: 126.4407 },
        facilities: ["Elevator", "Escalator", "Restroom", "WiFi"],
        connections: [],
      },
      {
        id: "ICN_T2",
        name: "Incheon Airport Terminal 2",
        nameLocal: "인천공항 2터미널",
        order: 2,
        coordinates: { lat: 37.4691, lng: 126.4505 },
        facilities: ["Elevator", "Escalator", "Restroom", "WiFi"],
        connections: [],
      },
      {
        id: "HONGDAE",
        name: "Hongik University",
        nameLocal: "홍대입구",
        order: 10,
        coordinates: { lat: 37.5571, lng: 126.9245 },
        facilities: ["Elevator", "Escalator", "Restroom", "WiFi"],
        connections: ["Line2", "GyeonguiLine"],
      },
      {
        id: "SEOUL_STATION",
        name: "Seoul Station",
        nameLocal: "서울역",
        order: 13,
        coordinates: { lat: 37.5547, lng: 126.9707 },
        facilities: ["Elevator", "Escalator", "Restroom", "WiFi", "Shops"],
        connections: ["Line1", "Line4", "KTX"],
      },
    ],
    schedule: {
      weekday: [
        {
          startTime: "05:18",
          endTime: "23:32",
          frequency: 12,
          firstTrain: "05:18",
          lastTrain: "23:32",
        },
      ],
      weekend: [
        {
          startTime: "05:18",
          endTime: "23:32",
          frequency: 15,
          firstTrain: "05:18",
          lastTrain: "23:32",
        },
      ],
      holiday: [
        {
          startTime: "05:18",
          endTime: "23:32",
          frequency: 15,
          firstTrain: "05:18",
          lastTrain: "23:32",
        },
      ],
    },
    fare: {
      currency: "KRW",
      adult: 4950,
      child: 2450,
      senior: 2450,
      discounts: [],
      paymentMethods: [
        { type: "cash", name: "Cash", supported: true },
        { type: "card", name: "Credit/Debit Card", supported: true },
        { type: "transit_card", name: "T-Money / Cashbee", supported: true },
        { type: "mobile", name: "Mobile Payment", supported: true },
      ],
    },
    travelTime: 66,
    accessibility: {
      wheelchairAccessible: true,
      elevator: true,
      escalator: true,
      tactilePaving: true,
      audioAnnouncements: true,
    },
  },
  {
    id: "BUS_6001",
    name: "Airport Limousine Bus 6001",
    type: "bus",
    operator: "KAL Limousine",
    color: "#FF6B35",
    stations: [
      {
        id: "ICN_T1",
        name: "Incheon Airport T1",
        nameLocal: "인천공항 1터미널",
        order: 1,
        coordinates: { lat: 37.4602, lng: 126.4407 },
        facilities: ["Shelter", "Seating"],
        connections: [],
      },
      {
        id: "GANGNAM",
        name: "Gangnam Station",
        nameLocal: "강남역",
        order: 5,
        coordinates: { lat: 37.4979, lng: 127.0276 },
        facilities: ["Shelter"],
        connections: ["Line2", "ShinbundangLine"],
      },
    ],
    schedule: {
      weekday: [
        {
          startTime: "05:00",
          endTime: "23:00",
          frequency: 15,
          firstTrain: "05:00",
          lastTrain: "23:00",
        },
      ],
      weekend: [
        {
          startTime: "05:00",
          endTime: "23:00",
          frequency: 20,
          firstTrain: "05:00",
          lastTrain: "23:00",
        },
      ],
      holiday: [
        {
          startTime: "05:00",
          endTime: "23:00",
          frequency: 20,
          firstTrain: "05:00",
          lastTrain: "23:00",
        },
      ],
    },
    fare: {
      currency: "KRW",
      adult: 16000,
      child: 13000,
      discounts: [],
      paymentMethods: [
        { type: "cash", name: "Cash", supported: true },
        { type: "card", name: "Credit/Debit Card", supported: true },
        { type: "transit_card", name: "T-Money", supported: false },
      ],
    },
    travelTime: 70,
    accessibility: {
      wheelchairAccessible: true,
      elevator: false,
      escalator: false,
      tactilePaving: false,
      audioAnnouncements: true,
    },
  },
];

export const ICN_RIDEHAILING: RideHailingProvider[] = [
  {
    id: "kakao_t",
    name: "Kakao T",
    logo: "/logos/kakao-t.png",
    region: ["KR"],
    services: [
      {
        id: "kakao_taxi",
        name: "Kakao Taxi",
        type: "economy",
        description: "Standard Korean taxi service",
        capacity: 4,
        estimatedPrice: {
          currency: "KRW",
          min: 65000,
          max: 85000,
          base: 4800,
          perKm: 1000,
          surcharges: [
            { type: "airport", name: "Airport Pickup Fee", amount: "5000 KRW" },
            { type: "toll", name: "Highway Toll", amount: "~7000 KRW" },
          ],
        },
        estimatedTime: 60,
        features: ["Real-time tracking", "In-app payment", "Korean language"],
        availability: {
          available24h: true,
          peakHours: ["07:00-09:00", "18:00-20:00"],
        },
      },
      {
        id: "kakao_black",
        name: "Kakao Black",
        type: "premium",
        description: "Premium sedan service",
        capacity: 4,
        estimatedPrice: {
          currency: "KRW",
          min: 95000,
          max: 120000,
          base: 15000,
          perKm: 2000,
          surcharges: [
            { type: "airport", name: "Airport Pickup Fee", amount: "10000 KRW" },
          ],
        },
        estimatedTime: 55,
        features: [
          "Premium vehicles",
          "Professional drivers",
          "Bottled water",
          "Phone charger",
        ],
        availability: {
          available24h: true,
        },
      },
    ],
    appLinks: {
      ios: "https://apps.apple.com/app/id981110422",
      android: "https://play.google.com/store/apps/details?id=com.kakao.taxi",
      web: "https://t.kakao.com",
    },
    affiliateTracking: {
      // No real Kakao T booking/affiliate API exists (confirmed via
      // developers.kakao.com — map/nav APIs only). This block is
      // illustrative mock shape only, not a real program.
      enabled: false,
      partnerId: "MOCK_NOT_REAL",
      trackingUrl: "",
      commission: {
        type: "percentage",
        value: 3.5,
      },
    },
  },
  {
    id: "uber",
    name: "Uber",
    logo: "/logos/uber.png",
    region: ["KR"],
    services: [
      {
        id: "uber_black",
        name: "Uber Black",
        type: "premium",
        description: "Premium rides with professional drivers",
        capacity: 4,
        estimatedPrice: {
          currency: "KRW",
          min: 100000,
          max: 130000,
          base: 20000,
          perKm: 2500,
          surcharges: [
            { type: "airport", name: "Airport Fee", amount: "15000 KRW" },
          ],
        },
        estimatedTime: 55,
        features: [
          "High-end vehicles",
          "Top-rated drivers",
          "English support",
        ],
        availability: {
          available24h: true,
        },
      },
    ],
    appLinks: {
      ios: "https://apps.apple.com/app/id368677368",
      android: "https://play.google.com/store/apps/details?id=com.ubercab",
      web: "https://uber.com",
    },
    affiliateTracking: {
      // Uber has no commission-bearing affiliate program for basic deep
      // links either — see lib/rideDeepLinks.ts for the real (revenue-
      // free, convenience-only) deep-link implementation actually in use.
      enabled: false,
      partnerId: "MOCK_NOT_REAL",
      trackingUrl: "",
      commission: {
        type: "fixed",
        value: 5000,
      },
    },
  },
];

export const ICN_OFFICIAL_TAXIS: OfficialTaxiInfo = {
  airportCode: "ICN",
  services: [
    {
      id: "regular_taxi",
      name: "Regular Taxi (일반택시)",
      type: "regular",
      description: "Standard metered taxi - Silver or White color",
      color: "Silver/White",
      phoneNumber: "+82-32-743-3110",
      fixedRates: [
        {
          destination: "Seoul City Center (Gangnam)",
          destinationType: "district",
          price: 70000,
          currency: "KRW",
          duration: 60,
          distance: 60,
          tollsIncluded: true,
        },
        {
          destination: "Seoul Station",
          destinationType: "station",
          price: 65000,
          currency: "KRW",
          duration: 55,
          distance: 55,
          tollsIncluded: true,
        },
        {
          destination: "Hongdae",
          destinationType: "district",
          price: 68000,
          currency: "KRW",
          duration: 58,
          distance: 58,
          tollsIncluded: true,
        },
      ],
      features: [
        "Metered fare",
        "Credit card accepted",
        "Receipt provided",
        "Basic English",
      ],
    },
    {
      id: "deluxe_taxi",
      name: "Deluxe Taxi (모범택시)",
      type: "deluxe",
      description: "Premium taxi service - Black color with yellow sign",
      color: "Black",
      phoneNumber: "+82-32-743-3114",
      fixedRates: [
        {
          destination: "Seoul City Center (Gangnam)",
          destinationType: "district",
          price: 95000,
          currency: "KRW",
          duration: 55,
          distance: 60,
          tollsIncluded: true,
        },
        {
          destination: "Seoul Station",
          destinationType: "station",
          price: 90000,
          currency: "KRW",
          duration: 50,
          distance: 55,
          tollsIncluded: true,
        },
      ],
      features: [
        "Fixed fare",
        "Larger vehicles",
        "English-speaking drivers",
        "Premium service",
        "No late-night surcharge",
      ],
    },
    {
      id: "international_taxi",
      name: "International Taxi",
      type: "international",
      description: "Multilingual taxi service - Orange color",
      color: "Orange",
      phoneNumber: "+82-1644-2255",
      bookingUrl: "https://www.intltaxi.co.kr",
      fixedRates: [
        {
          destination: "Seoul City Center",
          destinationType: "city_center",
          price: 85000,
          currency: "KRW",
          duration: 55,
          distance: 60,
          tollsIncluded: true,
        },
      ],
      features: [
        "English, Chinese, Japanese support",
        "Fixed fare",
        "Advance booking available",
        "Tourist-friendly",
      ],
    },
  ],
  stands: [
    {
      id: "T1_STAND_1",
      terminal: "Terminal 1",
      location: "1st Floor, Gates 4-6",
      floor: "1F",
      gate: "4-6",
      queueTime: 10,
      operatingHours: "24/7",
    },
    {
      id: "T2_STAND_1",
      terminal: "Terminal 2",
      location: "1st Floor, Gates 1-3",
      floor: "1F",
      gate: "1-3",
      queueTime: 8,
      operatingHours: "24/7",
    },
  ],
  scamPrevention: {
    warnings: [
      "Never accept rides from unlicensed taxi drivers approaching you inside the terminal",
      "Always use official taxi stands - never follow someone to a 'special taxi'",
      "Legitimate taxis will NEVER ask for payment before the ride",
      "Be wary of drivers who claim the meter is broken",
    ],
    redFlags: [
      "Driver approaches you inside the terminal offering a ride",
      "No taxi meter visible or driver refuses to use it",
      "Driver demands payment upfront",
      "Vehicle has no official taxi markings or license plate",
      "Driver insists on a 'flat rate' much higher than normal",
    ],
    officialIdentifiers: [
      "Official taxi license plate (visible on front and rear)",
      "Taxi meter clearly visible on dashboard",
      "Driver ID card displayed",
      "Receipt printer available",
      "Official taxi company phone number on vehicle",
    ],
    reportingContacts: [
      {
        type: "phone",
        label: "Airport Police",
        value: "+82-32-740-2114",
      },
      {
        type: "phone",
        label: "Tourist Police",
        value: "1330 (English support)",
      },
      {
        type: "website",
        label: "Report Taxi Complaint",
        value: "https://www.epeople.go.kr",
      },
    ],
    safetyTips: [
      "Take a photo of the taxi license plate before entering",
      "Share your ride details with a friend or family member",
      "Use the official taxi stands only",
      "Request a receipt at the end of your ride",
      "If uncomfortable, ask the driver to stop at a police station",
    ],
  },
  officialRates: [
    {
      destination: "Seoul City Center",
      baseRate: 65000,
      currency: "KRW",
      additionalCharges: ["Highway toll (~7,000 KRW)", "Late night surcharge (00:00-04:00): +20%"],
      notes: [
        "Prices are estimates and may vary based on traffic",
        "Tolls are included in fixed rates",
        "Credit cards accepted in all official taxis",
      ],
    },
  ],
};

// ============= Service Functions =============

export async function getAirportTransport(
  airportCode: string
): Promise<Airport | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  if (airportCode === "ICN") {
    return ICN_AIRPORT;
  }
  
  return null;
}

export async function getPublicTransitRoutes(
  airportCode: string
): Promise<TransitRoute[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  
  if (airportCode === "ICN") {
    return ICN_TRANSIT_ROUTES;
  }
  
  return [];
}

export async function getRideHailingProviders(
  airportCode: string
): Promise<RideHailingProvider[]> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  
  if (airportCode === "ICN") {
    return ICN_RIDEHAILING;
  }
  
  return [];
}

export async function getOfficialTaxiInfo(
  airportCode: string
): Promise<OfficialTaxiInfo | null> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  if (airportCode === "ICN") {
    return ICN_OFFICIAL_TAXIS;
  }
  
  return null;
}

export async function searchTransportOptions(
  params: TransportSearchParams
): Promise<TransportSearchResult | null> {
  const [airport, publicTransit, ridehailing, officialTaxis] = await Promise.all([
    getAirportTransport(params.airportCode),
    getPublicTransitRoutes(params.airportCode),
    getRideHailingProviders(params.airportCode),
    getOfficialTaxiInfo(params.airportCode),
  ]);

  if (!airport || !officialTaxis) {
    return null;
  }

  // Build transport options
  const options: TransportOption[] = [];

  // Add public transit options
  publicTransit.forEach((route) => {
    options.push({
      id: route.id,
      mode: route.type === "rail" ? "rail" : route.type === "subway" ? "subway" : "bus",
      provider: route.operator,
      name: route.name,
      description: `${route.type.toUpperCase()} - ${route.travelTime} min to city center`,
      price: {
        amount: route.fare.adult,
        currency: route.fare.currency,
        display: `${route.fare.currency} ${route.fare.adult.toLocaleString()}`,
      },
      duration: route.travelTime,
      comfort: route.type === "rail" ? 4 : route.type === "subway" ? 3 : 2,
      convenience: route.type === "rail" ? 5 : 4,
      reliability: 5,
      pros: [
        "Fixed schedule",
        "No traffic delays",
        route.accessibility.wheelchairAccessible ? "Wheelchair accessible" : "",
      ].filter(Boolean),
      cons: [
        "May require transfers",
        "Limited luggage space",
      ],
      realTimeAvailable: true,
    });
  });

  // Add ride-hailing options
  ridehailing.forEach((provider) => {
    provider.services.forEach((service) => {
      options.push({
        id: `${provider.id}_${service.id}`,
        mode: "ridehail",
        provider: provider.name,
        name: service.name,
        description: service.description,
        price: {
          amount: (service.estimatedPrice.min + service.estimatedPrice.max) / 2,
          currency: service.estimatedPrice.currency,
          display: `${service.estimatedPrice.currency} ${service.estimatedPrice.min.toLocaleString()}-${service.estimatedPrice.max.toLocaleString()}`,
        },
        duration: service.estimatedTime,
        comfort: service.type === "premium" ? 5 : 4,
        convenience: 5,
        reliability: 4,
        pros: [
          "Door-to-door service",
          "No waiting",
          "English support",
        ],
        cons: [
          "Price varies with traffic",
          "Surge pricing possible",
        ],
        bookingUrl: provider.appLinks.web,
        affiliateLink: provider.affiliateTracking?.trackingUrl,
        realTimeAvailable: true,
      });
    });
  });

  // Add official taxi options
  officialTaxis.services.forEach((service) => {
    const avgRate = service.fixedRates[0];
    options.push({
      id: service.id,
      mode: "taxi",
      provider: "Official Airport Taxi",
      name: service.name,
      description: service.description,
      price: {
        amount: avgRate.price,
        currency: avgRate.currency,
        display: `${avgRate.currency} ${avgRate.price.toLocaleString()}`,
      },
      duration: avgRate.duration,
      comfort: service.type === "deluxe" ? 5 : 3,
      convenience: 4,
      reliability: 5,
      pros: [
        "Fixed rate",
        "No surge pricing",
        "Official and safe",
      ],
      cons: [
        "May have queue wait time",
      ],
      bookingUrl: service.bookingUrl,
      realTimeAvailable: false,
    });
  });

  // Generate recommendations
  const recommendations: Recommendation[] = [];
  
  // Find cheapest
  const cheapest = options.reduce((min, opt) => 
    opt.price.amount < min.price.amount ? opt : min
  );
  recommendations.push({
    optionId: cheapest.id,
    reason: "Most affordable option",
    score: 10,
    badges: ["cheapest"],
  });

  // Find fastest
  const fastest = options.reduce((min, opt) => 
    opt.duration < min.duration ? opt : min
  );
  recommendations.push({
    optionId: fastest.id,
    reason: "Fastest travel time",
    score: 9,
    badges: ["fastest"],
  });

  // AI recommendation (balance of price, comfort, convenience)
  const scored = options.map((opt) => ({
    ...opt,
    score: (opt.comfort + opt.convenience + opt.reliability) / 3 - (opt.price.amount / 10000),
  }));
  const recommended = scored.reduce((max, opt) => 
    opt.score > max.score ? opt : max
  );
  recommendations.push({
    optionId: recommended.id,
    reason: "Best balance of price, comfort, and convenience",
    score: 10,
    badges: ["recommended"],
  });

  return {
    airport,
    options,
    publicTransit,
    ridehailing,
    officialTaxis,
    recommendations,
  };
}
