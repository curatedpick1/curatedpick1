import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('database enforces private writes, draft isolation, permanent URLs, queue uniqueness, and exclusive publisher leases', async () => {
  const db = new PGlite();
  try {
    await db.exec('create role anon; create role authenticated; create role service_role bypassrls; grant usage on schema public to anon, authenticated, service_role;');
    await db.exec(await readFile(new URL('../supabase/migrations/202609080001_catalog.sql', import.meta.url), 'utf8'));
    const inserted = await db.query<{ id: string; slug: string }>(`insert into products(title) values ('Warm desk lamp') returning id,slug`);
    const { id, slug } = inserted.rows[0];
    assert.ok(slug.startsWith('warm-desk-lamp-'));
    await db.exec('set role anon');
    const draft = await db.query<{ get_catalog: { revision: number; products: unknown[] } }>('select get_catalog()');
    assert.equal(draft.rows[0].get_catalog.products.length, 0);
    for (const table of ['products', 'pinterest_jobs', 'pinterest_tokens', 'catalog_state']) await assert.rejects(() => db.query(`select * from ${table}`), /permission denied/);
    await assert.rejects(() => db.query('select acquire_publisher_lock()'), /permission denied/);
    await db.exec('reset role');
    await assert.rejects(() => db.query('update products set published=true where id=$1', [id]), /check constraint/);
    await db.query(`update products set description='Warm light for your desk.',poster_url='https://cdn.example.com/lamp.jpg',poster_alt='Reading lamp', stores=$2::jsonb,pinterest_board_id='123',publish_to_pinterest=true,published=true where id=$1`, [id, JSON.stringify([{ name: 'Amazon', url: 'https://amazon.com/dp/B000000001?tag=test-20' }])]);
    assert.equal((await db.query('select * from pinterest_jobs')).rows.length, 1);
    await db.exec('set role anon');
    const live = (await db.query<{ get_catalog: { revision: number; products: Record<string, unknown>[] } }>('select get_catalog()')).rows[0].get_catalog;
    assert.equal(live.products.length, 1);
    assert.equal(live.products[0].slug, slug);
    assert.ok(!('video_path' in live.products[0]));
    assert.ok(!('pinterest_board_id' in live.products[0]));
    await assert.rejects(() => db.query("insert into products(title) values ('injected')"), /permission denied/);
    await db.exec('reset role; set role authenticated');
    await assert.rejects(() => db.query("update products set title='injected'"), /permission denied/);
    await db.exec('reset role');
    await assert.rejects(() => db.query("update products set slug='changed' where id=$1", [id]), /permanent/);
    await assert.rejects(() => db.query(`update products set stores='[{"name":"Unsafe","url":"javascript:alert(1)"}]' where id=$1`, [id]), /check constraint/);
    await db.query("update pinterest_jobs set state='published',pin_id='999' where product_id=$1", [id]);
    await db.query("update products set poster_url='https://cdn.example.com/new.jpg' where id=$1", [id]);
    assert.deepEqual((await db.query('select state,pin_id from pinterest_jobs')).rows, [{ state: 'published', pin_id: '999' }]);
    await db.exec('set role service_role');
    const first = (await db.query<{ acquire_publisher_lock: string }>('select acquire_publisher_lock()')).rows[0].acquire_publisher_lock;
    assert.ok(first);
    assert.equal((await db.query<{ acquire_publisher_lock: null }>('select acquire_publisher_lock()')).rows[0].acquire_publisher_lock, null);
    await db.query('select release_publisher_lock($1)', [first]);
    assert.ok((await db.query('select acquire_publisher_lock()')).rows[0]);
    await db.exec('reset role');
    await db.query('update products set published=false where id=$1', [id]);
    assert.equal((await db.query<{ get_catalog: { products: unknown[] } }>('select get_catalog()')).rows[0].get_catalog.products.length, 0);
  } finally { await db.close(); }
});
