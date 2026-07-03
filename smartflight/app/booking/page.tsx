"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import { getAirportGuide } from "../../lib/airportGuides";
import { getAircraftImage, getAircraftName } from "../../lib/aircraftImages";

type Offer = {
  id: string;
  price: string;
  currency: string;
  airline?: string;
  airlineIata?: string;
  airlineLogo?: string;
  departure?: string;
  arrival?: string;
  stops: number;
  duration?: string;
  originAirport?: string;
  destinationAirport?: string;
  aircraftType?: string;
  aircraftIata?: string;
  cabinClass?: string;
  segments?: Array<{
    departing_at?: string;
    arriving_at?: string;
    origin?: string;
    destination?: string;
    duration?: string;
    marketing_carrier?: string;
    operating_carrier?: string;
    aircraft?: string;
  }>;
};

const PROGRAM_GROUPS = [
  "Amex Membership Rewards",
  "BILT Rewards",
  "Star Alliance Programs",
  "SkyTeam Programs",
] as const;

// Aircraft images now imported from lib/aircraftImages.ts

const BOOKABLE_AIRLINES = [
  "korean air",
  "asiana",
  "turkish",
  "united",
  "delta",
  "air france",
  "klm",
  "lufthansa",
  "ana",
  "american",
  "british",
  "qatar",
  "emirates",
  "singapore",
  "cathay",
  "etihad",
  "air canada",
  "jal",
  "japan airlines",
  "eva",
  "finnair",
  "swiss",
  "austrian",
  "lot",
  "vietnam airlines",
  "thai",
  "malaysia airlines",
  "garuda",
];

const normalize = (v?: string) => (v || "").toLowerCase().trim();

const isBookableAirline = (airline?: string) => {
  const a = normalize(airline);
  if (!a) return false;
  if (a.includes("test") || a.includes("sample") || a.includes("dummy") || a.includes("duffel")) return false;
  return BOOKABLE_AIRLINES.some((k) => a.includes(k));
};

type PriceAlert = {
  id: string;
  from: string;
  to: string;
  targetPrice: number;
  setDate: string;
};

const parseDurationMinutes = (iso?: string) => {
  if (!iso) return Infinity;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return Infinity;
  const h = Number(m[1] || 0);
  const min = Number(m[2] || 0);
  return h * 60 + min;
};

const durationLabel = (iso?: string) => {
  const mins = parseDurationMinutes(iso);
  if (!Number.isFinite(mins)) return "--";
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

const timeLabel = (iso?: string) => (iso ? iso.slice(11, 16) : "--:--");

const dateLabel = (iso?: string) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    weekday: "short",
  });
};

