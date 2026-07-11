import Link from "next/link";
import { getAirportGuide } from "../../../../lib/airportGuides";

type Props = { params: Promise<{ iata: string }> };

export default async function AirportGuidePage({ params }: Props) {
  const { iata } = await params;
  const guide = getAirportGuide(iata);

  return (
    <main className="min-h-screen bg-[#F4F7FC] text-foreground">
      <header className="border-b border-[#e4ebf5] bg-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <Link href="/" className="text-sm font-semibold text-primary hover:underline">
            ← Home
          </Link>
          <span className="rounded-full bg-[#eff5ff] px-3 py-1 text-xs font-semibold text-[#2563eb]">
            Airport guide
          </span>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-5 py-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {guide.country ? `${guide.city}, ${guide.country}` : guide.city || "Travel"}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          {guide.name} ({guide.iata})
        </h1>
        <p className="mt-4 text-muted leading-relaxed">{guide.summary}</p>

        <section className="mt-10 rounded-2xl border border-[#e1eaf6] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">Terminals & airlines</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
            {guide.terminals.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>

        <section className="mt-6 rounded-2xl border border-[#e1eaf6] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">Before you depart</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
            {guide.beforeYouFly.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>

        <section className="mt-6 rounded-2xl border border-[#e1eaf6] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">After you land</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
            {guide.afterYouLand.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>

        <section id="accessibility" className="mt-6 rounded-2xl border border-[#e1eaf6] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">Accessibility & special assistance</h2>
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
                  className="rounded-full border border-[#dbe5f3] px-3 py-1.5 text-xs font-semibold text-primary hover:bg-[#f8fbff]"
                >
                  {l.label} ↗
                </a>
              ))}
            </div>
          )}
        </section>

        <h2 className="mt-12 text-xl font-bold">Ground transport</h2>
        <p className="mt-2 text-sm text-muted">
          Taxi vs bus vs rail depends on group size, luggage, and traffic. Always verify prices at official desks or trusted apps.
        </p>

        {(["taxi", "bus", "rail"] as const).map((mode) => {
          const block = guide.transit[mode];
          return (
            <section
              key={mode}
              className="mt-6 rounded-2xl border border-[#e1eaf6] bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-bold">{block.title}</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
                {block.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              {block.avoidScams.length > 0 && (
                <>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-amber-700">
                    Avoid common scams
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-amber-900/90">
                    {block.avoidScams.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </>
              )}
              {block.officialLinks && block.officialLinks.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {block.officialLinks.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-[#dbe5f3] px-3 py-1.5 text-xs font-semibold text-primary hover:bg-[#f8fbff]"
                    >
                      {l.label}
                    </a>
                  ))}
                </div>
              )}
            </section>
          );
        })}

        <p className="mt-10 text-xs text-muted">
          Information is for planning only. Always confirm schedules and fares with the airport and operators before travel.
        </p>
      </article>
    </main>
  );
}
