"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { getAirportGuide } from "../../lib/airportGuides";
import { buildAviasalesLink } from "../../lib/affiliateLinks";
import { useOfferSearch } from "../../hooks/useOfferSearch";
import { useOfferFilters } from "../../hooks/useOfferFilters";
import { usePriceAlerts } from "../../hooks/usePriceAlerts";
import { usePriceTrend } from "../../hooks/usePriceTrend";
import { useCheckoutFlow } from "../../hooks/useCheckoutFlow";
import FiltersBar from "../../components/booking/FiltersBar";
import SmartPickCards from "../../components/booking/SmartPickCards";
import OfferList from "../../components/booking/OfferList";
import PriceTrendChart from "../../components/booking/PriceTrendChart";
import PriceAlertPanel from "../../components/booking/PriceAlertPanel";
import AirportGuideCards from "../../components/booking/AirportGuideCards";
import LoyaltyCardTips from "../../components/booking/LoyaltyCardTips";
import CheckoutModal from "../../components/booking/CheckoutModal";
import { LocaleSwitcher } from "../../components/LocaleSwitcher";
import { AuthMenu } from "../../components/AuthMenu";
import { formatMoney } from "../../lib/offerUtils";

// Client-only scroll choreography — see components/ScrollFX.tsx
const ScrollFX = dynamic(() => import("../../components/ScrollFX"), { ssr: false });

