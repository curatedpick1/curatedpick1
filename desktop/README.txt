WINDOWS APP

Install release/Curated-Studio-Setup-1.0.0.exe, then open Curated Studio from your desktop.
Send that same installer to another Windows PC. Node.js and terminal commands are not needed.
This is an unsigned private build, so Windows may show an unknown-publisher notice.
Use Save on this PC for offline drafts. Unlock publishing with your existing admin passkey when online.
Both PCs publish to the same Supabase project. Drafts stay on the PC/app where you saved them.
Existing browser drafts stay in localhost; they are not automatically moved into the desktop app.
Pinterest still needs its account connection and publishing automation configured.

To rebuild (developer only): npm ci in Final, then npm ci and npm run dist in Final/desktop.
The installer includes only the form and public project settings, never publisher secrets or the passkey.
