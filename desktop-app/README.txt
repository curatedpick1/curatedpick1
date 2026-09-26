CURATED STUDIO — WINDOWS APP

Install distribution/Curated-Studio-Setup-1.4.0.exe, then open Curated Studio from your desktop or Start menu.
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
Pinterest still needs its account connection and publishing automation configured. After the one-time Worker migration, rebuild this installer with that Worker URL so product links point to the live site. Product changes appear on the Worker site without a website deployment.
Version 1.4 adds an optional product blog with headings, underlined notes, and centered product photos. Version 1.3 added Daraz, more categories, and required tags/category. It requires migration 202609260001_product_blog.sql after product-media migration 202609230004_product_media.sql. The publisher must also be deployed to the project's Supabase backend.

To run or rebuild from source, install Node.js 24. From the Curated folder, run:

  cd website
  npm ci
  cd ..\desktop-app
  npm ci
  npm start

To create a Windows installer instead of launching the developer app, run npm run dist from desktop-app.
The build uses the shared publishing form in website\studio and needs website\.private\studio-access.json.
The private installer includes catalog-editor access, but no Supabase service key or Pinterest secrets.
That private credential file is local and must never be pushed to GitHub.
