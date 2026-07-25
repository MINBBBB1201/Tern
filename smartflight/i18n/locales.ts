export const LOCALES = ["en", "ko", "ja", "zh"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "TERN_LOCALE";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ko: "한국어",
  ja: "日本語",
  zh: "简体中文",
};

/**
 * BCP-47 tags for Intl.* formatting (dates, weekdays, number grouping).
 * Anything user-visible that Intl formats must go through these, never a
 * hardcoded "en-US" — that was the leak that left English dates on the
 * booking page and the price-trend axis.
 */
export const LOCALE_TAGS: Record<Locale, string> = {
  en: "en-US",
  ko: "ko-KR",
  ja: "ja-JP",
  zh: "zh-CN",
};

export const localeTag = (locale: string | undefined | null) =>
  isLocale(locale) ? LOCALE_TAGS[locale] : LOCALE_TAGS[DEFAULT_LOCALE];

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}
