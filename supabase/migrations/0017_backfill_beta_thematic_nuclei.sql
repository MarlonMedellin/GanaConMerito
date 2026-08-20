-- 0017_backfill_beta_thematic_nuclei.sql
-- Assigns the universal current nucleus matching each beta item's area.

begin;

update public.item_bank ib
set thematic_nucleus_id = tn.id,
    updated_at = now()
from public.thematic_nuclei tn
where ib.source_path like 'content/items/beta-v1/%'
  and ib.thematic_nucleus_id is null
  and tn.is_active = true
  and tn.is_universal = true
  and tn.code = case ib.area
    when 'competencias_ciudadanas' then 'core-competencias-ciudadanas'
    when 'gestion' then 'core-gestion'
    when 'lectura_critica' then 'core-lectura-critica'
    when 'matematicas' then 'core-matematicas'
    when 'normatividad' then 'core-normatividad'
    when 'pedagogia' then 'core-pedagogia'
    else null
  end;

commit;
