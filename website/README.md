# The Curated Pick — Website

A standalone affiliate discovery website. Add a product once in Supabase, publish its page, then automatically publish its image or video Pin. Visitors choose a store and can keep exploring related products.

This folder contains the public storefront, Supabase backend, and shared Studio form. The separate Windows desktop shell is in `../desktop-app`.

The interface uses the curated site's blue/teal palette, shopping-bag logo, compact cards, and mobile navigation. Scroll reveals, headline entrances, light/dark mode, and product sharing work locally. Motion respects reduced-motion preferences, and content remains visible without JavaScript. The earlier Vite version is kept in `../archive/legacy-vite` for reference.

The floating Curated assistant searches `/assistant-catalog.json`, generated from the same published Supabase catalog, and answers basic site questions. It is a local catalog helper, not Gemini or generative AI; there are no AI keys, fees, or chat messages sent to a server. The contact section and `/contact/` page open email drafts rather than submitting messages to a backend. Set `PUBLIC_CONTACT_EMAIL` when ready to deploy.

**Start with [the workspace guide](../README.md)** for the basic commands. Use [SETUP.md](SETUP.md) for the full Supabase, hosting, and Pinterest setup.

**Want a private product form on your computer?** With Node.js 24 installed, double-click **Start Studio.cmd** on Windows or run **Start Studio.sh** on Linux. It starts the local server and opens the browser; first launch installs missing dependencies. The form opens immediately. Use **Save on this PC** to keep unfinished products and selected photos/videos offline. Publishing uses one admin passkey; no username or settings appear on the login page. Follow [LOCAL-STUDIO.md](LOCAL-STUDIO.md) to enable the admin account. This local app connects to the same Supabase catalog and is separate from the public storefront.

## Preview the website on your computer

Use Node.js 24. In a terminal:

```powershell
cd C:\Users\Stymite\Desktop\Curated\website
npm ci
npm run dev
```

Open http://127.0.0.1:4321. Without Supabase credentials, development shows a clearly labelled sample collection. Samples have no active merchant links and are never inserted into your database. Product pages show disabled example store buttons so you can review the layout before connecting any accounts. Search, filters, related products, sharing, and themes work locally. No setup is needed to review the UI.

```powershell
npm run check
npm test
npm run test:build
npm run build:demo
```

`npm run build` is the real production build: it requires the public Supabase read key and real `SITE_URL`, and fails if the catalog cannot be fetched. It never silently replaces your products with demo data. `test:build` writes only to ignored `test-results/`.

## Included

- Static HTML product pages, search, categories, permanent URLs, and product image metadata.
- Multiple affiliate store buttons; related picks ranked by category and shared tags.
- Separate website posters, Pinterest images/video covers, and private video staging.
- Supabase schema, draft validation, private tables, public published-only snapshot, and storage rules.
- A scheduled publisher: deploy first, check the exact live product version, then post a Pin.
- OAuth connection script, rotating token storage, duplicate prevention, and failure recovery.
- Disclosure, privacy, about, 404, sitemap, and robots pages.
- Vercel configuration and Cloudflare Pages instructions. No paid AI API or automation subscription.

No accounts, public content editor, wishlist, reviews, checkout, analytics scripts, auto-redirects, fabricated prices, or live-price claims.

## Hosting choice

**Vercel Hobby does not cover an affiliate-link business.** Vercel identifies sites primarily for affiliate linking as commercial. Use Vercel Pro if you choose Vercel; use **Cloudflare Pages Free** to keep hosting at $0 within its limits. Both can build this static project unchanged. [Vercel fair-use rules](https://vercel.com/docs/limits/fair-use-guidelines)

## What still needs your accounts

The code and local tests are complete. Your Supabase project, hosting deployment, merchant affiliate URLs/media permissions, and Pinterest authorization must be configured by following the guide. Real Pinterest/API calls and cloud permissions cannot be verified without those accounts. Pinterest Standard approval is required before enabling public automatic posting.

Useful files:

| File | Purpose |
| --- | --- |
| [SETUP.md](SETUP.md) | Exact first-time steps and daily workflow |
| [OPERATIONS.md](OPERATIONS.md) | Job states, retries, editing, backups, and troubleshooting |
| [.env.example](.env.example) | Website build variables; no privileged keys |
| [.env.functions.example](.env.functions.example) | Private publisher settings |
| [.env.publisher.example](.env.publisher.example) | Private local OAuth/connection settings |
| [Supabase migrations](supabase/migrations/202609080001_catalog.sql) | Tables, validation, private access, and publishing queue |
| [Publisher](supabase/functions/_shared/publisher.ts) | Website-first image/video automation |
| [TESTING.md](TESTING.md) | Validation performed and remaining live checks |
