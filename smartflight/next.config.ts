import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    // Next 16 restricts <Image quality> to this allowlist (default [75]);
    // the tern logo renders at quality={100}.
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        // Airline logos in OfferCard / search API responses
        protocol: "https",
        hostname: "images.kiwi.com",
      },
      {
        // Weather condition icons in AirportWeatherChip
        protocol: "https",
        hostname: "openweathermap.org",
      },
    ],
  },
};

export default withNextIntl(nextConfig);