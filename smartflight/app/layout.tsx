import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
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
  description: "Tern에서 최적 항공권을 찾아보세요",
  icons: {
    icon: "/logos/tern-logo-purepick.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body>
        {/* Site-wide 3D layer — single WebGL context, all page Views render
            through it. Skipped under prefers-reduced-motion / low-power. */}
        <GlobalCanvas />
        {/* Site-wide ambient drift — atmosphere, frozen under prefers-reduced-motion */}
        <div className="ambient-drift" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
