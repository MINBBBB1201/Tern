# Search-engine verification & sitemap submission

The site renders Google/Bing site-verification `<meta>` tags **only when the
corresponding env vars are set** (see `app/layout.tsx` → `metadata.verification`).
Nothing is hardcoded, so no placeholder tags ship. Do this once per environment:

## 1. Google Search Console

1. Go to <https://search.google.com/search-console> and add a property.
   Use the **URL-prefix** property `https://www.flytern.site` (matches the
   canonical host used across the app).
2. Choose the **HTML tag** verification method. Google shows a tag like:
   `<meta name="google-site-verification" content="AbC123…" />`.
   Copy the **content value only** (`AbC123…`).
3. Set the env var wherever the site is deployed (and in `.env.local` for local):
   ```
   NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=AbC123…
   ```
4. **Redeploy** (the value is inlined at build time), then click **Verify** in
   Search Console.
5. In Search Console → **Sitemaps**, submit: `https://www.flytern.site/sitemap.xml`

## 2. Bing Webmaster Tools

1. Go to <https://www.bing.com/webmasters> and add the site
   `https://www.flytern.site`. (Tip: you can also **import from Google Search
   Console** once step 1 is done, which skips manual verification.)
2. If verifying manually, choose the **meta tag** option. Bing shows:
   `<meta name="msvalidate.01" content="XYZ789…" />`. Copy the **content value**.
3. Set the env var:
   ```
   NEXT_PUBLIC_BING_SITE_VERIFICATION=XYZ789…
   ```
4. **Redeploy**, then click **Verify** in Bing Webmaster Tools.
5. In Bing → **Sitemaps**, submit: `https://www.flytern.site/sitemap.xml`

## Notes

- Both vars are optional and independent — set one, both, or neither. When
  unset, no verification meta tag is emitted.
- `NEXT_PUBLIC_*` values are **public** (they appear in the page source). That's
  expected for verification codes — they are not secrets.
- The sitemap and robots files are already live and generated automatically:
  `/sitemap.xml` (36 URLs) and `/robots.txt` (points at the sitemap). The blog
  RSS feed is at `/blog/rss.xml`.
- This is groundwork only — **you** create the accounts, paste the codes, and
  hit Submit; the code just makes the tags appear when the codes are present.
