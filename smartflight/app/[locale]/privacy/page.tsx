import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { alternatesFor, localeUrl, ogLocaleFor } from "../../../lib/seo";
import { LegalPage } from "../../../components/LegalPage";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: t("privacyTitle"),
    description: t("privacyDescription"),
    alternates: alternatesFor("/privacy", locale),
    openGraph: {
      title: t("privacyTitle"),
      description: t("privacyDescription"),
      url: localeUrl("/privacy", locale),
      siteName: "Tern",
      type: "website",
      ...ogLocaleFor(locale),
    },
  };
}

/* /privacy — Privacy Policy. Content + all four locales live in the
   PrivacyPage message namespace; LegalPage renders the shared chrome. */
export default function PrivacyPolicyPage() {
  return <LegalPage namespace="PrivacyPage" sections={7} />;
}
