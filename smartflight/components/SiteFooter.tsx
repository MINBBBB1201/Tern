"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

/**
 * Site-wide footer — returns every page to the hero's night sky so the
 * site ends where it began. Link groups follow the major-travel-site
 * convention: Company / Support / Explore.
 */
export function SiteFooter() {
  const t = useTranslations("Footer");
  const tHome = useTranslations("Home");

  const groups: { heading: string; links: { label: string; href: string }[] }[] = [
    {
      heading: t("company"),
      links: [
        { label: t("about"), href: "/about" },
        { label: t("whyTern"), href: "/about#name" },
      ],
    },
    {
      heading: t("support"),
      links: [{ label: t("helpFaq"), href: "/support" }],
    },
    {
      heading: t("explore"),
      links: [
        { label: t("deals"), href: "/deals" },
        { label: t("blog"), href: "/blog" },
        { label: t("booking"), href: "/booking" },
      ],
    },
  ];

  return (
    <footer
      className="py-14"
      style={{
        background: "linear-gradient(180deg, var(--dusk-700) 0%, var(--ink-900) 100%)",
        borderTop: "1px solid rgba(143,224,232,0.18)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-block" aria-label="Tern">
              <span className="relative block h-9 w-32 overflow-hidden md:h-10 md:w-40">
                <Image
                  src="/logos/tern-logo-purepick.png"
                  alt="Tern"
                  fill
                  className="object-cover object-center brightness-0 invert"
                  sizes="160px"
                />
              </span>
            </Link>
            <p className="mt-3 text-sm" style={{ color: "rgba(246,248,251,0.55)" }}>
              {t("tagline")}
            </p>
          </div>

          {groups.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <p className="data-mono text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: "rgba(143,224,232,0.7)" }}>
                {group.heading}
              </p>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-[var(--contrail-300)]"
                      style={{ color: "rgba(246,248,251,0.75)" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 border-t pt-6" style={{ borderColor: "rgba(143,224,232,0.14)" }}>
          <p className="text-sm" style={{ color: "rgba(246,248,251,0.55)" }}>
            {tHome("footerRights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
