"use client";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import {
  signInWithGoogle,
  signOut,
  handleRedirectResult,
  auth,
  onAuthStateChanged,
} from "../lib/auth";
import type { User } from "firebase/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SearchBar, { type SearchParams } from "../components/SearchBar";

interface PriceAlert {
  id: string;
  from: string;
  to: string;
  targetPrice: number;
  setDate: string;
}

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

const GlobeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
}) => (
  <div className="relative group">
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
      <div className="flex">
        <div className="flex-1 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 p-1.5 flex items-center justify-center overflow-hidden shrink-0">
            {airlineLogo ? (
              <img
                src={airlineLogo}
                alt={airline}
                className="object-contain w-full h-full"
                onError={(e) => {
                  const img = e.currentTarget;
                  img.onerror = null;
                  img.src = "/file.svg";
                }}
              />
            ) : (
              <PlaneRightIcon className="w-6 h-6 text-primary" />
            )}
          </div>
          <div>
            <p className="font-semibold text-foreground">{airline}</p>
            <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full mt-1">
              {cabinClass}
            </span>
          </div>
        </div>

        <div className="flex-[2] p-5 flex items-center justify-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{from}</p>
            <p className="text-xs text-muted">{fromCity}</p>
            <p className="text-sm font-medium text-foreground mt-1">{departureTime}</p>
          </div>
          <div className="flex-1 flex items-center gap-2 px-4">
            <div className="h-0.5 flex-1 border-t-2 border-dashed border-gray-300" />
            <PlaneRightIcon className="w-5 h-5 text-primary" />
            <div className="h-0.5 flex-1 border-t-2 border-dashed border-gray-300" />
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{to}</p>
            <p className="text-xs text-muted">{toCity}</p>
            <p className="text-sm font-medium text-foreground mt-1">{arrivalTime}</p>
          </div>
        </div>

        <div className="w-px border-l-2 border-dashed border-gray-200 my-4" />

        <div className="w-48 p-5 flex flex-col items-center justify-center bg-gray-50/50">
          <p className="text-sm text-muted mb-1">{duration} · {stops === 0 ? 'Direct' : `${stops} stop${stops > 1 ? 's' : ''}`}</p>
          <p className="text-3xl font-bold text-foreground">${price.toLocaleString()}</p>
          <button className="mt-3 px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-full hover:bg-primary/90 transition">
            Book Now
          </button>
        </div>
      </div>
    </div>
    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-[#F0F4F8] rounded-full" />
    <div className="absolute right-48 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-2 border-dashed border-gray-200" style={{ clipPath: 'inset(0 50% 0 0)' }} />
  </div>
);

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
    priceLabel: "USD $450",
    image:
      "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=1200&q=80",
  },
  {
    city: "New York",
    route: "ICN → JFK",
    dateRange: "24 Dec 2025 - 07 Jan 2026",
    priceLabel: "USD $249",
    image:
      "https://images.unsplash.com/photo-1546436836-07a91091f160?auto=format&fit=crop&w=1200&q=80",
  },
  {
    city: "Dubai",
    route: "ICN → DXB",
    dateRange: "24 Dec 2025 - 07 Jan 2026",
    priceLabel: "USD $310",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
  },
];

