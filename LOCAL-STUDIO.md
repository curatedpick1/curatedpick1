# Local Studio: your new daily workflow

You already completed SETUP steps 1–4 using Cloudflare, GitHub, and Supabase. Keep that work. This local app replaces manually filling product rows in Supabase.

**Local form → Supabase → Cloudflare product page → Pinterest Pin.**

The form runs at **http://127.0.0.1:4333**, only on your own computer. Friends can run their own copies against the same Supabase project. Internet is required. Each approved editor can edit all products and queue Pins for the one connected Pinterest account; this is not a separate store/account per friend.

## 1. Enable editor access once

In Supabase SQL Editor, run [202609130003_local_editors.sql](supabase/migrations/202609130003_local_editors.sql). This is an additional migration after the first two you already ran. Do not rerun migrations 001 or 002 afterward.

This creates `catalog_editors` and grants approved users product editing and media uploads. Public visitors and ordinary authenticated accounts still cannot edit products. Editors cannot read Pinterest credentials, manage the editor allowlist, change permanent slugs, delete products, or invoke the private publisher. To hide a product, they can unpublish it. Access is enforced by Supabase, not by the fact that the UI is local.

## 2. Create a login for yourself

1. In Supabase, open **Authentication → Users → Add user → Create new user**.
2. Create a user with an email and strong password. Confirm the email via the dashboard option if available; this account is for the publishing tool, not your Supabase dashboard login.
3. Copy that user's UUID.
4. In **Table Editor → catalog_editors**, add a row with `user_id` set to that UUID and `label` set to a name such as `Owner`. Leave the date at its default.

Repeat with a separate account/UUID for each friend. Share each person's credentials privately and let them choose their own password using your chosen account management process. Never distribute your Supabase owner login, service-role key, or Pinterest app secret. Deleting a person's `catalog_editors` row immediately removes their database editing rights, including for an already signed-in session.

## 3. Run it on your PC

Install Node.js 24 if needed. In a terminal:

```powershell
cd C:\Users\Stymite\Desktop\Curated\Final
npm ci
npm run studio
```

Open **http://127.0.0.1:4333**. Keep the terminal open while using the app.

Open **Connection settings** on the login card and enter:

| Setting | Your value |
| --- | --- |
| Supabase project URL | The same URL used in Cloudflare |
| Publishable key | The same `sb_publishable_...` key used in Cloudflare |
| Public website URL | `https://curatedpick1.pages.dev` (confirm this matches the deployed site) |

Sign in with the editor account from step 2. These three public settings are remembered in your browser. Passwords and auth tokens are not stored by the app; a reload requires signing in again. Your browser's password manager is separate.

Optionally copy [.env.studio.example](.env.studio.example) to `.env.studio` and fill those same public defaults. The server also reads public defaults from `.env` and `.env.example` if present. `.env.studio` is ignored by Git. No private backend key is needed by the local app.

## 4. Give a friend the app

Give them a copy of the project's source or repository access. Since the `curatedpick1/curatedpick1` repository contains this project's files directly at its root, their terminal should open that folder (there is no nested `Final` there).

They install Node.js 24, run `npm ci`, then `npm run studio`, open the same localhost address on their own PC, enter the same public connection settings, and use their own editor account. Copy source files only; do not send your `.env.publisher`, `.env.functions`, or other secret files. All editors share the catalog. If two people edit a product concurrently, a stale save is rejected rather than silently overwriting the other edit.

## 5. Use the product form

1. Click **New product** and enter title, description, category, and tags.
2. Upload a website poster and describe the image. Uploads go directly to Supabase under your user ID.
3. Add the matching store names and your full affiliate URLs.
4. Choose image/video, supply a board ID, and check **Queue a Pin when published** if desired. Upload a video and optional separate cover for a video Pin. Website images can be JPG/PNG/WebP; Pinterest covers should be JPG/PNG.
5. **Save draft** keeps it off the public website. **Publish product** saves it as public in Supabase and queues its Pin if selected.
6. Copy the generated permanent URL. It becomes reachable after Cloudflare rebuilds.

Status distinguishes draft/published database rows from a verified website deployment and actual Pinterest job states. “Credentials saved” does not prove the scheduled publisher is running or that Pinterest has granted production access. Refresh status to see current progress. No automatic retry is offered for uncertain Pin submissions; use the recovery guidance in [OPERATIONS.md](OPERATIONS.md).

Uploads are not deleted when a form is abandoned. Replace files by uploading a new one; this preserves existing Pin media URLs. Remove unused media later through the owner's Supabase dashboard after verifying it is not in use.

## 6. Complete automatic publishing once, as the owner

You skipped the publisher and Pinterest setup. They are still needed for automatic posting:

- Complete **SETUP step 6**: deploy the private publisher and connect the Cloudflare deploy hook.
- Complete **step 7**: schedule it in Supabase. It continues running even when all local apps are closed.
- Complete **steps 8–9**: authorize the Pinterest account, test, and obtain/enable the required production access. Use the board IDs returned by that connection in the local form.
- You can skip the old manual product-entry step 5 and daily routine step 10; the form replaces those.

Until these are complete, you can create drafts and publish rows, but Cloudflare needs a manual deployment to show changes and queued Pins will not automatically post. A local app cannot bypass Pinterest authorization or access approval.

The app has no public route in the Astro site. `studio/` is source tooling and is not copied into the public `dist` output. Run `npm run studio` for publishing, and `npm run dev` for a local preview of the public storefront.
