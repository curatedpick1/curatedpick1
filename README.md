# Curated workspace

This folder has two active projects:

- `website` â€” the storefront, Supabase backend, and shared publishing form.
- `desktop-app` â€” the Windows Electron app. It reuses the form from `website/studio`.

`archive/legacy-vite` contains the old website code for reference. Do not run it for the live site.

## Preview the website

Install Node.js 24 once. Open PowerShell in this `Curated` folder and run:

```powershell
cd .\website
npm ci
npm run dev
```

Open `http://127.0.0.1:4321`. The site runs on your PC. `npm ci` is needed once per computer, or again after dependencies change.

To open the local product form, double-click `website\Start Studio.cmd`. It checks for dependencies and launches the form at `http://127.0.0.1:4333`.

## Use the desktop app

For everyday use, install `desktop-app\distribution\Curated-Studio-Setup-1.2.0.exe` and open **Curated Studio** from the Start menu or desktop. The installed app needs no terminal or Node.js. It needs internet to publish; offline drafts stay on that PC.

## Clone this complete workspace

This complete version is on the `full-workspace` branch. Install Git LFS, then clone that branch so Git downloads the Windows installer too:

```powershell
git lfs install
git clone --branch full-workspace https://github.com/curatedpick1/curatedpick1.git
cd curatedpick1
git lfs pull
```

The repository is private because its Windows installer contains the shared editor access needed by the admins. Give repository access only to people you trust. Private setup files and backend secrets are not in the repository.

## Run or rebuild the desktop app from source

Install Node.js 24. In PowerShell opened in this `Curated` folder, run:

```powershell
cd .\website
npm ci
cd ..\desktop-app
npm ci
npm start
```

To create a Windows installer instead of launching the developer app, use `npm run dist` from `desktop-app`. The build needs the owner's private `website\.private\studio-access.json` and the public project settings in `website\.env.example`. The committed desktop assets/config.json contains only the Supabase URL, public publishable key, and site URL; it contains no backend secret.

## Website commands

Run these from `website`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Preview the storefront locally |
| `npm run studio` | Run the private product form in a browser |
| `npm run build` | Build the live website using its configured Supabase catalog |
| `npm run check` | Check website code |
| `npm run publisher:run` | Ask the Supabase publisher to process the queue now |
| `npm run pinterest:connect` | Connect the Pinterest account after app approval and local setup |

Full account and deployment setup is in [website/SETUP.md](website/SETUP.md). The local organization does not change the production site or its appearance.
