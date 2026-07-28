import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "../../i18n/routing";
import { hasLocale } from "next-intl";
import GlobalCanvas from "../../components/canvas/GlobalCanvas";
import "../globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

// Title/description follow the request's TERN_LOCALE cookie, like the rest
// of the site — a Korean visitor should not get an English <title>.
type LayoutProps = { children: React.ReactNode; params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * I7: the site declared no theme-color at all, so mobile Safari fell back to
 * sampling the page itself for its toolbar tint — and flipped the bottom bar
 * between black and white while scrolling. Two things fed that: no declared
 * colour, and `body` still carrying the light `--color-background` token,
 * which shows through on rubber-band overscroll even though every page paints
 * a dark gradient over it (fixed in globals.css).
 *
 * One fixed value, not a light/dark media pair: every route is the same
 * ink→dusk dark (F1) — home, booking, guide, signin and not-found all render
 * an ink-based gradient — so a light variant would only ever be wrong.
 * #0A0F1E is --ink-900, the 0% stop of that gradient and therefore the colour
 * actually adjacent to the toolbar at the top and bottom of the document.
 */
export const viewport: Viewport = {
  themeColor: "#0A0F1E",
  colorScheme: "dark",
};

export async function generateMetadata({
  params,
}: Omit<LayoutProps, "children">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  const title = t("siteTitle");
  const description = t("siteDescription");

  return {
  metadataBase: new URL("https://www.flytern.site"),
  title: {
    default: title,
    template: "%s | Tern",
  },
  description,
  icons: {
    icon: "/logos/tern-logo-purepick.png",
  },
  openGraph: {
    title,
    description,
    url: "https://www.flytern.site",
    siteName: "Tern",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  // Search-engine site verification — rendered ONLY when the env vars are
  // set (no placeholder tags ship). Google emits <meta name="google-site-
  // verification">; Bing uses <meta name="msvalidate.01">. Setup steps and
  // the sitemap-submission flow are documented in docs/seo/verification.md.
  verification: {
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    }),
    ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION && {
      other: { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION },
    }),
  },
  };
}

export default async function RootLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  // An unknown prefix (/de/about) must 404 rather than silently render English.
  if (!hasLocale(routing.locales, locale)) notFound();
  // Opts this layout into static rendering for the locale segment.
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {/* Site-wide 3D layer — single WebGL context, all page Views render
              through it. Skipped under prefers-reduced-motion / low-power. */}
          <GlobalCanvas />
          {/* Site-wide ambient drift — atmosphere, frozen under prefers-reduced-motion */}
          <div className="ambient-drift" aria-hidden="true" />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
