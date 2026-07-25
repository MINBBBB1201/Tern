"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "../../i18n/navigation";
import dynamic from "next/dynamic";
import { Link } from "../../i18n/navigation";
import SearchBar, { type SearchParams } from "../../components/SearchBar";
import { LocaleSwitcher } from "../../components/LocaleSwitcher";
import { AuthMenu } from "../../components/AuthMenu";
import { MobileMenu } from "../../components/MobileMenu";
import { useHoverTilt } from "../../hooks/useHoverTilt";
import type { Offer } from "../../lib/offerUtils";
import { airlineDealPages } from "../../lib/airlineDeals";
import { SiteFooter } from "../../components/SiteFooter";
import { localeTag } from "../../i18n/locales";
import { useDurationLabel } from "../../lib/useDurationLabel";

// Lazy, client-only: the 3D scene must never block first paint — the
// headline and search form are usable before this finishes loading.
// Renders as a drei <View> into the site-wide canvas (see GlobalCanvas).
const HeroTernView = dynamic(() => import("../../components/canvas/HeroTernView"), { ssr: false });
const ScrollFX = dynamic(() => import("../../components/ScrollFX"), { ssr: false });
const ScrollTrail = dynamic(() => import("../../components/ScrollTrail"), { ssr: false });

const PlaneRightIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" transform="rotate(-90 12 12)" />
  </svg>
);

/* Hero SmartPicks strip icons — same inline stroke style as the rest of
   the page's icon set. */
const TagIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M3 5a2 2 0 012-2h5.6a2 2 0 011.4.6l8.4 8.4a2 2 0 010 2.8L15 20.2a2 2 0 01-2.8 0L3.6 11.8A2 2 0 013 10.4V5z" />
  </svg>
);

const BoltIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const SunriseIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 13a4 4 0 00-4 4h8a4 4 0 00-4-4zM12 5v3m-6.4.6l2.1 2.1m10.7-2.1l-2.1 2.1M3 21h18" />
  </svg>
);

const SparkIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l2.1 6.9L21 12l-6.9 2.1L12 21l-2.1-6.9L3 12l6.9-2.1L12 3z" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l7 4v5c0 4.8-3.2 7.9-7 9-3.8-1.1-7-4.2-7-9V7l7-4zM9 12l2 2 4-4" />
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
  durationMinutes,
  stops,
  price,
  departureTime,
  arrivalTime,
  onBook,
}: {
  airline: string;
  airlineLogo?: string;
  cabinClass: string;
  from: string;
  to: string;
  fromCity: string;
  toCity: string;
  durationMinutes: number;
  stops: number;
  price: number;
  departureTime: string;
  arrivalTime: string;
  onBook: () => void;
}) => {
  const tilt = useHoverTilt<HTMLElement>(5);
  const t = useTranslations("Home");
  const duration = useDurationLabel();

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
            <Image
              src={airlineLogo}
              alt={airline}
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
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
            <p className="data-mono text-xs text-muted">{duration.fromMinutes(durationMinutes)}</p>
            <div className="relative w-full flex items-center">
              <div className="h-px flex-1 bg-gray-200" />
              <PlaneRightIcon className="mx-1 h-3 w-3 text-primary shrink-0" />
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <p className="text-xs text-muted">{stops === 0 ? t("nonStop") : t("stopCount", { count: stops })}</p>
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
          <p className="text-xs text-muted">{t("perPerson")}</p>
          <button
            type="button"
            onClick={onBook}
            className="btn-sheen rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            {t("bookNow")}
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
    from: 'ICN', to: 'NRT', fromCityKey: 'citySeoul', toCityKey: 'cityTokyo',
    departureTime: '08:30', arrivalTime: '11:00', durationMinutes: 150, stops: 0, price: 289,
  },
  {
    id: '2',
    airline: 'Korean Air',
    airlineLogo: 'https://images.kiwi.com/airlines/64/KE.png',
    cabinClass: 'Business',
    from: 'ICN', to: 'LAX', fromCityKey: 'citySeoul', toCityKey: 'cityLosAngeles',
    departureTime: '13:45', arrivalTime: '09:20', durationMinutes: 695, stops: 0, price: 1249,
  },
  {
    id: '3',
    airline: 'Asiana Airlines',
    airlineLogo: 'https://images.kiwi.com/airlines/64/OZ.png',
    cabinClass: 'Economy',
    from: 'ICN', to: 'CDG', fromCityKey: 'citySeoul', toCityKey: 'cityParis',
    departureTime: '10:15', arrivalTime: '16:30', durationMinutes: 735, stops: 1, price: 687,
  },
];

