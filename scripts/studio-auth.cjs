// The distributed private app carries only a catalog-editor login, never service_role.
// Each host keeps the credential out of HTTP routes and returns short-lived sessions.
const {readFile} = require('node:fs/promises');
function createStudioSession(config, credentialPath, fetcher = fetch) {
  let cached, pending;
  return async function getSession() {
    if (cached && cached.deadline > Date.now() + 60000) return {...cached.value, expires_in: Math.floor((cached.deadline-Date.now())/1000)};
    if (pending) return pending;
    pending = (async () => {
      let credential;
      try {credential = JSON.parse(await readFile(credentialPath, 'utf8'));}
      catch {throw new Error('Publishing access is missing from this copy. Install the configured Studio installer.');}
      if (credential.supabaseUrl !== config.supabaseUrl || !credential.email || !credential.password) {
        throw new Error('This copy is configured for a different project. Install the latest Studio installer.');
      }
      const response = await fetcher(`${config.supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST', signal: AbortSignal.timeout(20000),
        headers: {apikey: config.publishableKey, 'Content-Type': 'application/json'},
        body: JSON.stringify({email: credential.email, password: credential.password}),
      });
      if (!response.ok) throw new Error(response.status === 400 || response.status === 401
        ? 'Publishing access for this copy has expired or been revoked. Ask for the latest installer.'
        : 'Supabase could not connect. Your local drafts are safe; try again shortly.');
      const data = await response.json();
      if (!data.access_token || !data.user?.id || !Number.isFinite(data.expires_in)) throw new Error('Supabase returned an incomplete session.');
      const value = {access_token: data.access_token, expires_in: data.expires_in, user: {id: data.user.id}};
      cached = {value, deadline: Date.now() + data.expires_in * 1000};
      return value;
    })();
    try {return await pending;} finally {pending = undefined;}
  };
}
module.exports = {createStudioSession};
