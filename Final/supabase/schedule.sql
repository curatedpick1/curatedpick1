-- Run once in Supabase SQL Editor AFTER replacing BOTH placeholders below.
-- Enable the Cron and pg_net extensions in Database > Extensions first.
-- DO NOT COMMIT A FILLED-IN COPY. These values belong in Supabase Vault.
do $$ begin
  if exists(select 1 from vault.secrets where name in ('curated_publisher_url', 'curated_publisher_secret')) then
    raise exception 'Publisher Vault entries already exist. Update them in Vault instead of creating duplicates.';
  end if;
end $$;
select vault.create_secret('https://YOUR-PROJECT.supabase.co/functions/v1/publisher', 'curated_publisher_url');
select vault.create_secret('YOUR-RANDOM-PUBLISHER-SECRET', 'curated_publisher_secret');

select cron.schedule('curated-publisher', '*/5 * * * *', $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'curated_publisher_url'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-publisher-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'curated_publisher_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 120000
  );
$$);

-- To stop all scheduled processing:
-- select cron.unschedule('curated-publisher');
