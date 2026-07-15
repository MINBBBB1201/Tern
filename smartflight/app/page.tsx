"use client";
import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import Image from "next/image";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import SearchBar, { type SearchParams } from "../components/SearchBar";
import { LocaleSwitcher } from "../components/LocaleSwitcher";
import { AuthMenu } from "../components/AuthMenu";
import { useHoverTilt } from "../hooks/useHoverTilt";
import { usePriceAlerts } from "../hooks/usePriceAlerts";
import type { Offer } from "../lib/offerUtils";

type PricePoint = { date: string; price: number; fullDate: string; isSelected: boolean };

// Lazy, client-only: the 3D scene must never block first paint — the
// headline and search form are usable before this finishes loading.
// Renders as a drei <View> into the site-wide canvas (see GlobalCanvas).
const HeroTernView = dynamic(() => import("../components/canvas/HeroTernView"), { ssr: false });
const RouteArcView = dynamic(() => import("../components/canvas/RouteArcView"), { ssr: false });
const ScrollFX = dynamic(() => import("../components/ScrollFX"), { ssr: false });

const PlaneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const PlaneRightIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" transform="rotate(-90 12 12)" />
  </svg>
);

const SwapIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const MinusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const BrandLogo = ({
  className = "",
}: {
  className?: string;
}) => (
  <div className={`relative overflow-hidden ${className}`}>
    <Image
      src="/logos/tern-logo-purepick.png"
      alt="Tern"
      fill
      className="object-cover object-center"
      sizes="(max-width: 768px) 160px, 220px"
      priority
      quality={100}
    />
  </div>
);

const TicketCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`relative ${className}`}>
    <div className="bg-white/95 rounded-[28px] shadow-[0_24px_60px_rgba(27,45,84,0.22)] border border-white/80 overflow-hidden backdrop-blur-md">
      <div className="absolute inset-x-10 top-[84px] border-t-2 border-dashed border-[#d8e4fb] pointer-events-none" />
      {children}
    </div>
    <div className="absolute left-0 top-[84px] -translate-y-1/2 -translate-x-1/2 w-9 h-9 bg-[#dce8fb] rounded-full shadow-inner" />
    <div className="absolute right-0 top-[84px] -translate-y-1/2 translate-x-1/2 w-9 h-9 bg-[#dce8fb] rounded-full shadow-inner" />
  </div>
);

/* Mirrors OfferCard.tsx on the booking page (glass-panel-scan, tilt, mono
   data, glass-chip logo tile) so homepage flight rows read as the same
   component family as real search results — one card language, not two. */
const FlightTicketCard = ({
  airline,
  airlineLogo,
  cabinClass,
  from,
  to,
  fromCity,
  toCity,
  duration,
  stops,
  price,
  departureTime,
  arrivalTime
}: {
  airline: string;
  airlineLogo?: string;
  cabinClass: string;
  from: string;
  to: string;
  fromCity: string;
  toCity: string;
  duration: string;
  stops: number;
  price: number;
  departureTime: string;
  arrivalTime: string;
}) => {
  const tilt = useHoverTilt<HTMLElement>(2);

  return (
    <article
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      className="glass-panel-scan tilt-card rounded-[20px] hover:shadow-md"
    >
      <div className="flex flex-wrap items-center gap-4 p-4 md:p-5">
        {/* Airline logo */}
        <div className="glass-chip flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl">
          {airlineLogo ? (
            <img
              src={airlineLogo}
              alt={airline}
              className="h-9 w-9 object-contain"
              onError={(e) => {
                const img = e.currentTarget;
                img.onerror = null;
                img.src = "/file.svg";
              }}
            />
          ) : (
            <PlaneRightIcon className="w-5 h-5 text-primary" />
          )}
        </div>

        {/* Route & times */}
        <div className="flex flex-1 flex-wrap items-center gap-4 min-w-0">
          <div className="text-center">
            <p className="data-mono text-xl font-bold">{departureTime}</p>
            <p className="text-xs text-muted">{from} · {fromCity}</p>
          </div>
          <div className="flex flex-col items-center gap-0.5 flex-1 min-w-[80px]">
            <p className="data-mono text-xs text-muted">{duration}</p>
            <div className="relative w-full flex items-center">
              <div className="h-px flex-1 bg-gray-200" />
              <PlaneRightIcon className="mx-1 h-3 w-3 text-primary shrink-0" />
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <p className="text-xs text-muted">{stops === 0 ? "Non-stop" : `${stops} stop${stops > 1 ? "s" : ""}`}</p>
          </div>
          <div className="text-center">
            <p className="data-mono text-xl font-bold">{arrivalTime}</p>
            <p className="text-xs text-muted">{to} · {toCity}</p>
          </div>
        </div>

        {/* Airline name + cabin */}
        <div className="hidden md:block text-right min-w-[120px]">
          <p className="text-sm font-semibold">{airline}</p>
          <span className="glass-chip mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold text-primary-hover">
            {cabinClass}
          </span>
        </div>

        {/* Price + CTA */}
        <div className="flex flex-col items-end gap-2 ml-auto">
          <p className="data-mono text-2xl font-black text-foreground">${price.toLocaleString()}</p>
          <p className="text-xs text-muted">per person</p>
          <button
            type="button"
            className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    </article>
  );
};

