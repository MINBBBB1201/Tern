import { defineRouting } from "next-intl/routing";
import { DEFAULT_LOCALE, LOCALES, LOCALE_COOKIE } from "./locales";

/**
 * I5: locale moved from a cookie-only signal to the URL path.
 *
 * Before this, TERN_LOCALE was the *only* way a locale reached the server, so
 * every crawler — which sends no cookie — saw an English-only site and the
 * four translated locales were unreachable from search. Now each locale has
 * its own crawlable URL.
 *
 * `localePrefix: "as-needed"` keeps English on the bare paths (/about) and
 * prefixes the rest (/ko/about), so no existing URL 404s or changes meaning.
 *
 * `localeDetection` stays ON deliberately: the Duffel Links session is minted
 * with `success_url = ${origin}/booking` (app/api/checkout-session), a
 * locale-less path we must not change (working agreement §3). Cookie
 * detection is what redirects that return leg back to /ko/booking with the
 * order_id query intact, so the affiliate URL keeps working untouched while
 * the user keeps their language.
 */
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "as-needed",
  localeCookie: { name: LOCALE_COOKIE },
});
