# Verification

Run from `Final` with Node.js 24:

```powershell
npm ci
npm run check
npm test
npm run test:build
npx --yes deno check supabase/functions/publisher/index.ts
npm run build:demo
```

The Deno command checks the actual Supabase function entry point. It downloads the checker through `npx` if needed; there is no dependency on a globally installed Deno.

## Automated checks

- Product validation rejects unsafe merchant schemes, embedded credentials, missing store links, invalid slugs, and incomplete public content.
- Recommendations exclude the current product and rank category/tag matches deterministically.
- PostgreSQL-compatible PGlite runs the core migration and checks anonymous/authenticated access, draft isolation, permanent slugs, versioning, queue uniqueness, and exclusive publisher leases.
- The HTTP handler rejects unauthenticated/ordinary-user requests before any network/database operation.
- Mocked Pinterest/deploy requests cover website-before-Pin ordering, image publishing, private video upload and processing, disclosure, duplicate prevention, rate limits, uncertain submission recovery, and environment gates.
- `test:build` builds production-shaped fixtures into ignored `test-results/`, verifies actual static merchant buttons, escaped text, canonical metadata, and version markers, checks the empty state, and confirms an API outage fails the build.

## Browser checks performed locally

Desktop (1440 px) and mobile (390 and 320 px): homepage, search, category filters, no-results reset, product pages, reload at a direct product URL, related picks, metadata, legal pages, and 404. Also checked URL-persisted searches/categories, category text search, tag links, light/dark preference persistence, the mobile menu and Escape key, bottom navigation, copying a product URL, and the manual copy fallback when clipboard access fails. Checked for page errors and horizontal overflow. Light, dark, desktop, and mobile screenshots were reviewed for layout and image/content alignment.

Browser automation uses a temporary Playwright script outside the project; it is not required by the build. `npm test` and `test:build` are the reusable repository checks.

The interactive pass additionally checks scroll reveal activation, reduced-motion changes, content visibility without JavaScript, local catalog chat results, safe rendering of HTML-like user messages, price FAQ replies, native dialog focus/Escape handling, mobile chat bounds, and the contact composer's draft-only status. No email was sent. The actual default mail app depends on the visitor's device configuration.

## Checks that need your connected accounts

Local Studio adds a PostgreSQL permission test for allowlisted editors, blocked ordinary accounts, media paths, protected tokens, immediate revocation, repeated migration application, and stale-revision rejection. Browser checks use mocked Supabase requests for login denial/success, image/video uploads, multiple stores, draft/published saves, queue status, concurrent-edit conflicts, logout, and narrow-screen layout. No real products or accounts were created by those checks. Run the new migration and verify an approved and an unapproved real account before giving collaborators access.

Local mocks do not prove a live integration. After setup, verify:

1. Supabase migrations, Storage policies, and public snapshot access against your hosted project.
2. The deployed publisher rejects a request without the invocation secret.
3. An owner edit triggers the chosen hosting deployment; the live version/page matches it.
4. OAuth against your own approved Pinterest app, one sandbox image Pin, and one sandbox video Pin.
5. Standard approval and a separate production connection before a real public Pin.
6. Actual store URLs contain your affiliate attribution and lead to matching products.
7. Provider quotas, token renewal, media sizes, and failures under your real network/account limits.

No live merchant prices, API approvals, cloud deployment, or actual Pinterest posting are claimed by these local tests.
