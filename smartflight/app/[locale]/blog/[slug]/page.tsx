import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { blogPosts, getBlogPost } from "../../../../lib/blogPosts";
import { alternatesFor, localeUrl, ogLocaleFor } from "../../../../lib/seo";
import { getAirportGuide } from "../../../../lib/airportGuides";
import BlogPostClient from "./BlogPostClient";

type Props = { params: Promise<{ slug: string; locale: string }> };

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  // Localized per the request's TERN_LOCALE cookie, like the rest of
  // the site chrome. Root layout's "%s | Tern" template appends the
  // suffix for `title`; og/twitter need it added explicitly.
  const t = await getTranslations({ locale, namespace: "BlogPage" });
  const title = t(post.titleKey);
  const description = t(post.excerptKey);
  const url = localeUrl(`/blog/${post.slug}`, locale);

  return {
    title,
    description,
    alternates: alternatesFor(`/blog/${post.slug}`, locale),
    openGraph: {
      title: `${title} | Tern`,
      description,
      url,
      type: "article",
      siteName: "Tern",
      ...ogLocaleFor(locale),
    },
    twitter: {
      card: "summary",
      title: `${title} | Tern`,
      description,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const t = await getTranslations("BlogPage");
  const url = `https://www.flytern.site/blog/${post.slug}`;
  // Article structured data. datePublished is intentionally omitted — post
  // dates aren't tracked in the data, and the no-fake-data rule means we omit
  // the field rather than invent one. Author/publisher are the Tern org.
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: t(post.titleKey),
    description: t(post.excerptKey),
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: "Tern", url: "https://www.flytern.site" },
    publisher: {
      "@type": "Organization",
      name: "Tern",
      logo: {
        "@type": "ImageObject",
        url: "https://www.flytern.site/logos/tern-logo-purepick.png",
      },
    },
  };

  // Airport posts reshape the localized guide data. Resolved here, in the
  // server component, so the client bundle never pulls in every locale's
  // guide bodies (see lib/airportGuides.ts).
  const guide = post.kind === "airport" ? getAirportGuide(post.iata, await getLocale()) : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <BlogPostClient slug={slug} guide={guide} />
    </>
  );
}
