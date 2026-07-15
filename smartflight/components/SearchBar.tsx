"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { heroRoute } from "../lib/heroRoute";
import {
  ArrowLeftRight,
  Calendar,
  Users,
  Search,
  Minus,
  Plus,
  ChevronDown,
  MapPin,
  Plane,
} from "lucide-react";

export interface SearchParams {
  tripType: "oneway" | "roundtrip";
  from: string;
  fromCity: string;
  to: string;
  toCity: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass: "economy" | "premium_economy" | "business" | "first";
}

interface SearchBarProps {
  onSearch: (params: SearchParams) => void;
  loading?: boolean;
  routeLineRef?: React.Ref<HTMLDivElement>;
}

const fmt = (d: Date) => d.toISOString().split("T")[0];
const nextWeek = () => { const d = new Date(); d.setDate(d.getDate() + 7); return fmt(d); };
const twoWeeks = () => { const d = new Date(); d.setDate(d.getDate() + 14); return fmt(d); };

const displayDate = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const displayWeekday = (iso: string) => {
  if (!iso) return "";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });
};

export default function SearchBar({ onSearch, loading = false, routeLineRef }: SearchBarProps) {
  const t = useTranslations("Search");
  const CABIN_LABELS: Record<string, string> = {
    economy: t("cabinEconomy"),
    premium_economy: t("cabinPremiumEconomy"),
    business: t("cabinBusiness"),
    first: t("cabinFirst"),
  };
  const [tripType, setTripType] = useState<"roundtrip" | "oneway">("roundtrip");
  const [cabinClass, setCabinClass] = useState<"economy" | "premium_economy" | "business" | "first">("economy");
  const [from, setFrom] = useState("ICN");
  const [fromCity, setFromCity] = useState("Seoul Incheon");
  const [to, setTo] = useState("LHR");
  const [toCity, setToCity] = useState("London Heathrow");
  const [departureDate, setDepartureDate] = useState(nextWeek());
  const [returnDate, setReturnDate] = useState(twoWeeks());
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [passengerOpen, setPassengerOpen] = useState(false);
  const [swapping, setSwapping] = useState(false);

  const passengerRef = useRef<HTMLDivElement>(null);

  // Keep the hero globe's route arc in sync with the live origin/
  // destination — the globe reflects the actual search, not a demo route.
  useEffect(() => {
    heroRoute.set(from, to);
  }, [from, to]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (passengerRef.current && !passengerRef.current.contains(e.target as Node)) {
        setPassengerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSwap = () => {
    setSwapping(true);
    setTimeout(() => {
      setFrom(to); setFromCity(toCity);
      setTo(from); setToCity(fromCity);
      setSwapping(false);
    }, 180);
  };

  const handleSubmit = () => {
    onSearch({
      tripType, from, fromCity, to, toCity,
      departureDate,
      returnDate: tripType === "roundtrip" ? returnDate : undefined,
      adults, children, infants, cabinClass,
    });
  };

  const totalPassengers = adults + children + infants;
  const passengerLabel = totalPassengers === 1 ? "1 Passenger" : `${totalPassengers} Passengers`;

  return (
    <div style={{ width: "100%", fontFamily: "'Geist', 'Inter', ui-sans-serif, system-ui, sans-serif" }}>

      {/* ── Volumetric 3D Shell ── */}
      <div className="vol-shell">

        {/* ── Header: Trip type + Cabin class ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2px",
            padding: "10px 18px 0 18px",
            borderBottom: "1px solid rgba(180,205,235,0.25)",
            flexWrap: "wrap",
          }}
        >
          {(["roundtrip", "oneway"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTripType(type)}
              className={`vol-pill-option${tripType === type ? " active" : ""}`}
            >
              {type === "roundtrip" ? t("roundTrip") : t("oneWay")}
            </button>
          ))}

          <span style={{ color: "rgba(138,160,184,0.6)", fontSize: "11px", padding: "0 5px", userSelect: "none" }}>·</span>

          {(["economy", "premium_economy", "business", "first"] as const).map((cls) => (
            <button
              key={cls}
              onClick={() => setCabinClass(cls)}
              className={`vol-pill-option${cabinClass === cls ? " active" : ""}`}
            >
              {CABIN_LABELS[cls]}
            </button>
          ))}
        </div>

        {/* ── Main input row ── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "stretch",
            padding: "6px 8px 8px 8px",
            gap: 0,
          }}
        >

          {/* ── FROM / route line / TO — the route line is the hero contrail's landing point ── */}
          <div style={{ display: "flex", alignItems: "stretch", flex: "2 1 220px", minWidth: 0, position: "relative" }}>
            <div
              ref={routeLineRef}
              className="vol-route-line"
              style={{ display: "flex", alignItems: "center", left: "22%", right: "22%", top: "50%", transform: "translateY(-50%)" }}
            >
              <span className="vol-route-dot" />
              <span style={{ flex: 1, height: "1px", background: "var(--contrail-300)", opacity: 0.55 }} />
              <span className="vol-route-dot" />
            </div>

            {/* ── FROM field ── */}
            <div style={{ flex: "1 1 0", minWidth: 0 }}>
              <AirportField
                label={t("labelFrom")}
                isOrigin
                value={from}
                subValue={fromCity}
                onChange={(code, city) => { setFrom(code); setFromCity(city); }}
                placeholder={t("originPlaceholder")}
              />
            </div>

            {/* ── Swap button ── */}
            <div style={{ display: "flex", alignItems: "center", padding: "0 4px", flexShrink: 0, zIndex: 2 }}>
              <button
                className="vol-swap"
                onClick={handleSwap}
                title={t("swapAirports")}
                style={{
                  transform: swapping ? "rotate(180deg) scale(0.9)" : "rotate(0deg) scale(1)",
                  transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                }}
              >
                <ArrowLeftRight size={14} strokeWidth={2.2} />
              </button>
            </div>

            {/* ── TO field ── */}
            <div style={{ flex: "1 1 0", minWidth: 0 }}>
              <AirportField
                label={t("labelTo")}
                value={to}
                subValue={toCity}
                onChange={(code, city) => { setTo(code); setToCity(city); }}
                placeholder={t("destinationPlaceholder")}
              />
            </div>
          </div>

          {/* ── Sculpted divider ── */}
          <div className="vol-divider" />

          {/* ── DEPARTURE date ── */}
          <div style={{ flex: "0 1 128px", minWidth: "110px" }}>
            <DateField
              label={t("labelDeparture")}
              value={departureDate}
              onChange={setDepartureDate}
            />
          </div>

          {/* ── Sculpted divider ── */}
          <div
            className="vol-divider"
            style={{ opacity: tripType === "roundtrip" ? 1 : 0.2, transition: "opacity 0.2s ease" }}
          />

          {/* ── RETURN date ── */}
          <div
            style={{
              flex: "0 1 128px",
              minWidth: "110px",
              opacity: tripType === "roundtrip" ? 1 : 0.35,
              pointerEvents: tripType === "roundtrip" ? "auto" : "none",
              transition: "opacity 0.25s ease",
            }}
          >
            <DateField
              label={t("labelReturn")}
              value={returnDate}
              onChange={setReturnDate}
              placeholder={t("returnPlaceholder")}
            />
          </div>

          {/* ── Sculpted divider ── */}
          <div className="vol-divider" />

          {/* ── PASSENGERS field ── */}
          <div style={{ flex: "0 1 152px", minWidth: "130px", position: "relative" }} ref={passengerRef}>
            <button
              onClick={() => setPassengerOpen(!passengerOpen)}
              className="vol-field"
              style={{
                width: "100%",
                height: "100%",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "12px 14px",
                textAlign: "left",
                display: "block",
              }}
            >
              <div className="vol-label">
                <Users size={9} strokeWidth={2.5} style={{ opacity: 0.7 }} />
                {t("labelPassengers")}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="vol-value" style={{ fontSize: "16px", fontWeight: 700 }}>
                  {passengerLabel}
                </span>
                <ChevronDown
                  size={13}
                  strokeWidth={2.5}
                  style={{
                    color: "rgba(138,160,184,0.8)",
                    transform: passengerOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                    flexShrink: 0,
                    marginLeft: 4,
                  }}
                />
              </div>
              <div className="vol-sub">{CABIN_LABELS[cabinClass]}</div>
            </button>

            {/* ── Passenger popover ── */}
            {passengerOpen && (
              <div className="vol-popover animate-fade-up">
                {([
                  { label: "Adults", sub: "Age 12+", value: adults, set: setAdults, min: 1 },
                  { label: "Children", sub: "Age 2–11", value: children, set: setChildren, min: 0 },
                  { label: "Infants", sub: "Under 2", value: infants, set: setInfants, min: 0 },
                ] as const).map(({ label, sub, value, set, min }, i, arr) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "11px 0",
                      borderBottom: i < arr.length - 1 ? "1px solid rgba(180,205,235,0.3)" : "none",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#0d2040", letterSpacing: "-0.01em" }}>
                        {label}
                      </div>
                      <div style={{ fontSize: "11px", color: "rgba(138,160,184,0.9)", marginTop: "2px" }}>
                        {sub}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <button
                        className="vol-stepper-btn"
                        onClick={() => set(Math.max(min, value - 1) as never)}
                        disabled={value <= min}
                      >
                        <Minus size={11} strokeWidth={2.5} />
                      </button>
                      <span
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "#0d2040",
                          minWidth: "18px",
                          textAlign: "center",
                          fontVariantNumeric: "tabular-nums",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {value}
                      </span>
                      <button
                        className="vol-stepper-btn"
                        onClick={() => set((value + 1) as never)}
                      >
                        <Plus size={11} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  className="vol-done-btn"
                  onClick={() => setPassengerOpen(false)}
                >
                  Done
                </button>
              </div>
            )}
          </div>

          {/* ── Search button ── */}
          <div style={{ display: "flex", alignItems: "center", padding: "4px 4px 4px 6px", flexShrink: 0 }}>
            <button
              className="vol-search-btn"
              onClick={handleSubmit}
              disabled={loading}
              style={{ height: "calc(100% - 8px)", minHeight: "52px" }}
            >
              {loading ? (
                <>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    style={{ animation: "spin 0.75s linear infinite", flexShrink: 0 }}
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  {t("searching")}
                </>
              ) : (
                <>
                  <Search size={15} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                  {t("searchFlights")}
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────
   AirportField — sculpted volumetric card
   ───────────────────────────────────────────── */

interface AirportFieldProps {
  label: string;
  isOrigin?: boolean;
  value: string;
  subValue: string;
  onChange: (code: string, city: string) => void;
  placeholder?: string;
}

type AirportSuggestion = { iata: string; name: string; city: string; country: string };

function AirportField({ label, isOrigin, value, subValue, onChange, placeholder }: AirportFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [suggestions, setSuggestions] = useState<AirportSuggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressNextBlurCommit = useRef(false);

  const startEdit = () => {
    setDraft(value);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 10);
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (draft.trim().length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clears stale suggestions when the draft is cleared/too short; must happen synchronously so no stale dropdown flashes before the debounced fetch would otherwise run
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/airports/search?q=${encodeURIComponent(draft.trim())}`);
        const data = await res.json();
        setSuggestions(data.results || []);
        setActiveIndex(-1);
      } catch {
        setSuggestions([]);
      }
    }, 150); // local dataset lookup, so a short debounce is enough
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [draft]);

  const pickSuggestion = (s: AirportSuggestion) => {
    suppressNextBlurCommit.current = true;
    onChange(s.iata, s.city);
    setSuggestions([]);
    setEditing(false);
  };

  const commitEdit = () => {
    if (suppressNextBlurCommit.current) {
      suppressNextBlurCommit.current = false;
      return;
    }
    // If a suggestion is highlighted, prefer it over raw text parsing.
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      pickSuggestion(suggestions[activeIndex]);
      return;
    }
    const upper = draft.trim().toUpperCase();
    if (upper.length >= 2) {
      onChange(upper.slice(0, 3), upper.length > 3 ? draft.trim() : subValue);
    }
    setEditing(false);
    setSuggestions([]);
  };

  const isFrom = isOrigin;

  return (
    <button
      onClick={startEdit}
      className="vol-field"
      style={{
        width: "100%",
        height: "100%",
        background: "transparent",
        border: "none",
        cursor: "text",
        padding: "12px 14px",
        textAlign: "left",
        display: "block",
      }}
    >
      <div className="vol-label">
        {isFrom
          ? <Plane size={9} strokeWidth={2.5} style={{ opacity: 0.7 }} />
          : <MapPin size={9} strokeWidth={2.5} style={{ opacity: 0.7 }} />
        }
        {label}
      </div>

      {editing ? (
        <div className="relative">
          <input
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={e => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex((i) => Math.max(i - 1, -1));
              } else if (e.key === "Enter") {
                commitEdit();
              } else if (e.key === "Escape") {
                setSuggestions([]);
                setEditing(false);
              }
            }}
            className="vol-inline-input"
            autoFocus
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <div className="glass-panel absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-xl py-1 text-left">
              {suggestions.map((s, i) => (
                <div
                  key={s.iata}
                  onMouseDown={(e) => {
                    // mousedown fires before the input's onBlur, so we can
                    // commit the pick before the blur-driven raw-text parse
                    // would otherwise run.
                    e.preventDefault();
                    pickSuggestion(s);
                  }}
                  className={`cursor-pointer px-3 py-2 text-sm ${i === activeIndex ? "bg-black/5" : ""}`}
                >
                  <span className="data-mono font-semibold text-primary">{s.iata}</span>
                  <span className="ml-2 text-foreground">{s.city}</span>
                  <span className="ml-1 text-xs text-muted">— {s.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="vol-value">
            {value || (
              <span style={{ color: "rgba(180,200,225,0.8)", fontWeight: 400, fontSize: "16px" }}>
                {placeholder}
              </span>
            )}
          </div>
          <div className="vol-sub">{subValue}</div>
        </>
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────
   DateField — sculpted volumetric card
   ───────────────────────────────────────────── */

interface DateFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

function DateField({ label, value, onChange, placeholder }: DateFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="vol-field"
      style={{
        padding: "12px 14px",
        cursor: "pointer",
        height: "100%",
        position: "relative",
      }}
      onClick={() => inputRef.current?.showPicker?.()}
    >
      <div className="vol-label">
        <Calendar size={9} strokeWidth={2.5} style={{ opacity: 0.7 }} />
        {label}
      </div>
      <div className="vol-value" style={{ fontSize: "18px" }}>
        {value
          ? displayDate(value)
          : <span style={{ color: "rgba(180,200,225,0.8)", fontWeight: 400, fontSize: "14px" }}>{placeholder || "Select"}</span>
        }
      </div>
      <div className="vol-sub">
        {value ? displayWeekday(value) : ""}
      </div>
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}
        tabIndex={-1}
      />
    </div>
  );
}
