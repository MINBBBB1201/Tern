"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { buildBookingPrograms, dateLabel, durationLabel, type Offer } from "../../lib/offerUtils";
import { PriceDisplay } from "../../lib/PriceDisplay";

type CheckoutModalProps = {
  checkoutOffer: Offer | null;
  checkoutStep: "review" | "book";
  from: string;
  to: string;
  fromCity: string;
  toCity: string;
  onAdvanceToBook: () => void;
  onClose: () => void;
  aviasalesUrl: string | null;
};

/* Civil Twilight dark-glass text tones (the modal floats over a dimmed
   light page, so these are fixed, not theme tokens). */
const tone = {
  base: "text-[#F6F8FB]",
  muted: "text-[rgba(246,248,251,0.65)]",
  faint: "text-[rgba(246,248,251,0.5)]",
  label: "text-[rgba(143,224,232,0.75)]",
};

export default function CheckoutModal(props: CheckoutModalProps) {
  // AnimatePresence stays mounted across open/close so the exit
  // transition can play before the shell unmounts.
  return (
    <AnimatePresence>
      {props.checkoutOffer && (
        <CheckoutModalShell key="checkout-modal" {...props} checkoutOffer={props.checkoutOffer} />
      )}
    </AnimatePresence>
  );
}

function CheckoutModalShell({ checkoutOffer, checkoutStep, fromCity, toCity, from, to, onAdvanceToBook, onClose, aviasalesUrl }: CheckoutModalProps & { checkoutOffer: Offer }) {
  const t = useTranslations("Checkout");
  const reduceMotion = useReducedMotion();

  // Duffel Links handoff (TEST MODE / DEMO): payment and ticketing happen on
  // Duffel's hosted checkout, never in Tern. We mint a session server-side,
  // then navigate the whole tab there — Duffel redirects back to /booking
  // with `order_id` on success. Runs against the test token today; goes live
  // by swapping the env token once the business-side activation is resolved.
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const startHostedCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: checkoutOffer.id,
          currency: checkoutOffer.currency,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error("Could not create a checkout session");
      }
      window.location.assign(data.url);
      // Keep the spinner while the browser navigates away.
    } catch {
      setCheckoutError(t("checkoutOpenError"));
      setCheckoutLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(10,15,30,0.55)] backdrop-blur-sm sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <motion.div
        className={`glass-modal-dark w-full max-w-lg rounded-t-3xl p-6 sm:rounded-3xl ${tone.base}`}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={
          reduceMotion
            ? { opacity: 0, transition: { duration: 0.15 } }
            : { opacity: 0, scale: 0.97, y: 16, transition: { duration: 0.18, ease: "easeIn" } }
        }
        transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.9 }}
      >
        {/* Static boarding-pass mark — the hero's signature object, flat and small */}
        <div className="boarding-pass-mark data-mono mb-5" aria-hidden="true">
          <span>{from}</span>
          <span className="bpm-route">
            <i className="bpm-dot" />
            <i className="bpm-line" />
            <i className="bpm-dot" />
          </span>
          <span>{to}</span>
          <span className="bpm-stub">TERN</span>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-lg font-bold">
            {checkoutStep === "review" ? t("reviewTitle") : t("bookTitle")}
          </p>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-full p-1.5 ${tone.muted} hover:bg-white/10 hover:text-white transition-colors`}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={checkoutStep}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {checkoutStep === "review" && (
              <div className="space-y-5">
                {/* Flight summary — airline leads, route/date support, price is
                    the loudest number in the panel. */}
                <div className="glass-chip-dark rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold">{checkoutOffer.airline || t("partnerAirline")}</p>
                      <p className={`text-sm ${tone.muted} mt-0.5`}>
                        {fromCity} ({from}) → {toCity} ({to})
                      </p>
                      <p className={`data-mono text-xs ${tone.faint} mt-1`}>
                        {dateLabel(checkoutOffer.departure)} · {durationLabel(checkoutOffer.duration)}
                      </p>
                    </div>
                    <p className="data-mono text-2xl font-black text-white shrink-0">
                      <PriceDisplay amount={Number(checkoutOffer.price)} currency={checkoutOffer.currency} />
                    </p>
                  </div>
                </div>

                <div>
                  <p className={`data-mono mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${tone.label}`}>
                    {t("bookWithPointsOrCash")}
                  </p>
                  <div className="space-y-2">
                    {buildBookingPrograms(checkoutOffer).transferOptions.map((opt) => (
                      <div
                        key={opt.program}
                        className="glass-chip-dark flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5"
                      >
                        <span className="text-[13px] font-medium text-[rgba(246,248,251,0.88)] truncate">
                          {opt.program}
                        </span>
                        <span className="flex items-baseline gap-1.5 shrink-0">
                          <span className="data-mono text-sm font-bold text-white">
                            {opt.points.toLocaleString()}
                          </span>
                          <span className={`text-[11px] ${tone.faint}`}>{t("pts")}</span>
                          <span className="data-mono text-xs text-[rgba(143,224,232,0.9)]">{opt.cash}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onAdvanceToBook}
                  className="btn-sheen w-full rounded-2xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
                >
                  {t("continueToBooking")}
                </button>
              </div>
            )}

            {checkoutStep === "book" && (
              <div className="space-y-4">
                {/* Honest handoff copy: Duffel Links opens a fresh search — the
                    selected offer does NOT carry over (confirmed against the live
                    API; only currency and branding transfer). Never imply the
                    exact flight is pre-loaded and ready to pay for. */}
                <p className={`text-sm ${tone.muted}`}>
                  {t.rich("duffelHandoff", {
                    from,
                    to,
                    route: (chunks) => <strong className="text-white">{chunks}</strong>,
                  })}
                </p>
                <div className="glass-chip-dark rounded-2xl p-4 text-sm">
                  <p className="font-semibold">{checkoutOffer.airline || t("partnerAirline")}</p>
                  <p className={tone.muted}>
                    {fromCity} ({from}) → {toCity} ({to}) · {dateLabel(checkoutOffer.departure)}
                  </p>
                  <p className={tone.muted}>
                    {t("aroundPricePrefix")}{" "}
                    <PriceDisplay amount={Number(checkoutOffer.price)} currency={checkoutOffer.currency} />{" "}
                    {t("aroundPriceSuffix")}
                  </p>
                </div>
                <div className={`glass-chip-dark rounded-2xl p-4 text-sm ${tone.muted}`}>
                  {t("testModeNotice")}
                </div>
                {checkoutError && (
                  <p className="text-sm text-red-400" role="alert">{checkoutError}</p>
                )}
                <button
                  type="button"
                  onClick={startHostedCheckout}
                  disabled={checkoutLoading}
                  className="btn-sheen w-full rounded-2xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {checkoutLoading ? t("openingCheckout") : t("continueToCheckout")}
                </button>
                {/* Second revenue path (Travelpayouts White Label on our own
                    book.flytern.site). Same honesty bar as the Duffel copy above:
                    the deep link is search-level, so it opens a pre-filled search
                    for this route/date — the exact offer does not carry over. */}
                {aviasalesUrl && (
                  <div className="space-y-2">
                    <p className={`text-xs ${tone.muted}`}>
                      {t.rich("whiteLabelHandoff", {
                        from,
                        to,
                        route: (chunks) => <strong className="text-white">{chunks}</strong>,
                      })}
                    </p>
                    <a
                      href={aviasalesUrl}
                      target="_blank"
                      rel="sponsored noopener noreferrer"
                      className={`block w-full rounded-2xl border border-[rgba(143,224,232,0.28)] py-3 text-center text-sm font-semibold ${tone.base} hover:bg-white/5 transition-colors`}
                    >
                      {t("bookThisRoute")}
                    </a>
                  </div>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className={`w-full rounded-2xl border border-[rgba(143,224,232,0.28)] py-3 text-sm font-semibold ${tone.base} hover:bg-white/5 transition-colors`}
                >
                  {t("close")}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
