"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { SubpageShell } from "../../components/SubpageShell";

/* /about — what Tern compares, what it refuses to do, and where the
   name comes from. The tern glyph is the same mark the WHY strip uses. */
export default function AboutPage() {
  const t = useTranslations("AboutPage");
  const tf = useTranslations("Footer"); // reuse the localized Terms/Privacy labels

  return (
    <SubpageShell kicker={t("kicker")} title={t("title")} intro={t("intro")}>
      <section className="py-14">
        <div className="max-w-3xl mx-auto px-6 space-y-5">
          <section className="glass-panel rounded-2xl p-7">
            <p className="data-mono text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--contrail-300)" }}>
              {t("whatTitle")}
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">{t("whatBody")}</p>
          </section>

          <section className="glass-panel rounded-2xl p-7">
            <p className="data-mono text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--contrail-300)" }}>
              {t("diffTitle")}
            </p>
            <ul className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted">
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--contrail-300)" }} aria-hidden="true" />
                {t("diff1")}
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--contrail-300)" }} aria-hidden="true" />
                {t("diff2")}
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--contrail-300)" }} aria-hidden="true" />
                {t("diff3")}
              </li>
            </ul>
          </section>

          {/* How we make money (H4) — the affiliate model stated up front,
              consistent with the Terms/Privacy, user-first, no new claims. */}
          <section id="money" className="glass-panel rounded-2xl p-7">
            <p className="data-mono text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--contrail-300)" }}>
              {t("moneyTitle")}
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">{t("moneyIntro")}</p>
            <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-muted">
              {(["money1", "money2", "money3"] as const).map((k) => (
                <li key={k} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--contrail-300)" }} aria-hidden="true" />
                  {t(k)}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-muted">{t("moneyFoot")}</p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm">
              <Link href="/terms" className="font-semibold text-[var(--contrail-300)] transition hover:underline">
                {tf("terms")} →
              </Link>
              <Link href="/privacy" className="font-semibold text-[var(--contrail-300)] transition hover:underline">
                {tf("privacy")} →
              </Link>
            </div>
          </section>

          {/* The name — dark glass, because this is the hero's story. */}
          <section id="name" className="glass-modal-dark rounded-2xl p-7 text-[#F6F8FB]">
            <div className="flex items-start gap-4">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0 mt-1">
                <path d="M2 15 L22 8 L12 12.5 L9.5 4.5 L7.5 5.5 L9 13.5 Z" fill="var(--contrail-300)" />
              </svg>
              <div>
                <p className="data-mono text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: "rgba(143,224,232,0.8)" }}>
                  {t("nameTitle")}
                </p>
                <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "rgba(246,248,251,0.8)" }}>
                  {t("nameBody1")}
                </p>
                <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "rgba(246,248,251,0.8)" }}>
                  {t("nameBody2")}
                </p>
              </div>
            </div>
          </section>

          <div className="pt-2">
            <Link
              href="/"
              className="btn-sheen inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition"
            >
              {t("ctaSearch")}
            </Link>
          </div>
        </div>
      </section>
    </SubpageShell>
  );
}
