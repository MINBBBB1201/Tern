"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";
import { buildBookingPrograms, dateLabel, durationLabel, formatMoney, type Offer } from "../../lib/offerUtils";

gsap.registerPlugin(useGSAP);

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

export default function CheckoutModal(props: CheckoutModalProps) {
  // Hook-safe gate: the animated shell mounts only while an offer is open,
  // so its useGSAP entrance runs exactly once per open.
  if (!props.checkoutOffer) return null;
  return <CheckoutModalShell {...props} checkoutOffer={props.checkoutOffer} />;
}

function CheckoutModalShell({ checkoutOffer, checkoutStep, fromCity, toCity, from, to, onAdvanceToBook, onClose, aviasalesUrl }: CheckoutModalProps & { checkoutOffer: Offer }) {
  const t = useTranslations("Checkout");
  const rootRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLDivElement>(null);

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

  // "Sliding through glass": backdrop frosts in while the pass-shaped
  // panel rises with real perspective depth and settles. Step changes
  // crossfade the content quietly. Reduced motion: no tweens, the modal
  // simply appears (its natural CSS state).
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(rootRef.current, { autoAlpha: 0, duration: 0.22, ease: "power1.out" });
        gsap.from("[data-modal-panel]", {
          y: 56,
          rotateX: 9,
          transformPerspective: 1100,
          transformOrigin: "50% 100%",
          scale: 0.97,
          autoAlpha: 0,
          duration: 0.45,
          ease: "power3.out",
        });
      });
    },
    { scope: rootRef }
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(stepRef.current, { autoAlpha: 0, y: 10, duration: 0.28, ease: "power2.out" });
      });
    },
    { scope: rootRef, dependencies: [checkoutStep] }
  );

  return (
    <div ref={rootRef} className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
      <div data-modal-panel className="glass-panel-strong w-full max-w-lg rounded-t-3xl p-6 sm:rounded-3xl">
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
          <button type="button" onClick={onClose} className="rounded-full p-1.5 hover:bg-gray-100">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div ref={stepRef}>
        {checkoutStep === "review" && (
          <div className="space-y-4">
            <div className="glass-chip rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{checkoutOffer.airline || t("partnerAirline")}</p>
                  <p className="text-sm text-muted">{fromCity} ({from}) → {toCity} ({to})</p>
                  <p className="text-sm text-muted">{dateLabel(checkoutOffer.departure)} · {durationLabel(checkoutOffer.duration)}</p>
                </div>
                <p className="text-2xl font-black text-primary">{formatMoney(Number(checkoutOffer.price), checkoutOffer.currency)}</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold">{t("bookWithPointsOrCash")}</p>
              <div className="space-y-2">
                {buildBookingPrograms(checkoutOffer).transferOptions.map((opt) => (
                  <div key={opt.program} className="glass-chip flex items-center justify-between rounded-xl px-3 py-2.5 text-sm">
                    <span className="font-medium">{opt.program}</span>
                    <span className="text-primary-hover font-semibold">{opt.points.toLocaleString()} {t("pts")} {opt.cash}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={onAdvanceToBook}
              className="w-full rounded-2xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
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
            <p className="text-sm text-muted">
              {t.rich("duffelHandoff", {
                from,
                to,
                route: (chunks) => <strong>{chunks}</strong>,
              })}
            </p>
            <div className="glass-chip rounded-2xl p-4 text-sm">
              <p className="font-semibold">{checkoutOffer.airline || t("partnerAirline")}</p>
              <p className="text-muted">
                {fromCity} ({from}) → {toCity} ({to}) · {dateLabel(checkoutOffer.departure)}
              </p>
              <p className="text-muted">
                {t("aroundPrice", { price: formatMoney(Number(checkoutOffer.price), checkoutOffer.currency) })}
              </p>
            </div>
            <div className="glass-chip rounded-2xl p-4 text-sm text-muted">
              {t("testModeNotice")}
            </div>
            {checkoutError && (
              <p className="text-sm text-red-600" role="alert">{checkoutError}</p>
            )}
            <button
              type="button"
              onClick={startHostedCheckout}
              disabled={checkoutLoading}
              className="w-full rounded-2xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              {checkoutLoading ? t("openingCheckout") : t("continueToCheckout")}
            </button>
            {/* Second revenue path (Travelpayouts White Label on our own
                book.flytern.site). Same honesty bar as the Duffel copy above:
                the deep link is search-level, so it opens a pre-filled search
                for this route/date — the exact offer does not carry over. */}
            {aviasalesUrl && (
              <div className="space-y-2">
                <p className="text-xs text-muted">
                  {t.rich("whiteLabelHandoff", {
                    from,
                    to,
                    route: (chunks) => <strong>{chunks}</strong>,
                  })}
                </p>
                <a
                  href={aviasalesUrl}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  className="block w-full rounded-2xl border border-[#d5dfec] py-3 text-center text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  {t("bookThisRoute")}
                </a>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-2xl border border-[#d5dfec] py-3 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              {t("close")}
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
