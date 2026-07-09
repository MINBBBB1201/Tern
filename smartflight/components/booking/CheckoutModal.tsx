"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
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
};

export default function CheckoutModal(props: CheckoutModalProps) {
  // Hook-safe gate: the animated shell mounts only while an offer is open,
  // so its useGSAP entrance runs exactly once per open.
  if (!props.checkoutOffer) return null;
  return <CheckoutModalShell {...props} checkoutOffer={props.checkoutOffer} />;
}

function CheckoutModalShell({ checkoutOffer, checkoutStep, fromCity, toCity, from, to, onAdvanceToBook, onClose }: CheckoutModalProps & { checkoutOffer: Offer }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLDivElement>(null);

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
            {checkoutStep === "review" ? "Review your flight" : "Complete booking"}
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
                  <div key={opt.program} className="glass-chip flex items-center justify-between rounded-xl px-3 py-2.5 text-sm">
                    <span className="font-medium">{opt.program}</span>
                    <span className="text-primary-hover font-semibold">{opt.points.toLocaleString()} pts {opt.cash}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={onAdvanceToBook}
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
            <div className="rounded-2xl border border-[color-mix(in_srgb,var(--color-success)_30%,white)] bg-success-subtle p-4 text-sm text-success-strong">
              ✅ Booking confirmed (demo). Check your email for confirmation details.
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-2xl border border-[#d5dfec] py-3 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
