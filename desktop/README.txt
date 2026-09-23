WINDOWS APP

Install release/Curated-Studio-Setup-1.2.0.exe, then open Curated Studio from your desktop.
Send that same installer to another Windows PC. Node.js and terminal commands are not needed.
This is an unsigned private build, so Windows may show an unknown-publisher notice.
Open the app and publish. No password, signup or settings are needed.
Anyone with this configured installer can add and edit products. Share it only with your admins.
Use Save on this PC for offline drafts, then Publish when online.
Add photos and a video together. The app prepares both poster sizes; video-only uploads get an automatic poster.
The first photo is the poster. Choose Use as poster on another photo to change it.
Board ID is optional. Pinterest uses the configured default or the first available public account board.
The website shows all photos. Photo Pins use up to five; mixed uploads become a video Pin with the chosen poster.
Both PCs publish to the same Supabase project. Drafts stay on the PC/app where you saved them.
Existing browser drafts stay in localhost; they are not automatically moved into the desktop app.
Pinterest still needs its account connection and publishing automation configured.
Version 1.2 also needs migration 202609230004_product_media.sql and the updated publisher deployed to the project's Supabase backend.

To rebuild (developer only): npm ci in Final, then npm ci and npm run dist in Final/desktop.
The private installer includes catalog-editor access, but no Supabase service key or Pinterest secrets.
The build needs the owner's ignored .private/studio-access.json file; it is never pushed to GitHub.
