import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

/**
 * I5: the locale now comes from the URL segment the middleware resolved, not
 * from the TERN_LOCALE cookie directly. The cookie still exists — the
 * middleware reads it to decide which prefix a returning visitor lands on,
 * which is what keeps the Duffel return leg (`/booking` → `/ko/booking`) in
 * the user's language — but it is no longer the source of truth for
 * rendering. That switch is the point of the round: crawlers send no cookie,
 * so a cookie-sourced locale meant crawlers only ever saw English.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
