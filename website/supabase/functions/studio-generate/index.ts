const categories = [
  'Home & living', 'Tech & desk', 'Kitchen & dining', 'On the go', 'Style & essentials',
  'Beauty & care', 'Fashion', 'Travel', 'Fitness & wellness', 'Baby & kids', 'Pets',
  'Office & study', 'Gifts', 'Outdoor', 'Gaming', 'Automotive', 'Deals',
];

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};
const respond = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: cors });

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (request.method !== 'POST') return respond({ error: 'Use POST.' }, 405);

  const authorization = request.headers.get('authorization');
  const apiKey = request.headers.get('apikey');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const geminiKey = Deno.env.get('GEMINI_API_KEY');
  if (!authorization || !apiKey || !supabaseUrl) return respond({ error: 'Sign in to the editor first.' }, 401);
  if (!geminiKey) return respond({ error: 'AI suggestions are not configured yet. Add GEMINI_API_KEY to Supabase Function secrets.' }, 503);

  // Check the editor allowlist with the caller's JWT; never trust the desktop client alone.
  const editorCheck = await fetch(`${supabaseUrl}/rest/v1/rpc/is_catalog_editor`, {
    method: 'POST', headers: { apikey: apiKey, authorization, 'content-type': 'application/json' }, body: '{}',
  });
  if (!editorCheck.ok || await editorCheck.json().catch(() => false) !== true) {
    return respond({ error: 'Editor access is required.' }, 403);
  }

  let input: { title?: string; mimeType?: string; imageBase64?: string };
  try { input = await request.json(); } catch { return respond({ error: 'Invalid request body.' }, 400); }
  const title = input.title?.trim().slice(0, 100);
  const mimeType = input.mimeType;
  const imageBase64 = input.imageBase64;
  if (!title || !imageBase64 || !['image/jpeg', 'image/png', 'image/webp'].includes(mimeType || '') || imageBase64.length > 7_000_000) {
    return respond({ error: 'Add a title and a JPEG, PNG, or WebP poster under 5 MB.' }, 400);
  }

  try {
    const generated = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent', {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': geminiKey },
      body: JSON.stringify({
        contents: [{ parts: [
          { text: `Write concise, useful affiliate-product listing copy using only facts visible in the photo or stated in the title. Do not invent brands, materials, dimensions, features, prices, guarantees, or performance claims. Return one JSON object only: {"description":"...","category":"...","tags":["..."]}. Description: plain language, 1-3 sentences, max 440 characters. Choose exactly one category from this list: ${categories.join(' | ')}. Tags: 4-8 relevant short search phrases, each max 40 characters, no hashtags. Product title: ${title}` },
          { inline_data: { mime_type: mimeType, data: imageBase64 } },
        ] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
      }),
    });
    const data = await generated.json().catch(() => null);
    if (!generated.ok) {
      const status = generated.status === 429 ? 429 : generated.status >= 500 ? 503 : 502;
      return respond({ error: generated.status === 429 ? 'Gemini free-tier limit reached. Wait a little and try again.' : 'The AI suggestion service could not complete this request.' }, status);
    }
    const text = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || '').join('');
    const value = JSON.parse(text || '{}');
    const category = categories.includes(value.category) ? value.category : categories[0];
    const description = typeof value.description === 'string' ? value.description.trim().slice(0, 440) : '';
    const tags = Array.isArray(value.tags) ? [...new Set(value.tags.filter((tag: unknown) => typeof tag === 'string').map((tag: string) => tag.trim().slice(0, 40)).filter(Boolean))].slice(0, 12) : [];
    if (!description) return respond({ error: 'The AI returned an empty description. Try again.' }, 502);
    return respond({ description, category, tags });
  } catch {
    return respond({ error: 'Could not reach the AI service. Check the connection and try again.' }, 502);
  }
});
