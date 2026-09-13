# Local Studio: your new daily workflow

You already completed SETUP steps 1–4 using Cloudflare, GitHub, and Supabase. Keep that work. This local app replaces manually filling product rows in Supabase.

**Local form → Supabase → Cloudflare product page → Pinterest Pin.**

The form runs at **http://127.0.0.1:4333**, only on your own computer, on Windows or Linux. Friends can run their own copies against the same Supabase project. **Preparing and saving local drafts works without internet or a login. Uploading to Supabase and publishing require internet and an approved editor login.** Each approved editor can edit all shared products and queue Pins for the one connected Pinterest account; this is not a separate store/account per friend.

## 1. Enable editor access once

In Supabase SQL Editor, run [202609130003_local_editors.sql](supabase/migrations/202609130003_local_editors.sql). This is an additional migration after the first two you already ran. Do not rerun migrations 001 or 002 afterward.

This creates `catalog_editors` and grants approved users product editing and media uploads. Public visitors and ordinary authenticated accounts still cannot edit products. Editors cannot read Pinterest credentials, manage the editor allowlist, change permanent slugs, delete products, or invoke the private publisher. To hide a product, they can unpublish it. Access is enforced by Supabase, not by the fact that the UI is local.

## 2. Create a login for yourself

1. In Supabase, open **Authentication → Users → Add user → Create new user**.
2. Create a user with an email and strong password. Confirm the email via the dashboard option if available; this account is for the publishing tool, not your Supabase dashboard login.
3. Copy that user's UUID.
4. In **Table Editor → catalog_editors**, add a row with `user_id` set to that UUID. Leave `label` blank and the date at its default. No display name is needed.

Set your chosen editor password in Supabase when creating the account; the local app does not embed a shared password. Repeat with a separate account/UUID for each friend. Share each person's credentials privately and let them choose their own password using your chosen account management process. Never distribute your Supabase owner login, service-role key, or Pinterest app secret. Deleting a person's `catalog_editors` row immediately removes their database editing rights, including for an already signed-in session.

## 3. Run it on your PC

Install Node.js 24 if needed. In a terminal:

```powershell
cd C:\Users\Stymite\Desktop\Curated\Final
npm ci
npm run studio
```

Daily shortcut: double-click **Start Studio.cmd** on Windows. It installs missing dependencies on first launch, starts the server in the background, and opens **http://127.0.0.1:4333**. Reopening it reuses the running server. You do not need to keep a terminal open. If using the manual `npm run studio` command instead, keep its terminal open.

On Linux, run **Start Studio.sh**. Your file manager may require Properties → Permissions → Allow executing as a program, then Run / Run in Terminal. It starts the server and opens the browser, installing missing dependencies on first launch. The manual `npm ci` / `npm run studio` commands also work. Install dependencies once while online; afterward the local server can start without internet.

The product form opens immediately, without a password or Supabase setup. Use **Save on this PC** before closing the tab. Your draft appears under **On this PC**, ready to reopen later. This saves the selected image/video bytes too, so the original file does not need to stay in its original folder. Incomplete forms can be saved locally.

Use the same browser profile and the exact `http://127.0.0.1:4333` address each time. Drafts live in that browser's IndexedDB, not in your source folder or Supabase. Your friend cannot see them yet. Clearing browser site data, using a private window, or losing that browser profile can remove local drafts. Files referenced only by an online URL are not downloaded for offline use; choose local files for offline previews.

Click **Unlock publishing**, open **One-time settings**, and enter your editor email once, along with:

| Setting | Your value |
| --- | --- |
| Supabase project URL | The same URL used in Cloudflare |
| Publishable key | The same `sb_publishable_...` key used in Cloudflare |
| Public website URL | `https://curatedpick1.pages.dev` (confirm this matches the deployed site) |

Click **Save settings**. Daily unlocking now asks for only your editor password; the account email and public connection settings are remembered in your browser. Passwords and auth tokens are not stored by the app; a reload requires signing in again to access Supabase. Local drafts still open without signing in. Your browser's password manager is separate. Anyone using this same browser profile can open its local drafts.

