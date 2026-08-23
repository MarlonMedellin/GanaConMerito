-- 0007_backfill_profiles_nuclei.sql
-- Backfill inicial para segmentación por perfil profesional + núcleos temáticos.
-- Objetivo: dejar el sistema en estado consistente antes de adaptar selectNextItem.

begin;

-- -----------------------------------------------------------------------------
-- 1. Núcleo transitorio universal para contenido existente
-- -----------------------------------------------------------------------------
-- Este núcleo evita que los ítems publicados queden fuera de práctica mientras se
-- realiza la clasificación fina posterior.

insert into public.thematic_nuclei (
  code,
  name,
  description,
  area,
  subarea,
  is_universal,
  is_active
)
values (
  'legacy-general',
  'Contenido general legado',
  'Núcleo transitorio universal para preguntas existentes aún no reclasificadas.',
  'general',
  'legacy',
  true,
  true
)
on conflict (code) do nothing;

-- -----------------------------------------------------------------------------
-- 2. Perfiles profesionales iniciales (seed mínimo)
-- -----------------------------------------------------------------------------
-- Estos perfiles son base operativa. Se pueden ampliar/refinar más adelante desde
-- admin o migraciones posteriores.

insert into public.professional_profiles (
  code,
  name,
  description,
  area,
  is_active
)
values
  (
    'docente-matematicas',
    'Docente de Matemáticas',
    'Perfil profesional inicial para usuarios del área de matemáticas.',
    'educacion',
    true
  ),
  (
    'docente-lenguaje',
    'Docente de Lenguaje',
    'Perfil profesional inicial para usuarios del área de lenguaje.',
    'educacion',
    true
  ),
  (
    'docente-ciencias-sociales',
    'Docente de Ciencias Sociales',
    'Perfil profesional inicial para usuarios del área de ciencias sociales.',
    'educacion',
    true
  ),
  (
    'docente-ciencias-naturales',
    'Docente de Ciencias Naturales',
    'Perfil profesional inicial para usuarios del área de ciencias naturales.',
    'educacion',
    true
  ),
  (
    'docente-general',
    'Docente General',
    'Perfil transitorio para usuarios docentes sin clasificación disciplinar fina.',
    'educacion',
    true
  )
on conflict (code) do nothing;

-- -----------------------------------------------------------------------------
-- 3. Relación inicial perfil ↔ núcleo
-- -----------------------------------------------------------------------------
-- Mientras el banco no esté reclasificado por núcleos específicos, todos los perfiles
-- iniciales heredan acceso explícito al núcleo legacy-general (aunque sea universal).
-- Esto deja trazabilidad de la matriz desde el inicio.

insert into public.profile_thematic_nuclei (
  professional_profile_id,
  thematic_nucleus_id,
  is_enabled,
  priority_weight
)
select
  pp.id,
  tn.id,
  true,
  100
from public.professional_profiles pp
cross join public.thematic_nuclei tn
where pp.code in (
  'docente-matematicas',
  'docente-lenguaje',
  'docente-ciencias-sociales',
  'docente-ciencias-naturales',
  'docente-general'
)
  and tn.code = 'legacy-general'
on conflict (professional_profile_id, thematic_nucleus_id) do nothing;

-- -----------------------------------------------------------------------------
-- 4. Backfill de item_bank hacia núcleo legacy
-- -----------------------------------------------------------------------------
-- Regla: todo ítem existente sin núcleo recibe el núcleo transitorio universal.

update public.item_bank ib
set thematic_nucleus_id = tn.id
from public.thematic_nuclei tn
where tn.code = 'legacy-general'
  and ib.thematic_nucleus_id is null;

-- -----------------------------------------------------------------------------
-- 5. Gate de consistencia mínima
-- -----------------------------------------------------------------------------
-- Este bloque falla la migración si, después del backfill, todavía existen ítems
-- publicados sin núcleo. Así se evita dejar la app en limbo antes de tocar selección.

do $$
declare
  missing_count integer;
begin
  select count(*)
  into missing_count
  from public.item_bank
  where status = 'published'
    and thematic_nucleus_id is null;

  if missing_count > 0 then
    raise exception
      'Backfill incompleto: % item(s) publicados quedaron sin thematic_nucleus_id.',
      missing_count;
  end if;
end
$$;

commit;
