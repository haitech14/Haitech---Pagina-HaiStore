-- Corrige categorías si 003 falló por slugs duplicados en un mismo INSERT.
-- Idempotente: puede ejecutarse aunque 003 haya completado parcialmente.

insert into public.store_product_categories (slug, name, sort_order)
select
  slug,
  name,
  row_number() over (order by name)::integer as sort_order
from (
  select distinct on (
    lower(regexp_replace(trim(category), '\s+', '-', 'g'))
  )
    lower(regexp_replace(trim(category), '\s+', '-', 'g')) as slug,
    trim(category) as name
  from public.products
  where category is not null and trim(category) <> ''
  order by
    lower(regexp_replace(trim(category), '\s+', '-', 'g')),
    trim(category)
) as categories_by_slug
on conflict (slug) do update set
  name = excluded.name,
  updated_at = now();

update public.products p
set category_id = c.id
from public.store_product_categories c
where p.category is not null
  and lower(regexp_replace(trim(p.category), '\s+', '-', 'g')) = c.slug
  and (p.category_id is null or p.category_id is distinct from c.id);