const BrandLogo = ({ className = "" }: { className?: string }) => (
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

function BookingPageClient() {
  const searchParams = useSearchParams();
  const tNav = useTranslations("Nav");
  const tWhyShop = useTranslations("WhyShop");
  const tFilters = useTranslations("Filters");

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

  const totalPassengers = adults + children + infants;

  // Duffel Links return leg (test-mode demo): on a completed hosted checkout,
  // Duffel redirects back here with `order_id` + `reference` appended.
  const linkOrderId = searchParams.get("order_id");

  const departureGuide = useMemo(() => getAirportGuide(from), [from]);
  const arrivalGuide = useMemo(() => getAirportGuide(to), [to]);

  // White Label deep link to book.flytern.site (second revenue path alongside
  // Duffel Links). Search-level only: it pre-fills route/dates/pax/cabin, not
  // the specific offer — the CTAs say "book this route", never "book this flight".
  const aviasalesUrl = useMemo(
    () =>
      buildAviasalesLink({
        from,
        to,
        departureDate,
        returnDate: tripType === "oneway" ? "" : returnDate,
        adults,
        children,
        infants,
        cabinClass,
      }),
    [from, to, departureDate, returnDate, tripType, adults, children, infants, cabinClass]
  );

  const { results, loading, error, fetchOffers } = useOfferSearch({
    from,
    to,
    departureDate,
    adults,
    children,
    infants,
    cabinClass,
  });

  const filters = useOfferFilters(results);
  const priceAlerts = usePriceAlerts({ from, to });
  const priceTrend = usePriceTrend(departureDate, fetchOffers);
  const checkout = useCheckoutFlow();

  const { resetMaxPriceFor } = filters;
  const { checkMatch } = priceAlerts;

  useEffect(() => {
    resetMaxPriceFor(results);
    const minPrice = results.length > 0 ? Math.min(...results.map((o) => Number(o.price))) : null;
    checkMatch(minPrice);
  }, [results, resetMaxPriceFor, checkMatch]);

  const scrollToOffer = (id: string) => {
    document.getElementById(`flight-card-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <main className="min-h-screen bg-[var(--paper-50)] text-foreground">
      <ScrollFX />
      <header className="glass-nav sticky top-0 z-40">
        <div className="mx-auto flex h-16 w-full max-w-[min(100%,88rem)] items-center justify-between px-5">
          <Link href="/" aria-label={tNav("home")}>
            <BrandLogo className="h-10 w-36 md:h-11 md:w-44" />
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden rounded-full bg-primary-subtle px-3 py-1.5 text-primary-hover md:inline-flex">
              {tFilters(tripType === "oneway" ? "oneWay" : "roundTrip")}
            </span>
            <LocaleSwitcher />
            <AuthMenu />
            <Link href="/" className="btn-sheen rounded-full bg-primary px-4 py-2 font-semibold text-white">
              {tNav("changeSearch")}
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[min(100%,88rem)] px-4 py-6 sm:px-5">
        {linkOrderId && (
          <div className="glass-panel mb-4 rounded-2xl border border-[color-mix(in_srgb,var(--color-success)_30%,white)] bg-success-subtle p-4 text-sm text-success-strong">
            ✅ Booking confirmed on Tern&apos;s secure checkout (test mode — no real ticket issued).{" "}
            <span className="data-mono">Order {linkOrderId}</span>
          </div>
        )}

        <div data-fx-quick className="glass-panel mb-4 rounded-2xl p-4 md:p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#2563eb]">{tWhyShop("title")}</p>
          <p className="mt-2 text-sm font-medium text-foreground md:text-base">
            {tWhyShop("body")}
          </p>
          <p className="mt-2 text-xs text-muted">
            {tWhyShop("disclaimer")}
          </p>
        </div>

        <div data-fx-quick className="glass-panel rounded-[26px] p-4 md:p-5">
          <div className="mb-3 grid gap-2 md:grid-cols-[1.1fr_1.1fr_0.9fr_0.9fr_auto]">
            <div className="glass-chip data-mono rounded-xl px-4 py-3 text-sm font-semibold">{fromCity} ({from})</div>
            <div className="glass-chip data-mono rounded-xl px-4 py-3 text-sm font-semibold">{toCity} ({to})</div>
            <div className="glass-chip data-mono rounded-xl px-4 py-3 text-sm text-muted">{departureDate}</div>
            <div className="glass-chip data-mono rounded-xl px-4 py-3 text-sm text-muted">{returnDate || tFilters("oneWay")}</div>
            <div className="glass-chip data-mono rounded-xl px-4 py-3 text-sm text-muted">
              {tFilters("paxCabin", {
                count: totalPassengers,
                cabin: tFilters(
                  cabinClass === "premium_economy" ? "cabinPremiumEconomy"
                    : cabinClass === "business" ? "cabinBusiness"
                    : cabinClass === "first" ? "cabinFirst"
                    : "cabinEconomy"
                ),
              })}
            </div>
          </div>

          <FiltersBar
            sortTab={filters.sortTab}
            setSortTab={filters.setSortTab}
            stopsFilter={filters.stopsFilter}
            setStopsFilter={filters.setStopsFilter}
            priceCeiling={filters.priceCeiling}
            maxPrice={filters.maxPrice}
            setMaxPrice={filters.setMaxPrice}
            selectedAirlines={filters.selectedAirlines}
            setSelectedAirlines={filters.setSelectedAirlines}
            selectedPrograms={filters.selectedPrograms}
            setSelectedPrograms={filters.setSelectedPrograms}
            depWindow={filters.depWindow}
            setDepWindow={filters.setDepWindow}
            arrWindow={filters.arrWindow}
            setArrWindow={filters.setArrWindow}
            loyaltyFilterOn={filters.loyaltyFilterOn}
            setLoyaltyFilterOn={filters.setLoyaltyFilterOn}
            connectingOnly={filters.connectingOnly}
            setConnectingOnly={filters.setConnectingOnly}
            uniqueAirlines={filters.uniqueAirlines}
          />
        </div>

        <SmartPickCards
          smartPicks={filters.smartPicks}
          onPick={(sort, offer) => {
            filters.setSortTab(sort);
            scrollToOffer(offer.id);
          }}
        />

        <div data-fx-card>
          <AirportGuideCards departureGuide={departureGuide} arrivalGuide={arrivalGuide} from={from} to={to} />
        </div>

        {/* Matched alert banner */}
        {priceAlerts.matchedAlert && (
          <div className="mt-4 rounded-2xl border border-[color-mix(in_srgb,var(--color-success)_30%,white)] bg-success-subtle p-4 text-sm text-success-strong">
            🎉 Price alert triggered! A fare for {priceAlerts.matchedAlert.from} → {priceAlerts.matchedAlert.to} is at or below your target of <span className="data-mono">{formatMoney(priceAlerts.matchedAlert.targetPrice, "USD")}</span>.
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
            {tFilters("offersError")}
          </div>
        )}

        {/* Results list */}
        {!loading && !error && filters.filteredSortedOffers.length > 0 && (
          <OfferList
            offers={filters.filteredSortedOffers}
            from={from}
            to={to}
            cabinClass={cabinClass}
            cheapestDirect={filters.cheapestDirect}
            cheapestConnecting={filters.cheapestConnecting}
            onSelectOffer={checkout.openCheckout}
            aviasalesUrl={aviasalesUrl}
          />
        )}

        {!loading && !error && filters.filteredSortedOffers.length === 0 && results.length > 0 && (
          <div className="glass-panel mt-8 rounded-2xl p-8 text-center text-sm text-muted">
            No flights match your current filters. Try adjusting stops, price, or airline filters.
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <div className="glass-panel mt-8 rounded-2xl p-8 text-center text-sm text-muted">
            No bookable flights found for this route and date. Try a different date or route.
          </div>
        )}

        <div data-fx-card>
          <PriceTrendChart
            priceChartData={priceTrend.priceChartData}
            chartLoading={priceTrend.chartLoading}
            onLoadTrend={priceTrend.loadTrend}
            cheapestDatePoint={priceTrend.cheapestDatePoint}
          />
        </div>

        <div data-fx-card>
          <PriceAlertPanel
            alerts={priceAlerts.alerts}
            alertPrice={priceAlerts.alertPrice}
            setAlertPrice={priceAlerts.setAlertPrice}
            onAddAlert={priceAlerts.addAlert}
            onDeleteAlert={priceAlerts.deleteAlert}
          />
        </div>

        <div data-fx-card>
          <LoyaltyCardTips />
        </div>
      </section>

      <CheckoutModal
        checkoutOffer={checkout.checkoutOffer}
        checkoutStep={checkout.checkoutStep}
        from={from}
        to={to}
        fromCity={fromCity}
        toCity={toCity}
        onAdvanceToBook={checkout.advanceToBook}
        onClose={checkout.closeCheckout}
        aviasalesUrl={aviasalesUrl}
      />
    </main>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[var(--paper-50)]">
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
