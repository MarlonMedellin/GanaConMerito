-- seed.sql
-- Seed mínimo para el MVP
-- Este seed inserta únicamente contenido base.
-- El bootstrap de perfiles debe hacerse después de que exista un usuario real en auth.users.

begin;

-- =========================================================
-- 1) SAMPLE ITEMS
-- =========================================================
with upsert_item_1 as (
  insert into public.item_bank (
    content_id, slug, title, area, subarea, exam_type, competency, difficulty,
    target_level, item_type, stem, correct_option, explanation,
    normative_refs, is_published, version
  ) values (
    'caso-convivencia-001',
    'caso-convivencia-001',
    'Caso de convivencia escolar',
    'normatividad',
    'convivencia_escolar',
    'docente',
    'interpretacion_normativa',
    0.62,
    'satisfactorio',
    'multiple_choice',
    'Un estudiante de 13 años incurre en una conducta que afecta la convivencia escolar. El comité propone excluirlo inmediatamente del establecimiento. ¿Cuál es la respuesta más adecuada?',
    'B',
    'La opción correcta es B porque la actuación debe armonizar el debido proceso, el interés superior del menor y el marco normativo aplicable.',
    array['ley_1098','decreto_1075']::text[],
    true,
    1
  )
  on conflict (slug) do update set
    title = excluded.title,
    area = excluded.area,
    subarea = excluded.subarea,
    exam_type = excluded.exam_type,
    competency = excluded.competency,
    difficulty = excluded.difficulty,
    target_level = excluded.target_level,
    item_type = excluded.item_type,
    stem = excluded.stem,
    correct_option = excluded.correct_option,
    explanation = excluded.explanation,
    normative_refs = excluded.normative_refs,
    is_published = excluded.is_published,
    version = excluded.version,
    updated_at = now()
  returning id
), upsert_item_2 as (
  insert into public.item_bank (
    content_id, slug, title, area, subarea, exam_type, competency, difficulty,
    target_level, item_type, stem, correct_option, explanation,
    normative_refs, is_published, version
  ) values (
    'planeacion-aula-001',
    'planeacion-aula-001',
    'Planeación de aula con evaluación formativa',
    'pedagogia',
    'planeacion_didactica',
    'docente',
    'diseno_pedagogico',
    0.48,
    'basico',
    'multiple_choice',
    'Un docente diseña una secuencia didáctica y quiere integrar evaluación formativa durante el proceso. ¿Qué decisión es la más adecuada?',
    'C',
    'La opción correcta es C porque la evaluación formativa debe integrarse durante el proceso para retroalimentar y ajustar la enseñanza.',
    array[]::text[],
    true,
    1
  )
  on conflict (slug) do update set
    title = excluded.title,
    area = excluded.area,
    subarea = excluded.subarea,
    exam_type = excluded.exam_type,
    competency = excluded.competency,
    difficulty = excluded.difficulty,
    target_level = excluded.target_level,
    item_type = excluded.item_type,
    stem = excluded.stem,
    correct_option = excluded.correct_option,
    explanation = excluded.explanation,
    normative_refs = excluded.normative_refs,
    is_published = excluded.is_published,
    version = excluded.version,
    updated_at = now()
  returning id
), upsert_item_3 as (
  insert into public.item_bank (
    content_id, slug, title, area, subarea, exam_type, competency, difficulty,
    target_level, item_type, stem, correct_option, explanation,
    normative_refs, is_published, version
  ) values (
    'razonamiento-matematico-001',
    'razonamiento-matematico-001',
    'Interpretación de patrones numéricos',
    'matematicas',
    'pensamiento_numerico',
    'docente',
    'razonamiento_cuantitativo',
    0.35,
    'basico',
    'multiple_choice',
    'En una secuencia 2, 5, 11, 23, ? cada término se obtiene multiplicando por 2 y sumando 1. ¿Cuál es el siguiente término?',
    'D',
    'La opción correcta es D porque 23 * 2 + 1 = 47.',
    array[]::text[],
    true,
    1
  )
  on conflict (slug) do update set
    title = excluded.title,
    area = excluded.area,
    subarea = excluded.subarea,
    exam_type = excluded.exam_type,
    competency = excluded.competency,
    difficulty = excluded.difficulty,
    target_level = excluded.target_level,
    item_type = excluded.item_type,
    stem = excluded.stem,
    correct_option = excluded.correct_option,
    explanation = excluded.explanation,
    normative_refs = excluded.normative_refs,
    is_published = excluded.is_published,
    version = excluded.version,
    updated_at = now()
  returning id
)
select 1;

insert into public.item_options (item_id, option_key, option_text)
select ib.id, v.option_key, v.option_text
from public.item_bank ib
join (values
  ('caso-convivencia-001','A','Confirmar la exclusión inmediata porque protege a la institución.'),
  ('caso-convivencia-001','B','Revisar debido proceso, interés superior del menor y medidas pedagógicas proporcionales.'),
  ('caso-convivencia-001','C','Delegar la decisión exclusivamente al docente titular.'),
  ('caso-convivencia-001','D','Aplicar cualquier sanción sin revisión del manual de convivencia.'),
  ('planeacion-aula-001','A','Aplicar una prueba final única sin retroalimentación previa.'),
  ('planeacion-aula-001','B','Evaluar solo asistencia y cumplimiento de tareas.'),
  ('planeacion-aula-001','C','Recoger evidencias parciales y retroalimentar durante el aprendizaje.'),
  ('planeacion-aula-001','D','Posponer toda evaluación hasta terminar el período.'),
  ('razonamiento-matematico-001','A','35'),
  ('razonamiento-matematico-001','B','45'),
  ('razonamiento-matematico-001','C','46'),
  ('razonamiento-matematico-001','D','47')
) as v(slug, option_key, option_text)
  on ib.slug = v.slug
on conflict (item_id, option_key) do update set
  option_text = excluded.option_text;

commit;
