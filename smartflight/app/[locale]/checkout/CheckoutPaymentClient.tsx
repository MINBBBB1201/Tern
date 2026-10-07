"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ANONYMOUS, loadTossPayments, type TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import { TOSS_CURRENCY, TOSS_ORDER_NAME, TOSS_TEST_AMOUNT, newOrderId } from "../../../lib/toss";

/**
 * TossPayments payment widget (I14, TEST MODE).
 *
 * Two-step by design: this component only AUTHENTICATES the payer. Toss then
 * redirects to `successUrl` with `paymentKey`/`orderId`/`amount`, and the
 * money moves only when the result route posts those to
 * /api/payments/confirm, server-side, with the secret key. Nothing here can
 * approve a payment, which is why the client key being public is fine.
 */

const CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

export default function CheckoutPaymentClient() {
  const t = useTranslations("Payment");
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // One order id per page visit. A lazy useState initialiser rather than a
  // ref written during render: Toss refuses a second payment on an orderId it
  // has already seen, so this must be stable for the life of the mount, and
  // useState is the sanctioned way to compute a per-mount value once.
  const [orderId] = useState(newOrderId);

  // A missing client key is known at render time — it is a build-time env
  // constant, not something an effect discovers — so it is derived, not
  // stored. Runtime failures still go through `error`.
  const configError = CLIENT_KEY ? null : t("notConfigured");
  const shownError = configError ?? error;

  useEffect(() => {
    if (!CLIENT_KEY) return;
    // Toss allows one widget instance per page and throws
    // AlreadyRenderedError on a second render, so a cancelled mount must not
    // leave its widgets behind — React StrictMode mounts twice in dev.
    let cancelled = false;
    let methodWidget: { destroy: () => void } | null = null;
    let agreementWidget: { destroy: () => void } | null = null;

    (async () => {
      try {
        const toss = await loadTossPayments(CLIENT_KEY);
        if (cancelled) return;
        const widgets = toss.widgets({ customerKey: ANONYMOUS });
        // setAmount must precede the renders (new in SDK v2) — the payment UI
        // decides which methods are even offered from the amount.
        await widgets.setAmount({ value: TOSS_TEST_AMOUNT, currency: TOSS_CURRENCY });
        if (cancelled) return;
        const [m, a] = await Promise.all([
          widgets.renderPaymentMethods({ selector: "#toss-payment-method", variantKey: "DEFAULT" }),
          widgets.renderAgreement({ selector: "#toss-agreement", variantKey: "AGREEMENT" }),
        ]);
        methodWidget = m;
        agreementWidget = a;
        if (cancelled) {
          m.destroy();
          a.destroy();
          return;
        }
        widgetsRef.current = widgets;
        setReady(true);
      } catch (err) {
        if (cancelled) return;
        console.error("[toss] widget render failed", err);
        setError(t("widgetError"));
      }
    })();

    return () => {
      cancelled = true;
      widgetsRef.current = null;
      methodWidget?.destroy();
      agreementWidget?.destroy();
    };
  }, [t]);

  const pay = async () => {
    const widgets = widgetsRef.current;
    if (!widgets) return;
    setSubmitting(true);
    setError(null);
    // The result route is a child of this one, so deriving the return URLs
    // from the current path carries the locale prefix automatically — no
    // second source of truth for next-intl's `as-needed` prefixing.
    const base = `${window.location.origin}${window.location.pathname.replace(/\/$/, "")}/result`;
    try {
      await widgets.requestPayment({
        orderId,
        orderName: TOSS_ORDER_NAME,
        successUrl: base,
        failUrl: base,
      });
      // Redirect flow: on success the browser has already navigated away.
    } catch (err) {
      // Closing the payment window rejects here; that is a cancel, not a
      // fault, so it must not read as an error to the user.
      const code = (err as { code?: string })?.code;
      if (code !== "USER_CANCEL") {
        console.error("[toss] requestPayment failed", err);
        setError(t("requestError"));
      }
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Test-mode banner. The amount below is a fixed test charge, not a
          fare — saying so plainly is the point (§2-1). */}
      <div className="glass-panel rounded-2xl p-5">
        <p className="data-mono text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--contrail-300)" }}>
          {t("testModeLabel")}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{t("testModeBody")}</p>
        <div className="mt-4 flex items-baseline justify-between border-t border-[rgba(143,224,232,0.18)] pt-4">
          <span className="text-sm text-muted">{t("amountLabel")}</span>
          <span className="data-mono text-xl font-bold text-foreground">
            {new Intl.NumberFormat("ko-KR", { style: "currency", currency: TOSS_CURRENCY }).format(TOSS_TEST_AMOUNT)}
          </span>
        </div>
      </div>

      {/* Toss owns the markup inside these two containers. */}
      <div className="glass-panel overflow-hidden rounded-2xl">
        <div id="toss-payment-method" />
        <div id="toss-agreement" />
      </div>

      {shownError && (
        <p className="text-sm text-red-400" role="alert">
          {shownError}
        </p>
      )}

      <button
        type="button"
        onClick={pay}
        disabled={!ready || submitting}
        className="btn-sheen w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? t("payButtonBusy") : t("payButton")}
      </button>
    </div>
  );
}
