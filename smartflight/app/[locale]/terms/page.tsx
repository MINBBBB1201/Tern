import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { alternatesFor, localeUrl, ogLocaleFor } from "../../../lib/seo";
import { LegalPage } from "../../../components/LegalPage";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: t("termsTitle"),
    description: t("termsDescription"),
    alternates: alternatesFor("/terms", locale),
    openGraph: {
      title: t("termsTitle"),
      description: t("termsDescription"),
      url: localeUrl("/terms", locale),
      siteName: "Tern",
      type: "website",
      ...ogLocaleFor(locale),
    },
  };
}

/* /terms — Terms of Use. Content + all four locales live in the TermsPage
   message namespace; LegalPage renders the shared subpage chrome. */
export default function TermsOfUsePage() {
  return <LegalPage namespace="TermsPage" sections={7} />;
}
