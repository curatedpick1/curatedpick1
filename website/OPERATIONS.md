# Running the site after setup

## What happens when you save

Drafts stay private. Publishing a complete product makes it available on the live site immediately. A database trigger advances the catalog version and queues a Pin only when `publish_to_pinterest=true`.

The scheduled function reads the live `catalog-version.json` from the Cloudflare Worker and checks that the exact product ID/version is present in its rendered HTML. It then posts one image/video Pin. No deploy hook or website rebuild is involved.

Each run processes at most one ready Pin or one video upload stage. Product edits do not trigger site builds. Related products are ranked by shared category, then shared tags, with recent products filling remaining spaces. No tracking cookies or paid recommendation API are used.

## Edit, hide, or remove a product

- Change `poster_url`/`poster_alt` to change the website poster. This does not create or modify a Pinterest Pin.
- Change title, description, store links, category, or tags to update the live page immediately. Existing Pin text/media stay as they were; edit that Pin manually in Pinterest if necessary.
- Set `publish_to_pinterest=false` to stop a pending Pin. It does not delete already published Pins.
- Set `published=false` to remove the product page immediately. Old Pin links will then reach a 404, so normally keep useful product pages and update store links instead.
- Slugs become permanent after first publication, including after unpublishing. This protects existing links.
- Do not delete jobs to request ordinary edits: their Pin IDs prevent duplicate posting.
- Data changes are served on the next request and open catalog pages reload within 30 seconds. If Supabase is unavailable, dynamic pages may return an error until it recovers.

## Publishing states

Inspect **Supabase → Table Editor → pinterest_jobs**. No credentials are exposed on the public website.

| State | Meaning / action |
| --- | --- |
| `pending` | Waiting for the website version, next retry time, or its turn in the queue |
| `media_processing` | Video uploaded; a later run will check Pinterest's processing result |
| `creating` | Pin request is being sent; do not touch the row during this stage |
| `published` | Pin ID was saved successfully; `api_env` distinguishes sandbox from production |
| `cancelled` | Product was unpublished or automatic pinning was switched off before posting |
| `failed` | Invalid input, revoked authorization, repeated failures, or failed video processing; read `last_error` |
| `needs_review` | Pinterest may have accepted the Pin but its response was uncertain; inspect Pinterest before retrying |

Inspect **catalog_state** for catalog and live-site verification status:

- `revision`: current published catalog version.
- `requested_revision`: legacy field; no longer used by real-time publishing.
- `deployed_revision`: latest catalog revision verified on the live Worker.
- `last_error`: a concise failure message.
- `builds_today`: legacy field; product updates do not trigger site builds.

Cron invocation logs and Edge Function logs show run status. A Cron HTTP request being accepted does **not** by itself prove publishing succeeded; inspect the function response/jobs and the live site.

## Recover a failed job

First fix the reported problem. HTTP 400/422 usually needs a media/field correction. HTTP 401/403 can mean an expired/revoked connection, incorrect environment, or missing API permissions. Reconnect Pinterest when necessary.

For a definitely rejected job with **no Pin ID**, after fixing it:

```sql
update public.pinterest_jobs
set state='pending', attempts=0, next_attempt_at=now(), last_error=null
where product_id='YOUR-PRODUCT-UUID' and state='failed' and pin_id is null;
```

For a failed video, also set `media_id`, `media_path`, and `media_started_at` to null before retrying to force a fresh upload.

For `needs_review`, check the correct Pinterest account/board and environment first. If the Pin exists, record it:

```sql
update public.pinterest_jobs
set state='published', pin_id='THE-EXISTING-PIN-ID', last_error=null
where product_id='YOUR-PRODUCT-UUID' and state='needs_review';
```

If you have verified that Pinterest did **not** create it, reset that specific job to `pending`, set `attempts=0`, and `next_attempt_at=now()`. Never bulk-reset uncertain jobs or clear real Pin IDs. There is no claim of exactly-once delivery across Pinterest and the database; uncertain submissions deliberately require inspection.

## Stop automation

