import { NextRequest, NextResponse } from "next/server";

// Duffel Links hosted-checkout session (TEST MODE / DEMO).
//
// Tern is not licensed to sell or issue airline tickets, so checkout is
// handed off to Duffel Links: Duffel is the merchant of record and handles
// payment + ticketing under its own accreditation. We only mint a session
// URL and redirect the customer to it.
//
// This runs against our test-mode token (`duffel_test_...`), so the hosted
// checkout accepts test cards and issues no real tickets. Flipping to live
// requires ONLY a `duffel_live_...` token in DUFFEL_ACCESS_TOKEN — but that
// token is gated on Duffel's live-mode verification (KYC) and the
// supported-country question, which is a business decision tracked
// separately. No code change is expected here beyond the env var.

const TERN_PRIMARY_COLOR = "#2F6FED";

export async function POST(req: NextRequest) {
  const { reference, currency } = await req
    .json()
    .catch(() => ({ reference: undefined, currency: undefined }));

  const token = process.env.DUFFEL_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json({ error: "No token" }, { status: 500 });
  }

  // Return URLs must be absolute AND https — Duffel 422s on http:// (verified
  // against the live API; https://localhost is accepted). Deployed origins are
  // https already; on plain-http local dev the handoff still works, but the
  // redirect back lands on an https URL the dev server doesn't serve — run
  // `next dev --experimental-https` if you need to demo the return leg.
  // Duffel appends `?order_id=...&reference=...` to success_url on completion,
  // so keep these free of query strings and let the booking page detect
  // success by the presence of `order_id`.
  const returnUrl = `${req.nextUrl.origin.replace(/^http:\/\//, "https://")}/booking`;

  try {
    const sessionRes = await fetch("https://api.duffel.com/links/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Duffel-Version": "v2",
        Accept: "application/json",
      },
      body: JSON.stringify({
        data: {
          // Ties the Duffel order back to the offer the user picked in Tern.
          // Links can't deep-link a specific offer or pre-fill the search —
          // confirmed empirically: the API silently discards injected
          // origin/destination/date fields and the hosted UI opens with an
          // empty search form. Only traveller_currency and branding carry
          // over, so this reference is our only reconciliation handle.
          reference: reference || `tern-demo-${Date.now()}`,
          success_url: returnUrl,
          failure_url: returnUrl,
          abandonment_url: returnUrl,
          primary_color: TERN_PRIMARY_COLOR,
          ...(currency ? { traveller_currency: currency } : {}),
          // Markup is where Tern's revenue margin gets configured once live;
          // deliberately unset in the test-mode demo.
          flights: { enabled: true },
          stays: { enabled: false },
        },
      }),
    });

    const sessionData = await sessionRes.json();

    if (!sessionRes.ok) {
      console.error("Duffel Links error:", sessionData);
      return NextResponse.json({ error: sessionData }, { status: 500 });
    }

    const url = (sessionData as { data?: { url?: string } })?.data?.url;

    if (!url) {
      console.error("Duffel Links returned no URL:", sessionData);
      return NextResponse.json({ error: "No checkout URL returned" }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
