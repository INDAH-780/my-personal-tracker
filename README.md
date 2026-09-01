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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Automated scholarship discovery

The app includes a protected Vercel cron route at `/api/automation/scholarships`. It runs daily at 06:00 UTC, uses Tavily basic search and Gemini extraction to find global Master's, PhD, and AI-focused MBA scholarships, and creates or refreshes matching `WISHLIST` records for the configured user.

The search focuses on computer engineering, electrical engineering, robotics, AI and machine learning, embedded systems, TinyML, and ML systems. It searches both named scholarship programmes and funding hidden inside university graduate-school, department, fellowship, assistantship, studentship, and financial-aid pages. Dedicated searches cover all eight Ivy League universities. Automatically discovered records use a stable fingerprint so later runs update them instead of creating duplicates.

Configure the variables documented in `.env.example` in Vercel, then apply the Prisma schema change to the production database:

```bash
npx prisma db push
```

The cron route requires Vercel's `Authorization: Bearer <CRON_SECRET>` header. It can also be triggered manually with the same header:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://your-domain.example/api/automation/scholarships
```
