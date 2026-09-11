const url = process.env.SUPABASE_URL;
const secret = process.env.PUBLISHER_SECRET;
if (!url || !secret || secret.length < 32) throw new Error('Configure SUPABASE_URL and PUBLISHER_SECRET in .env.publisher first.');
const response = await fetch(`${new URL(url).origin}/functions/v1/publisher`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', 'x-publisher-secret': secret }, body: '{}', signal: AbortSignal.timeout(120_000),
});
console.log(`Publisher HTTP ${response.status}`);
console.log(await response.text());
if (!response.ok) process.exitCode = 1;
