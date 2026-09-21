WINDOWS APP

Install release/Curated-Studio-Setup-1.1.0.exe, then open Curated Studio from your desktop.
Send that same installer to another Windows PC. Node.js and terminal commands are not needed.
This is an unsigned private build, so Windows may show an unknown-publisher notice.
Open the app and publish. No password, signup or settings are needed.
Anyone with this configured installer can add and edit products. Share it only with your admins.
Use Save on this PC for offline drafts, then Publish when online.
Both PCs publish to the same Supabase project. Drafts stay on the PC/app where you saved them.
Existing browser drafts stay in localhost; they are not automatically moved into the desktop app.
Pinterest still needs its account connection and publishing automation configured.

To rebuild (developer only): npm ci in Final, then npm ci and npm run dist in Final/desktop.
The private installer includes catalog-editor access, but no Supabase service key or Pinterest secrets.
The build needs the owner's ignored .private/studio-access.json file; it is never pushed to GitHub.
