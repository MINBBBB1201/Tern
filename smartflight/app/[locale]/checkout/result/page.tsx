import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { SubpageShell } from "../../../../components/SubpageShell";
import CheckoutResultClient from "./CheckoutResultClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Payment" });
  return {
    title: t("resultMetaTitle"),
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

/* /checkout/result — where Toss's redirect lands, for both outcomes.
 *
 * One route, not two: `requestPayment` is given the same URL for successUrl
 * and failUrl, and the two cases are told apart by which query parameters Toss
 * appends (`paymentKey` on an authenticated payment, `code`/`message` on a
 * failure or a cancel). Two routes would duplicate the shell and the copy for
 * no gain, and would still both need the "neither" branch for a direct hit. */
export default async function CheckoutResultPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Payment" });

  return (
    <SubpageShell kicker={t("kicker")} title={t("resultTitle")}>
      <section className="py-14">
        <div className="mx-auto max-w-2xl px-6">
          {/* The whole outcome is carried in the query string Toss redirects
              with, so the client reads useSearchParams() and this boundary is
              required rather than decorative. */}
          <Suspense fallback={<div className="glass-panel rounded-2xl p-6"><p className="text-sm text-muted">{t("confirming")}</p></div>}>
            <CheckoutResultClient />
          </Suspense>
        </div>
      </section>
    </SubpageShell>
  );
}
