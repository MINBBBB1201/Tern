import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  /**
   * Everything except: Next internals, the API routes (JSON, no locale),
   * and the metadata/asset routes that must stay at fixed URLs — sitemap.xml,
   * robots.txt, the RSS feed, the search-engine verification file, and any
   * file with an extension (logos, OG images, favicons).
   */
  matcher: ["/((?!api|_next|_vercel|sitemap\\.xml|robots\\.txt|.*\\..*).*)"],
};
