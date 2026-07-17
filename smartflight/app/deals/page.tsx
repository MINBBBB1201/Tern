"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { SubpageShell } from "../../components/SubpageShell";
import { airlineDealPages } from "../../lib/airlineDeals";

/* /deals — the C1 card pattern promoted to a full route. Same honesty
   contract: every fact is verifiable on the linked airline page; the
   only Tern-side additions are the popular-route search entry points. */
export default function DealsPage() {
  const t = useTranslations("DealsPage");
  const tHome = useTranslations("Home");

  return (
    <SubpageShell kicker={t("kicker")} title={t("title")} intro={t("intro")}>
      <section className="glass-boost py-14">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid gap-5 sm:grid-cols-2">
            {airlineDealPages.map((deal) => (
              <article key={deal.iata} className="glass-panel rounded-2xl p-6 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <span className="glass-chip rounded-full px-2.5 py-1 data-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                    {tHome("official")}
                  </span>
                  <div className="glass-chip flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl">
                    <img
                      src={`https://images.kiwi.com/airlines/64/${deal.iata}.png`}
                      alt={deal.airline}
                      className="h-8 w-8 object-contain"
                      onError={(e) => {
                        const img = e.currentTarget;
                        img.onerror = null;
                        img.src = "/file.svg";
                      }}
                    />
                  </div>
                </div>

                <h2 className="mt-4 text-xl font-bold text-foreground">{deal.airline}</h2>
                <p className="mt-1 text-sm text-muted">{tHome(deal.descKey)}</p>

                <div className="mt-5 flex items-center justify-between gap-2 border-t border-dashed border-[var(--glass-border)] pt-4">
                  <span className="glass-chip data-mono rounded-md px-2.5 py-1 text-xs font-semibold text-foreground">
                    {deal.domain}
                  </span>
                  <span className="data-mono text-[11px] text-muted">
                    {t("popularRoute")}&ensp;{deal.route.from} → {deal.route.to}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <a
                    href={deal.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-sheen inline-flex items-center justify-center rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-white hover:bg-primary/90 transition"
                  >
                    {t("officialSite")}
                  </a>
                  <Link
                    href={`/booking?from=${deal.route.from}&to=${deal.route.to}`}
                    className="inline-flex items-center justify-center rounded-full border border-[var(--glass-border)] px-4 py-2.5 text-xs font-semibold text-foreground hover:border-[var(--contrail-300)] transition"
                  >
                    {t("searchCta")}
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Honesty note — how this page works, stated on the page itself. */}
          <div className="glass-panel mt-10 rounded-2xl p-6">
            <p className="data-mono text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--signal-600)" }}>
              {t("howTitle")}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>{t("how1")}</li>
              <li>{t("how2")}</li>
              <li>{t("how3")}</li>
            </ul>
          </div>
        </div>
      </section>
    </SubpageShell>
  );
}
