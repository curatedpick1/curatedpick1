begin;
create or replace function public.valid_product_blog(value jsonb)
returns boolean language plpgsql immutable set search_path = '' as $$
declare item jsonb; run jsonb; kind text; body text; runs jsonb;
begin
  if value is null or jsonb_typeof(value) <> 'array' or jsonb_array_length(value) > 40 then return false; end if;
  for item in select jsonb_array_elements(value) loop
    if jsonb_typeof(item) <> 'object' or jsonb_typeof(item->'type') is distinct from 'string' then return false; end if;
    kind := item->>'type';
    if kind in ('heading','paragraph','underline') then
      if jsonb_typeof(item->'text') is distinct from 'string' then return false; end if;
      body := item->>'text';
      if length(trim(body)) = 0 or (kind = 'heading' and length(body) > 160) or (kind <> 'heading' and length(body) > 2400) then return false; end if;
    elsif kind = 'image' then
      if not public.is_https_link(item->>'url') or jsonb_typeof(item->'alt') is distinct from 'string' or length(item->>'alt') > 500
        or coalesce(item->>'align','center') not in ('left','center','right') then return false; end if;
    elsif kind = 'rich_text' then
      runs := item->'runs';
      if item->>'tag' not in ('p','h2','h3') or item->>'align' not in ('left','center','right')
        or jsonb_typeof(runs) is distinct from 'array' or jsonb_array_length(runs) < 1 or jsonb_array_length(runs) > 300 then return false; end if;
      body := '';
      for run in select jsonb_array_elements(runs) loop
        if jsonb_typeof(run) <> 'object' or jsonb_typeof(run->'text') is distinct from 'string'
          or (run ? 'bold' and jsonb_typeof(run->'bold') <> 'boolean')
          or (run ? 'italic' and jsonb_typeof(run->'italic') <> 'boolean')
          or (run ? 'underline' and jsonb_typeof(run->'underline') <> 'boolean')
          or (run ? 'size' and run->>'size' not in ('small','normal','large','xlarge'))
          or (run ? 'font' and run->>'font' not in ('Arial','Impact','Georgia','Verdana','Trebuchet MS','Times New Roman','Courier New')) then return false; end if;
        body := body || (run->>'text');
      end loop;
      if length(trim(body)) = 0 or length(body) > 2400 then return false; end if;
    else return false;
    end if;
  end loop;
  return true;
end;
$$;
alter table public.products drop constraint if exists products_blog_content_valid;
alter table public.products add constraint products_blog_content_valid
  check (public.valid_product_blog(blog_content) and (jsonb_array_length(blog_content) = 0 or length(trim(blog_title)) > 0));
notify pgrst, 'reload schema';
commit;

