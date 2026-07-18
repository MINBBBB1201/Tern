import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { blogPosts, getBlogPost } from "../../../lib/blogPosts";
import BlogPostClient from "./BlogPostClient";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  // Localized per the request's TERN_LOCALE cookie, like the rest of
  // the site chrome. Root layout's "%s | Tern" template appends the
  // suffix for `title`; og/twitter need it added explicitly.
  const t = await getTranslations("BlogPage");
  const title = t(post.titleKey);
  const description = t(post.excerptKey);
  const url = `https://www.flytern.site/blog/${post.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | Tern`,
      description,
      url,
      type: "article",
      siteName: "Tern",
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
  if (!getBlogPost(slug)) notFound();
  return <BlogPostClient slug={slug} />;
}
