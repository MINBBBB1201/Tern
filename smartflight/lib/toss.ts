/**
 * TossPayments shared constants (I14).
 *
 * Isomorphic on purpose: the browser needs the amount to render the widget and
 * the server needs the SAME amount to validate what it is about to approve.
 * Nothing secret lives here — the secret key is read only in
 * app/api/payments/confirm/route.ts and never imported into a client module.
 *
 * ── Why the amount is a constant and not the offer price ──
 * Duffel returns every offer in ONE currency (our organisation's billing
 * currency, USD — see lib/currency.ts, which exists precisely because of
 * that). The Toss widget charges in KRW. Converting a USD offer with the
 * display-only FX rates in lib/currency.ts would turn an approximate display
 * figure into an amount actually charged to a card, which is the §2-1 problem
 * this project keeps running into from the other direction.
 *
 * So this round wires the PLUMBING (widget -> payment window -> server
 * approval -> result screen) against a fixed, openly-labelled test amount, and
 * leaves "what Tern actually charges, in what currency" as a business decision
 * for the round that turns on live keys. Every screen that shows this amount
 * says it is a test charge; none of them dresses it up as a fare.
 */

/** Fixed test charge, in KRW. Not a fare, and the UI never claims it is. */
export const TOSS_TEST_AMOUNT = 1000;
export const TOSS_CURRENCY = "KRW";

/** Shown on the Toss payment window and in the merchant console. */
export const TOSS_ORDER_NAME = "Tern test payment";

/**
 * Toss requires 6-64 chars of [A-Za-z0-9-_]. Random rather than derived from
 * the offer id: offer ids are Duffel's and can repeat across a retry, and Toss
 * rejects a second payment on an orderId it has already seen — a retry after a
 * failed card would be refused for the wrong reason.
 */
export function newOrderId(): string {
  const rand = crypto.randomUUID().replace(/-/g, "").slice(0, 18);
  return `tern-${Date.now().toString(36)}-${rand}`;
}