/* Popular-routes ticker: rotates through routes only — deliberately no
   prices and no booking/activity claims. A "just booked" feed was
   considered and rejected as fabricated social proof (same trust
   principle that removed the fake stats rows). */
const popularRoutes = [
  { from: "ICN", to: "NRT", cityKeys: ["citySeoul", "cityTokyo"] },
  { from: "ICN", to: "JFK", cityKeys: ["citySeoul", "cityNewYork"] },
  { from: "ICN", to: "CDG", cityKeys: ["citySeoul", "cityParis"] },
  { from: "ICN", to: "DXB", cityKeys: ["citySeoul", "cityDubai"] },
  { from: "ICN", to: "LAX", cityKeys: ["citySeoul", "cityLosAngeles"] },
] as const;

const HeroRouteTicker = ({ label }: { label: string }) => {
  const t = useTranslations("Home");
  const [idx, setIdx] = useState(0);
  const [entering, setEntering] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let swap: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      setEntering(false);
      swap = setTimeout(() => {
        setIdx((i) => (i + 1) % popularRoutes.length);
        setEntering(true);
      }, 320);
    }, 7000);
    return () => {
      clearInterval(interval);
      clearTimeout(swap);
    };
  }, []);

  const route = popularRoutes[idx];
  return (
    <div className="hero-ticker">
      <span className="hero-ticker-label">{label}</span>
      <span className={`data-mono hero-ticker-route ${entering ? "is-in" : ""}`}>
        {route.from} → {route.to}
        <span className="hero-ticker-cities">
          {route.cityKeys.map((k) => t(k)).join(" · ")}
        </span>
      </span>
    </div>
  );
};

/* The visible date window is computed, not written down: it anchors to the
   first of next month (UTC, so server and client agree) and runs a fortnight.
   The old hardcoded "24 Dec 2025 - 07 Jan 2026" was both English-only and
   already stale — a B6 residual. */
const sampleWindow = () => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 13);
  return [start, end] as const;
};

const destinationDeals = [
  {
    cityKey: "cityTokyo",
    route: "ICN → NRT",
    price: 450,
    image:
      "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=1200&q=80",
  },
  {
    cityKey: "cityNewYork",
    route: "ICN → JFK",
    price: 249,
    image:
      "https://images.unsplash.com/photo-1546436836-07a91091f160?auto=format&fit=crop&w=1200&q=80",
  },
  {
    cityKey: "cityDubai",
    route: "ICN → DXB",
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
  onOpen,
}: {
  deal: { cityKey: string; route: string; price: number; image: string };
  onOpen: () => void;
}) => {
  const tilt = useHoverTilt<HTMLElement>(5);
  const t = useTranslations("Home");
  const tag = localeTag(useLocale());
  const dateRange = useMemo(() => {
    const [start, end] = sampleWindow();
    // Two plain format() calls rather than formatRange(): Node's and Chrome's
    // ICU disagree on the separator formatRange inserts, which shows up as a
    // hydration mismatch. timeZone is pinned so server and client agree.
    // No year: the window is always inside the next couple of months, so
    // repeating "2026" on both sides just made the chip read redundantly.
    const fmt = new Intl.DateTimeFormat(tag, {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
    return `${fmt.format(start)} – ${fmt.format(end)}`;
  }, [tag]);
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
      onClick={onOpen}
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
        <p className="text-3xl font-bold leading-tight">{t(deal.cityKey)}</p>
        <p className="data-mono mt-1 text-xs text-white/80">{dateRange}</p>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-white/80">{t("economyFrom")}</p>
            <p className="data-mono text-2xl font-bold">USD ${shownPrice}</p>
          </div>
          <span className="data-mono text-sm font-medium text-white/90">{deal.route}</span>
        </div>
      </div>
    </article>
  );
};

/* Copy lives in messages/*.json (Home.offer{id}Title/Sub/Cta). */
const bestOfferCards = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
  },
];

