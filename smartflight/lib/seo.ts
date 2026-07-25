import type { Metadata } from "next";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "../i18n/locales";

export const SITE_URL = "https://www.flytern.site";

/** BCP-47 tags for og:locale (underscored, per the Open Graph spec). */
const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  ko: "ko_KR",
  ja: "ja_JP",
  zh: "zh_CN",
};

/**
 * Absolute URL for a route in a given locale, matching the router's
 * `localePrefix: "as-needed"` — the default locale has no prefix.
 */
export function localeUrl(path: string, locale: string): string {
  const clean = path === "/" ? "" : path;
  return locale === DEFAULT_LOCALE
    ? `${SITE_URL}${clean}`
    : `${SITE_URL}/${locale}${clean}`;
}

/**
 * canonical + hreflang for one page.
 *
 * Every locale of a page cross-references every other, and `x-default` points
 * at the unprefixed (English) URL — that is what tells Google the four
 * translations are the same page rather than duplicate content, and it is the
 * half that was entirely missing before I5. `canonical` is self-referential
 * per locale: /ko/about must claim itself, not /about, or Google drops the
 * Korean version from the index.
 */
export function alternatesFor(path: string, locale: string): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[l] = localeUrl(path, l);
  languages["x-default"] = localeUrl(path, DEFAULT_LOCALE);

  return { canonical: localeUrl(path, locale), languages };
}

/** og:locale + og:locale:alternate for one page. */
export function ogLocaleFor(locale: string) {
  const current = OG_LOCALE[locale as Locale] ?? OG_LOCALE[DEFAULT_LOCALE];
  return {
    locale: current,
    alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
  };
}

/** The hreflang alternates a sitemap entry carries, keyed the way Next expects. */
export function sitemapAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[l] = localeUrl(path, l);
  return { languages };
}