Optionally copy [.env.studio.example](.env.studio.example) to `.env.studio` and fill those same public defaults. The server also reads public defaults from `.env` and `.env.example` if present. `.env.studio` is ignored by Git. No private backend key is needed by the local app.

## 4. Give a friend the app

Give them a copy of the project's source or repository access. Since the `curatedpick1/curatedpick1` repository contains this project's files directly at its root, their terminal should open that folder (there is no nested `Final` there).

They install Node.js 24, run `npm ci`, then `npm run studio`, open the same localhost address on their own PC, enter the same public connection settings, and use their own editor account. Copy source files only; do not send your `.env.publisher`, `.env.functions`, or other secret files. All editors share the catalog. If two people edit a product concurrently, a stale save is rejected rather than silently overwriting the other edit.

## 5. Use the product form

1. Click **New product** and enter title, description, category, and tags.
2. Choose a website poster and describe the image. Selecting a file keeps it in the form; it does not upload anything yet.
3. Add the matching store names and your full affiliate URLs.
4. Choose image/video, supply a board ID, and check **Post to Pinterest** if desired. Choose a video and optional separate cover for a video Pin. Website images can be JPG/PNG/WebP; Pinterest covers should be JPG/PNG.
5. **Save on this PC** saves an offline draft with its selected files. **Save to Supabase draft** uploads files and creates a shared draft, keeping it off the public website. **Publish product** uploads files, saves the product as public in Supabase, and queues its Pin if selected. If you are signed out, your draft is saved locally first and the sign-in form opens. After signing in, click the desired save/publish button again. Reconnecting to the internet does not publish anything automatically.
6. Copy the generated permanent URL. It becomes reachable after Cloudflare rebuilds.

The main form shows title, description, Pin format/board, poster, image description, video when selected, and affiliate links. Category/tags, media URLs and homepage featuring are under **Optional details & existing media**. Shared drafts, deletion and detailed publishing status are under **More actions & publishing status**. The last board ID entered is remembered for new products.

Status distinguishes draft/published database rows from a verified website deployment and actual Pinterest job states. “Credentials saved” does not prove the scheduled publisher is running or that Pinterest has granted production access. Click **Refresh** to see current progress. No automatic retry is offered for uncertain Pin submissions; use the recovery guidance in [OPERATIONS.md](OPERATIONS.md).

Before an online save, the app saves a local recovery draft. A successful save removes that local draft. A failed upload/save keeps it for retry, including local file copies. A lost response on a new product save is recovered using the same product ID, even after reopening the browser; it does not create a second product. If that product already exists, it opens the saved version and keeps your local draft for comparing any newer edits. Review those edits before deleting the local draft. Conflicting edits from another browser tab or another editor are rejected, preserving the current form.

**Delete local draft** removes only the copy on this PC, including its attached local files. It does not remove a Supabase product or Pin. Once you try saving a draft online, it is tied to that Supabase project to prevent accidentally uploading it to another project.

Uploads that already reached Supabase are not deleted when a form is abandoned. Replace files by uploading a new one; this preserves existing Pin media URLs. Remove unused media later through the owner's Supabase dashboard after verifying it is not in use.

## 6. Complete automatic publishing once, as the owner

You skipped the publisher and Pinterest setup. They are still needed for automatic posting:

- Complete **SETUP step 6**: deploy the private publisher and connect the Cloudflare deploy hook.
- Complete **step 7**: schedule it in Supabase. It continues running even when all local apps are closed.
- Complete **steps 8–9**: authorize the Pinterest account, test, and obtain/enable the required production access. Use the board IDs returned by that connection in the local form.
- You can skip the old manual product-entry step 5 and daily routine step 10; the form replaces those.

Until these are complete, you can create drafts and publish rows, but Cloudflare needs a manual deployment to show changes and queued Pins will not automatically post. A local app cannot bypass Pinterest authorization or access approval.

The app has no public route in the Astro site. `studio/` is source tooling and is not copied into the public `dist` output. Run `npm run studio` for publishing, and `npm run dev` for a local preview of the public storefront.
