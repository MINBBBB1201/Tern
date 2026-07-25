import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalPage } from "../../components/LegalPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Meta");
  return {
    title: t("privacyTitle"),
    description: t("privacyDescription"),
    alternates: { canonical: "/privacy" },
  };
}

/* /privacy — Privacy Policy. Content + all four locales live in the
   PrivacyPage message namespace; LegalPage renders the shared chrome. */
export default function PrivacyPolicyPage() {
  return <LegalPage namespace="PrivacyPage" sections={7} />;
}
