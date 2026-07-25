import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import BookingContent from "./BookingContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Meta");
  return {
    title: t("bookingTitle"),
    description: t("bookingDescription"),
    alternates: { canonical: "/booking" },
  };
}

export default function BookingPage() {
  return <BookingContent />;
}
