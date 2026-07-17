"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { AuthMenu } from "./AuthMenu";
import { SiteFooter } from "./SiteFooter";

/**
 * Shared chrome for content subpages (/deals, /blog, /about, /support):
 * the homepage's two-state glass nav, a Civil Twilight night band with
 * the star texture for the page header, light content below, and the
 * grouped SiteFooter — so subpages read as the same site as the hero,
 * not bolted-on extras.
 */
export function SubpageShell({
  kicker,
  title,
  intro,
  children,
}: {
  kicker: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  const tNav = useTranslations("Nav");
  // Same nav behavior as the homepage: dark glass while over the night
  // band, light glass once scrolled onto light content.
  const [overBand, setOverBand] = useState(true);
  useEffect(() => {
    const onScroll = () => setOverBand(window.scrollY < 180);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm font-medium transition ${overBand ? "text-white/70 hover:text-[var(--contrail-300)]" : "text-muted hover:text-primary-hover"}`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--paper-50)" }}>
      <nav className={`fixed top-0 left-0 right-0 z-50 ${overBand ? "glass-nav-dark" : "glass-nav"}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label={tNav("home")}>
            <span className="relative block h-10 w-36 overflow-hidden md:h-11 md:w-44">
              <Image
                src="/logos/tern-logo-purepick.png"
                alt="Tern"
                fill
                className={`object-cover object-center transition ${overBand ? "brightness-0 invert" : ""}`}
                sizes="176px"
                priority
              />
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {navLink("/", tNav("home"))}
            {navLink("/booking", tNav("booking"))}
            {navLink("/deals", tNav("deals"))}
            {navLink("/blog", tNav("blog"))}
          </div>
          <div className="flex items-center gap-4">
            <LocaleSwitcher dark={overBand} />
            <AuthMenu dark={overBand} />
          </div>
        </div>
      </nav>

      {/* Night band — the hero's sky, condensed into a page header. */}
      <header
        className="relative overflow-hidden pt-32 pb-16"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 110%, rgba(242,147,77,0.14) 0%, transparent 60%), linear-gradient(180deg, var(--ink-900) 0%, var(--dusk-700) 100%)",
        }}
      >
        <div className="hero-stars" aria-hidden="true" />
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <span className="section-kicker" style={{ color: "var(--contrail-300)" }}>{kicker}</span>
          <h1 className="hero-headline text-4xl md:text-5xl font-bold text-[#F6F8FB]">{title}</h1>
          {intro && (
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed" style={{ color: "rgba(246,248,251,0.7)" }}>
              {intro}
            </p>
          )}
        </div>
        {/* Horizon hairline — the band ends the way the hero's night does. */}
        <div
          className="absolute inset-x-0 bottom-0 h-px"
          aria-hidden="true"
          style={{ background: "linear-gradient(90deg, transparent, rgba(143,224,232,0.45), transparent)" }}
        />
      </header>

      <main className="flex-1">{children}</main>

      <SiteFooter />
    </div>
  );
}
