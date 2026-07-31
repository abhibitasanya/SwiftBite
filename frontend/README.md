This is a [Next.js](https://nextjs.org) project configured for static export.

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Static Deployment

Build the site with:

```bash
npm run build
```

The exported static site is generated in the `out/` folder. Deploy the contents of that folder to any static host such as Netlify, GitHub Pages, Cloudflare Pages, or an S3-style bucket.

Keep these items in place for deployment:

- `src/app/page.tsx` for the landing page
- `src/app/layout.tsx` for metadata and document structure
- `src/app/manifest.ts` and `src/app/icon.svg` for PWA assets
- `src/components/auth-landing.tsx` for the client-side experience
- `public/` for any extra static files you add later

Set `NEXT_PUBLIC_API_BASE_URL` to the live backend URL before building or serving the site. The frontend talks to the backend from the browser, so a static host will not provide those APIs itself.
