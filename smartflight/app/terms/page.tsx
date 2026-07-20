import { LegalPage } from "../../components/LegalPage";

/* /terms — Terms of Use. Content + all four locales live in the TermsPage
   message namespace; LegalPage renders the shared subpage chrome. */
export default function TermsOfUsePage() {
  return <LegalPage namespace="TermsPage" sections={7} />;
}
