# Complete setup: follow these steps in order

**Using the local form on your PC or a friend's PC?** After steps 1–4, follow [LOCAL-STUDIO.md](LOCAL-STUDIO.md). It replaces manual product entry in steps 5 and 10. The owner still completes steps 6–9 once to enable automatic website updates and Pinterest posting.

The daily workflow after setup is: **upload your media → add one product row in Supabase → publish → website updates → Pinterest posts**. Media upload and store URLs are inputs; the title and description are entered once.

This project is ready to configure, not already connected or deployed. Do not post passwords or private keys into chat. Put each key only in the location specified below.

## 1. Choose your host

For your $0 budget, use **Cloudflare Workers Free**. This storefront renders from Supabase when each request arrives, so product edits do not wait for a static-site rebuild. Free Workers currently allow up to 100,000 requests a day; page rendering uses that daily allowance. [Cloudflare pricing](https://developers.cloudflare.com/workers/platform/pricing/)

You will also need a free Supabase account, a GitHub account, and a Pinterest business/developer account. Use your existing domain if you have one, or the host's included subdomain; buying a new domain costs extra.

## 2. Create a fresh Supabase project

1. Open https://supabase.com/dashboard and create a **Free** project. Choose a region near your audience and save the database password in your password manager.
2. Enable MFA for your Supabase owner account. Do not give visitors or collaborators your owner login.
3. Open **SQL Editor → New query**. Copy the complete contents of [202609080001_catalog.sql](supabase/migrations/202609080001_catalog.sql) and click **Run**.
4. Open another query, paste [202609080002_storage.sql](supabase/migrations/202609080002_storage.sql), and run it.
5. In **Table Editor**, confirm `products`, `catalog_state`, `pinterest_jobs`, and `pinterest_tokens` exist.
6. In **Storage**, confirm `product-images` is public and `product-videos` is private. Do not add public write policies.
7. From **Project Settings → API / API Keys** (or the Connect dialog), copy the project URL and **publishable key**. A legacy `anon` key also works for the website.

These migrations are run once on a fresh project. They intentionally do not insert fake products. The public site can read only the published catalog through `get_catalog`; public and ordinary authenticated users cannot edit products or read tokens. [Supabase key guidance](https://supabase.com/docs/guides/database/secure-data)

## 3. Prepare your GitHub repository

Recommended: create a **private, empty GitHub repository** for this new site. Use GitHub Desktop to add the `website` folder and publish it. Include the source files and `package-lock.json`.

Do not upload `node_modules`, `dist`, `.env`, `.env.functions`, `.env.publisher`, `.private`, or `test-results`. The included `.gitignore` excludes them. The `.example` files are safe templates.

If you publish the existing `Curated` repository instead, configure the hosting project's **Root Directory as `website`**. If the new repository contains only the contents of `website`, leave Root Directory at its default.

## 4. Deploy the real-time site on Cloudflare Workers Free

The old `curatedpick1.pages.dev` Pages site is a static snapshot. Keep it for now; create a Worker for the real-time site. The Worker URL will be different unless you connect a custom domain.

1. In Cloudflare, open **Workers & Pages ? Create application ? Workers Builds ? Connect to Git**.
2. Select `curatedpick1/curatedpick1`, branch `full-workspace`, and set the root directory to `website`.
3. Set the build command to `npm run build` and deploy command to `npx wrangler deploy`. The repository includes `wrangler.jsonc` with the Worker configuration.
4. Add build variables: `NODE_VERSION=24`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `DEMO_MODE=false`, `PUBLIC_CONTACT_EMAIL`, and `PUBLIC_PINTEREST_URL`.
5. Deploy. Cloudflare will show the real `https://...workers.dev` URL. Open it and check the home page, one product page, `/catalog-version.json`, and `/privacy/`.

New and edited products are read from Supabase on each page request. Open pages check the catalog every 30 seconds and reload when it changes. HTML and catalog responses are marked `no-store`; static images, styles, and fonts remain static assets. Cloudflare's free Workers allowance is 100,000 dynamic requests per day, shared with other Workers and Pages Functions on the account.

After the first deployment, use this Worker URL for `SITE_URL` in Step 6. If you own a custom domain, attach it to the Worker first and use that hostname instead. Update the Pinterest app's website and OAuth redirect URLs if its old `pages.dev` address was registered. Set the same `SITE_URL` in `website/.env.example` and rebuild the Windows installer so new Pins point to the Worker site.

## 5. Add your first real product

1. In Supabase **Storage → product-images**, upload a JPEG or PNG you are allowed to use. Keep it under 5 MB. Use its **public URL** for `poster_url`.
2. For a video Pin, also upload an MP4/MOV/M4V under **20 MB** to the private `product-videos` bucket. Keep a copy of your original on your computer. Note its storage path, for example `reading-lamp.mp4`. Upload a JPEG/PNG cover to `product-images`.
3. In **Table Editor → products → Insert row**, enter:

| Column | What you enter |
| --- | --- |
| `title` | Product title, up to 100 characters; this is also the Pin title |
| `slug` | Leave empty/null to generate a unique permanent URL |
| `description` | Useful product description, up to 440 characters; reused in the Pin with an affiliate disclosure added |
| `category` | For example `Home & living`, `Tech & desk`, `Kitchen & dining`, `On the go`, or `Style & essentials` |
| `tags` | An array such as `["lighting", "desk"]`; drives related recommendations |
| `poster_url` | Public image URL from Step 1 |
| `poster_alt` | A short description of the image |
| `stores` | JSON array of your matching merchant/affiliate links, shown below |
| `featured` | `true` if you want this product in the homepage spotlight; latest featured product wins |
| `published` | Start with `false` while editing; change to `true` once the product is complete |
| `publish_to_pinterest` | Keep `false` until Pinterest is connected |
| `pin_media_type` | `image` or `video` |
| `pin_image_url` | Optional image/cover for Pinterest; defaults to the website poster |
| `video_path` | For video only: private bucket path such as `reading-lamp.mp4` |
| `pinterest_board_id` | Leave empty until Step 8 gives you the numeric board ID |

Leave `id`, version fields, and dates at their defaults. Arrays in Supabase may be edited as JSON or with the array editor.

Example structure for `stores` — **replace the entire URLs with your own valid affiliate links**:

```json
[
  { "name": "Amazon", "url": "https://YOUR-ACTUAL-AMAZON-AFFILIATE-LINK.example" },
  { "name": "AliExpress", "url": "https://YOUR-ACTUAL-ALIEXPRESS-AFFILIATE-LINK.example", "note": "Check the exact variant and shipping" },
  { "name": "Alibaba", "url": "https://YOUR-ACTUAL-ALIBABA-LINK.example", "note": "Check minimum order quantity" }
]
```

These placeholders only illustrate the format. Collect links from each merchant's affiliate program; the code does not enroll you or add affiliate tracking automatically. Only offer stores carrying the matching product; variants and wholesale minimums can differ.

4. Save the row with `published=true`. It is available on the live site immediately after the real-time Worker has been deployed once.
5. Its URL is `https://YOUR-DOMAIN/products/THE-GENERATED-SLUG/`. Open it and test each store button.

## 6. Deploy the private publisher

Open a PowerShell terminal in `website`. The Supabase CLI runs through `npx`; Docker is not needed to deploy this hosted function.

```powershell
cd C:\Users\Stymite\Desktop\Curated\website
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REFERENCE
Copy-Item .env.functions.example .env.functions
```

The project reference is the first part of `https://YOUR_PROJECT_REFERENCE.supabase.co`. Enter your database password when prompted by the CLI. You already applied the SQL through the editor; **do not also run `db push` for the same migrations**.

Generate a random publisher secret locally:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Edit your private `.env.functions`:

- `SITE_URL`: exact public production website origin.
- `PUBLISHER_SECRET`: the generated 64-character value.
- Leave `PINTEREST_PUBLISHING_ENABLED=false`, `PINTEREST_STANDARD_ACCESS=false`, and `PINTEREST_API_ENV=sandbox` for now. The app ID/secret can wait until Step 8.

Then:

```powershell
npx supabase secrets set --env-file .env.functions
npx supabase functions deploy publisher --use-api
npx supabase functions deploy studio-generate --use-api
Copy-Item .env.publisher.example .env.publisher
```

For the app's **Suggest description, category & tags** button, create an API key in [Google AI Studio](https://aistudio.google.com/apikey), then add it in Supabase **Edge Functions â†’ Secrets** as `GEMINI_API_KEY`. Keep this key in Supabase only; never put it in the desktop app, `.env.example`, or Git. Gemini's free tier and availability vary by model, account, and region; check the active quota in AI Studio. Google's [unpaid API terms](https://ai.google.dev/gemini-api/terms) allow submitted content to be used to improve Google services and reviewed by humans, so don't submit confidential images. Suggestions use the title and poster image, and should be reviewed before publishing.

In private `.env.publisher`, set `SUPABASE_URL` and the same `PUBLISHER_SECRET`. Then run:

```powershell
npm run publisher:run
```

Expect `website_only` and `deployment: current`. The function checks the live Worker and the exact product page before it posts a Pin. If it reports `waiting`, confirm that the Worker is deployed and that `SITE_URL` points to it.

The function's JWT verification is intentionally disabled in its config: it instead requires the private `x-publisher-secret` header. Public site keys do not authorize publishing. Supabase injects its own service-role credentials into the function; never copy those into the website's hosting variables. [Function secrets](https://supabase.com/docs/guides/functions/secrets)

## 7. Schedule automatic Pin publishing

1. In Supabase **Database → Extensions**, enable **pg_cron** (Cron) and **pg_net**. Supabase Vault must also be available.
2. Open [supabase/schedule.sql](supabase/schedule.sql), copy its contents to the SQL Editor, and replace `YOUR-PROJECT` and `YOUR-RANDOM-PUBLISHER-SECRET` in that editor. Use the **same** secret from Step 6. Do not save a filled copy in Git.
3. Run it once. Confirm a job named `curated-publisher` appears in Cron and is active.
4. Edit a published product; the Worker serves the new data immediately. The publisher checks it on its next run. Check `catalog_state.last_error` if the Pin remains queued.

The job runs every five minutes. Site updates are immediate; Pinterest posting waits for the next scheduled check and any required image/video processing. Outages or queue load can delay posting. [Supabase scheduling](https://supabase.com/docs/guides/functions/schedule-functions)

## 8. Connect Pinterest privately

1. At https://developers.pinterest.com/ create/register your developer app under the business account you want to post from. Supply your deployed site and `https://YOUR-DOMAIN/privacy/`.
2. Register this exact OAuth redirect URL: **`https://YOUR-DOMAIN/pinterest-connect/`**, including the trailing slash.
3. Obtain the app's Trial access as required by Pinterest. Save its app ID and secret privately.
4. In `.env.publisher`, fill `PINTEREST_APP_ID`, `PINTEREST_APP_SECRET`, `PINTEREST_REDIRECT_URI`, `PINTEREST_API_ENV=sandbox`, and the legacy `SUPABASE_SERVICE_ROLE_KEY` from Supabase's private API Keys settings. The local connection script uses that key only to store tokens privately.
5. Run:

```powershell
npm run pinterest:connect
```

6. Open the authorization URL printed by the script. Log into your intended Pinterest account and approve the app. On the callback page, click **Copy connection response**, then paste it into the waiting terminal. Do not close the terminal during this process.
7. The script validates the response, stores tokens in the private `pinterest_tokens` table, and lists accessible boards with their numeric IDs. Set your product's `pinterest_board_id` to the intended board ID. Use a board available to the selected sandbox/production environment.
8. Add the same Pinterest app ID/secret to `.env.functions`, keep the API environment `sandbox`, set `PINTEREST_PUBLISHING_ENABLED=true`, and run `npx supabase secrets set --env-file .env.functions`.
9. Set `publish_to_pinterest=true` on the one product you want to test. A `pinterest_jobs` row should appear. The publisher checks the live page on its next five-minute run, then moves the job through pending/upload states to `published`. No website rebuild is needed.

The video file is uploaded first, then checked on a later tick before Pin creation. Image Pins do not need that upload stage. Photos/covers should be JPEG or PNG; a poster by itself cannot become a video. [Pinterest media flow](https://developer.pinterest.com/docs/work-with-organic-content-and-users/create-boards-and-pins/)

## 9. Get public posting approval and switch environments

**Sandbox/Trial Pins are not a public marketing launch.** Pinterest requires Standard access for publicly visible API-created Pins. Prepare the required recording demonstrating OAuth and the working integration, submit it in your developer app, and wait for approval. The private terminal OAuth flow is suitable for demonstrating a single-owner tool. [Pinterest access tiers](https://developer.pinterest.com/docs/key-concepts/access-tiers/)

After approval:

1. Set `PINTEREST_PUBLISHING_ENABLED=false` in function secrets while switching. Allow an in-flight run to finish.
2. Change `.env.publisher` to `PINTEREST_API_ENV=production` and run `npm run pinterest:connect` again. This stores production credentials and lists production board IDs.
3. Set the real production board IDs on your products. In `.env.functions` use `PINTEREST_API_ENV=production`, `PINTEREST_STANDARD_ACCESS=true`, and leave publishing disabled until ready.
4. If the same test product should get a public Pin, reset **only its sandbox job**, in SQL Editor:

```sql
update public.pinterest_jobs
set state='pending', pin_id=null, api_env=null, media_id=null, media_path=null,
    media_started_at=null, attempts=0, next_attempt_at=now(), last_error=null
where product_id='YOUR-PRODUCT-UUID' and api_env='sandbox';
```

5. Set `PINTEREST_PUBLISHING_ENABLED=true` and upload `.env.functions` again. Confirm the first actual public Pin on Pinterest, its correct video/image, destination page, and merchant buttons.

Until approval, you can use the site normally and manually publish Pins using each existing product page URL. There is no built-in browser automation workaround.

## 10. Your normal daily routine

1. Collect matching store affiliate links. Upload your licensed image/video once to Supabase Storage.
2. Add a **single** product row with title, description, poster, store links, category/tags, and Pinterest settings.
3. Set `published=true` and `publish_to_pinterest=true` after reviewing it.
4. The site reads the new product directly from Supabase. The publisher verifies the exact live page and creates one Pin; no rebuild is needed.
5. To change only the website image later, replace `poster_url` and `poster_alt`. The live page updates immediately; the existing Pin is left alone. A separate `pin_image_url` lets the initial Pin use a different image/cover.

Keep `published` products complete. New public products are rejected if they have no valid store links or poster. Published slugs cannot change, so old Pins keep working.

## Before sharing the live site

- Replace preview concepts with your own real, permissioned product content. Never use `build:demo` for the live affiliate deployment.
- Verify your public contact email, disclosure, and privacy text. Register/approve your site and social channels with each affiliate program as required.
- Add your custom domain to the host before changing `SITE_URL`; update the function origin and registered Pinterest redirect too. Reconnect OAuth after a redirect change.
- If claiming your website on Pinterest, put its verification token in `PUBLIC_PINTEREST_VERIFY` in hosting build variables and rebuild.
- Test with a phone: product URL → correct product → chosen merchant. No automatic redirect should occur.
- Read [OPERATIONS.md](OPERATIONS.md) for paused projects, failed jobs, backups, and editing behavior.

Prices are deliberately omitted. Neither Pinterest nor this code automatically discovers correct real-time prices across multiple merchants. Add an approved merchant API integration separately if that becomes worthwhile.
