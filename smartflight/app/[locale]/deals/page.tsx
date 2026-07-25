import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { alternatesFor, localeUrl, ogLocaleFor } from "../../../lib/seo";
import DealsContent from "./DealsContent";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: t("dealsTitle"),
    description: t("dealsDescription"),
    alternates: alternatesFor("/deals", locale),
    openGraph: {
      title: t("dealsTitle"),
      description: t("dealsDescription"),
      url: localeUrl("/deals", locale),
      siteName: "Tern",
      type: "website",
      ...ogLocaleFor(locale),
    },
  };
}

export default function DealsPage() {
  return <DealsContent />;
}
