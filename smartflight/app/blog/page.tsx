"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { SubpageShell } from "../../components/SubpageShell";
import { blogPosts } from "../../lib/blogPosts";

export default function BlogIndexPage() {
  const t = useTranslations("BlogPage");

  return (
    <SubpageShell kicker={t("kicker")} title={t("title")} intro={t("intro")}>
      <section className="glass-boost py-14">
        <div className="max-w-4xl mx-auto px-6">
          <div className="space-y-4">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group glass-panel glass-row block rounded-2xl p-6 transition-transform duration-200 hover:-translate-y-0.5"
              >
                <span className="glass-chip rounded-full px-2.5 py-1 data-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                  {t(post.tagKey)}
                </span>
                <h2 className="mt-3 text-xl font-bold text-foreground leading-snug">{t(post.titleKey)}</h2>
                <p className="mt-1.5 text-sm text-muted">{t(post.excerptKey)}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--signal-600)" }}>
                  {t("readMore")}
                  <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SubpageShell>
  );
}
