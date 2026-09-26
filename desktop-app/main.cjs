const {app, BrowserWindow, protocol, session, shell, dialog, Menu} = require('electron');
const {readFile} = require('node:fs/promises');
const path = require('node:path');
const {createStudioSession} = require('./studio-auth.cjs');

app.setName('Curated Studio');
// A stable local origin keeps IndexedDB drafts across restarts and upgrades.
protocol.registerSchemesAsPrivileged([{scheme: 'curated', privileges: {
  standard: true, secure: true, supportFetchAPI: true, corsEnabled: true,
}}]);
if (!app.isPackaged && process.env.CURATED_STUDIO_TEST_DATA) {
  app.setPath('userData', process.env.CURATED_STUDIO_TEST_DATA);
}
const origin = 'curated://studio';
const assets = path.join(__dirname, 'assets');
const routes = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/drafts.js', ['drafts.js', 'text/javascript; charset=utf-8']],
  ['/media.js', ['media.js', 'text/javascript; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
  ['/logo.svg', ['logo.svg', 'image/svg+xml']],
  ['/font.woff2', ['font.woff2', 'font/woff2']],
  ['/config.json', ['config.json', 'application/json']],
]);
let window;
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if (window) { if (window.isMinimized()) window.restore(); window.focus(); } });
  app.whenReady().then(async () => {
    const config = JSON.parse(await readFile(path.join(assets, 'config.json'), 'utf8'));
    const site = new URL(config.siteUrl).origin;
    const getSession = createStudioSession(config, path.join(__dirname, 'private', 'editor.json'));
    const headers = {
      'Content-Security-Policy': `default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' https: blob:; media-src blob:; connect-src 'self' ${new URL(config.supabaseUrl).origin} ${site} https://generativelanguage.googleapis.com; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`,
      'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'Cache-Control': 'no-store',
    };
    protocol.handle('curated', async request => {
      const url = new URL(request.url);
      const route = routes.get(url.pathname);
      if (url.host === 'studio' && url.pathname === '/session') {
        if (request.method !== 'POST') return new Response(null, {status:405, headers});
        try {return Response.json(await getSession(), {headers});}
        catch(error) {return Response.json({error:error.message}, {status:503, headers});}
      }
      if (url.host === 'studio' && url.pathname === '/gemini-config.json') {
        if (request.method !== 'GET') return new Response(null, {status:405, headers});
        try {const key=JSON.parse(await readFile(path.join(__dirname,'private','gemini-api-key.json'),'utf8'));return Response.json(key,{headers});}
        catch {return Response.json({apiKey:''},{status:503,headers});}
      }
      if (url.host !== 'studio' || !route) return new Response('Not found', {status: 404, headers});
      if (!['GET', 'HEAD'].includes(request.method)) return new Response(null, {status: 405, headers});
      try {
        const body = request.method === 'HEAD' ? null : await readFile(path.join(assets, route[0]));
        return new Response(body, {headers: {...headers, 'Content-Type': route[1]}});
      } catch { return new Response('App files are missing. Reinstall Curated Studio.', {status: 500, headers}); }
    });
    session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
    session.defaultSession.setPermissionCheckHandler(() => false);
    Menu.setApplicationMenu(null);
    window = new BrowserWindow({
      title: 'Curated Studio', width: 1240, height: 900, minWidth: 760, minHeight: 600,
      backgroundColor: '#f5f7fa', show: false, autoHideMenuBar: true,
      icon: path.join(assets, 'icon.ico'),
      webPreferences: {nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true, webviewTag: false},
    });
    function openProduct(urlString) {
      try {
        const url = new URL(urlString);
        const trustedHost = url.origin === site || url.hostname === 'supabase.com' || url.hostname === 'www.pinterest.com';
        if (url.protocol === 'https:' && trustedHost && !url.username && !url.password) {
          shell.openExternal(url.href).catch(() => {});
        }
      } catch { /* Ignore malformed or untrusted navigation. */ }
    }
    window.webContents.setWindowOpenHandler(({url}) => {openProduct(url); return {action: 'deny'};});
    window.webContents.on('will-navigate', (event, url) => {
      if (url !== `${origin}/`) {event.preventDefault(); openProduct(url);}
    });
    window.webContents.on('will-attach-webview', event => event.preventDefault());
    window.webContents.on('will-prevent-unload', event => {
      const choice = dialog.showMessageBoxSync(window, {type: 'question', buttons: ['Keep editing', 'Discard unsaved changes'], defaultId: 0, cancelId: 0, title: 'Unsaved draft', message: 'Save your changes before leaving?', detail: 'Choose Keep editing, then Save on this PC to keep your draft.'});
      if (choice === 1) event.preventDefault();
    });
    window.once('ready-to-show', () => window.show());
    await window.loadURL(`${origin}/`);
  }).catch(error => {dialog.showErrorBox('Curated Studio could not start', error.message); app.quit();});
  app.on('window-all-closed', () => app.quit());
}
