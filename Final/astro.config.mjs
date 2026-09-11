import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
const env = loadEnv(process.env.NODE_ENV || 'production', process.cwd(), '');
export default defineConfig({
  site: process.env.SITE_URL || env.SITE_URL || 'http://localhost:4321',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
