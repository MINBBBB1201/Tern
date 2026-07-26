/**
 * Localized country names for the airport dataset.
 *
 * I5-4 decision: the dataset's `country` field is an ISO 3166-1 alpha-2 code,
 * and CLDR publishes authoritative translations for those codes in every
 * locale we ship. `Intl.DisplayNames` reads exactly that table, so this is a
 * *verified published source*, not machine translation — which is what makes
 * it acceptable under working agreement §2-1 while translating the 7,917
 * airport names and 6,488 city names is not (no authoritative ko/ja/zh form
 * exists for a proper name like "New York Skyports Seaplane Base").
 *
 * Coverage measured against the real dataset: 235 of the 236 distinct codes
 * resolve in ko/ja/zh. The one miss is `KS`, which is not a valid ISO code —
 * the dataset uses it for Kosovo, whose ISO 3166-1 user-assigned code is
 * `XK`. That single documented correction is applied below; it is a code
 * fix, not an invented name.
 */

/** Dataset codes that aren't valid ISO 3166-1 alpha-2, mapped to the real one. */
const CODE_FIXUPS: Record<string, string> = {
  KS: "XK", // Kosovo — dataset uses a non-standard code
};

// Intl.DisplayNames construction is not free and the autocomplete renders
// eight rows per keystroke, so keep one instance per locale.
const cache = new Map<string, Intl.DisplayNames>();

function displayNames(locale: string): Intl.DisplayNames | null {
  const hit = cache.get(locale);
  if (hit) return hit;
  try {
    const dn = new Intl.DisplayNames([locale], { type: "region" });
    cache.set(locale, dn);
    return dn;
  } catch {
    // Unknown locale tag — fall back to the raw code rather than throwing
    // inside a render.
    return null;
  }
}

/**
 * ISO 3166-1 alpha-2 → localized country name. Returns the original code if
 * the locale or the code is unresolvable, so the UI degrades to something
 * true rather than blank.
 */
export function countryName(code: string | undefined, locale: string): string {
  if (!code) return "";
  const iso = CODE_FIXUPS[code] ?? code;
  const dn = displayNames(locale);
  if (!dn) return code;
  try {
    return dn.of(iso) ?? code;
  } catch {
    return code;
  }
}
