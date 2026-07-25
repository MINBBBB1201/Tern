import { ImageResponse } from "next/og";
import { getBlogPost, blogPosts } from "../../../../lib/blogPosts";
import { ogCard, ogSize, ogContentType } from "../../../../lib/og";
import messages from "../../../../messages/en.json";

export const alt = "Tern — Guides & Notes";
export const size = ogSize;
export const contentType = ogContentType;

// Pre-generate one image per post at build time.
export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

// Share previews are language-agnostic — use the English titles (crawlers
// never send the locale cookie anyway).
const blog = messages.BlogPage as Record<string, string>;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  const title = post ? blog[post.titleKey] : "Guides & Notes";

  return new ImageResponse(ogCard({ kicker: "Guides & Notes", title }), { ...size });
}
