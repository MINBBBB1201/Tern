"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import { SubpageShell } from "../../../components/SubpageShell";
import { getBlogPost } from "../../../lib/blogPosts";
import { getAirportGuide } from "../../../lib/airportGuides";

const Card = ({ children }: { children: React.ReactNode }) => (
  <section className="glass-panel rounded-2xl p-6">{children}</section>
);

const CardHeading = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lg font-bold text-foreground">{children}</h2>
);

const Bullets = ({ items }: { items: readonly string[] }) => (
  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
    {items.map((b) => (
      <li key={b}>{b}</li>
    ))}
  </ul>
);

export default function BlogPostClient({ slug }: { slug: string }) {
  const t = useTranslations("BlogPage");
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <SubpageShell kicker={t(post.tagKey)} title={t(post.titleKey)} intro={t(post.introKey)}>
      <article className="glass-boost py-14">
        <div className="max-w-3xl mx-auto px-6 space-y-5">
          {post.kind === "airport" && <AirportPostBody iata={post.iata} />}

          {post.kind === "points" && (
            <>
              <Card>
                <p className="text-sm leading-relaxed text-muted">{t("pointsHow")}</p>
              </Card>
              <Card>
                <CardHeading>1 · 2 · 3</CardHeading>
                <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm text-muted">
                  <li>{t("pointsTip1")}</li>
                  <li>{t("pointsTip2")}</li>
                  <li>{t("pointsTip3")}</li>
                </ol>
              </Card>
            </>
          )}

          {post.kind === "product" && (
            <div className="space-y-4">
              {(["Cheapest", "Fastest", "Earliest", "AI", "Delay"] as const).map((k) => (
                <Card key={k}>
                  <p className="data-mono text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--signal-600)" }}>
                    {t(`rank${k}`)}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{t(`rank${k}Body`)}</p>
                </Card>
              ))}
            </div>
          )}

          <div className="pt-4">
            <Link href="/blog" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
              {t("backToList")}
            </Link>
          </div>
        </div>
      </article>
    </SubpageShell>
  );
}

/* Airport posts reshape the real guide data (English content — see the
   B6 residual note in docs/backlog.md) under localized headings. */
function AirportPostBody({ iata }: { iata: string }) {
  const t = useTranslations("BlogPage");
  const tGuide = useTranslations("AirportGuide");
  const guide = getAirportGuide(iata);

  return (
    <>
      <Card>
        <p className="text-sm leading-relaxed text-muted">{guide.summary}</p>
      </Card>

      <Card>
        <CardHeading>{tGuide("afterLand")}</CardHeading>
        <Bullets items={guide.afterYouLand} />
      </Card>

      {guide.transitTips && guide.transitTips.length > 0 && (
        <Card>
          <CardHeading>{tGuide("transitTitle")}</CardHeading>
          <p className="mt-1 text-xs text-muted">{tGuide("transitNote")}</p>
          <Bullets items={guide.transitTips} />
        </Card>
      )}

      <Card>
        <CardHeading>{tGuide("groundTitle")}</CardHeading>
        <div className="mt-4 space-y-5">
          {(["taxi", "bus", "rail"] as const).map((mode) => {
            const block = guide.transit[mode];
            return (
              <div key={mode}>
                <p className="text-sm font-semibold text-foreground">{block.title}</p>
                <Bullets items={block.bullets} />
              </div>
            );
          })}
        </div>
      </Card>

      <Link
        href={`/guide/airport/${iata}`}
        className="btn-sheen inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition"
      >
        {t("openGuide")}
      </Link>
    </>
  );
}
