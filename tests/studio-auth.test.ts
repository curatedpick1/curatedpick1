import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createRequire} from 'node:module';
const {createStudioSession} = createRequire(import.meta.url)('../scripts/studio-auth.cjs');
const config = {supabaseUrl:'https://example.supabase.co',publishableKey:'sb_publishable_test'};

test('app access coalesces logins and returns only a short-lived session', async () => {
  const directory = await mkdtemp(join(tmpdir(),'studio-auth-'));
  const file = join(directory,'editor.json');
  await writeFile(file,JSON.stringify({supabaseUrl:config.supabaseUrl,email:'editor@example.test',password:'test-only'}));
  let calls = 0;
  const connect = createStudioSession(config,file,async (url, options) => {
    calls++;
    assert.equal(url,`${config.supabaseUrl}/auth/v1/token?grant_type=password`);
    assert.equal(JSON.parse(options.body).password,'test-only');
    return Response.json({access_token:'short-token',refresh_token:'never-return',expires_in:3600,user:{id:'editor-id',email:'private@example.test'}});
  });
  const [a,b] = await Promise.all([connect(),connect()]);
  assert.deepEqual(a,b);
  assert.deepEqual(Object.keys(a).sort(),['access_token','expires_in','user']);
  assert.deepEqual(a.user,{id:'editor-id'});
  await connect();
  assert.equal(calls,1);
});

test('unconfigured or cross-project copies cannot obtain publishing access', async () => {
  const directory = await mkdtemp(join(tmpdir(),'studio-auth-'));
  const file = join(directory,'editor.json');
  let calls = 0;
  const connect = createStudioSession(config,file,async()=>{calls++;throw Error('must not contact backend');});
  await assert.rejects(connect(),/missing from this copy/);
  await writeFile(file,JSON.stringify({supabaseUrl:'https://other.supabase.co',email:'editor@example.test',password:'test-only'}));
  await assert.rejects(connect(),/different project/);
  assert.equal(calls,0);
});

test('revoked app access is not cached and credential errors do not reveal secrets', async () => {
  const directory = await mkdtemp(join(tmpdir(),'studio-auth-'));
  const file = join(directory,'editor.json');
  await writeFile(file,JSON.stringify({supabaseUrl:config.supabaseUrl,email:'editor@example.test',password:'test-only'}));
  let calls = 0;
  const connect = createStudioSession(config,file,async()=>{
    calls++;
    return calls===1?Response.json({error:'private provider details'}, {status:400}):Response.json({access_token:'short-token',expires_in:3600,user:{id:'editor-id'}});
  });
  await assert.rejects(connect(),/expired or been revoked/);
  assert.equal((await connect()).user.id,'editor-id');
  assert.equal(calls,2);
});
