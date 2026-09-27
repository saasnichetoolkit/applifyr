# APPLIFYR 

Build a Next.js 14 (App Router) web application for APPLIFYR (applifyr.com) using Tailwind CSS, TypeScript, and Supabase.



BRAND DESIGN SYSTEM REQUIREMENTS:

- Primary Theme: Dark industrial aesthetic matching dark midnight navy (#0B1020).

- Accent Colors: Electric Indigo (#4F46E5) for primary CTAs and glowing cards, Aqua (#22D3EE) for badges/metrics, and Warm White (#F8FAFC) for text.

- Typography: Space Grotesk for headings, Inter for body text, JetBrains Mono for metrics/ratings.

- Tagline/Pillars: DISCOVER • AMPLIFY • DISTRIBUTE

- Hero Headline: "Discover apps worth using."

- Hero Subheadline: "APPLIFYR helps people find useful software faster—and helps great apps reach the right users."



PAGES TO BUILD:

1. Header Component:

   - APPLIFYR Logo (Radio tower beacon icon in Indigo/Aqua gradient).

   - Links: "Explore", "Categories", "For builders", "Sign in".

   - CTA Button: "Submit an app" (#4F46E5 styling).



2. Homepage (`app/page.tsx`):

   - Hero Section with dual CTA buttons: "Explore the directory →" and "Submit your app".

   - Metric Banner: Displaying "2,184+ Apps Indexed", "92% Verified", "48 Categories".

   - "Featured this week" Section: Grid of cards showing glowing Indigo borders, app logo, title, category pill, short tagline, and a metric score box (e.g. "9.2").

   - "Recent Submissions" Section: Paginated list/grid of indexed tools.



3. App Detail Page (`app/app/[slug]/page.tsx`):

   - Dynamic route fetching single app from Supabase by slug.

   - Includes full description, verified badge, score metric, "Visit Website ↗" outbound button with rel="nofollow sponsored".

   - Bottom banner: "Want to amplify your app? Get featured on APPLIFYR homepage."



4. Categories Hub (`app/category/[category]/page.tsx`):

   - Category filtering for 'productivity', 'finance', 'developer_tools', 'marketing_seo', 'design_creative', 'ai_tools'.



5. Dynamic Sitemap (`app/sitemap.ts`):

   - Programmatic sitemap querying Supabase for all active slugs.



Use @supabase/supabase-js with NEXT_PUBLIC_SUPABASE_URL a

nd NEXT_PUBLIC_SUPABASE_ANON_KEY.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fd9b1cd8-37c5-456c-95d4-bc62a70487f2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