const sampleFlights = [
  {
    id: '1',
    airline: 'Turkish Airlines',
    airlineLogo: 'https://images.kiwi.com/airlines/64/TK.png',
    cabinClass: 'Economy',
    from: 'ICN', to: 'NRT', fromCity: 'Seoul', toCity: 'Tokyo',
    departureTime: '08:30', arrivalTime: '11:00', duration: '2h 30m', stops: 0, price: 289,
  },
  {
    id: '2',
    airline: 'Korean Air',
    airlineLogo: 'https://images.kiwi.com/airlines/64/KE.png',
    cabinClass: 'Business',
    from: 'ICN', to: 'LAX', fromCity: 'Seoul', toCity: 'Los Angeles',
    departureTime: '13:45', arrivalTime: '09:20', duration: '11h 35m', stops: 0, price: 1249,
  },
  {
    id: '3',
    airline: 'Asiana Airlines',
    airlineLogo: 'https://images.kiwi.com/airlines/64/OZ.png',
    cabinClass: 'Economy',
    from: 'ICN', to: 'CDG', fromCity: 'Seoul', toCity: 'Paris',
    departureTime: '10:15', arrivalTime: '16:30', duration: '12h 15m', stops: 1, price: 687,
  },
];

const airlineLogoByName: Record<string, string> = {
  "turkish airlines": "https://images.kiwi.com/airlines/64/TK.png",
  "korean air": "https://images.kiwi.com/airlines/64/KE.png",
  "asiana airlines": "https://images.kiwi.com/airlines/64/OZ.png",
  "jeju air": "https://images.kiwi.com/airlines/64/7C.png",
  "air premia": "https://images.kiwi.com/airlines/64/YP.png",
};

const resolveAirlineLogoByName = (name?: string) => {
  if (!name) return undefined;
  return airlineLogoByName[name.toLowerCase()] ?? undefined;
};

const destinationDeals = [
  {
    city: "Tokyo",
    route: "ICN → NRT",
    dateRange: "24 Dec 2025 - 07 Jan 2026",
    price: 450,
    image:
      "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=1200&q=80",
  },
  {
    city: "New York",
    route: "ICN → JFK",
    dateRange: "24 Dec 2025 - 07 Jan 2026",
    price: 249,
    image:
      "https://images.unsplash.com/photo-1546436836-07a91091f160?auto=format&fit=crop&w=1200&q=80",
  },
  {
    city: "Dubai",
    route: "ICN → DXB",
    dateRange: "24 Dec 2025 - 07 Jan 2026",
    price: 310,
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
  },
];

/* The homepage's one interactive centerpiece: on hover (desktop) or tap
   (mobile) the card tilts toward the cursor — same tilt-card pattern as
   OfferCard/SmartPickCards — the fare counts up, and a thin contrail
   briefly traces the route across the photo. Everything else on the page
   stays calm so this single moment reads as tactile, not as a demo reel. */
