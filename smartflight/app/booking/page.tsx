import type { Metadata } from "next";
import BookingContent from "./BookingContent";

export const metadata: Metadata = {
  title: "Search & Compare Flights",
  description:
    "Compare live fares side by side — cheapest, fastest, earliest arrival, an AI-balanced pick, smart connections, and lowest delay risk — with points-vs-cash value and airport ground-transport tips, then book by cash or miles.",
  alternates: { canonical: "/booking" },
};

export default function BookingPage() {
  return <BookingContent />;
}
