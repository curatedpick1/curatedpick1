import { spawnSync } from 'node:child_process';
const result = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], {
  stdio: 'inherit', env: { ...process.env, DEMO_MODE: 'true', SITE_URL: 'https://preview.example.com' },
});
process.exit(result.status ?? 1);
