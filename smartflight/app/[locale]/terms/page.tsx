import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalPage } from "../../components/LegalPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Meta");
  return {
    title: t("termsTitle"),
    description: t("termsDescription"),
    alternates: { canonical: "/terms" },
  };
}

/* /terms — Terms of Use. Content + all four locales live in the TermsPage
   message namespace; LegalPage renders the shared subpage chrome. */
export default function TermsOfUsePage() {
  return <LegalPage namespace="TermsPage" sections={7} />;
}
