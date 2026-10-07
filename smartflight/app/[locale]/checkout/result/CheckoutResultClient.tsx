"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "../../../../i18n/navigation";

/**
 * Payment result (I14, TEST MODE).
 *
 * Toss redirects here after the payment window closes. On an authenticated
 * payment it appends `paymentKey`, `orderId`, `amount`; on a failure or a
 * cancel it appends `code`, `message`, `orderId`. Authentication is NOT
 * approval — the money only moves when /api/payments/confirm approves it
 * server-side, which is what the success branch does before claiming anything.
 *
 * What this screen deliberately does NOT say: nothing about a ticket, a PNR, a
 * seat or a booking reference. Tern has no ticketing accreditation and the
 * Duffel side is not wired up, so a confirmed payment means exactly "we took a
 * test payment" and the copy says only that (§2-1).
 */

type Approved = {
  orderId: string;
  status: string | null;
  method: string | null;
  totalAmount: number | null;
  currency: string | null;
  approvedAt: string | null;
};

type State =
  | { phase: "idle" }
  | { phase: "confirming" }
  | { phase: "approved"; data: Approved }
  | { phase: "failed"; code: string; message: string };

export default function CheckoutResultClient() {
  const t = useTranslations("Payment");
  const params = useSearchParams();
  const [state, setState] = useState<State>({ phase: "idle" });

  const paymentKey = params.get("paymentKey");
  const orderId = params.get("orderId");
  const amount = params.get("amount");
  const failCode = params.get("code");
  const failMessage = params.get("message");

  // Confirm exactly once per landing. StrictMode double-mounts in dev and a
  // second confirm on the same paymentKey is an error at Toss, so the guard is
  // a ref, not a state flag (state resets with the re-mount, refs do not).
  // The server also sends an Idempotency-Key, which is the real protection —
  // this just avoids showing the user a spurious "already processed".
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    if (!paymentKey || !orderId || !amount) return;
    firedRef.current = true;
    // No synchronous setState here: "idle" already renders the confirming
    // panel, so setting it would be a cascading render for no visible change.
    (async () => {
      try {
        const res = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
        });
        const data = await res.json();
        if (!res.ok) {
          setState({ phase: "failed", code: data?.code ?? "CONFIRM_FAILED", message: data?.message ?? "" });
          return;
        }
        setState({ phase: "approved", data });
      } catch {
        setState({ phase: "failed", code: "NETWORK_ERROR", message: "" });
      }
    })();
  }, [paymentKey, orderId, amount]);

  // Toss reported the failure itself (declined card, closed window, timeout).
  if (failCode) {
    return <Failed t={t} code={failCode} message={failMessage ?? ""} />;
  }

  if (!paymentKey) {
    // Someone opened this URL directly. Say so rather than implying a payment.
    return (
      <Panel>
        <p className="text-sm leading-relaxed text-muted">{t("noPayment")}</p>
        <Actions t={t} retry />
      </Panel>
    );
  }

  if (state.phase === "confirming" || state.phase === "idle") {
    return (
      <Panel>
        <p className="text-sm text-muted">{t("confirming")}</p>
      </Panel>
    );
  }

  if (state.phase === "failed") {
    return <Failed t={t} code={state.code} message={state.message} />;
  }

  const d = state.data;
  return (
    <Panel>
      <p className="data-mono text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--contrail-300)" }}>
        {t("successKicker")}
      </p>
      <h2 className="mt-2 text-xl font-bold text-foreground">{t("successTitle")}</h2>
      {/* Honest status: payment confirmed, booking NOT issued. */}
      <p className="mt-3 text-sm leading-relaxed text-muted">{t("successBody")}</p>

      <dl className="mt-5 space-y-2 border-t border-[rgba(143,224,232,0.18)] pt-4 text-sm">
        <Row label={t("fieldOrderId")} value={d.orderId} mono />
        {d.status && <Row label={t("fieldStatus")} value={d.status} mono />}
        {d.totalAmount != null && (
          <Row
            label={t("fieldAmount")}
            value={new Intl.NumberFormat("ko-KR", {
              style: "currency",
              currency: d.currency || "KRW",
            }).format(d.totalAmount)}
            mono
          />
        )}
        {d.approvedAt && <Row label={t("fieldApprovedAt")} value={new Date(d.approvedAt).toLocaleString()} mono />}
      </dl>

      <Actions t={t} />
    </Panel>
  );
}

type T = (key: string) => string;

function Failed({ t, code, message }: { t: T; code: string; message: string }) {
  // PAY_PROCESS_CANCELED is the payer closing the window — not a fault, and
  // telling them "payment failed" for it would be wrong.
  const cancelled = code === "PAY_PROCESS_CANCELED";
  return (
    <Panel>
      <p className="data-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-red-400">
        {cancelled ? t("cancelKicker") : t("failKicker")}
      </p>
      <h2 className="mt-2 text-xl font-bold text-foreground">{cancelled ? t("cancelTitle") : t("failTitle")}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">{cancelled ? t("cancelBody") : t("failBody")}</p>
      {/* Toss's own message, shown verbatim and attributed: it is the only
          accurate account of why this particular payment did not go through,
          and paraphrasing it into our own words would be inventing a reason. */}
      {message && (
        <div className="mt-4 rounded-xl border border-[rgba(248,113,113,0.28)] bg-[rgba(248,113,113,0.06)] p-3.5">
          <p className="data-mono text-[10px] uppercase tracking-[0.12em] text-muted">{t("providerMessage")}</p>
          <p className="mt-1 text-sm text-foreground">{message}</p>
          <p className="data-mono mt-1 text-[11px] text-muted">{code}</p>
        </div>
      )}
      <Actions t={t} retry />
    </Panel>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="glass-panel rounded-2xl p-6">{children}</div>;
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className={`${mono ? "data-mono" : ""} text-right text-foreground break-all`}>{value}</dd>
    </div>
  );
}

function Actions({ t, retry }: { t: T; retry?: boolean }) {
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {retry && (
        <Link
          href="/checkout"
          className="btn-sheen inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          {t("tryAgain")}
        </Link>
      )}
      <Link
        href="/booking"
        className="inline-flex items-center justify-center rounded-full border border-[rgba(143,224,232,0.28)] px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-white/5"
      >
        {t("backToSearch")}
      </Link>
    </div>
  );
}
