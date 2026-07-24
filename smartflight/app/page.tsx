import type { Metadata } from "next";
import HomeContent from "./HomeContent";

// The homepage's title/description/OG come from the root layout default
// (they are already the home copy); this route only adds its canonical.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Strictly factual structured data — no ratings, review counts, or other
// social-proof metrics (the project's no-fake-stats rule applies to
// schema.org too). Organization + WebSite are the two entity types Google
// uses for the knowledge panel / site name.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Tern",
  url: "https://www.flytern.site",
  logo: "https://www.flytern.site/logos/tern-logo-purepick.png",
  description:
    "Tern compares flights across price, speed, arrival time, delay risk, and points-vs-cash value, then books by cash or miles.",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Tern",
  url: "https://www.flytern.site",
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <HomeContent />
    </>
  );
}