// Airline deal cards are shared with /deals — see lib/airlineDeals.ts
// (imported above), which also carries the C1 honesty contract.

const popularAirlines = [
  {
    key: "turkish",
    name: "Turkish Airlines",
    iata: "TK",
    website: "https://www.turkishairlines.com",
    descKey: "airlineDescTurkish",
    recommendedRoute: "ICN → IST",
  },
  {
    key: "korean",
    name: "Korean Air",
    iata: "KE",
    website: "https://www.koreanair.com",
    descKey: "airlineDescKorean",
    recommendedRoute: "ICN → LAX",
  },
  {
    key: "asiana",
    name: "Asiana Airlines",
    iata: "OZ",
    website: "https://flyasiana.com",
    descKey: "airlineDescAsiana",
    recommendedRoute: "ICN → CDG",
  },
  {
    key: "jeju",
    name: "Jeju Air",
    iata: "7C",
    website: "https://www.jejuair.net",
    descKey: "airlineDescJeju",
    recommendedRoute: "ICN → NRT",
  },
  {
    key: "airpremia",
    name: "Air Premia",
    iata: "YP",
    website: "https://www.airpremia.com",
    descKey: "airlineDescPremia",
    recommendedRoute: "ICN → NRT",
  },
  {
    key: "singapore",
    name: "Singapore Airlines",
    iata: "SQ",
    website: "https://www.singaporeair.com",
    descKey: "airlineDescSingapore",
    recommendedRoute: "ICN → SIN",
  },
];

