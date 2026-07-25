import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import DealsContent from "./DealsContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Meta");
  return {
    title: t("dealsTitle"),
    description: t("dealsDescription"),
    alternates: { canonical: "/deals" },
  };
}

export default function DealsPage() {
  return <DealsContent />;
}
