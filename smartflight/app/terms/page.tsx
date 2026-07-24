import type { Metadata } from "next";
import { LegalPage } from "../../components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The terms governing your use of Tern — the flight-comparison tools, the affiliate links out to airlines and booking partners, and what the service does and does not promise.",
  alternates: { canonical: "/terms" },
};

/* /terms — Terms of Use. Content + all four locales live in the TermsPage
   message namespace; LegalPage renders the shared subpage chrome. */
export default function TermsOfUsePage() {
  return <LegalPage namespace="TermsPage" sections={7} />;
}
