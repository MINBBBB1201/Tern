This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/[locale]/page.tsx`. The page auto-updates as you edit the file.
(Routes live under `app/[locale]/` — the locale is a path segment; see the Deployment note below and `i18n/routing.ts`.)

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment

**Production is served by Vercel, deployed automatically from `main`.**

- `www.flytern.site` → Vercel (`*.vercel-dns-017.com`); the apex `flytern.site`
  308-redirects to `www`.
- There is **no deploy script and no `vercel.json`** — the Vercel GitHub
  integration is the whole pipeline. **Pushing to `origin/main` deploys.**
  There is no separate release step, so treat a push as going live.
- The app needs a Node runtime: it uses middleware (`middleware.ts`, locale
  routing), server-rendered routes and API routes. A static export would break
  all three — in particular the `/booking` → `/ko/booking` redirect that keeps
  the Duffel Links return leg in the user's language.

### Firebase is Auth-only

`.firebaserc` points at the `smartflight-70ae5` project, which is used for
**Firebase Authentication only**. Firebase Hosting is *not* part of the
pipeline: its site (`smartflight-70ae5.web.app`) still serves the default
"Welcome to Firebase Hosting" placeholder.

`firebase.json` used to declare a `hosting` block pointing at a placeholder
directory. It was removed — running `firebase deploy --only hosting` would
have published that placeholder, and would overwrite the real site if a custom
domain were ever attached to that Firebase site. **Do not add it back** unless
Firebase Hosting genuinely becomes a deploy target.
