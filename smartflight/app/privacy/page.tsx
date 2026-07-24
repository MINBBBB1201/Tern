import type { Metadata } from "next";
import { LegalPage } from "../../components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Tern handles your information: what stays on your device, what we don't collect, and the third-party services involved when you search and book flights.",
  alternates: { canonical: "/privacy" },
};

/* /privacy — Privacy Policy. Content + all four locales live in the
   PrivacyPage message namespace; LegalPage renders the shared chrome. */
export default function PrivacyPolicyPage() {
  return <LegalPage namespace="PrivacyPage" sections={7} />;
}
