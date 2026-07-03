import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