const bestOfferCards = [
  {
    title: "Your next destination awaits",
    subtitle: "Limited-time booking perks",
    cta: "Explore",
    image:
      "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=1200&q=80",
    tone: "from-[#1f6fff]/90 via-[#2f8dff]/75 to-[#8ad0ff]/70",
  },
  {
    title: "Up to 50% Off Flights!",
    subtitle: "Flash campaign · selected routes",
    cta: "See Deals",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80",
    tone: "from-[#1446d8]/90 via-[#2454ea]/80 to-[#34b6ff]/75",
  },
  {
    title: "Get ready for the next adventure",
    subtitle: "Seasonal fare drop",
    cta: "View Offer",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
    tone: "from-[#0f8be8]/88 via-[#20a2ff]/78 to-[#7ad7ff]/74",
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
  const [user, setUser] = useState<User | null>(null);

  // Search params are owned by SearchBar; page tracks last submitted for downstream use
  const [lastSearch, setLastSearch] = useState<SearchParams>({
    tripType: "roundtrip",
    from: "ICN", fromCity: "Seoul",
    to: "NRT", toCity: "Tokyo",
    departureDate: "", adults: 1, children: 0, infants: 0, cabinClass: "economy",
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [sortTab, setSortTab] = useState<"price" | "duration" | "ai">("price");
  const [priceChartData, setPriceChartData] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [alertPrice, setAlertPrice] = useState("");
  const [matchedAlert, setMatchedAlert] = useState<PriceAlert | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showOffers, setShowOffers] = useState(true);
  const [selectedAirlineKey, setSelectedAirlineKey] = useState("turkish");

  useEffect(() => {
    handleRedirectResult().then((u) => { if (u) setUser(u); });
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const savedAlerts = localStorage.getItem("priceAlerts");
    if (savedAlerts) {
      try { setAlerts(JSON.parse(savedAlerts)); } catch { console.error("Failed to load alerts"); }
    }
  }, []);

  const handleSignIn = async () => { try { await signInWithGoogle(); } catch (err) { console.error("Login failed:", err); } };
  const handleSignOut = async () => { try { await signOut(); } catch (err) { console.error("Logout failed:", err); } };

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

  const calculateDuration = (dep: string, arr: string) => {
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
    const filtered = results.filter((offer: any) => (offer.airline ?? "").toLowerCase() === airlineName.toLowerCase());
    if (filtered.length === 0) return null;
    return filtered.reduce((fastest: any, current: any) => {
      return calculateDuration(current.departure, current.arrival) < calculateDuration(fastest.departure, fastest.arrival) ? current : fastest;
    }, filtered[0]);
  };

  const handlePriceTrend = async () => {
    if (!lastSearch.departureDate) return;
    setChartLoading(true);
    const chartData: any[] = [];
    const selectedDate = new Date(lastSearch.departureDate);
    try {
      for (let i = -7; i <= 7; i++) {
        const checkDate = new Date(selectedDate);
        checkDate.setDate(checkDate.getDate() + i);
        const dateStr = checkDate.toISOString().split("T")[0];
        const res = await fetch("/api/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ origin: lastSearch.from, destination: lastSearch.to, departureDate: dateStr, adults: lastSearch.adults }) });
        const data = await res.json();
        if (res.ok && data.offers?.length > 0) {
          const minPrice = Math.min(...data.offers.map((o: any) => Number(o.price)));
          chartData.push({ date: new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" }), price: minPrice, fullDate: dateStr, isSelected: dateStr === lastSearch.departureDate });
        }
      }
      setPriceChartData(chartData);
    } catch {} finally { setChartLoading(false); }
  };

  const cheapestDatePoint = priceChartData.length > 0 ? priceChartData.reduce((min, curr) => Number(curr.price) < Number(min.price) ? curr : min) : null;

  const handleAddAlert = () => {
    if (!alertPrice || isNaN(Number(alertPrice))) return;
    const newAlert: PriceAlert = { id: Date.now().toString(), from: lastSearch.from, to: lastSearch.to, targetPrice: Number(alertPrice), setDate: new Date().toLocaleDateString("en-US") };
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

  const cheapestDirect = results.filter((f) => f.stops === 0).reduce((min: any, curr) => !min || Number(curr.price) < Number(min.price) ? curr : min, null);
  const cheapestConnecting = results.filter((f) => (f.stops ?? 0) > 0).reduce((min: any, curr) => !min || Number(curr.price) < Number(min.price) ? curr : min, null);
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
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandLogo className="h-10 w-36 md:h-11 md:w-44" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="/" className="text-sm font-medium text-foreground hover:text-primary transition">Home</a>
            <a href="/booking" className="text-sm font-medium text-muted hover:text-primary transition">Booking</a>
            <a href="#deals" className="text-sm font-medium text-muted hover:text-primary transition">Deals</a>
            <a href="#blog" className="text-sm font-medium text-muted hover:text-primary transition">Blog</a>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition">
              <GlobeIcon />
              <span className="hidden sm:inline">EN</span>
            </button>
            {user ? (
              <div className="flex items-center gap-3">
                {user.photoURL && (
                  <Image src={user.photoURL} alt={user.displayName ?? ""} width={32} height={32} className="rounded-full" />
                )}
                <span className="hidden sm:inline text-sm text-muted">{user.displayName}</span>
                <button onClick={handleSignOut} className="px-4 py-2 rounded-full bg-gray-100 border border-gray-200 text-sm font-medium hover:bg-gray-200 transition">
                  Sign Out
                </button>
              </div>
            ) : (
              <button onClick={handleSignIn} className="px-5 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition shadow-lg shadow-primary/25">
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero: Light Volumetric Sky — image_8.png ── */}
      <section
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '100vh',
          marginTop: '64px',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #c8dff5 0%, #a8c8e8 40%, #d8ecf8 75%, #e8f4fc 100%)',
        }}
      >
        {/* ── Atmospheric depth layers ── */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
            background: 'radial-gradient(ellipse 140% 70% at 50% 0%, rgba(255,255,255,0.85) 0%, transparent 55%)',
          }} />
          <div style={{
            position: 'absolute', top: '15%', left: '5%', width: '45%', height: '60%',
            background: 'radial-gradient(ellipse at 40% 50%, rgba(168,200,232,0.45) 0%, transparent 65%)',
            filter: 'blur(30px)',
          }} />
          <div style={{
            position: 'absolute', top: '10%', right: '0%', width: '55%', height: '55%',
            background: 'radial-gradient(ellipse at 60% 30%, rgba(200,223,245,0.35) 0%, transparent 60%)',
            filter: 'blur(20px)',
          }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '25%',
            background: 'linear-gradient(to top, rgba(232,244,252,0.8) 0%, transparent 100%)',
          }} />
        </div>

        {/* ── Perspective grid overlay ── */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2, overflow: 'visible' }}
          viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <pattern id="perspGrid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse"
              patternTransform="translate(720,900) perspective(600) rotateX(55deg) translate(-720,-900)">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(26,58,107,0.08)" strokeWidth="0.8"/>
            </pattern>
            <linearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="white" stopOpacity="0"/>
              <stop offset="40%" stopColor="white" stopOpacity="0"/>
              <stop offset="100%" stopColor="white" stopOpacity="0.9"/>
            </linearGradient>
            <mask id="gridMask">
              <rect width="1440" height="900" fill="url(#gridFade)"/>
            </mask>
          </defs>
          {/* Horizontal vanishing lines */}
          {[0.35, 0.42, 0.50, 0.58, 0.66, 0.74, 0.82, 0.90, 1.0].map((y, i) => (
            <line key={`h${i}`}
              x1="0" y1={900 * y} x2="1440" y2={900 * y}
              stroke="rgba(26,58,107,0.07)" strokeWidth="0.7"
            />
          ))}
          {/* Vertical vanishing lines — converge to horizon center */}
          {[-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6].map((n, i) => {
            const vanishX = 720;
            const vanishY = 900 * 0.35;
            const baseX = 720 + n * 120;
            return (
              <line key={`v${i}`}
                x1={vanishX} y1={vanishY}
                x2={baseX} y2={900}
                stroke="rgba(26,58,107,0.07)" strokeWidth="0.7"
              />
            );
          })}
        </svg>

        {/* ── White/cyan data-stream arcs ── */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 4, overflow: 'visible' }}
          viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <filter id="arcGlow">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="arcGlowStrong">
              <feGaussianBlur stdDeviation="8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          {/* Primary white arc — sweeps left to right */}
          <path d="M 80 600 Q 400 200 800 280 Q 1050 330 1360 180"
            stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" fill="none"
            filter="url(#arcGlowStrong)" strokeDasharray="1400" strokeDashoffset="1400">
            <animate attributeName="stroke-dashoffset" from="1400" to="0" dur="4s" repeatCount="indefinite" begin="0s"/>
            <animate attributeName="opacity" values="0;1;1;0" dur="4s" repeatCount="indefinite" begin="0s"/>
          </path>
          {/* Cyan arc — parallel offset */}
          <path d="M 60 560 Q 380 220 780 310 Q 1020 370 1320 220"
            stroke="rgba(100,200,255,0.75)" strokeWidth="1.2" fill="none"
            filter="url(#arcGlow)" strokeDasharray="1300" strokeDashoffset="1300">
            <animate attributeName="stroke-dashoffset" from="1300" to="0" dur="4.5s" repeatCount="indefinite" begin="0.7s"/>
            <animate attributeName="opacity" values="0;0.85;0.85;0" dur="4.5s" repeatCount="indefinite" begin="0.7s"/>
          </path>
          {/* Soft blue arc — lower */}
          <path d="M 100 650 Q 420 380 760 420 Q 960 445 1200 360"
            stroke="rgba(60,140,220,0.5)" strokeWidth="0.9" fill="none"
            filter="url(#arcGlow)" strokeDasharray="1200" strokeDashoffset="1200">
            <animate attributeName="stroke-dashoffset" from="1200" to="0" dur="5.5s" repeatCount="indefinite" begin="1.4s"/>
            <animate attributeName="opacity" values="0;0.6;0.6;0" dur="5.5s" repeatCount="indefinite" begin="1.4s"/>
          </path>
          {/* Short upper-right arc */}
          <path d="M 950 120 Q 1100 80 1260 110 Q 1360 130 1420 90"
            stroke="rgba(255,255,255,0.7)" strokeWidth="1.1" fill="none"
            filter="url(#arcGlow)" strokeDasharray="550" strokeDashoffset="550">
            <animate attributeName="stroke-dashoffset" from="550" to="0" dur="3s" repeatCount="indefinite" begin="2s"/>
            <animate attributeName="opacity" values="0;0.8;0.8;0" dur="3s" repeatCount="indefinite" begin="2s"/>
          </path>
          {/* Traveling dots on primary arc */}
          <circle cx="0" cy="0" r="3.5" fill="rgba(255,255,255,0.95)" filter="url(#arcGlowStrong)">
            <animateMotion dur="4s" repeatCount="indefinite" begin="0s"
              path="M 80 600 Q 400 200 800 280 Q 1050 330 1360 180"/>
            <animate attributeName="opacity" values="0;1;1;0" dur="4s" repeatCount="indefinite" begin="0s"/>
          </circle>
          <circle cx="0" cy="0" r="2.5" fill="rgba(100,200,255,0.9)" filter="url(#arcGlow)">
            <animateMotion dur="4.5s" repeatCount="indefinite" begin="0.7s"
              path="M 60 560 Q 380 220 780 310 Q 1020 370 1320 220"/>
            <animate attributeName="opacity" values="0;0.9;0.9;0" dur="4.5s" repeatCount="indefinite" begin="0.7s"/>
          </circle>
        </svg>

        {/* ── 3D Volumetric cloud structures ── */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5, overflow: 'visible' }}
          viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <filter id="cloudSoft"><feGaussianBlur stdDeviation="18"/></filter>
            <filter id="cloudMid"><feGaussianBlur stdDeviation="10"/></filter>
            <filter id="cloudSharp"><feGaussianBlur stdDeviation="5"/></filter>
            <radialGradient id="cg1" cx="45%" cy="38%" r="52%">
              <stop offset="0%" stopColor="rgba(255,255,255,1.0)"/>
              <stop offset="35%" stopColor="rgba(235,245,255,0.92)"/>
              <stop offset="70%" stopColor="rgba(200,225,248,0.6)"/>
              <stop offset="100%" stopColor="rgba(168,200,232,0)"/>
            </radialGradient>
            <radialGradient id="cg2" cx="50%" cy="42%" r="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.95)"/>
              <stop offset="40%" stopColor="rgba(220,238,255,0.8)"/>
              <stop offset="100%" stopColor="rgba(168,200,232,0)"/>
            </radialGradient>
            <radialGradient id="cg3" cx="50%" cy="35%" r="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.88)"/>
              <stop offset="50%" stopColor="rgba(210,232,252,0.65)"/>
              <stop offset="100%" stopColor="rgba(168,200,232,0)"/>
            </radialGradient>
          </defs>

          {/* Left cloud cluster */}
          <ellipse cx="160" cy="580" rx="260" ry="110" fill="url(#cg1)" filter="url(#cloudSoft)" opacity="0.75"/>
          <ellipse cx="120" cy="540" rx="180" ry="80" fill="url(#cg1)" filter="url(#cloudMid)" opacity="0.7"/>
          <ellipse cx="200" cy="510" rx="140" ry="60" fill="rgba(255,255,255,0.85)" filter="url(#cloudSharp)" opacity="0.65"/>
          {/* Cloud shadow */}
          <ellipse cx="160" cy="620" rx="220" ry="40" fill="rgba(100,140,190,0.12)" filter="url(#cloudSoft)"/>

          {/* Center-bottom cloud */}
          <ellipse cx="680" cy="760" rx="340" ry="105" fill="url(#cg2)" filter="url(#cloudSoft)" opacity="0.65"/>
          <ellipse cx="640" cy="730" rx="240" ry="75" fill="url(#cg2)" filter="url(#cloudMid)" opacity="0.6"/>
          <ellipse cx="720" cy="710" rx="180" ry="55" fill="rgba(255,255,255,0.8)" filter="url(#cloudSharp)" opacity="0.55"/>

          {/* Right cloud — partially behind airplane */}
          <ellipse cx="1260" cy="480" rx="220" ry="90" fill="url(#cg3)" filter="url(#cloudSoft)" opacity="0.7"/>
          <ellipse cx="1300" cy="450" rx="160" ry="65" fill="url(#cg3)" filter="url(#cloudMid)" opacity="0.65"/>
          <ellipse cx="1240" cy="420" rx="120" ry="48" fill="rgba(255,255,255,0.82)" filter="url(#cloudSharp)" opacity="0.6"/>

          {/* Upper-right wisp */}
          <ellipse cx="1380" cy="180" rx="140" ry="42" fill="url(#cg3)" filter="url(#cloudSoft)" opacity="0.45"/>
          <ellipse cx="1360" cy="160" rx="100" ry="30" fill="rgba(255,255,255,0.7)" filter="url(#cloudMid)" opacity="0.4"/>

          {/* Upper-left wisp */}
          <ellipse cx="80" cy="200" rx="120" ry="38" fill="url(#cg1)" filter="url(#cloudSoft)" opacity="0.4"/>
        </svg>

        {/* ── TERN-branded airplane — right side ── */}
        <div
          className="animate-plane-float"
          style={{
            position: 'absolute', right: '-1%', top: '48%', transform: 'translateY(-50%) rotate(-3deg)',
            width: 'clamp(340px, 42vw, 660px)',
            zIndex: 6, pointerEvents: 'none',
          }}
        >
          <svg viewBox="0 0 800 420" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 16px 48px rgba(26,58,107,0.22)) drop-shadow(0 4px 16px rgba(26,58,107,0.14))' }}>
            <defs>
              <linearGradient id="ternBody" x1="60" y1="185" x2="740" y2="235" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#e8f0fa"/>
                <stop offset="25%" stopColor="#f4f8fe"/>
                <stop offset="55%" stopColor="#eaf2fc"/>
                <stop offset="100%" stopColor="#c8d8ee"/>
              </linearGradient>
              <linearGradient id="ternWing" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#dce8f8"/>
                <stop offset="100%" stopColor="#a0b8d8"/>
              </linearGradient>
              <linearGradient id="ternEngine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#a0b0c8"/>
                <stop offset="50%" stopColor="#d0dcea"/>
                <stop offset="100%" stopColor="rgba(80,100,130,0.8)"/>
              </linearGradient>
              <linearGradient id="ternTailStripe" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1a3a6b"/>
                <stop offset="100%" stopColor="#2a5a9a"/>
              </linearGradient>
            </defs>

            {/* Fuselage — white livery */}
            <ellipse cx="400" cy="210" rx="340" ry="34" fill="url(#ternBody)"/>
            {/* Upper deck highlight */}
            <path d="M 200 196 Q 360 175 560 180 Q 640 182 680 192 Q 640 197 560 195 Q 360 188 200 207 Z"
              fill="rgba(248,252,255,0.95)"/>
            {/* Nose */}
            <path d="M 62 210 Q 82 201 118 206 Q 100 210 118 214 Q 82 219 62 210 Z" fill="#d0dcea"/>
            {/* Tail */}
            <path d="M 718 210 Q 758 205 778 210 Q 758 215 718 210 Z" fill="#b8cce0"/>

            {/* Vertical stabilizer — TERN teal accent */}
            <path d="M 698 210 Q 708 158 728 126 Q 738 121 743 126 Q 738 158 738 210 Z"
              fill="url(#ternWing)" opacity="0.92"/>
            {/* Teal stripe on tail fin */}
            <path d="M 710 185 Q 718 162 728 148 Q 733 144 736 148 Q 730 162 728 185 Z"
              fill="#1a8a7a" opacity="0.75"/>

            {/* Horizontal stabilizers */}
            <path d="M 688 210 Q 718 200 758 195 Q 768 196 768 200 Q 748 205 718 212 Q 698 215 688 210 Z"
              fill="url(#ternWing)" opacity="0.88"/>
            <path d="M 688 210 Q 718 220 758 225 Q 768 224 768 220 Q 748 215 718 208 Q 698 205 688 210 Z"
              fill="url(#ternWing)" opacity="0.72"/>

            {/* Main wing upper */}
            <path d="M 348 210 Q 378 215 418 242 Q 478 272 558 312 Q 598 332 638 342 Q 618 337 578 317 Q 498 277 428 250 Q 388 232 358 220 Z"
              fill="url(#ternWing)" opacity="0.95"/>
            {/* Main wing lower */}
            <path d="M 348 210 Q 378 205 418 180 Q 478 153 558 118 Q 598 100 638 90 Q 618 96 578 116 Q 498 150 428 176 Q 388 190 358 200 Z"
              fill="url(#ternWing)" opacity="0.9"/>

            {/* Engines */}
            <ellipse cx="458" cy="258" rx="37" ry="13" fill="url(#ternEngine)" opacity="0.95"/>
            <ellipse cx="458" cy="258" rx="28" ry="8" fill="#1a2a40" opacity="0.8"/>
            <ellipse cx="538" cy="298" rx="33" ry="11" fill="url(#ternEngine)" opacity="0.9"/>
            <ellipse cx="538" cy="298" rx="25" ry="7" fill="#1a2a40" opacity="0.8"/>
            <ellipse cx="458" cy="162" rx="37" ry="13" fill="url(#ternEngine)" opacity="0.95"/>
            <ellipse cx="458" cy="162" rx="28" ry="8" fill="#1a2a40" opacity="0.8"/>
            <ellipse cx="538" cy="122" rx="33" ry="11" fill="url(#ternEngine)" opacity="0.9"/>
            <ellipse cx="538" cy="122" rx="25" ry="7" fill="#1a2a40" opacity="0.8"/>

            {/* TERN navy cheatline */}
            <path d="M 100 220 Q 400 224 700 220" stroke="url(#ternTailStripe)" strokeWidth="3" fill="none" opacity="0.7"/>
            {/* Teal accent stripe */}
            <path d="M 100 215 Q 400 219 700 215" stroke="#1a8a7a" strokeWidth="1.5" fill="none" opacity="0.55"/>

            {/* Window row */}
            {Array.from({ length: 22 }, (_, i) => (
              <rect key={i} x={138 + i * 25} y={201} width="10" height="6" rx="2"
                fill="rgba(180,215,248,0.75)"/>
            ))}

            {/* TERN logo text on fuselage */}
            <text x="280" y="196" fontFamily="'Geist','Inter',sans-serif" fontSize="18" fontWeight="800"
              fill="#1a3a6b" letterSpacing="3" opacity="0.85">TERN</text>
          </svg>
        </div>

        {/* ── Hero content (centered) ── */}
        <div style={{
          position: 'relative', zIndex: 10,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: 'calc(100vh - 64px)',
          padding: '80px 24px',
          textAlign: 'center',
        }}>
          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(2.6rem, 5.2vw, 4.2rem)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
            color: '#0d2040',
            margin: '0 0 4px 0',
            maxWidth: '820px',
            animation: 'heroTextIn 0.7s cubic-bezier(0.16,1,0.3,1) both',
          }}>
            Find the best flight,
          </h1>
          <h1 style={{
            fontSize: 'clamp(2.6rem, 5.2vw, 4.2rem)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
            color: '#0d2040',
            margin: '0 0 52px 0',
            maxWidth: '820px',
            animation: 'heroTextIn 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both',
          }}>
            <span style={{ color: '#1a3a6b' }}>instantly.</span>
          </h1>

          {/* Search bar */}
          <div style={{
            width: '100%', maxWidth: '1000px',
            animation: 'heroTextIn 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s both',
          }}>
            <SearchBar onSearch={handleSearch} loading={loading} />
          </div>

          {/* Stats row */}
          <div style={{
            display: 'flex', alignItems: 'center',
            marginTop: '36px', flexWrap: 'wrap', justifyContent: 'center',
            animation: 'heroTextIn 0.7s cubic-bezier(0.16,1,0.3,1) 0.35s both',
          }}>
            {[
              { value: '500+', label: 'Airlines' },
              { value: '2M+', label: 'Routes' },
              { value: '4.9/5', label: 'Rating' },
              { value: '10M+', label: 'Travelers' },
            ].map(({ value, label }, i, arr) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', padding: '0 28px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#0d2040', letterSpacing: '-0.03em', lineHeight: 1.2 }}>{value}</div>
                  <div style={{ fontSize: '12px', color: '#4a6080', marginTop: '2px', letterSpacing: '0.04em' }}>{label}</div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ width: '1px', height: '36px', background: 'rgba(26,58,107,0.15)', flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes heroTextIn {
            from { opacity: 0; transform: translateY(18px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </section>


      {/* Explore the best offer for you */}
      <section className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground">Explore the best offers for you</h2>
            <p className="text-muted mt-2">Curated fare campaigns and destination promotions from partner airlines.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {bestOfferCards.map((offer) => (
              <article key={offer.title} className="relative h-40 rounded-2xl overflow-hidden shadow-lg group cursor-pointer">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${offer.image})` }}
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${offer.tone}`} />
                <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/80">Sponsored</p>
                    <h3 className="mt-2 text-2xl font-bold leading-tight max-w-[15ch]">{offer.title}</h3>
                    <p className="mt-1 text-sm text-white/90">{offer.subtitle}</p>
                  </div>
                  <span className="inline-flex w-fit px-3 py-1.5 rounded-full bg-white/20 backdrop-blur text-sm font-semibold border border-white/30">
                    {offer.cta}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Exclusive Flight Coupons for Smarter Travelers */}
      <section className="py-12 bg-[#F8FAFC] border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground">Exclusive Flight Coupons for Smarter Travelers</h2>
            <p className="text-muted mt-2">Ad-ready coupon placements for airline promotions and future in-app monetization.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {couponAds.map((coupon) => (
              <article key={coupon.code} className="relative bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[10px] uppercase tracking-[0.16em] text-primary font-semibold">Sponsored</p>
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold text-foreground">{coupon.title}</p>
                    <p className="text-xs text-muted mt-1">{coupon.desc}</p>
                  </div>
                  <img
                    src={`https://images.kiwi.com/airlines/64/${coupon.iata}.png`}
                    alt={coupon.airline}
                    className="w-8 h-8 object-contain shrink-0"
                    onError={(e) => {
                      const img = e.currentTarget;
                      img.onerror = null;
                      img.src = "/file.svg";
                    }}
                  />
                </div>

                <div className="mt-4 pt-3 border-t border-dashed border-gray-200 flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                    {coupon.code}
                  </span>
                  <span className="text-[11px] text-muted">{coupon.expires}</span>
                </div>

                <a
                  href={coupon.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition inline-flex items-center justify-center"
                >
                  Official Offer Page
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Top Destinations */}
      <section className="py-20" style={{ background: 'linear-gradient(180deg, #EEF8FF 0%, #ffffff 100%)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Explore Top Destinations</h2>
            <p className="text-muted mt-2">Get exclusive flight deals to your favorite cities</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {destinationDeals.map((deal) => (
              <article
                key={deal.city}
                className="relative h-80 overflow-hidden rounded-2xl shadow-lg cursor-pointer group hover:shadow-xl transition-all"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${deal.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-3xl font-bold leading-tight">{deal.city}</p>
                  <p className="mt-1 text-xs text-white/80">{deal.dateRange}</p>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-white/80">Economy From</p>
                      <p className="text-2xl font-bold">{deal.priceLabel}</p>
                    </div>
                    <span className="text-sm font-medium text-white/90">{deal.route}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Most Popular Airlines */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground">Most Popular Airlines</h2>
            <p className="text-muted mt-2">Choose a carrier to see the fastest schedule and airline information</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {popularAirlines.map((airline) => {
              const isActive = selectedAirlineKey === airline.key;
              return (
                <button
                  key={airline.key}
                  type="button"
                  onClick={() => setSelectedAirlineKey(airline.key)}
                  className={`w-full rounded-2xl border px-4 py-3 flex items-center justify-between transition ${
                    isActive
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-gray-200 bg-white hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={`https://images.kiwi.com/airlines/64/${airline.iata}.png`}
                      alt={airline.name}
                      className="w-8 h-8 object-contain shrink-0"
                      onError={(e) => {
                        const img = e.currentTarget;
                        img.onerror = null;
                        img.src = "/file.svg";
                      }}
                    />
                    <span className="text-sm font-semibold text-foreground truncate text-left">{airline.name}</span>
                  </div>
                  <span className="text-muted">→</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-[#F8FAFC] p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
              <div className="flex items-start gap-4">
                <img
                  src={`https://images.kiwi.com/airlines/64/${selectedAirline.iata}.png`}
                  alt={selectedAirline.name}
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    const img = e.currentTarget;
                    img.onerror = null;
                    img.src = "/file.svg";
                  }}
                />
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
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Recommended Route</p>
                <p className="text-lg font-bold text-foreground mt-1">{selectedAirline.recommendedRoute}</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Fastest Schedule</p>
                {fastestOfferForSelectedAirline ? (
                  <>
                    <p className="text-lg font-bold text-foreground mt-1">
                      {fastestOfferForSelectedAirline.departure?.slice(11, 16)} → {fastestOfferForSelectedAirline.arrival?.slice(11, 16)}
                    </p>
                    <p className="text-sm text-muted mt-1">
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

      {/* Stats Bar */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "500+", label: "Destinations" },
              { value: "50M+", label: "Happy Travelers" },
              { value: "200+", label: "Airlines" },
              { value: "4.9", label: "User Rating" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Flights Section */}
      {!showResults && (
        <section className="py-20 bg-[#F8FAFC]">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex items-center justify-between mb-10">
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
                <FlightTicketCard
                  key={flight.id}
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
                    Target price reached! {matchedAlert.from} to {matchedAlert.to} - Current lowest: ${Math.min(...results.map((o: any) => Number(o.price))).toLocaleString()} USD
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
                    <button onClick={handleAddAlert} disabled={!alertPrice} className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition disabled:opacity-50">Set Alert</button>
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
                          <button onClick={() => handleDeleteAlert(alert.id)} className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition">Remove</button>
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

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <BrandLogo className="h-9 w-32 md:h-10 md:w-40" />
            </div>
            <p className="text-sm text-muted">© 2026 Tern. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
