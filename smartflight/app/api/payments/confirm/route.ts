import { NextRequest, NextResponse } from "next/server";
import { TOSS_TEST_AMOUNT } from "../../../../lib/toss";

/**
 * TossPayments payment approval (I14). TEST MODE.
 *
 * The widget only AUTHENTICATES the payer; money moves when this endpoint
 * calls Toss's confirm API. Splitting it that way is the whole point of the
 * two-step design — the browser is never trusted to declare a payment
 * approved, and `TOSS_SECRET_KEY` never leaves the server. This file is the
 * only place in the repo that reads it (verified by grep over the build
 * output, docs/screenshots/i14-secret-scan.txt).
 *
 * Scope: this approves a payment. It does NOT issue a ticket — Tern has no
 * ticketing accreditation and the Duffel Balance integration that would pay
 * for one is a separate round. The result screen says exactly that and
 * invents no PNR, no e-ticket number, no seat.
 */

const TOSS_CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm";

type ConfirmBody = { paymentKey?: unknown; orderId?: unknown; amount?: unknown };

export async function POST(req: NextRequest) {
  const secret = process.env.TOSS_SECRET_KEY;
  if (!secret) {
    console.error("[toss] TOSS_SECRET_KEY is not set");
    return NextResponse.json({ code: "NO_SECRET_KEY", message: "Payment is not configured." }, { status: 500 });
  }

  const body = (await req.json().catch(() => ({}))) as ConfirmBody;
  const paymentKey = typeof body.paymentKey === "string" ? body.paymentKey : "";
  const orderId = typeof body.orderId === "string" ? body.orderId : "";
  const amount = Number(body.amount);

  if (!paymentKey || !orderId || !Number.isFinite(amount)) {
    return NextResponse.json({ code: "BAD_REQUEST", message: "Missing payment parameters." }, { status: 400 });
  }

  // The amount arrives from a query string the payer's browser was redirected
  // with, so it is attacker-controlled. Approving whatever the client asks for
  // is the classic hole in this integration: a payer authenticates 1,000 KRW
  // and the server confirms 10. Compare against the amount WE set, and refuse
  // rather than approve a figure we did not originate.
  if (amount !== TOSS_TEST_AMOUNT) {
    console.error("[toss] amount mismatch", { orderId, got: amount, expected: TOSS_TEST_AMOUNT });
    return NextResponse.json(
      { code: "AMOUNT_MISMATCH", message: "The payment amount did not match the order." },
      { status: 400 }
    );
  }

  // Basic auth is base64("<secretKey>:") — the trailing colon is the empty
  // password half of HTTP Basic, and Toss's docs call it out explicitly
  // because omitting it fails as an auth error rather than a format error.
  const auth = Buffer.from(`${secret}:`).toString("base64");

  try {
    const res = await fetch(TOSS_CONFIRM_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
        // Toss holds this for 15 days and replays the first response for a
        // repeat, so a double-submit (StrictMode, a refresh on the result
        // screen, a flaky network retry) cannot approve twice.
        "Idempotency-Key": `confirm-${orderId}`,
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Toss error shape: { code, message }. Pass both through — the codes are
      // documented and the result screen maps the ones worth explaining — but
      // do not leak anything else from the response.
      const code = typeof data?.code === "string" ? data.code : "CONFIRM_FAILED";
      const message = typeof data?.message === "string" ? data.message : "Payment approval failed.";
      console.error("[toss] confirm failed", { orderId, status: res.status, code, message });
      return NextResponse.json({ code, message }, { status: res.status });
    }

    // Whitelist what reaches the browser rather than forwarding the whole
    // Payment object: it carries card metadata, receipt URLs and the payer's
    // details, none of which the result screen needs.
    return NextResponse.json({
      orderId: data?.orderId ?? orderId,
      status: data?.status ?? null,
      method: data?.method ?? null,
      totalAmount: data?.totalAmount ?? null,
      currency: data?.currency ?? null,
      approvedAt: data?.approvedAt ?? null,
    });
  } catch (err) {
    console.error("[toss] confirm request threw", err);
    return NextResponse.json({ code: "NETWORK_ERROR", message: "Could not reach the payment provider." }, { status: 502 });
  }
}
