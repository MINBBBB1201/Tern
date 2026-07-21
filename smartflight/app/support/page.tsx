"use client";

import { useTranslations } from "next-intl";
import { SubpageShell } from "../../components/SubpageShell";

/* /support — FAQ as native <details> styled into the glass system
   (no JS accordion dependency for six questions), plus contact. */
export default function SupportPage() {
  const t = useTranslations("SupportPage");
  const faqs = ["faq1", "faq2", "faq3", "faq4", "faq5", "faq6"] as const;

  return (
    <SubpageShell kicker={t("kicker")} title={t("title")} intro={t("intro")}>
      <section className="py-14">
        <div className="max-w-3xl mx-auto px-6">
          <div className="space-y-3">
            {faqs.map((id) => (
              <details key={id} className="glass-panel group rounded-2xl">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden">
                  <span className="text-[15px] font-semibold text-foreground">{t(`${id}q`)}</span>
                  <span
                    className="glass-chip flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition-transform group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 -mt-1">
                  <p className="text-sm leading-relaxed text-muted">{t(`${id}a`)}</p>
                </div>
              </details>
            ))}
          </div>

          <div id="contact" className="glass-modal-dark mt-10 scroll-mt-24 rounded-2xl p-7 text-[#F6F8FB]">
            <p className="data-mono text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: "rgba(143,224,232,0.8)" }}>
              {t("contactTitle")}
            </p>
            <p className="mt-2 text-sm" style={{ color: "rgba(246,248,251,0.7)" }}>
              {t("contactBody")}
            </p>
            <a
              href={`mailto:${t("contactAddress")}`}
              className="btn-sheen mt-4 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition"
            >
              {t("contactAddress")}
            </a>
          </div>
        </div>
      </section>
    </SubpageShell>
  );
}
