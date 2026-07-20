import { LegalPage } from "../../components/LegalPage";

/* /privacy — Privacy Policy. Content + all four locales live in the
   PrivacyPage message namespace; LegalPage renders the shared chrome. */
export default function PrivacyPolicyPage() {
  return <LegalPage namespace="PrivacyPage" sections={7} />;
}