export default function Home() {
  const router = useRouter();
  const tNav = useTranslations("Nav");
  const tHero = useTranslations("Hero");
  const tPicks = useTranslations("SmartPicks");
  const tHome = useTranslations("Home");
  // G3: one cursor-tilt instance reused across the inline card grids
  // (the hook keys off e.currentTarget, so a single instance drives many
  // cards). Airline-deal cards tilt a touch more than the wide picker rows.
  const cardTilt = useHoverTilt<HTMLElement>(5);
  const rowTilt = useHoverTilt<HTMLButtonElement>(4);

  const [loading, setLoading] = useState(false);
  // Always empty on the homepage — search redirects to /booking. Kept because
  // the airlines panel's "fastest schedule" lookup below still reads it (it
  // simply renders its empty-state fallback here).
  const [results] = useState<Offer[]>([]);
  const [showOffers, setShowOffers] = useState(true);
  const [selectedAirlineKey, setSelectedAirlineKey] = useState("turkish");

  // Inspiration cards are prompts, not links — clicking one brings the
  // user back to the tool that acts on the prompt: the search bar.
  const scrollToSearch = () => {
    const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelector(".vol-shell")?.scrollIntoView({
      behavior: prefersReduce ? "auto" : "smooth",
      block: "center",
    });
  };
  // F1: the whole homepage now lives inside the dark spectrum (ink→dusk→
  // ink), so the nav wears its dark glass everywhere — the two-state
  // light/dark toggle died with the light "day" band.



  // Called by SearchBar on submit — navigates to /booking with all params
  const handleSearch = (params: SearchParams) => {
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

  const getFastestOfferForAirline = (airlineName?: string) => {
    if (!airlineName || results.length === 0) return null;
    const filtered = results.filter((offer) => (offer.airline ?? "").toLowerCase() === airlineName.toLowerCase());
    if (filtered.length === 0) return null;
    return filtered.reduce((fastest, current) => {
      return calculateDuration(current.departure, current.arrival) < calculateDuration(fastest.departure, fastest.arrival) ? current : fastest;
    }, filtered[0]);
  };

  const selectedAirline = popularAirlines.find((a) => a.key === selectedAirlineKey) ?? popularAirlines[0];
  const fastestOfferForSelectedAirline = getFastestOfferForAirline(selectedAirline?.name);

  return (
    <main
      className="night-tail min-h-screen"
      style={{
        /* F1 — the page's one continuous tone track. A single gradient
           spanning the full document height IS the scroll-linked color
           interpolation: as you scroll, the visible band moves through
           ink→dusk→deep-dusk→ink→dusk with no seams and no JS. Stops are
           fractions of total page height (content drift across locales
           only slides them within the same dark family, so it is
           invisible). The hero paints its own twilight sky over the top
           band; the footer's dusk→ink block continues from the 100% stop. */
        background:
          'linear-gradient(180deg, var(--ink-900) 0%, var(--ink-900) 16%, var(--dusk-700) 26%, #16234A 40%, var(--dusk-700) 52%, #111C3A 66%, var(--ink-900) 78%, #141F3D 92%, var(--dusk-700) 100%)',
      }}
    >
      {/* Scroll choreography: reveals for [data-fx-*] elements below */}
      <ScrollFX />
      {/* Navigation — dark glass over the whole dark-spectrum page */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav-dark">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label={tNav("home")}>
            <BrandLogo className="h-10 w-36 md:h-11 md:w-44 transition brightness-0 invert" />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium hover:text-[var(--contrail-300)] transition text-white">{tNav("home")}</Link>
            {/* Was a raw <a>, which since I5 would drop the locale prefix and
                bounce a ko visitor onto the English booking page. */}
            <Link href="/booking" className="text-sm font-medium transition text-white/70 hover:text-[var(--contrail-300)]">{tNav("booking")}</Link>
            <Link href="/deals" className="text-sm font-medium transition text-white/70 hover:text-[var(--contrail-300)]">{tNav("deals")}</Link>
            <Link href="/blog" className="text-sm font-medium transition text-white/70 hover:text-[var(--contrail-300)]">{tNav("blog")}</Link>
          </div>
          <div className="flex items-center gap-4">
            <LocaleSwitcher dark />
            {/* Auth lives inline on desktop; on mobile it moves into the drawer. */}
            <div className="hidden md:block">
              <AuthMenu dark />
            </div>
            <MobileMenu />
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

        {/* G2: flight-path contrail, scoped to (and clipped by) the hero */}
        <ScrollTrail />

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
          {/* Popular-routes ticker: quiet live-feeling chip below the copy,
              honest content (routes only — no fabricated booking activity) */}
          <div className="animate-hero-text" style={{ animationDelay: '0.25s', marginTop: '-16px', marginBottom: '26px' }}>
            <HeroRouteTicker label={tHero("popularRoute")} />
          </div>
          </div>

          {/* Search bar */}
          <div className="animate-hero-text" style={{ width: '100%', maxWidth: '1000px', animationDelay: '0.2s' }}>
            <SearchBar onSearch={handleSearch} loading={loading} />
          </div>

          {/* SmartPicks strip — the product's real differentiators, replacing
              the former hardcoded social-proof numbers (design review:
              fabricated stats are a trust problem on an early-stage
              product). Labels reuse the translated SmartPicks namespace. */}
          <div className="animate-hero-text hero-picks" style={{ animationDelay: '0.35s' }}>
            {[
              { key: "cheap", icon: <TagIcon />, label: tPicks("cheapestLabel") },
              { key: "fast", icon: <BoltIcon />, label: tPicks("fastestLabel") },
              { key: "early", icon: <SunriseIcon />, label: tPicks("earliestLabel") },
              { key: "ai", icon: <SparkIcon />, label: tPicks("aiLabel") },
              { key: "safe", icon: <ShieldCheckIcon />, label: tPicks("safestLabel") },
            ].map(({ key, icon, label }) => (
              <span key={key} className="hero-pick-chip">
                {icon}
                {label}
              </span>
            ))}
          </div>

          {/* Airline strip: real carrier marks already used elsewhere on
              the page — a factual "you can search these here" signal, not
              a partnership claim. Toned to the dark glass family. */}
          <div className="animate-hero-text hero-airlines" style={{ animationDelay: '0.45s' }}>
            <span className="hero-airlines-label">{tHero("searchableAirlines")}</span>
            {popularAirlines.map((airline) => (
              <span key={airline.iata} className="hero-airline-chip" title={airline.name}>
                <Image
                  src={`https://images.kiwi.com/airlines/64/${airline.iata}.png`}
                  alt={airline.name}
                  width={24}
                  height={24}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              </span>
            ))}
          </div>
        </div>
      </section>


      {/* Why "Tern" — the name, stated plainly, not implied by an animation.
          The hero ends on the warm --horizon-500 band; this strip lets that
          horizon sink back into dusk (F1: the old horizon×paper color-mixes
          read as a muddy pink haze — the light "day" band is gone, so the
          warmth now dissolves into the page's dusk track instead). */}
      <section
        className="py-14"
        style={{
          background:
            'linear-gradient(180deg, var(--horizon-500) 0%, color-mix(in srgb, var(--horizon-500) 38%, var(--dusk-700)) 22%, color-mix(in srgb, var(--horizon-500) 10%, var(--dusk-700)) 52%, transparent 100%)',
        }}
      >
        <div data-fx-head className="max-w-4xl mx-auto px-6 flex items-center justify-center gap-5 text-center md:text-left">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="hidden md:block shrink-0">
            <path d="M2 15 L22 8 L12 12.5 L9.5 4.5 L7.5 5.5 L9 13.5 Z" fill="var(--contrail-300)" />
          </svg>
          <p className="text-[15px] leading-relaxed" style={{ color: 'var(--paper-50)' }}>
            <span className="data-mono text-[11px] font-semibold tracking-[0.18em] block mb-1" style={{ color: 'var(--contrail-300)' }}>{tHome("whyKicker")}</span>
            {tHome("whyBody")}
          </p>
        </div>
      </section>

      {/* Explore the best offer for you — same photo-card language as
          "Explore Top Destinations" below: real destination photo, glass
          content bar. No "Sponsored" tag: nothing here is sponsored, and
          claiming so is a false disclosure. */}
      <section className="py-14">
        <div className="max-w-6xl mx-auto px-6">
          <div data-fx-head className="mb-8">
            <span className="section-kicker">{tHome("kickerInspiration")}</span>
            <h2 className="text-3xl font-bold text-foreground">{tHome("offersTitle")}</h2>
            <p className="text-muted mt-2">{tHome("offersSub")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {bestOfferCards.map((offer) => (
              <article
                data-fx-card
                key={offer.id}
                role="button"
                tabIndex={0}
                onClick={scrollToSearch}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); scrollToSearch(); } }}
                className="photo-card h-56 rounded-2xl group cursor-pointer"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${offer.image})` }}
                />
                {/* F1: heavier foot — the content bar is dark glass now, so the
                    photo behind it needs more ink for the white type to sit on */}
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,15,30,0.66)] via-transparent to-[rgba(10,15,30,0.12)]" />
                <div className="glass-panel absolute inset-x-3 bottom-3 rounded-xl p-4">
                  <h3 className="text-lg font-bold leading-snug text-foreground">{tHome(`offer${offer.id}Title`)}</h3>
                  <p className="mt-0.5 text-xs text-muted">{tHome(`offer${offer.id}Sub`)}</p>
                  {/* F1: contrail, not signal blue — the dark-glass bar lets the
                      bright photo through, and blue washed out against it */}
                  <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--contrail-300)', textShadow: '0 1px 8px rgba(10,15,30,0.55)' }}>
                    {tHome(`offer${offer.id}Cta`)}
                    <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Airline Deals & Promotions — glass panels linking to the carriers'
          own deals pages. The domain is data (like flight numbers), so it
          gets the mono chip. */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div data-fx-head className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="section-kicker">{tHome("kickerDeals")}</span>
              <h2 className="text-3xl font-bold text-foreground">{tHome("dealsTitle")}</h2>
              <p className="text-muted mt-2">{tHome("dealsSub")}</p>
            </div>
            <Link
              href="/deals"
              className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--glass-border)] px-4 py-2 text-sm font-semibold text-foreground transition hover:border-[var(--contrail-300)] hover:text-[var(--contrail-300)]"
            >
              {tHome("dealsSeeAll")}
              <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {airlineDealPages.map((deal) => (
              <div data-fx-card key={deal.iata}>
              <article
                onMouseMove={cardTilt.onMouseMove}
                onMouseLeave={cardTilt.onMouseLeave}
                style={{ ["--brand" as string]: deal.brand }}
                className="deal-card tilt-card glass-panel group relative rounded-2xl p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="deal-official glass-chip rounded-full px-2.5 py-1 data-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                    {tHome("official")}
                  </span>
                  <div className="deal-card-logo glass-chip flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl">
                    <Image
                      src={`https://images.kiwi.com/airlines/64/${deal.iata}.png`}
                      alt={deal.airline}
                      width={28}
                      height={28}
                      className="w-7 h-7 object-contain"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                </div>

                <p className="mt-3 text-lg font-bold text-foreground">{deal.airline}</p>
                <p className="text-xs text-muted mt-1">{tHome(deal.descKey)}</p>

                <div className="mt-4 pt-3 border-t border-dashed border-[var(--glass-border)]">
                  <span className="glass-chip data-mono rounded-md px-2.5 py-1 text-xs font-semibold text-foreground">
                    {deal.domain}
                  </span>
                </div>

                <a
                  href={deal.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-sheen mt-3 w-full py-2 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition inline-flex items-center justify-center"
                >
                  {tHome("viewDeals")}
                </a>
              </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Top Destinations — the one interactive moment on the page */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div data-fx-head className="text-center mb-6">
            <span className="section-kicker">{tHome("kickerDest")}</span>
            <h2 className="text-3xl font-bold text-foreground">{tHome("destTitle")}</h2>
            <p className="text-muted mt-2">{tHome("destSub")}</p>
          </div>
          {/* RouteArcView (scroll-traced arc) removed: after the F1 dark
              re-theme its contrail line read as a stray "hero route line"
              floating over this section rather than the subtle ink-on-paper
              trace it was designed as. The destination cards carry the
              section on their own. */}
          <div className="grid md:grid-cols-3 gap-6">
            {destinationDeals.map((deal) => {
              const [routeFrom, routeTo] = deal.route.split(" → ");
              return (
                <div data-fx-card key={deal.cityKey}>
                  <DestinationCard
                    deal={deal}
                    onOpen={() => router.push(`/booking?from=${routeFrom}&to=${routeTo}`)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Most Popular Airlines — deepening from dusk toward ink on the
          page's continuous tone track. The old white→horizon bridge died
          with the light band (F1). Stars at low opacity behind a vertical
          fade mask keep the deep zone from reading flat. */}
      <section className="relative overflow-hidden py-16">
        <div className="hero-stars night-stars" aria-hidden="true" />
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div data-fx-head className="text-center mb-10">
            <span className="section-kicker">{tHome("kickerCarriers")}</span>
            <h2 className="text-3xl font-bold text-foreground">{tHome("carriersTitle")}</h2>
            <p className="text-muted mt-2">{tHome("carriersSub")}</p>
          </div>

          {/* G5: data-fx-card on each cell (not the grid) so the six cards
              stagger in one-by-one on scroll entry; the tilt lives on the
              inner button so the entrance and hover transforms never fight. */}
          <div className="grid md:grid-cols-3 gap-4">
            {popularAirlines.map((airline) => {
              const isActive = selectedAirlineKey === airline.key;
              return (
                <div data-fx-card key={airline.key}>
                <button
                  type="button"
                  onClick={() => setSelectedAirlineKey(airline.key)}
                  onMouseMove={rowTilt.onMouseMove}
                  onMouseLeave={rowTilt.onMouseLeave}
                  className={`tilt-card glass-panel glass-row w-full rounded-2xl px-4 py-3 flex items-center justify-between ${isActive ? "is-active" : ""}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Real airline brand marks — never restyled, only their
                        container is standardized into the glass-chip tile */}
                    <span className="glass-chip flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl">
                      <Image
                        src={`https://images.kiwi.com/airlines/64/${airline.iata}.png`}
                        alt={airline.name}
                        width={28}
                        height={28}
                        className="w-7 h-7 object-contain"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                    </span>
                    <span className="text-sm font-semibold text-foreground truncate text-left">{airline.name}</span>
                  </div>
                  <span className="text-muted">→</span>
                </button>
                </div>
              );
            })}
          </div>

          <div className="glass-panel mt-6 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
              <div className="flex items-start gap-4">
                <span className="glass-chip flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl">
                  <Image
                    src={`https://images.kiwi.com/airlines/64/${selectedAirline.iata}.png`}
                    alt={selectedAirline.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 object-contain"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                </span>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{selectedAirline.name}</h3>
                  <p className="text-sm text-muted mt-1 max-w-2xl">{tHome(selectedAirline.descKey)}</p>
                </div>
              </div>

              <a
                href={selectedAirline.website}
                target="_blank"
                rel="noreferrer"
                className="btn-sheen inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition"
              >
                {tHome("visitWebsite")}
              </a>
            </div>

            <div className="mt-5 grid md:grid-cols-2 gap-4">
              <div className="glass-chip rounded-xl p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">{tHome("recommendedRoute")}</p>
                <p className="data-mono text-lg font-bold text-foreground mt-1">{selectedAirline.recommendedRoute}</p>
              </div>

              <div className="glass-chip rounded-xl p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">{tHome("fastestSchedule")}</p>
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
                    {tHome("fastestScheduleEmpty")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capability band — every figure here is a verifiable product
          fact (5 smart picks, live offers, the ±5-day trend window, 4
          locales). Fabricated social-proof stats are banned; the
          template's "50M+ travelers" row died here (D1). */}
      <section className="py-16 border-y" style={{ borderColor: 'rgba(143,224,232,0.10)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "5", label: tHome("bandPicks") },
              { value: "LIVE", label: tHome("bandLive") },
              { value: "±5d", label: tHome("bandTrend") },
              { value: "4", label: tHome("bandLocales") },
            ].map((fact) => (
              <div data-fx-card key={fact.label} className="glass-chip rounded-2xl px-4 py-5 text-center">
                <p className="data-mono text-3xl md:text-4xl font-bold text-foreground">{fact.value}</p>
                <p className="text-sm text-muted mt-1">{fact.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Flights — the homepage's sample-flights strip. The
          conditional search-results view that used to render below it
          (gated on showResults, which was never set true) was removed:
          search redirects to /booking. */}
        <section className="relative overflow-hidden py-20">
          <div className="hero-stars night-stars" aria-hidden="true" />
          <div className="relative z-10 max-w-5xl mx-auto px-6">
            <div data-fx-head className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-bold text-foreground">{tHome("flightsTitle")}</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted">{tHome("showOffers")}</span>
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
                  onBook={() => router.push(`/booking?from=${flight.from}&to=${flight.to}`)}
                  cabinClass={flight.cabinClass === "Business" ? tHome("cabinBusiness") : tHome("cabinEconomy")}
                  from={flight.from}
                  to={flight.to}
                  fromCity={tHome(flight.fromCityKey)}
                  toCity={tHome(flight.toCityKey)}
                  departureTime={flight.departureTime}
                  arrivalTime={flight.arrivalTime}
                  durationMinutes={flight.durationMinutes}
                  stops={flight.stops}
                  price={flight.price}
                />
                </div>
              ))}
            </div>
          </div>
        </section>

      {/* Footer — returns to the hero's night sky so the page ends where it
          began. Grouped links shared site-wide via SiteFooter (C7). */}
      <SiteFooter />
    </main>
  );
}
