"use client";

import { useLocale } from "next-intl";
import { useState, useTransition } from "react";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "../i18n/navigation";
import { LOCALES, LOCALE_LABELS, type Locale } from "../i18n/locales";

type LocaleSwitcherProps = {
  dark?: boolean;
};

export function LocaleSwitcher({ dark }: LocaleSwitcherProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSelect = (next: Locale) => {
    setOpen(false);
    if (next === locale) return;
    startTransition(() => {
      /* I5: switching language is a navigation now, not a cookie write — the
         locale lives in the URL. next-intl's usePathname returns the
         locale-stripped path, and `params` carries dynamic segments (the
         [iata] of an airport guide, the [slug] of a post) so the switch stays
         on the same page. next-intl also refreshes TERN_LOCALE, which is what
         the middleware later reads to keep the Duffel return leg in this
         language. */
      router.replace(
        // @ts-expect-error -- the {pathname, params} form is the documented
        // way to carry dynamic segments; pathnames aren't typed in this project.
        { pathname, params },
        { locale: next }
      );
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className={`flex items-center gap-1 text-sm transition ${
          dark ? "text-white/70 hover:text-white" : "text-muted hover:text-foreground"
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
        </svg>
        <span className="hidden sm:inline">{locale.toUpperCase()}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="glass-panel absolute right-0 top-full z-50 mt-2 min-w-[140px] overflow-hidden rounded-xl py-1">
            {LOCALES.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => handleSelect(code)}
                className={`block w-full px-4 py-2 text-left text-sm hover:bg-black/5 ${
                  code === locale ? "font-semibold text-primary-hover" : "text-foreground"
                }`}
              >
                {LOCALE_LABELS[code]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
