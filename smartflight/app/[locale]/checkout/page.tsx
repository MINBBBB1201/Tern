import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SubpageShell } from "../../../components/SubpageShell";
import CheckoutPaymentClient from "./CheckoutPaymentClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Payment" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    // Transactional, per-order, and currently a test harness — there is
    // nothing here for an index. Deliberately no `alternates`/OG either: the
    // other subpages advertise themselves, this one should not (I11 set the
    // precedent for pages that exist but should not be found).
    robots: { index: false, follow: false },
  };
}

/* /checkout — TossPayments payment widget (I14, TEST MODE).
 *
 * A page rather than a step inside CheckoutModal because Toss's
 * `requestPayment` navigates the whole tab to successUrl/failUrl: a modal
 * cannot survive the round trip, and the return leg needs a real URL to land
 * on. The existing Duffel Links handoff works for the same reason — it also
 * leaves the tab — and is untouched by this route. */
export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Payment" });

  return (
    <SubpageShell kicker={t("kicker")} title={t("title")} intro={t("intro")}>
      <section className="py-14">
        <div className="mx-auto max-w-2xl px-6">
          <CheckoutPaymentClient />
        </div>
      </section>
    </SubpageShell>
  );
}
