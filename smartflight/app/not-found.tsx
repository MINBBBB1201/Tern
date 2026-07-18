import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

/* Brand 404 — the full night sky, a tern glyph drifting off its
   contrail, and two real routes out. Minimal chrome on purpose: a 404
   is a dead end, so the page itself is the wayfinding. */
export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6"
      style={{
        background:
          "radial-gradient(ellipse 90% 55% at 50% 115%, rgba(242,147,77,0.22) 0%, transparent 60%), linear-gradient(180deg, var(--ink-900) 0%, var(--dusk-700) 100%)",
      }}
    >
      <div className="hero-stars" aria-hidden="true" />

      <Link href="/" aria-label="Tern" className="z-10" style={{ position: "absolute", left: 24, top: 20 }}>
        <span className="relative block h-10 w-36 overflow-hidden">
          <Image
            src="/logos/tern-logo-purepick.png"
            alt="Tern"
            fill
            className="object-cover object-center brightness-0 invert"
            sizes="144px"
          />
        </span>
      </Link>

      <div className="relative z-10 max-w-xl text-center">
        {/* A contrail that stops mid-sky, the tern already off it. */}
        <svg viewBox="0 0 260 60" className="mx-auto mb-8 h-14 w-64" fill="none" aria-hidden="true">
          <path
            d="M0 48 C 60 44, 110 34, 158 22"
            stroke="var(--contrail-300)"
            strokeWidth="1.5"
            strokeDasharray="6 7"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path d="M196 10 L236 4 L216 12 L212 22 L208 20 L210 13 Z" fill="var(--contrail-300)" />
        </svg>

        <p className="data-mono text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--contrail-300)" }}>
          {t("kicker")}
        </p>
        <h1 className="hero-headline mt-3 text-4xl font-bold text-[#F6F8FB] md:text-5xl">{t("title")}</h1>
        <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "rgba(246,248,251,0.7)" }}>
          {t("body")}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="btn-sheen inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            {t("ctaHome")}
          </Link>
          <Link
            href="/support"
            className="inline-flex items-center justify-center rounded-full border border-[var(--glass-border)] px-6 py-3 text-sm font-semibold text-[#F6F8FB] transition hover:border-[var(--contrail-300)]"
          >
            {t("ctaSupport")}
          </Link>
        </div>
      </div>
    </main>
  );
}
