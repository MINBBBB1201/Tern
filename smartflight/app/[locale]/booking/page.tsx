import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { alternatesFor, localeUrl, ogLocaleFor } from "../../../lib/seo";
import BookingContent from "./BookingContent";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: t("bookingTitle"),
    description: t("bookingDescription"),
    alternates: alternatesFor("/booking", locale),
    openGraph: {
      title: t("bookingTitle"),
      description: t("bookingDescription"),
      url: localeUrl("/booking", locale),
      siteName: "Tern",
      type: "website",
      ...ogLocaleFor(locale),
    },
  };
}

export default function BookingPage() {
  return <BookingContent />;
}
