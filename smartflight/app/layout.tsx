import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import GlobalCanvas from "../components/canvas/GlobalCanvas";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.flytern.site"),
  title: {
    default: "Tern — Compare Flights, Delay Risk & Points Value",
    template: "%s | Tern",
  },
  description: "Compare cheapest fares, fastest trips, earliest arrivals, AI-balanced picks, smart connection deals, and delay-risk signals — then book with points or cash in one flow.",
  icons: {
    icon: "/logos/tern-logo-purepick.png",
  },
  openGraph: {
    title: "Tern — Compare Flights, Delay Risk & Points Value",
    description: "Compare cheapest fares, fastest trips, earliest arrivals, AI-balanced picks, smart connection deals, and delay-risk signals — then book with points or cash in one flow.",
    url: "https://www.flytern.site",
    siteName: "Tern",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tern — Compare Flights, Delay Risk & Points Value",
    description: "Compare cheapest fares, fastest trips, earliest arrivals, AI-balanced picks, smart connection deals, and delay-risk signals — then book with points or cash in one flow.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
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
