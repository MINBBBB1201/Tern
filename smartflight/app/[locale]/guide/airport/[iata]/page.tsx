import type { Metadata } from "next";
import { Link } from "../../../../../i18n/navigation";
import { getTranslations } from "next-intl/server";
import { SiteFooter } from "../../../../../components/SiteFooter";
import { resolveAirportGuideOr404 } from "../../../../../lib/airportGuideAccess";
import { buildAirportUberLink } from "../../../../../lib/rideDeepLinks";
import { getAirport } from "../../../../../lib/airportData";
import { alternatesFor, localeUrl, ogLocaleFor } from "../../../../../lib/seo";

type Props = { params: Promise<{ iata: string; locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { iata, locale } = await params;
  // Resolves or 404s (I10) — called here too, not only in the page, so a
  // nonexistent code never gets metadata built for a page that will 404.
  const guide = resolveAirportGuideOr404(iata, locale);
  // The root layout's title template ("%s | Tern") appends the suffix
  // automatically for `title` below — don't add it again here, or it
  // renders as "... | Tern | Tern". openGraph/twitter titles aren't
  // templated, so they need it added explicitly.
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  const title = tMeta("guideTitle", { name: guide.name, iata: guide.iata });
  const description =
    guide.summary || tMeta("guideDescriptionFallback", { name: guide.name, iata: guide.iata });
  const url = localeUrl(`/guide/airport/${guide.iata}`, locale);

  return {
    title,
    description,
    alternates: alternatesFor(`/guide/airport/${guide.iata}`, locale),
    openGraph: {
      title: `${title} | Tern`,
      description,
      url,
      type: "website",
      siteName: "Tern",
      ...ogLocaleFor(locale),
    },
    twitter: {
      card: "summary",
      title: `${title} | Tern`,
      description,
    },
  };
}

export default async function AirportGuidePage({ params }: Props) {
  const { iata, locale } = await params;
  const guide = resolveAirportGuideOr404(iata, locale);
  const coords = getAirport(guide.iata);
  const t = await getTranslations({ locale, namespace: "AirportGuide" });
  const tNav = await getTranslations({ locale, namespace: "Nav" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Airport",
    name: guide.name,
    iataCode: guide.iata,
    description: guide.summary,
    url: `https://www.flytern.site/guide/airport/${guide.iata}`,
    ...(coords
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: coords.lat,
            longitude: coords.lon,
          },
        }
      : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: guide.city,
      addressCountry: guide.country,
    },
  };

  // BreadcrumbList: Home → this airport guide. Factual trail only (there is
  // no /guide index route to sit between them).
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: tNav("home"), item: "https://www.flytern.site" },
      {
        "@type": "ListItem",
        position: 2,
        // Localized name + code only; the English "Airport Guide" suffix that
        // used to be appended here didn't follow the page's language.
        name: `${guide.name} (${guide.iata})`,
        item: `https://www.flytern.site/guide/airport/${guide.iata}`,
      },
    ],
  };

  return (
    <main
      className="night-tail min-h-screen text-foreground"
      style={{
        /* Same continuous dark tone track as the F2 subpages. */
        background:
          "linear-gradient(180deg, var(--dusk-700) 0%, #131E3C 40%, #101A36 72%, var(--dusk-700) 100%)",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <header className="glass-nav-dark border-b border-[var(--glass-border)]">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <Link href="/" className="text-sm font-semibold text-[var(--contrail-300)] hover:underline">
            {t("backHome")}
          </Link>
          <span className="glass-chip rounded-full px-3 py-1 text-xs font-semibold text-[var(--contrail-300)]">
            {t("badge")}
          </span>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-5 py-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {guide.country ? `${guide.city}, ${guide.country}` : guide.city || t("badge")}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          {guide.name} ({guide.iata})
        </h1>
        <p className="mt-4 text-muted leading-relaxed">{guide.summary}</p>

        <section className="mt-10 glass-panel rounded-2xl p-6">
          <h2 className="text-lg font-bold">{t("terminals")}</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
            {guide.terminals.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>

        <section className="mt-6 glass-panel rounded-2xl p-6">
          <h2 className="text-lg font-bold">{t("beforeDepart")}</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
            {guide.beforeYouFly.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>

        <section className="mt-6 glass-panel rounded-2xl p-6">
          <h2 className="text-lg font-bold">{t("afterLand")}</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
            {guide.afterYouLand.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>

        <section id="accessibility" className="mt-6 glass-panel rounded-2xl p-6">
          <h2 className="text-lg font-bold">{t("accessibilityTitle")}</h2>
          <p className="mt-2 text-sm text-muted leading-relaxed">{guide.accessibility.summary}</p>
          <ul className="mt-4 space-y-3">
            {guide.accessibility.services.map((s) => (
              <li key={s.label} className="text-sm">
                <span className="font-semibold">{s.label}</span>
                <span className="text-muted"> — {s.detail}</span>
              </li>
            ))}
          </ul>
          {guide.accessibility.officialLinks.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {guide.accessibility.officialLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[var(--glass-border)] px-3 py-1.5 text-xs font-semibold text-[var(--contrail-300)] hover:bg-white/5"
                >
                  {l.label} ↗
                </a>
              ))}
            </div>
          )}
        </section>

        {guide.floorGuide && guide.floorGuide.length > 0 && (
          <section className="mt-6 glass-panel rounded-2xl p-6">
            <h2 className="text-lg font-bold">{t("floorGuide")}</h2>
            <ul className="mt-3 space-y-2">
              {guide.floorGuide.map((f) => (
                <li key={f.floor} className="flex gap-3 text-sm">
                  <span className="data-mono w-32 shrink-0 font-semibold text-[var(--contrail-300)]">{f.floor}</span>
                  <span className="text-muted">{f.label}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {guide.transitTips && guide.transitTips.length > 0 && (
          <section className="mt-6 glass-panel rounded-2xl p-6">
            <h2 className="text-lg font-bold">{t("transitTitle")}</h2>
            <p className="mt-1 text-xs text-muted">{t("transitNote")}</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
              {guide.transitTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </section>
        )}

        <h2 className="mt-12 text-xl font-bold">{t("groundTitle")}</h2>
        <p className="mt-2 text-sm text-muted">{t("groundNote")}</p>

        {(["taxi", "bus", "rail"] as const).map((mode) => {
          const block = guide.transit[mode];
          const uberLink = mode === "taxi" ? buildAirportUberLink(guide.iata) : null;
          return (
            <section
              key={mode}
              className="mt-6 glass-panel rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold">{block.title}</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
                {block.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              {block.avoidScams.length > 0 && (
                <>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#fbbf24]">
                    {t("avoidScams")}
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-[rgba(252,211,77,0.9)]">
                    {block.avoidScams.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </>
              )}
              {uberLink && (
                <div className="mt-4">
                  <a
                    href={uberLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-black/70"
                  >
                    {t("uberCta")}
                  </a>
                  <p className="mt-1.5 text-[11px] text-muted">
                    {t("uberNote", { iata: guide.iata })}
                  </p>
                </div>
              )}
              {block.officialLinks && block.officialLinks.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {block.officialLinks.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-[var(--glass-border)] px-3 py-1.5 text-xs font-semibold text-[var(--contrail-300)] hover:bg-white/5"
                    >
                      {l.label}
                    </a>
                  ))}
                </div>
              )}
            </section>
          );
        })}

        <p className="mt-10 text-xs text-muted">{t("disclaimer")}</p>
      </article>
      <SiteFooter />
    </main>
  );
}