const formatMoney = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount.toLocaleString()}`;
  }
};

const scoreOffer = (o: Offer) => {
  const p = Number(o.price || 0);
  const d = parseDurationMinutes(o.duration);
  return p * 0.65 + d * 0.35 + (o.stops ?? 0) * 120;
};

const toMinutes = (iso?: string) => {
  if (!iso) return -1;
  const hh = Number(iso.slice(11, 13));
  const mm = Number(iso.slice(14, 16));
  if (Number.isNaN(hh) || Number.isNaN(mm)) return -1;
  return hh * 60 + mm;
};

const resolvesProgramMatch = (offer: Offer, selectedPrograms: string[]) => {
  if (selectedPrograms.length === 0) return true;
  const airline = (offer.airline || "").toLowerCase();

  return selectedPrograms.some((p) => {
    if (p === "Amex Membership Rewards" || p === "BILT Rewards") return true;
    if (p === "Star Alliance Programs") {
      return ["united", "turkish", "asiana", "lufthansa", "air canada"].some((k) => airline.includes(k));
    }
    if (p === "SkyTeam Programs") {
      return ["delta", "air france", "klm", "korean air"].some((k) => airline.includes(k));
    }
    return false;
  });
};

/** Airlines commonly paired with major transferable currency / alliance programs (heuristic). */
const loyaltyAllianceMatch = (offer: Offer) => {
  const a = (offer.airline || "").toLowerCase();
  const star = ["united", "turkish", "asiana", "lufthansa", "air canada", "swiss", "ana", "singapore", "eva", "austrian", "lot"];
  const sky = ["delta", "air france", "klm", "korean air", "vietnam airlines", "garuda"];
  return star.some((k) => a.includes(k)) || sky.some((k) => a.includes(k));
};

// getAircraftImage is now imported from lib/aircraftImages.ts

const arrivalTimestamp = (iso?: string) => {
  if (!iso) return Infinity;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? Infinity : t;
};

const layoverBetweenSegments = (arr?: string, dep?: string) => {
  if (!arr || !dep) return 0;
  const mins = (new Date(dep).getTime() - new Date(arr).getTime()) / 60000;
  return Math.max(0, mins);
};

/** Heuristic 0–98: higher = more schedule fragility (not live FAA data). */
const computeDelayRiskScore = (offer: Offer): number => {
  let risk = 8;
  risk += (offer.stops ?? 0) * 15;
  const depM = toMinutes(offer.departure);
  if (depM >= 0 && (depM >= 22 * 60 || depM <= 5 * 60)) risk += 12;
  const segs = offer.segments ?? [];
  for (let i = 0; i < segs.length - 1; i++) {
    const lay = layoverBetweenSegments(segs[i]?.arriving_at, segs[i + 1]?.departing_at);
    if (lay > 0 && lay < 55) risk += 30;
    else if (lay < 85) risk += 18;
    else if (lay < 115) risk += 9;
  }
  return Math.min(98, Math.round(risk));
};

type SortTab =
  | "price"
  | "duration"
  | "arrival"
  | "ai"
  | "delay_low"
  | "delay_high"
  | "connecting_value";

const buildBookingPrograms = (offer: Offer) => {
  const airline = offer.airline || "Partner Airline";
  const iata = (offer.airlineIata || "--").toUpperCase();
  const base = Math.max(30000, Math.round(Number(offer.price || 0) * 120));

  return {
    easyPicks: [
      {
        label: `${airline} Direct Program`,
        points: base,
        cash: "+$60",
        note: `Book directly with ${airline} (${iata}) for instant ticket issuance.`,
      },
      {
        label: "Tern Smart Pick",
        points: Math.round(base * 0.92),
        cash: "+$78",
        note: "Includes optimized transfer ratio and fee-aware recommendation.",
      },
    ],
    transferOptions: [
      { program: "Amex Membership Rewards", points: Math.round(base * 0.36), cash: "+$95" },
      { program: "BILT Rewards", points: Math.round(base * 0.35), cash: "+$90" },
      { program: "Chase Ultimate Rewards", points: Math.round(base * 0.37), cash: "+$98" },
      { program: "Capital One Miles", points: Math.round(base * 0.38), cash: "+$105" },
    ],
  };
};

const CARD_PROGRAM_OPTIONS = [
  { program: "Amex Platinum", earnRate: "5x points", transferBonus: "Up to 20%", note: "Best for premium cabin redemptions." },
  { program: "Chase Sapphire Reserve", earnRate: "3x points", transferBonus: "Up to 15%", note: "Balanced value between cash and points." },
  { program: "Capital One Venture X", earnRate: "2x miles", transferBonus: "Up to 20%", note: "Strong for mixed cash + points booking." },
];

function BookingPageClient() {
  const searchParams = useSearchParams();

  const from = (searchParams.get("from") || "ICN").toUpperCase();
  const to = (searchParams.get("to") || "NRT").toUpperCase();
  const fromCity = searchParams.get("fromCity") || "Seoul";
  const toCity = searchParams.get("toCity") || "Tokyo";
  const departureDate = searchParams.get("departureDate") || new Date().toISOString().split("T")[0];
  const returnDate = searchParams.get("returnDate") || "";
  const tripType = searchParams.get("tripType") || "oneway";
  const adults = Number(searchParams.get("adults") || 1);
  const children = Number(searchParams.get("children") || 0);
  const infants = Number(searchParams.get("infants") || 0);
  const cabinClass = searchParams.get("cabinClass") || "economy";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<Offer[]>([]);
  const [sortTab, setSortTab] = useState<SortTab>("duration");

  const [stopsFilter, setStopsFilter] = useState<"all" | "0" | "1" | "2">("all");
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [depWindow, setDepWindow] = useState<[number, number]>([0, 1439]);
  const [arrWindow, setArrWindow] = useState<[number, number]>([0, 1439]);

  const [showAirlinePanel, setShowAirlinePanel] = useState(false);
  const [showStopsPanel, setShowStopsPanel] = useState(false);
  const [showTimesPanel, setShowTimesPanel] = useState(false);
  const [showProgramsPanel, setShowProgramsPanel] = useState(false);

  const [priceChartData, setPriceChartData] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(false);

  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [alertPrice, setAlertPrice] = useState("");
  const [matchedAlert, setMatchedAlert] = useState<PriceAlert | null>(null);

  const [checkoutOffer, setCheckoutOffer] = useState<Offer | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"review" | "book">("review");
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);
  const [loyaltyFilterOn, setLoyaltyFilterOn] = useState(false);
  const [connectingOnly, setConnectingOnly] = useState(false);

  const totalPassengers = adults + children + infants;

  const departureGuide = useMemo(() => getAirportGuide(from), [from]);
  const arrivalGuide = useMemo(() => getAirportGuide(to), [to]);

  const fetchOffers = async (targetDate: string) => {
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin: from,
        destination: to,
        departureDate: targetDate,
        adults,
        children,
        infants,
        cabinClass,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error ? "Search API failed" : "Search failed");
    return (data?.offers || []) as Offer[];
  };

  useEffect(() => {
    const savedAlerts = localStorage.getItem("priceAlerts");
    if (savedAlerts) {
      try {
        setAlerts(JSON.parse(savedAlerts));
      } catch {
        setAlerts([]);
      }
    }
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetchOffers(departureDate)
      .then((offers) => {
        if (!active) return;
        const filteredBookable = offers.filter((o) => isBookableAirline(o.airline));
        setResults(filteredBookable);

        const highest = filteredBookable.length > 0 ? Math.max(...filteredBookable.map((o) => Number(o.price))) : 3000;
        setMaxPrice(Math.max(300, Math.ceil(highest / 100) * 100));

        if (filteredBookable.length > 0) {
          const minPrice = Math.min(...filteredBookable.map((o) => Number(o.price)));
          const match = alerts.find((a) => a.from === from && a.to === to && minPrice <= a.targetPrice);
          if (match) setMatchedAlert(match);
        }
      })
      .catch(() => {
        if (!active) return;
        setError("Failed to load real-time flight offers.");
        setResults([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [from, to, departureDate, adults, children, infants, cabinClass]);

  const uniqueAirlines = useMemo(() => {
    return Array.from(new Set(results.map((r) => r.airline).filter(Boolean) as string[]));
  }, [results]);

  const baseFiltered = useMemo(() => {
    let data = [...results];

    if (stopsFilter !== "all") {
      const maxStops = Number(stopsFilter);
      data = data.filter((o) => (o.stops ?? 0) <= maxStops);
    }

    data = data.filter((o) => Number(o.price) <= maxPrice);

    if (selectedAirlines.length > 0) {
      data = data.filter((o) => selectedAirlines.includes(o.airline || ""));
    }

    data = data.filter((o) => resolvesProgramMatch(o, selectedPrograms));
    if (loyaltyFilterOn) {
      data = data.filter((o) => loyaltyAllianceMatch(o));
    }

    if (connectingOnly) {
      data = data.filter((o) => (o.stops ?? 0) > 0);
    }

    data = data.filter((o) => {
      const dep = toMinutes(o.departure);
      const arr = toMinutes(o.arrival);
      if (dep < 0 || arr < 0) return true;
      return dep >= depWindow[0] && dep <= depWindow[1] && arr >= arrWindow[0] && arr <= arrWindow[1];
    });

    return data;
  }, [
    results,
    stopsFilter,
    maxPrice,
    selectedAirlines,
    selectedPrograms,
    depWindow,
    arrWindow,
    loyaltyFilterOn,
    connectingOnly,
  ]);

  const smartPicks = useMemo(() => {
    const pool = baseFiltered;
    if (pool.length === 0) return null;
    const cheapest = pool.reduce((m, c) => (!m || Number(c.price) < Number(m.price) ? c : m));
    const fastest = pool.reduce((m, c) =>
      !m || parseDurationMinutes(c.duration) < parseDurationMinutes(m.duration) ? c : m
    );
    const earliestArr = pool.reduce((m, c) =>
      !m || arrivalTimestamp(c.arrival) < arrivalTimestamp(m.arrival) ? c : m
    );
    const ai = pool.reduce((m, c) => (!m || scoreOffer(c) < scoreOffer(m) ? c : m));
    const connectingPool = pool.filter((o) => (o.stops ?? 0) > 0);
    const bestConnection =
      connectingPool.length > 0
        ? connectingPool.reduce((m, c) => (!m || Number(c.price) < Number(m.price) ? c : m))
        : null;
    const safest = pool.reduce((m, c) =>
      !m || computeDelayRiskScore(c) < computeDelayRiskScore(m) ? c : m
    );
    const delayWatch = pool.reduce((m, c) =>
      !m || computeDelayRiskScore(c) > computeDelayRiskScore(m) ? c : m
    );
    return { cheapest, fastest, earliestArr, ai, bestConnection, safest, delayWatch };
  }, [baseFiltered]);

  const filteredSortedOffers = useMemo(() => {
    let data = [...baseFiltered];

    if (sortTab === "price") {
      data.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortTab === "duration") {
      data.sort((a, b) => parseDurationMinutes(a.duration) - parseDurationMinutes(b.duration));
    } else if (sortTab === "arrival") {
      data.sort((a, b) => arrivalTimestamp(a.arrival) - arrivalTimestamp(b.arrival));
    } else if (sortTab === "ai") {
      data.sort((a, b) => scoreOffer(a) - scoreOffer(b));
    } else if (sortTab === "delay_low") {
      data.sort((a, b) => computeDelayRiskScore(a) - computeDelayRiskScore(b));
    } else if (sortTab === "delay_high") {
      data.sort((a, b) => computeDelayRiskScore(b) - computeDelayRiskScore(a));
    } else if (sortTab === "connecting_value") {
      data = data.filter((o) => (o.stops ?? 0) > 0);
      data.sort((a, b) => Number(a.price) - Number(b.price));
    }

    return data;
  }, [baseFiltered, sortTab]);

  const cheapestDirect = filteredSortedOffers
    .filter((o) => (o.stops ?? 0) === 0)
    .reduce<Offer | null>((min, cur) => (!min || Number(cur.price) < Number(min.price) ? cur : min), null);

  const cheapestConnecting = filteredSortedOffers
    .filter((o) => (o.stops ?? 0) > 0)
    .reduce<Offer | null>((min, cur) => (!min || Number(cur.price) < Number(min.price) ? cur : min), null);

  const handlePriceTrend = async () => {
    setChartLoading(true);
    const chartData: any[] = [];
    const selectedDate = new Date(departureDate);
    try {
      for (let i = -5; i <= 5; i++) {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split("T")[0];
        const offers = await fetchOffers(dateStr);
        if (offers.length > 0) {
          const minPrice = Math.min(...offers.map((o) => Number(o.price)));
          chartData.push({
            date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            price: minPrice,
            fullDate: dateStr,
            isSelected: dateStr === departureDate,
          });
        }
      }
      setPriceChartData(chartData);
    } finally {
      setChartLoading(false);
    }
  };

  const cheapestDatePoint =
    priceChartData.length > 0
      ? priceChartData.reduce((min, curr) => (Number(curr.price) < Number(min.price) ? curr : min))
      : null;

  const handleAddAlert = () => {
    if (!alertPrice || isNaN(Number(alertPrice))) return;
    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      from,
      to,
      targetPrice: Number(alertPrice),
      setDate: new Date().toLocaleDateString("en-US"),
    };
    const updated = [...alerts, newAlert];
    setAlerts(updated);
    localStorage.setItem("priceAlerts", JSON.stringify(updated));
    setAlertPrice("");
  };

  const handleDeleteAlert = (id: string) => {
    const updated = alerts.filter((a) => a.id !== id);
    setAlerts(updated);
    localStorage.setItem("priceAlerts", JSON.stringify(updated));
  };

  const scrollToOffer = (id: string) => {
    document.getElementById(`flight-card-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const smartPickCards = smartPicks
    ? [
        { key: "cheap", label: "Cheapest", sub: "Lowest fare in view", offer: smartPicks.cheapest, sort: "price" as SortTab },
        { key: "fast", label: "Fastest", sub: "Shortest travel time", offer: smartPicks.fastest, sort: "duration" as SortTab },
        { key: "early", label: "Earliest arrival", sub: "First to land locally", offer: smartPicks.earliestArr, sort: "arrival" as SortTab },
        { key: "ai", label: "AI pick", sub: "Balanced price & time", offer: smartPicks.ai, sort: "ai" as SortTab },
        ...(smartPicks.bestConnection
          ? [{ key: "conn", label: "Best connection deal", sub: "Great value with stops", offer: smartPicks.bestConnection, sort: "connecting_value" as SortTab }]
          : []),
        { key: "safe", label: "Lowest delay risk", sub: "Heuristic schedule stability", offer: smartPicks.safest, sort: "delay_low" as SortTab },
      ]
    : [];

  return (
    <main className="min-h-screen bg-[#F4F7FC] text-foreground">
      <header className="sticky top-0 z-40 border-b border-[#e4ebf5] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[min(100%,88rem)] items-center justify-between px-5">
          <div className="text-2xl font-bold text-primary">SKYSCANNER STYLE TEST</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden rounded-full bg-[#eff5ff] px-3 py-1.5 text-[#2563eb] md:inline-flex">
              {tripType}
            </span>
            <Link href="/" className="rounded-full bg-primary px-4 py-2 font-semibold text-white">
              Change Search
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[min(100%,88rem)] px-4 py-6 sm:px-5">
        <div className="mb-4 rounded-2xl border border-[#cfe0fb] bg-gradient-to-r from-[#f0f7ff] via-white to-[#f5f9ff] p-4 shadow-sm md:p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#2563eb]">Why shop on Tern</p>
          <p className="mt-2 text-sm font-medium text-foreground md:text-base">
            Compare cheapest fares, fastest trips, earliest arrivals, AI-balanced picks, smart connection deals, and delay-risk signals—then book with points or cash in one flow.
          </p>
          <p className="mt-2 text-xs text-muted">
            Delay risk is an on-device heuristic (connections, redeyes)—not live ATC data. Always confirm at the airline on day of travel.
          </p>
        </div>

        <div className="rounded-[26px] border border-[#e5ecf6] bg-white p-4 shadow-[0_20px_40px_rgba(15,23,42,0.06)] md:p-5">
          <div className="mb-3 grid gap-2 md:grid-cols-[1.1fr_1.1fr_0.9fr_0.9fr_auto]">
            <div className="rounded-xl border border-[#dfe7f2] px-4 py-3 text-sm font-semibold">{fromCity} ({from})</div>
            <div className="rounded-xl border border-[#dfe7f2] px-4 py-3 text-sm font-semibold">{toCity} ({to})</div>
            <div className="rounded-xl border border-[#dfe7f2] px-4 py-3 text-sm text-muted">{departureDate}</div>
            <div className="rounded-xl border border-[#dfe7f2] px-4 py-3 text-sm text-muted">{returnDate || "One-way"}</div>
            <div className="rounded-xl border border-[#dfe7f2] px-4 py-3 text-sm text-muted">
              {totalPassengers} pax · {cabinClass.replace("_", " ")}
            </div>
          </div>

          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => { setShowAirlinePanel((v) => !v); setShowStopsPanel(false); setShowTimesPanel(false); setShowProgramsPanel(false); }} className="rounded-full border border-[#d5dfec] bg-white px-4 py-2 text-sm font-medium">Airlines</button>
              <button type="button" onClick={() => { setShowStopsPanel((v) => !v); setShowAirlinePanel(false); setShowTimesPanel(false); setShowProgramsPanel(false); }} className="rounded-full border border-[#d5dfec] bg-white px-4 py-2 text-sm font-medium">Stops</button>
              <button type="button" onClick={() => { setShowTimesPanel((v) => !v); setShowAirlinePanel(false); setShowStopsPanel(false); setShowProgramsPanel(false); }} className="rounded-full border border-[#d5dfec] bg-white px-4 py-2 text-sm font-medium">Times</button>
              <button type="button" onClick={() => { setShowProgramsPanel((v) => !v); setShowAirlinePanel(false); setShowStopsPanel(false); setShowTimesPanel(false); }} className="rounded-full border border-[#d5dfec] bg-white px-4 py-2 text-sm font-medium">Programs</button>
              <label className="flex cursor-pointer items-center gap-2 rounded-full border border-[#dbe7f6] bg-[#f8fbff] px-3 py-2 text-xs font-medium">
                <input type="checkbox" checked={loyaltyFilterOn} onChange={(e) => setLoyaltyFilterOn(e.target.checked)} className="rounded border-gray-300" />
                Match alliance / transferable miles
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-full border border-[#dbe7f6] bg-[#fffefb] px-3 py-2 text-xs font-medium">
                <input type="checkbox" checked={connectingOnly} onChange={(e) => setConnectingOnly(e.target.checked)} className="rounded border-gray-300" />
                Connecting only
              </label>
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">Sort</span>
                <select value={sortTab} onChange={(e) => setSortTab(e.target.value as SortTab)} className="rounded-full border border-[#d5dfec] px-3 py-2 text-sm">
                  <option value="duration">Fastest (shortest travel)</option>
                  <option value="price">Cheapest</option>
                  <option value="arrival">Earliest arrival</option>
                  <option value="ai">AI recommended</option>
                  <option value="connecting_value">Best connecting deal</option>
                  <option value="delay_low">Lowest delay risk</option>
                </select>
              </div>
            </div>

            {showAirlinePanel && (
              <div className="absolute left-0 z-20 mt-2 w-72 rounded-2xl border border-gray-200 bg-white p-3 shadow-xl">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold">Select airlines</p>
                  <button className="text-xs text-muted" onClick={() => setSelectedAirlines([])}>Reset</button>
                </div>
                <div className="max-h-60 space-y-1 overflow-auto pr-1">
                  {uniqueAirlines.map((name) => {
                    const checked = selectedAirlines.includes(name);
                    return (
                      <label
                        key={name}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setSelectedAirlines((prev) =>
                              checked ? prev.filter((a) => a !== name) : [...prev, name]
                            )
                          }
                          className="rounded border-gray-300"
                        />
                        {name}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {showStopsPanel && (
              <div className="absolute left-0 z-20 mt-2 w-56 rounded-2xl border border-gray-200 bg-white p-3 shadow-xl">
                <p className="mb-2 text-sm font-semibold">Max stops</p>
                {(["all", "0", "1", "2"] as const).map((v) => (
                  <label key={v} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50">
                    <input
                      type="radio"
                      name="stops"
                      checked={stopsFilter === v}
                      onChange={() => setStopsFilter(v)}
                      className="border-gray-300"
                    />
                    {v === "all" ? "Any number of stops" : v === "0" ? "Non-stop only" : v === "1" ? "Up to 1 stop" : "Up to 2 stops"}
                  </label>
                ))}
              </div>
            )}

            {showTimesPanel && (
              <div className="absolute left-0 z-20 mt-2 w-72 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
                <p className="mb-3 text-sm font-semibold">Departure & Arrival windows</p>
                <div className="space-y-4">
                  <div>
                    <p className="mb-1 text-xs text-muted">Departure: {Math.floor(depWindow[0] / 60).toString().padStart(2, "0")}:{(depWindow[0] % 60).toString().padStart(2, "0")} – {Math.floor(depWindow[1] / 60).toString().padStart(2, "0")}:{(depWindow[1] % 60).toString().padStart(2, "0")}</p>
                    <input type="range" min={0} max={1439} value={depWindow[0]} onChange={(e) => setDepWindow([Number(e.target.value), depWindow[1]])} className="w-full" />
                    <input type="range" min={0} max={1439} value={depWindow[1]} onChange={(e) => setDepWindow([depWindow[0], Number(e.target.value)])} className="w-full" />
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-muted">Arrival: {Math.floor(arrWindow[0] / 60).toString().padStart(2, "0")}:{(arrWindow[0] % 60).toString().padStart(2, "0")} – {Math.floor(arrWindow[1] / 60).toString().padStart(2, "0")}:{(arrWindow[1] % 60).toString().padStart(2, "0")}</p>
                    <input type="range" min={0} max={1439} value={arrWindow[0]} onChange={(e) => setArrWindow([Number(e.target.value), arrWindow[1]])} className="w-full" />
                    <input type="range" min={0} max={1439} value={arrWindow[1]} onChange={(e) => setArrWindow([arrWindow[0], Number(e.target.value)])} className="w-full" />
                  </div>
                </div>
              </div>
            )}

            {showProgramsPanel && (
              <div className="absolute left-0 z-20 mt-2 w-64 rounded-2xl border border-gray-200 bg-white p-3 shadow-xl">
                <p className="mb-2 text-sm font-semibold">Loyalty programs</p>
                {PROGRAM_GROUPS.map((pg) => {
                  const checked = selectedPrograms.includes(pg);
                  return (
                    <label key={pg} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setSelectedPrograms((prev) =>
                            checked ? prev.filter((p) => p !== pg) : [...prev, pg]
                          )
                        }
                        className="rounded border-gray-300"
                      />
                      {pg}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Price slider */}
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xs text-muted whitespace-nowrap">Max price</span>
            <input
              type="range"
              min={100}
              max={maxPrice}
              step={50}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs font-semibold text-foreground whitespace-nowrap">{formatMoney(maxPrice, "USD")}</span>
          </div>
        </div>

        {/* Smart pick cards */}
        {smartPickCards.length > 0 && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {smartPickCards.map((card) => (
              <button
                key={card.key}
                type="button"
                onClick={() => { setSortTab(card.sort); if (card.offer) scrollToOffer(card.offer.id); }}
                className="rounded-2xl border border-[#e5ecf6] bg-white p-3 text-left shadow-sm hover:border-primary hover:shadow-md transition-all"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">{card.label}</p>
                <p className="mt-0.5 text-xs text-muted">{card.sub}</p>
                {card.offer && (
                  <p className="mt-1.5 text-base font-bold text-foreground">
                    {formatMoney(Number(card.offer.price), card.offer.currency)}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Matched alert banner */}
        {matchedAlert && (
          <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            🎉 Price alert triggered! A fare for {matchedAlert.from} → {matchedAlert.to} is at or below your target of {formatMoney(matchedAlert.targetPrice, "USD")}.
          </div>
        )}

        {/* Loading / error */}
        {loading && (
          <div className="mt-8 flex items-center justify-center gap-3 py-16 text-muted">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Searching live fares…
          </div>
        )}

        {error && !loading && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Results list */}
        {!loading && !error && filteredSortedOffers.length > 0 && (
          <div className="mt-4 space-y-3">
            {/* Cheapest direct / connecting callouts */}
            {(cheapestDirect || cheapestConnecting) && (
              <div className="flex flex-wrap gap-2 text-xs">
                {cheapestDirect && (
                  <span className="rounded-full bg-[#eff5ff] px-3 py-1 text-primary font-medium">
                    Cheapest non-stop: {formatMoney(Number(cheapestDirect.price), cheapestDirect.currency)}
                  </span>
                )}
                {cheapestConnecting && (
                  <span className="rounded-full bg-[#f5fff8] px-3 py-1 text-green-700 font-medium">
                    Cheapest with stops: {formatMoney(Number(cheapestConnecting.price), cheapestConnecting.currency)}
                  </span>
                )}
              </div>
            )}

            {filteredSortedOffers.map((offer) => {
              const isExpanded = expandedOfferId === offer.id;
              const delayRisk = computeDelayRiskScore(offer);
              const riskColor = delayRisk < 25 ? "text-green-600" : delayRisk < 55 ? "text-yellow-600" : "text-red-600";
              const aircraftImg = getAircraftImage(offer.aircraftIata);
              const aircraftName = getAircraftName(offer.aircraftIata);
              const programs = buildBookingPrograms(offer);

              return (
                <article
                  key={offer.id}
                  id={`flight-card-${offer.id}`}
                  className="rounded-[20px] border border-[#e5ecf6] bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Main row */}
                  <div className="flex flex-wrap items-center gap-4 p-4 md:p-5">
                    {/* Airline logo */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                      {offer.airlineLogo ? (
                        <Image
                          src={offer.airlineLogo}
                          alt={offer.airline || "Airline"}
                          width={36}
                          height={36}
                          className="object-contain"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <span className="text-xs font-bold text-muted">{(offer.airlineIata || "??").toUpperCase()}</span>
                      )}
                    </div>

                    {/* Route & times */}
                    <div className="flex flex-1 flex-wrap items-center gap-4 min-w-0">
                      <div className="text-center">
                        <p className="text-xl font-bold tabular-nums">{timeLabel(offer.departure)}</p>
                        <p className="text-xs text-muted">{offer.originAirport || from}</p>
                      </div>
                      <div className="flex flex-col items-center gap-0.5 flex-1 min-w-[80px]">
                        <p className="text-xs text-muted">{durationLabel(offer.duration)}</p>
                        <div className="relative w-full flex items-center">
                          <div className="h-px flex-1 bg-gray-200" />
                          <svg className="mx-1 h-3 w-3 text-primary shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0011 2a1.5 1.5 0 00-1.5 1.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                          </svg>
                          <div className="h-px flex-1 bg-gray-200" />
                        </div>
                        <p className="text-xs text-muted">{offer.stops === 0 ? "Non-stop" : `${offer.stops} stop${offer.stops > 1 ? "s" : ""}`}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold tabular-nums">{timeLabel(offer.arrival)}</p>
                        <p className="text-xs text-muted">{offer.destinationAirport || to}</p>
                      </div>
                    </div>

                    {/* Airline name + cabin */}
                    <div className="hidden md:block text-right min-w-[120px]">
                      <p className="text-sm font-semibold">{offer.airline || "Partner Airline"}</p>
                      <p className="text-xs text-muted capitalize">{(offer.cabinClass || cabinClass).replace("_", " ")}</p>
                      <p className={`text-xs font-medium mt-0.5 ${riskColor}`}>Risk {delayRisk}/98</p>
                    </div>

                    {/* Price + CTA */}
                    <div className="flex flex-col items-end gap-2 ml-auto">
                      <p className="text-2xl font-black text-foreground tabular-nums">
                        {formatMoney(Number(offer.price), offer.currency)}
                      </p>
                      <p className="text-xs text-muted">per person</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setExpandedOfferId(isExpanded ? null : offer.id)}
                          className="rounded-full border border-[#d5dfec] px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors"
                        >
                          {isExpanded ? "Less" : "Details"}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setCheckoutOffer(offer); setCheckoutStep("review"); }}
                          className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-[#f0f4fa] px-4 pb-4 pt-3 md:px-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        {/* Segments */}
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Flight segments</p>
                          {(offer.segments || []).length > 0 ? (
                            <div className="space-y-2">
                              {offer.segments!.map((seg, i) => (
                                <div key={i} className="rounded-xl border border-[#edf2fb] bg-[#f8faff] p-3 text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold">{seg.origin} → {seg.destination}</span>
                                    <span className="text-muted">{durationLabel(seg.duration)}</span>
                                  </div>
                                  <div className="mt-1 flex gap-3 text-muted">
                                    <span>{timeLabel(seg.departing_at)} → {timeLabel(seg.arriving_at)}</span>
                                    <span>{seg.marketing_carrier || seg.operating_carrier || ""}</span>
                                    {seg.aircraft && <span>{seg.aircraft}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted">No segment data available.</p>
                          )}
                        </div>

                        {/* Aircraft + loyalty */}
                        <div className="space-y-3">
                          {aircraftImg && (
                            <div className="overflow-hidden rounded-xl border border-[#edf2fb]">
                              <Image
                                src={aircraftImg}
                                alt={aircraftName || "Aircraft"}
                                width={400}
                                height={200}
                                className="h-32 w-full object-cover"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                              />
                              {aircraftName && (
                                <p className="px-3 py-1.5 text-xs text-muted">{aircraftName}</p>
                              )}
                            </div>
                          )}

                          <div>
                            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">Book with points</p>
                            <div className="space-y-1">
                              {programs.easyPicks.map((p) => (
                                <div key={p.label} className="flex items-center justify-between rounded-lg bg-[#f8faff] px-3 py-2 text-xs">
                                  <span className="font-medium">{p.label}</span>
                                  <span className="text-primary font-semibold">{p.points.toLocaleString()} pts {p.cash}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {!loading && !error && filteredSortedOffers.length === 0 && results.length > 0 && (
          <div className="mt-8 rounded-2xl border border-[#e5ecf6] bg-white p-8 text-center text-sm text-muted">
            No flights match your current filters. Try adjusting stops, price, or airline filters.
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <div className="mt-8 rounded-2xl border border-[#e5ecf6] bg-white p-8 text-center text-sm text-muted">
            No bookable flights found for this route and date. Try a different date or route.
          </div>
        )}

        {/* Price trend chart */}
        <div className="mt-6 rounded-[20px] border border-[#e5ecf6] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Price trend (±5 days)</p>
              <p className="text-xs text-muted">Compare fares around your travel date</p>
            </div>
            <button
              type="button"
              onClick={handlePriceTrend}
              disabled={chartLoading}
              className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white disabled:opacity-60 hover:bg-primary/90 transition-colors"
            >
              {chartLoading ? "Loading…" : "Load trend"}
            </button>
          </div>
          {priceChartData.length > 0 && (
            <div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={priceChartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(v: unknown) => [`$${v as number}`, "Min fare"]} />
                  <Line type="monotone" dataKey="price" stroke="#0062E3" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  {cheapestDatePoint && (
                    <ReferenceDot x={cheapestDatePoint.date} y={cheapestDatePoint.price} r={6} fill="#22c55e" stroke="white" strokeWidth={2} label={{ value: "Best", position: "top", fontSize: 10 }} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Price alerts */}
        <div className="mt-4 rounded-[20px] border border-[#e5ecf6] bg-white p-5 shadow-sm">
          <p className="mb-3 text-sm font-semibold">Price alerts</p>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Target price (USD)"
              value={alertPrice}
              onChange={(e) => setAlertPrice(e.target.value)}
              className="flex-1 rounded-xl border border-[#dfe7f2] px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddAlert}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              Set alert
            </button>
          </div>
          {alerts.length > 0 && (
            <div className="mt-3 space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between rounded-xl border border-[#edf2fb] bg-[#f8faff] px-3 py-2 text-xs">
                  <span>{alert.from} → {alert.to} · target {formatMoney(alert.targetPrice, "USD")} · set {alert.setDate}</span>
                  <button type="button" onClick={() => handleDeleteAlert(alert.id)} className="ml-2 text-red-400 hover:text-red-600">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Airport guides */}
        {(departureGuide || arrivalGuide) && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[departureGuide, arrivalGuide].map((guide, idx) => guide && (
              <div key={idx} className="rounded-[20px] border border-[#e5ecf6] bg-white p-5 shadow-sm">
                <p className="mb-1 text-sm font-semibold">{guide.name}</p>
                <p className="text-xs text-muted mb-3">{guide.summary}</p>
                <Link
                  href={`/guide/airport/${idx === 0 ? from : to}`}
                  className="inline-flex items-center gap-1 rounded-full bg-[#eff5ff] px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  Airport guide →
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Loyalty card recommendations */}
        <div className="mt-4 rounded-[20px] border border-[#e5ecf6] bg-white p-5 shadow-sm">
          <p className="mb-3 text-sm font-semibold">Maximize your points</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {CARD_PROGRAM_OPTIONS.map((card) => (
              <div key={card.program} className="rounded-xl border border-[#edf2fb] bg-[#f8faff] p-3">
                <p className="text-xs font-semibold">{card.program}</p>
                <p className="mt-1 text-xs text-muted">{card.earnRate} · Transfer bonus {card.transferBonus}</p>
                <p className="mt-1 text-xs text-muted">{card.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Checkout modal */}
      {checkoutOffer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-lg font-bold">
                {checkoutStep === "review" ? "Review your flight" : "Complete booking"}
              </p>
              <button type="button" onClick={() => setCheckoutOffer(null)} className="rounded-full p-1.5 hover:bg-gray-100">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {checkoutStep === "review" && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-[#e5ecf6] bg-[#f8faff] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{checkoutOffer.airline || "Partner Airline"}</p>
                      <p className="text-sm text-muted">{fromCity} ({from}) → {toCity} ({to})</p>
                      <p className="text-sm text-muted">{dateLabel(checkoutOffer.departure)} · {durationLabel(checkoutOffer.duration)}</p>
                    </div>
                    <p className="text-2xl font-black text-primary">{formatMoney(Number(checkoutOffer.price), checkoutOffer.currency)}</p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold">Book with points or cash</p>
                  <div className="space-y-2">
                    {buildBookingPrograms(checkoutOffer).transferOptions.map((opt) => (
                      <div key={opt.program} className="flex items-center justify-between rounded-xl border border-[#edf2fb] px-3 py-2.5 text-sm">
                        <span className="font-medium">{opt.program}</span>
                        <span className="text-primary font-semibold">{opt.points.toLocaleString()} pts {opt.cash}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCheckoutStep("book")}
                  className="w-full rounded-2xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
                >
                  Continue to booking
                </button>
              </div>
            )}

            {checkoutStep === "book" && (
              <div className="space-y-4">
                <p className="text-sm text-muted">
                  You&apos;re about to book with <strong>{checkoutOffer.airline || "Partner Airline"}</strong> for{" "}
                  <strong>{formatMoney(Number(checkoutOffer.price), checkoutOffer.currency)}</strong>.
                  This is a demo — no real booking will be made.
                </p>
                <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                  ✅ Booking confirmed (demo). Check your email for confirmation details.
                </div>
                <button
                  type="button"
                  onClick={() => setCheckoutOffer(null)}
                  className="w-full rounded-2xl border border-[#d5dfec] py-3 text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#F4F7FC]">
        <div className="flex items-center gap-3 text-muted">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading booking page…
        </div>
      </div>
    }>
      <BookingPageClient />
    </Suspense>
  );
}