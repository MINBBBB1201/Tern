import { notFound } from "next/navigation";

/**
 * I9: the route that makes the branded 404 reachable.
 *
 * app/[locale]/not-found.tsx has existed since F-series and is fully
 * localized, but nothing ever rendered it: per Next's not-found convention a
 * `not-found.js` only fires when `notFound()` is thrown *inside its segment*,
 * while genuinely unmatched URLs fall through to the root `app/not-found.js`.
 * This project has no root `app/` layout — `app/[locale]/layout.tsx` is the
 * root — so that fallback did not exist and every bad URL got Next's built-in
 * white error page instead (no stylesheet, no theme-color, `background:#fff`).
 *
 * A catch-all page that does nothing but call `notFound()` turns "unmatched"
 * back into "thrown inside [locale]", which is the one thing `not-found.tsx`
 * does respond to. Because it sits under `[locale]`, the existing layout,
 * fonts and messages all apply, so the 404 comes out in the request's
 * language for free.
 *
 * Deliberately NOT `global-not-found.tsx` (the other option in Next 16, whose
 * docs name this exact "root layout is a dynamic segment" case): that one is
 * still experimental, bypasses layout rendering so global styles and fonts
 * must be re-imported by hand, and — being global — has no locale segment to
 * translate from. This route needs no experimental flag and reuses the page
 * that was already designed and translated.
 *
 * Catch-alls are the lowest-priority match in the App Router, so every real
 * route still wins; that is verified rather than assumed (I8-1).
 */
export default function CatchAllNotFound(): never {
  notFound();
}
