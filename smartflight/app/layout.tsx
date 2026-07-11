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
  title: "Tern ✈️",
  description: "Find the best flight deals with Tern",
  icons: {
    icon: "/logos/tern-logo-purepick.png",
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
