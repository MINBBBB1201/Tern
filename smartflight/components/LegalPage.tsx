"use client";

import { useTranslations } from "next-intl";
import { SubpageShell } from "./SubpageShell";

/* Shared chrome for the legal pages (/terms, /privacy): the same night-band
   header + light glass body as the other subpages, driven entirely by a
   message namespace so both pages — and all four locales — share one layout.
   Sections are flat s{n}h / s{n}p keys (like SupportPage's faqNq/faqNa), and
   bodies honour \n via whitespace-pre-line for the sub-listed paragraphs. */
const CONTACT_EMAIL = "support@flytern.site";

export function LegalPage({ namespace, sections }: { namespace: string; sections: number }) {
  const t = useTranslations(namespace);
  const ids = Array.from({ length: sections }, (_, i) => i + 1);

  return (
    <SubpageShell kicker={t("kicker")} title={t("title")} intro={t("intro")}>
      <section className="glass-boost py-14">
        <div className="max-w-3xl mx-auto px-6">
          <p className="data-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            {t("effective")}
          </p>

          <div className="mt-8 space-y-9">
            {ids.map((n) => (
              <section key={n}>
                <h2 className="text-lg font-bold text-foreground">{t(`s${n}h`)}</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">
                  {t(`s${n}p`)}
                </p>
              </section>
            ))}
          </div>

          <div className="glass-panel mt-10 rounded-2xl p-6">
            <p className="text-sm text-muted">
              {t("contactLead")}{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-semibold text-primary-hover hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </SubpageShell>
  );
}