Set `PINTEREST_PUBLISHING_ENABLED=false` in private `.env.functions` and upload the secrets again to stop new Pin processing while keeping website updates. Already in-flight work may finish.

To stop the scheduler entirely:

```sql
select cron.unschedule('curated-publisher');
```

To replace the shared invocation secret, update it in Supabase function secrets, Supabase Vault, and your local `.env.publisher`. All three must match. Requests with missing/wrong secrets fail before accessing the database.

## Keep media and tokens working

Website images live in the public `product-images` bucket. Pinterest images/covers must be publicly retrievable; use JPEG/PNG. Changing a website poster does not change the media Pinterest has already stored. Do not delete an image the current site still uses.

Videos are staged in private `product-videos` storage. The publisher supports up to 20 MB per video to stay within the free function's memory/time budget. Prepare/compress longer videos on your computer. After confirmed successful Pin publication, you can delete its staged video if you retain the original backup and do not need to repost it. It is not needed by the website, which shows the poster.

The worker refreshes tokens when processing work if they are near expiry or have not been refreshed for a week. Continuous refresh tokens can still expire after prolonged inactivity or be revoked. Reconnect with the local script if that happens. Keep `.env.publisher` private and keep MFA enabled on the provider accounts. Tokens are stored in an RLS-protected private table accessible to the owner/service role, not in website JavaScript.

## Free limits and outages

Supabase Free currently includes a 500 MB database, 1 GB storage, and limited bandwidth/function usage; inactive projects may pause and automatic backups are not included. This site's real work is small at a few products a day, but video storage and image traffic can exhaust allowances. Do not assume unlimited free capacity or permanent uptime. [Supabase pricing](https://supabase.com/pricing)

Cloudflare Workers Free currently includes 100,000 dynamic requests per day, shared with Workers and Pages Functions. Static asset requests are free and unlimited. [Workers pricing and limits](https://developers.cloudflare.com/workers/platform/pricing/)

The Worker reads Supabase when rendering catalog pages. If Supabase pauses, catalog pages and publisher checks wait until it returns; static assets continue to be served.

## Backups

- Keep source code in your private GitHub repository.
- Regularly export `products` and `pinterest_jobs` from Supabase as CSV and save them outside the project. Back up original media separately.
- For a full schema/data backup, use Supabase's documented database dump process and secure the resulting files. A full dump can include private OAuth tokens: never publish or commit it.
- Restore product IDs and Pin IDs together; restoring only products and rebuilding an empty queue can create duplicate Pins.
- Reconnect Pinterest rather than distributing a copy of token rows across machines.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Local preview fails after copying `.env.example` | Replace its placeholder URLs/keys, or remove the unconfigured `.env` for demo development |
| Production build says catalog download failed | Migration exists, public key is correct, project is active; check `get_catalog` via SQL Editor |
| Website shows no products | At least one real product must have `published=true`; no demo data is seeded |
| Merchant buttons are missing in local demo | Intentional: samples are not real affiliate listings |
| Site does not reflect an edit | Confirm the new Cloudflare Worker is deployed, `SITE_URL` points to its live URL, and Supabase is active. Open `/catalog-version.json` and check `catalog_state.last_error`. |
| Pin remains pending | `published=true`, pinning enabled, live manifest/product version, a valid board, and correct token environment |
| Pin is visible only to you | Sandbox/Trial is not public posting; complete Standard approval and production connection |
| Publisher returns 401 | `PUBLISHER_SECRET` must match the invocation header/Vault; ordinary Supabase JWTs do not authorize this function |
| Publisher returns busy | Another run holds its 180-second lease; wait for it to finish/expire |
| Video processing times out | Inspect/replace the file, clear failed media fields, then retry the job |
| A new domain stops publishing | Update hosting `SITE_URL`, function `SITE_URL`, registered Pinterest redirect, and reconnect OAuth |

This setup reduces the public attack surface; it is not a guarantee against account compromise, merchant changes, platform moderation, or service outages. A middle page does not exempt affiliate content from Pinterest's rules.
