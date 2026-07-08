"use client";

import { useState } from "react";
import type { Offer } from "../lib/offerUtils";

export function useCheckoutFlow() {
  const [checkoutOffer, setCheckoutOffer] = useState<Offer | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"review" | "book">("review");

  const openCheckout = (offer: Offer) => {
    setCheckoutOffer(offer);
    setCheckoutStep("review");
  };

  const advanceToBook = () => setCheckoutStep("book");

  const closeCheckout = () => setCheckoutOffer(null);

  return { checkoutOffer, checkoutStep, openCheckout, advanceToBook, closeCheckout };
}
