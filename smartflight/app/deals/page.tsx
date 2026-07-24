import type { Metadata } from "next";
import DealsContent from "./DealsContent";

export const metadata: Metadata = {
  title: "Airline Deals & Promotions",
  description:
    "Official deal pages for Turkish Airlines, Korean Air, Asiana, and other carriers — links straight to each airline's own promotions, plus a one-tap Tern search for that route. Every fact is verifiable on the linked airline page.",
  alternates: { canonical: "/deals" },
};

export default function DealsPage() {
  return <DealsContent />;
}