const DestinationCard = ({
  deal,
}: {
  deal: { city: string; route: string; dateRange: string; price: number; image: string };
}) => {
  const tilt = useHoverTilt<HTMLElement>(3);
  const [active, setActive] = useState(false);
  const [shownPrice, setShownPrice] = useState(deal.price);
  const rafRef = useRef(0);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const activate = () => {
    if (active) return;
    setActive(true);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    cancelAnimationFrame(rafRef.current);
    const started = performance.now();
    const duration = 650;
    const tick = (now: number) => {
      const t = Math.min((now - started) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setShownPrice(Math.round(deal.price * eased));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const deactivate = () => {
    setActive(false);
    cancelAnimationFrame(rafRef.current);
    setShownPrice(deal.price);
  };

  return (
    <article
      onMouseEnter={activate}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={(e) => {
        deactivate();
        tilt.onMouseLeave(e);
      }}
      onClick={activate}
      className="tilt-card relative h-80 overflow-hidden rounded-2xl shadow-lg cursor-pointer group hover:shadow-xl transition-all"
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
        style={{ backgroundImage: `url(${deal.image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

      {/* Contrail route trace — decorative, drawn only while active */}
      <svg
        className={`route-trace absolute inset-0 h-full w-full pointer-events-none ${active ? "is-active" : ""}`}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          className="route-trace-path"
          d="M -2 82 C 24 68, 52 38, 103 14"
          pathLength={1}
          fill="none"
          stroke="var(--contrail-300)"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
          style={{ filter: 'drop-shadow(0 0 5px rgba(143,224,232,0.85))' }}
        />
      </svg>

      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <p className="text-3xl font-bold leading-tight">{deal.city}</p>
        <p className="data-mono mt-1 text-xs text-white/80">{deal.dateRange}</p>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-white/80">Economy From</p>
            <p className="data-mono text-2xl font-bold">USD ${shownPrice}</p>
          </div>
          <span className="data-mono text-sm font-medium text-white/90">{deal.route}</span>
        </div>
      </div>
    </article>
  );
};

const bestOfferCards = [
  {
    title: "Your next destination awaits",
    subtitle: "Limited-time booking perks",
    cta: "Explore",
    image:
      "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Up to 50% Off Flights!",
    subtitle: "Flash campaign · selected routes",
    cta: "See Deals",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Get ready for the next adventure",
    subtitle: "Seasonal fare drop",
    cta: "View Offer",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
  },
];

const couponAds = [
  {
    airline: "Korean Air",
    iata: "KE",
    title: "Take 8% Off",
    desc: "Valid on ICN departures above $200 for multi-city bookings.",
    code: "KOREAN8",
    expires: "Until 30 Nov",
    url: "https://www.koreanair.com/kr/en/book/deals",
  },
  {
    airline: "Turkish Airlines",
    iata: "TK",
    title: "Business Class -10%",
    desc: "Premium cabin promo for Europe routes from Korea.",
    code: "TKBIZ10",
    expires: "Until 12 Dec",
    url: "https://www.turkishairlines.com/en-int/flights/flight-ticket/",
  },
  {
    airline: "Asiana Airlines",
    iata: "OZ",
    title: "Free Baggage Upgrade",
    desc: "Extra 10kg baggage on selected long-haul flights.",
    code: "OZBAG10",
    expires: "Until 25 Dec",
    url: "https://flyasiana.com/C/KR/EN/contents/travel-information",
  },
  {
    airline: "Jeju Air",
    iata: "7C",
    title: "Weekend Saver 7%",
    desc: "Savings for Fri-Sun bookings to Japan and SEA.",
    code: "WEEKEND7",
    expires: "Until 15 Dec",
    url: "https://www.jejuair.net/en/specialprice/event.do",
  },
];

const popularAirlines = [
  {
    key: "turkish",
    name: "Turkish Airlines",
    iata: "TK",
    website: "https://www.turkishairlines.com",
    description:
      "A global full-service carrier with broad Europe-Middle East connections and premium long-haul options.",
    recommendedRoute: "ICN → IST",
  },
  {
    key: "korean",
    name: "Korean Air",
    iata: "KE",
    website: "https://www.koreanair.com",
    description:
      "Korea’s flagship airline, known for strong transpacific schedules, comfort, and reliable full-service operations.",
    recommendedRoute: "ICN → LAX",
  },
  {
    key: "asiana",
    name: "Asiana Airlines",
    iata: "OZ",
    website: "https://flyasiana.com",
    description:
      "A premium Korean carrier with quality in-flight service and solid Asia-Europe route coverage.",
    recommendedRoute: "ICN → CDG",
  },
  {
    key: "jeju",
    name: "Jeju Air",
    iata: "7C",
    website: "https://www.jejuair.net",
    description:
      "A leading low-cost carrier in Korea focused on affordable fares and convenient short-haul travel.",
    recommendedRoute: "ICN → NRT",
  },
  {
    key: "airpremia",
    name: "Air Premia",
    iata: "YP",
    website: "https://www.airpremia.com",
    description:
      "A hybrid-service airline delivering competitive fares with enhanced seat comfort on medium and long routes.",
    recommendedRoute: "ICN → NRT",
  },
  {
    key: "singapore",
    name: "Singapore Airlines",
    iata: "SQ",
    website: "https://www.singaporeair.com",
    description:
      "A world-renowned premium airline with excellent service standards and global network quality.",
    recommendedRoute: "ICN → SIN",
  },
];

export default function Home() {
  const router = useRouter();
  const tNav = useTranslations("Nav");
  const tHero = useTranslations("Hero");

  // Search params are owned by SearchBar; page tracks last submitted for downstream use
  const [lastSearch, setLastSearch] = useState<SearchParams>({
    tripType: "roundtrip",
    from: "ICN", fromCity: "Seoul",
    to: "NRT", toCity: "Tokyo",
    departureDate: "", adults: 1, children: 0, infants: 0, cabinClass: "economy",
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Offer[]>([]);
  const [sortTab, setSortTab] = useState<"price" | "duration" | "ai">("price");
  const [priceChartData, setPriceChartData] = useState<PricePoint[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const { alerts, alertPrice, setAlertPrice, matchedAlert, addAlert, deleteAlert } = usePriceAlerts({
    from: lastSearch.from,
    to: lastSearch.to,
  });
  const [showResults, setShowResults] = useState(false);
  const [showOffers, setShowOffers] = useState(true);
  const [selectedAirlineKey, setSelectedAirlineKey] = useState("turkish");
  // Nav sits over the dark hero at the top, over light sections once scrolled —
  // same glass material in both states, different fill.
  const [navOverHero, setNavOverHero] = useState(true);

  useEffect(() => {
    const onScroll = () => setNavOverHero(window.scrollY < window.innerHeight - 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);



  // Called by SearchBar on submit — navigates to /booking with all params
  const handleSearch = (params: SearchParams) => {
    setLastSearch(params);
    setLoading(true);
    const urlParams = new URLSearchParams({
      from: params.from,
      to: params.to,
      fromCity: params.fromCity,
      toCity: params.toCity,
      departureDate: params.departureDate,
      returnDate: params.returnDate ?? "",
      tripType: params.tripType,
      adults: String(params.adults),
      children: String(params.children),
      infants: String(params.infants),
      cabinClass: params.cabinClass,
    });
    router.push(`/booking?${urlParams.toString()}`);
    setLoading(false);
  };

  const calculateDuration = (dep?: string, arr?: string) => {
    if (!dep || !arr) return Infinity;
    return new Date(arr).getTime() - new Date(dep).getTime();
  };

  const getSortedResults = () => {
    const sorted = [...results];
    if (sortTab === "price") return sorted.sort((a, b) => Number(a.price) - Number(b.price));
    if (sortTab === "duration") return sorted.sort((a, b) => calculateDuration(a.departure, a.arrival) - calculateDuration(b.departure, b.arrival));
    if (sortTab === "ai") return sorted.sort((a, b) => { if ((a.stops ?? 0) !== (b.stops ?? 0)) return (a.stops ?? 0) - (b.stops ?? 0); return Number(a.price) - Number(b.price); });
    return sorted;
  };

  const getFastestOfferForAirline = (airlineName?: string) => {
    if (!airlineName || results.length === 0) return null;
    const filtered = results.filter((offer) => (offer.airline ?? "").toLowerCase() === airlineName.toLowerCase());
    if (filtered.length === 0) return null;
    return filtered.reduce((fastest, current) => {
      return calculateDuration(current.departure, current.arrival) < calculateDuration(fastest.departure, fastest.arrival) ? current : fastest;
    }, filtered[0]);
  };

  const handlePriceTrend = async () => {
    if (!lastSearch.departureDate) return;
    setChartLoading(true);
    const chartData: PricePoint[] = [];
    const selectedDate = new Date(lastSearch.departureDate);
    try {
      for (let i = -7; i <= 7; i++) {
        const checkDate = new Date(selectedDate);
        checkDate.setDate(checkDate.getDate() + i);
        const dateStr = checkDate.toISOString().split("T")[0];
        const res = await fetch("/api/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ origin: lastSearch.from, destination: lastSearch.to, departureDate: dateStr, adults: lastSearch.adults }) });
        const data = await res.json();
        if (res.ok && data.offers?.length > 0) {
          const minPrice = Math.min(...data.offers.map((o: { price: string }) => Number(o.price)));
          chartData.push({ date: new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" }), price: minPrice, fullDate: dateStr, isSelected: dateStr === lastSearch.departureDate });
        }
      }
      setPriceChartData(chartData);
    } catch {} finally { setChartLoading(false); }
  };

  const cheapestDatePoint = priceChartData.length > 0 ? priceChartData.reduce((min, curr) => Number(curr.price) < Number(min.price) ? curr : min) : null;

  const cheapestDirect = results.filter((f) => f.stops === 0).reduce<Offer | null>((min, curr) => !min || Number(curr.price) < Number(min.price) ? curr : min, null);
  const cheapestConnecting = results.filter((f) => (f.stops ?? 0) > 0).reduce<Offer | null>((min, curr) => !min || Number(curr.price) < Number(min.price) ? curr : min, null);
  const selectedAirline = popularAirlines.find((a) => a.key === selectedAirlineKey) ?? popularAirlines[0];
  const fastestOfferForSelectedAirline = getFastestOfferForAirline(selectedAirline?.name);

  const getCabinClassLabel = (cls: string) => {
    switch (cls) {
      case 'economy': return 'Economy';
      case 'premium_economy': return 'Premium';
      case 'business': return 'Business';
      case 'first': return 'First';
      default: return 'Economy';
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Scroll choreography: reveals for [data-fx-*] elements below */}
      <ScrollFX />
      {/* Navigation — one glass bar, two states: dark fill over the twilight
          hero at the top, light fill once it sits over light content */}
      <nav className={`fixed top-0 left-0 right-0 z-50 ${navOverHero ? "glass-nav-dark" : "glass-nav"}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label={tNav("home")}>
            <BrandLogo className={`h-10 w-36 md:h-11 md:w-44 transition ${navOverHero ? "brightness-0 invert" : ""}`} />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className={`text-sm font-medium hover:text-[var(--contrail-300)] transition ${navOverHero ? "text-white" : "text-foreground"}`}>{tNav("home")}</Link>
            <a href="/booking" className={`text-sm font-medium transition ${navOverHero ? "text-white/70 hover:text-[var(--contrail-300)]" : "text-muted hover:text-primary-hover"}`}>{tNav("booking")}</a>
            <a href="#deals" className={`text-sm font-medium transition ${navOverHero ? "text-white/70 hover:text-[var(--contrail-300)]" : "text-muted hover:text-primary-hover"}`}>{tNav("deals")}</a>
            <a href="#blog" className={`text-sm font-medium transition ${navOverHero ? "text-white/70 hover:text-[var(--contrail-300)]" : "text-muted hover:text-primary-hover"}`}>{tNav("blog")}</a>
          </div>
          <div className="flex items-center gap-4">
            <LocaleSwitcher dark={navOverHero} />
            <AuthMenu dark={navOverHero} />
          </div>
        </div>
      </nav>

      {/* ── Hero: Civil Twilight — 35,000ft, dawn/dusk horizon ── */}
      {/* No top margin: the twilight gradient runs underneath the glass nav,
          so the nav's dark fill has real hero to frost against */}
      <section
        className="hero-twilight"
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '100vh',
        }}
      >
        {/* Ambient stars — distant, drifting almost imperceptibly */}
        <div className="hero-stars" aria-hidden="true" />

        {/* Signature sequence: glass tern → boarding pass */}
        <HeroTernView />

        {/* ── Hero content (centered) ── */}
        <div className="hero-content" style={{
          position: 'relative', zIndex: 10,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh',
          padding: '144px 24px 80px',
          textAlign: 'center',
        }}>
          {/* Copy block: centered by default; when the animated 3D scene is
              active on desktop, .hero-copy shifts right so the globe owns
              the left half (see globals.css + data-hero-static). */}
          <div className="hero-copy" style={{ display: 'flex', flexDirection: 'column' }}>
          <h1
            className="hero-headline animate-hero-text"
            style={{
              fontSize: 'clamp(2.6rem, 5.2vw, 4.2rem)',
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: 'var(--paper-50)',
              margin: '0 0 16px 0',
              maxWidth: '820px',
            }}
          >
            {tHero("title")}
          </h1>
          <p
            className="animate-hero-text text-balance"
            style={{
              fontSize: 'clamp(1rem, 1.6vw, 1.15rem)',
              color: 'rgba(246,248,251,0.72)',
              margin: '0 0 44px 0',
              maxWidth: '580px',
              animationDelay: '0.1s',
            }}
          >
            {tHero("subtitle")}
          </p>
          </div>

          {/* Search bar */}
          <div className="animate-hero-text" style={{ width: '100%', maxWidth: '1000px', animationDelay: '0.2s' }}>
            <SearchBar onSearch={handleSearch} loading={loading} />
          </div>

          {/* Stats row */}
          <div
            className="animate-hero-text"
            style={{
              display: 'flex', alignItems: 'center',
              marginTop: '36px', flexWrap: 'wrap', justifyContent: 'center',
              animationDelay: '0.35s',
            }}
          >
            {[
              { value: '500+', label: tHero("statAirlines") },
              { value: '2M+', label: tHero("statRoutes") },
              { value: '4.9/5', label: tHero("statRating") },
              { value: '10M+', label: tHero("statTravelers") },
            ].map(({ value, label }, i, arr) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', padding: '0 28px' }}>
                  <div className="data-mono" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--paper-50)', letterSpacing: '-0.01em', lineHeight: 1.2 }}>{value}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(246,248,251,0.6)', marginTop: '2px', letterSpacing: '0.04em' }}>{label}</div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ width: '1px', height: '36px', background: 'rgba(143,224,232,0.2)', flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Why "Tern" — the name, stated plainly, not implied by an animation.
          The hero ends on the warm --horizon-500 band; this strip continues
          that horizon and lets it settle into daylight paper, so the page
          transitions from night to day instead of cutting to flat white. */}
      <section
        className="py-14"
        style={{
          background:
            'linear-gradient(180deg, var(--horizon-500) 0%, color-mix(in srgb, var(--horizon-500) 40%, var(--paper-50)) 30%, color-mix(in srgb, var(--horizon-500) 12%, var(--paper-50)) 62%, var(--paper-50) 100%)',
        }}
      >
        <div data-fx-head className="max-w-4xl mx-auto px-6 flex items-center justify-center gap-5 text-center md:text-left">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="hidden md:block shrink-0">
            <path d="M2 15 L22 8 L12 12.5 L9.5 4.5 L7.5 5.5 L9 13.5 Z" fill="var(--dusk-700)" />
          </svg>
          <p className="text-[15px] leading-relaxed" style={{ color: 'var(--dusk-700)' }}>
            <span className="data-mono text-[11px] font-semibold tracking-[0.18em] block mb-1" style={{ color: 'var(--signal-600)' }}>WHY &ldquo;TERN&rdquo;</span>
            The Arctic Tern flies pole to pole every year — farther than any other animal alive — chasing an endless summer.
            Tern helps you do the same, for less.
          </p>
        </div>
      </section>

      {/* Explore the best offer for you — same photo-card language as
          "Explore Top Destinations" below: real destination photo, glass
          content bar, glass-chip sponsored tag (kept for disclosure). */}
      <section className="py-14" style={{ background: 'var(--paper-50)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div data-fx-head className="mb-8">
            <h2 className="text-3xl font-bold text-foreground">Explore the best offers for you</h2>
            <p className="text-muted mt-2">Curated fare campaigns and destination promotions from partner airlines.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {bestOfferCards.map((offer) => (
              <article data-fx-card key={offer.title} className="relative h-56 rounded-2xl overflow-hidden shadow-lg group cursor-pointer">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${offer.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,15,30,0.45)] via-transparent to-[rgba(10,15,30,0.12)]" />
                <span className="glass-chip absolute left-3 top-3 rounded-full px-2.5 py-1 data-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground">
                  Sponsored
                </span>
                <div className="glass-panel absolute inset-x-3 bottom-3 rounded-xl p-4">
                  <h3 className="text-lg font-bold leading-snug text-foreground">{offer.title}</h3>
                  <p className="mt-0.5 text-xs text-muted">{offer.subtitle}</p>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--signal-600)' }}>
                    {offer.cta}
                    <span aria-hidden="true">→</span>
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Exclusive Flight Coupons for Smarter Travelers — glass panels; the
          promo code is data (like flight numbers), so it gets the mono chip. */}
      <section className="glass-boost py-12 bg-white border-y" style={{ borderColor: 'rgba(27,42,82,0.08)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div data-fx-head className="mb-8">
            <h2 className="text-3xl font-bold text-foreground">Exclusive Flight Coupons for Smarter Travelers</h2>
            <p className="text-muted mt-2">Ad-ready coupon placements for airline promotions and future in-app monetization.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {couponAds.map((coupon) => (
              <article data-fx-card key={coupon.code} className="glass-panel relative rounded-2xl p-4 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <span className="glass-chip rounded-full px-2.5 py-1 data-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                    Sponsored
                  </span>
                  <div className="glass-chip flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl">
                    <img
                      src={`https://images.kiwi.com/airlines/64/${coupon.iata}.png`}
                      alt={coupon.airline}
                      className="w-7 h-7 object-contain"
                      onError={(e) => {
                        const img = e.currentTarget;
                        img.onerror = null;
                        img.src = "/file.svg";
                      }}
                    />
                  </div>
                </div>

                <p className="mt-3 text-lg font-bold text-foreground">{coupon.title}</p>
                <p className="text-xs text-muted mt-1">{coupon.desc}</p>

                <div className="mt-4 pt-3 border-t border-dashed border-[var(--glass-border)] flex items-center justify-between gap-2">
                  <span className="glass-chip data-mono rounded-md px-2.5 py-1 text-xs font-semibold text-foreground">
                    {coupon.code}
                  </span>
                  <span className="data-mono text-[11px] text-muted">{coupon.expires}</span>
                </div>

                <a
                  href={coupon.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 w-full py-2 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition inline-flex items-center justify-center"
                >
                  Official Offer Page
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Top Destinations — the one interactive moment on the page */}
      <section
        className="py-20"
        style={{ background: 'linear-gradient(180deg, color-mix(in srgb, var(--contrail-300) 14%, #ffffff) 0%, #ffffff 100%)' }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div data-fx-head className="text-center mb-6">
            <h2 className="text-3xl font-bold text-foreground">Explore Top Destinations</h2>
            <p className="text-muted mt-2">Get exclusive flight deals to your favorite cities</p>
          </div>
          {/* Ink route arc traced on by scroll — the section's 3D moment */}
          <RouteArcView />
          <div className="grid md:grid-cols-3 gap-6">
            {destinationDeals.map((deal) => (
              <div data-fx-card key={deal.city}>
                <DestinationCard deal={deal} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Most Popular Airlines */}
      <section className="glass-boost py-16" style={{ background: 'var(--paper-50)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div data-fx-head className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground">Most Popular Airlines</h2>
            <p className="text-muted mt-2">Choose a carrier to see the fastest schedule and airline information</p>
          </div>

          <div data-fx-card className="grid md:grid-cols-3 gap-4">
            {popularAirlines.map((airline) => {
              const isActive = selectedAirlineKey === airline.key;
              return (
                <button
                  key={airline.key}
                  type="button"
                  onClick={() => setSelectedAirlineKey(airline.key)}
                  className={`glass-panel glass-row w-full rounded-2xl px-4 py-3 flex items-center justify-between ${isActive ? "is-active" : ""}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Real airline brand marks — never restyled, only their
                        container is standardized into the glass-chip tile */}
                    <span className="glass-chip flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl">
                      <img
                        src={`https://images.kiwi.com/airlines/64/${airline.iata}.png`}
                        alt={airline.name}
                        className="w-7 h-7 object-contain"
                        onError={(e) => {
                          const img = e.currentTarget;
                          img.onerror = null;
                          img.src = "/file.svg";
                        }}
                      />
                    </span>
                    <span className="text-sm font-semibold text-foreground truncate text-left">{airline.name}</span>
                  </div>
                  <span className="text-muted">→</span>
                </button>
              );
            })}
          </div>

          <div className="glass-panel mt-6 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
              <div className="flex items-start gap-4">
                <span className="glass-chip flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl">
                  <img
                    src={`https://images.kiwi.com/airlines/64/${selectedAirline.iata}.png`}
                    alt={selectedAirline.name}
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      const img = e.currentTarget;
                      img.onerror = null;
                      img.src = "/file.svg";
                    }}
                  />
                </span>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{selectedAirline.name}</h3>
                  <p className="text-sm text-muted mt-1 max-w-2xl">{selectedAirline.description}</p>
                </div>
              </div>

              <a
                href={selectedAirline.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition"
              >
                Visit Official Website
              </a>
            </div>

            <div className="mt-5 grid md:grid-cols-2 gap-4">
              <div className="glass-chip rounded-xl p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Recommended Route</p>
                <p className="data-mono text-lg font-bold text-foreground mt-1">{selectedAirline.recommendedRoute}</p>
              </div>

              <div className="glass-chip rounded-xl p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Fastest Schedule</p>
                {fastestOfferForSelectedAirline ? (
                  <>
                    <p className="data-mono text-lg font-bold text-foreground mt-1">
                      {fastestOfferForSelectedAirline.departure?.slice(11, 16)} → {fastestOfferForSelectedAirline.arrival?.slice(11, 16)}
                    </p>
                    <p className="data-mono text-sm text-muted mt-1">
                      {Math.floor(calculateDuration(fastestOfferForSelectedAirline.departure, fastestOfferForSelectedAirline.arrival) / 3600000)}h {Math.floor((calculateDuration(fastestOfferForSelectedAirline.departure, fastestOfferForSelectedAirline.arrival) % 3600000) / 60000)}m
                      {" "}· ${Number(fastestOfferForSelectedAirline.price).toLocaleString()}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted mt-2">
                    Search flights first to see the fastest real-time schedule for this airline.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar — these numbers are data, so they get the mono data type
          and a quiet glass container instead of floating bare in space */}
      <section className="glass-boost py-16 bg-white border-y" style={{ borderColor: 'rgba(27,42,82,0.08)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "500+", label: "Destinations" },
              { value: "50M+", label: "Happy Travelers" },
              { value: "200+", label: "Airlines" },
              { value: "4.9", label: "User Rating" },
            ].map((stat) => (
              <div data-fx-card key={stat.label} className="glass-chip rounded-2xl px-4 py-5 text-center">
                <p className="data-mono text-3xl md:text-4xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Flights Section */}
      {!showResults && (
        <section className="glass-boost py-20" style={{ background: 'var(--paper-50)' }}>
          <div className="max-w-5xl mx-auto px-6">
            <div data-fx-head className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-bold text-foreground">Choose Your Perfect Flight</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted">Show Offers</span>
                <button onClick={() => setShowOffers(!showOffers)} className={`relative w-12 h-6 rounded-full transition ${showOffers ? 'bg-primary' : 'bg-gray-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${showOffers ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {sampleFlights.map((flight) => (
                <div data-fx-card key={flight.id}>
                <FlightTicketCard
                  airline={flight.airline}
                  airlineLogo={flight.airlineLogo}
                  cabinClass={flight.cabinClass}
                  from={flight.from}
                  to={flight.to}
                  fromCity={flight.fromCity}
                  toCity={flight.toCity}
                  departureTime={flight.departureTime}
                  arrivalTime={flight.arrivalTime}
                  duration={flight.duration}
                  stops={flight.stops}
                  price={flight.price}
                />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search Results */}
      {showResults && (
        <section className="py-16 bg-[#F8FAFC]">
          <div className="max-w-5xl mx-auto px-6">
            {results.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">{results.length} Flights Found</h2>

                {matchedAlert && (
                  <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium text-center">
                    Target price reached! {matchedAlert.from} to {matchedAlert.to} - Current lowest: ${Math.min(...results.map((o) => Number(o.price))).toLocaleString()} USD
                  </div>
                )}

                {(cheapestDirect || cheapestConnecting) && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">Direct vs Connecting</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {cheapestDirect && (
                        <div className="bg-white rounded-xl p-5 border border-primary/30 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><PlaneIcon /></div>
                            <span className="text-sm font-semibold text-primary">Direct Flight</span>
                          </div>
                          <p className="text-3xl font-bold text-foreground">${Number(cheapestDirect.price).toLocaleString()}</p>
                          <p className="text-sm text-muted mt-1">{cheapestDirect.airline}</p>
                          <p className="text-sm text-foreground mt-2">{cheapestDirect.departure?.slice(11, 16)} → {cheapestDirect.arrival?.slice(11, 16)}</p>
                        </div>
                      )}
                      {cheapestConnecting && (
                        <div className="bg-white rounded-xl p-5 border border-amber-300/50 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center"><SwapIcon /></div>
                            <span className="text-sm font-semibold text-amber-600">{cheapestConnecting.stops} Stop{cheapestConnecting.stops > 1 ? "s" : ""}</span>
                          </div>
                          <p className="text-3xl font-bold text-foreground">${Number(cheapestConnecting.price).toLocaleString()}</p>
                          <p className="text-sm text-muted mt-1">{cheapestConnecting.airline}</p>
                          <p className="text-sm text-foreground mt-2">{cheapestConnecting.departure?.slice(11, 16)} → {cheapestConnecting.arrival?.slice(11, 16)}</p>
                        </div>
                      )}
                    </div>
                    {cheapestDirect && cheapestConnecting && (
                      <div className={`text-center py-3 rounded-xl text-sm font-semibold ${Number(cheapestDirect.price) <= Number(cheapestConnecting.price) ? "bg-primary/10 text-primary" : "bg-green-50 text-green-600"}`}>
                        {Number(cheapestDirect.price) <= Number(cheapestConnecting.price) ? "Direct flight is cheaper!" : `Save $${(Number(cheapestDirect.price) - Number(cheapestConnecting.price)).toLocaleString()} with connecting flight!`}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-200">
                  {(["price", "duration", "ai"] as const).map((tab) => (
                    <button key={tab} onClick={() => setSortTab(tab)} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition ${sortTab === tab ? "bg-primary text-white" : "text-muted hover:text-foreground"}`}>
                      {tab === "price" ? "Lowest Price" : tab === "duration" ? "Shortest" : "AI Recommended"}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {getSortedResults().map((offer) => (
                    <FlightTicketCard
                      key={offer.id}
                      airline={offer.airline ?? "Unknown Airline"}
                      airlineLogo={offer.airlineLogo ?? resolveAirlineLogoByName(offer.airline)}
                      cabinClass={getCabinClassLabel(lastSearch.cabinClass)}
                      from={lastSearch.from} to={lastSearch.to} fromCity={lastSearch.fromCity} toCity={lastSearch.toCity}
                      departureTime={offer.departure?.slice(11, 16) ?? '--:--'}
                      arrivalTime={offer.arrival?.slice(11, 16) ?? '--:--'}
                      duration={`${Math.floor(calculateDuration(offer.departure, offer.arrival) / 3600000)}h ${Math.floor((calculateDuration(offer.departure, offer.arrival) % 3600000) / 60000)}m`}
                      stops={offer.stops ?? 0}
                      price={Number(offer.price)}
                    />
                  ))}
                </div>

                <button onClick={handlePriceTrend} disabled={chartLoading} className="w-full py-3 rounded-xl bg-white border border-gray-200 text-foreground text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50">
                  {chartLoading ? "Loading price trends..." : "View Price Trends"}
                </button>

                {priceChartData.length > 0 && (
                  <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Price Trends (±7 days)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={priceChartData}>
                        <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: "12px" }} />
                        <YAxis stroke="#64748b" style={{ fontSize: "12px" }} label={{ value: "USD", angle: -90, position: "insideLeft" }} />
                        <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} formatter={(value) => `$${Number(value).toLocaleString()}`} />
                        <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={2} dot={{ fill: "#2563eb", r: 4 }} activeDot={{ r: 6 }} />
                        {priceChartData.map((point) => point.isSelected ? <ReferenceDot key={point.fullDate} x={point.date} y={point.price} r={6} fill="#0ea5e9" stroke="#0891b2" strokeWidth={2} /> : null)}
                        {cheapestDatePoint && !cheapestDatePoint.isSelected && <ReferenceDot x={cheapestDatePoint.date} y={cheapestDatePoint.price} r={6} fill="#10b981" stroke="#059669" strokeWidth={2} label={{ value: "Best", position: "top", fill: "#10b981", fontSize: 12 }} />}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Set Price Alert</h3>
                  <div className="flex gap-3">
                    <input type="number" value={alertPrice} onChange={(e) => setAlertPrice(e.target.value)} placeholder="Target price (USD)" className="flex-1 p-3 rounded-xl bg-gray-50 text-foreground border border-gray-200 placeholder-gray-400 outline-none focus:border-primary transition" />
                    <button onClick={addAlert} disabled={!alertPrice} className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition disabled:opacity-50">Set Alert</button>
                  </div>
                  {alerts.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs text-muted uppercase tracking-wide">Active Alerts ({alerts.length})</p>
                      {alerts.map((alert) => (
                        <div key={alert.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{alert.from} → {alert.to}</p>
                            <p className="text-xs text-muted">${alert.targetPrice} USD · {alert.setDate}</p>
                          </div>
                          <button onClick={() => deleteAlert(alert.id)} className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition">Remove</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : !loading ? (
              <div className="text-center py-12">
                <p className="text-muted">No flights found. Try different dates or destinations.</p>
              </div>
            ) : null}
          </div>
        </section>
      )}

      {/* Footer — returns to the hero's night sky so the page ends where it
          began; a plain white footer here would read as one more seam */}
      <footer
        className="py-12"
        style={{
          background: 'linear-gradient(180deg, var(--dusk-700) 0%, var(--ink-900) 100%)',
          borderTop: '1px solid rgba(143,224,232,0.18)',
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <Link href="/" className="flex items-center gap-2" aria-label={tNav("home")}>
              <BrandLogo className="h-9 w-32 md:h-10 md:w-40 brightness-0 invert" />
            </Link>
            <p className="text-sm" style={{ color: 'rgba(246,248,251,0.65)' }}>© 2026 Tern. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
