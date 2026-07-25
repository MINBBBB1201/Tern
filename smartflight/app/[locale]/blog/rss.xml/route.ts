import { blogPosts } from "../../../lib/blogPosts";
import messages from "../../../messages/en.json";

// Static — the feed only changes when a post is added to blogPosts.
export const dynamic = "force-static";

const BASE = "https://www.flytern.site";
const blog = messages.BlogPage as Record<string, string>;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const items = blogPosts
    .map((p) => {
      const link = `${BASE}/blog/${p.slug}`;
      // No per-post <pubDate>: post dates aren't tracked in the data, and the
      // no-fake-data rule means we omit rather than invent one.
      return `    <item>
      <title>${escapeXml(blog[p.titleKey])}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(blog[p.excerptKey])}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Tern — Guides &amp; Notes</title>
    <link>${BASE}/blog</link>
    <atom:link href="${BASE}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <description>Airport layover guides, points-and-miles explainers, and product notes from Tern.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
