# PRD — Supabase limpio para Question Bank V4

**Estado:** implementación local candidata; proyecto remoto, cutover y deploy no
autorizados ni ejecutados.

## Resultado esperado

Construir desde cero una base Supabase V4 segura y reproducible con el repositorio
como autoridad. No se preservan filas, UUID, sesiones, estadísticas ni contratos
runtime Legacy/V3. La instancia Supabase existente permanece intacta hasta una
decisión productiva posterior.

## Decisiones

1. Ejecutar únicamente `supabase/migrations/0001–0003` en una base nueva.
2. Conservar `0001–0030` anteriores en `supabase/legacy-migrations/` como historia.
3. Reutilizar los números de versión y comprobar `gcm-v4-clean-v1` + `instance_id`
   para impedir que una base legacy reciba accidentalmente el rebaseline.
4. Reemplazar `item_bank` por `questions`/`question_options` con ID editorial V4.
5. Separar banco/taxonomía, targeting y knowledge base.
6. Reconciliar solo GitHub → Supabase mediante un motor compartido CLI/API.
7. Denegar banco crudo y verdad editorial a `anon`/`authenticated` desde el origen.

PR #102 y la migración histórica `0030` se conservan como evidencia de pruebas y
frontera de seguridad; no son la ruta de cutover de esta baseline.

## Entregables de repositorio

- baseline reproducible y semilla vacía;
- modelo runtime para identidad, práctica, evaluación, estadísticas consumidas y Tutor;
- releases y trazabilidad de sincronización;
- targeting perfil → `positionName` → OPEC;
- knowledge sources y relaciones verificadas;
- reconciliador validate/plan/diff/apply/verify/status;
- API administrativa server-only sin secretos;
- pruebas de idempotencia, drift, atomicidad, ACL/RLS y pre/post respuesta.

Detalles de modelo: `docs/database/v4-clean-baseline.md`.
Operación: `docs/05-ops/content-sync.md`.

## Criterios de aceptación local

- reset desde cero ejecuta solo la baseline nueva;
- 248 preguntas y 992 opciones materializadas;
- segunda sincronización `changed = 0`, `drift = 0`;
- drift manual detectado y reparado;
- un fallo de lote no deja release parcial;
- exactamente una familia y seis perfiles docentes;
- OPEC/mappings/fuentes no verificadas no se promueven;
- repositorio, práctica, sesión, evaluación y Tutor usan IDs V4 sin fallback;
- cliente no obtiene clave ni explicación antes de responder;
- `anon`/`authenticated` no leen banco crudo; `service_role` sí puede servirlo;
- typecheck, tests, build y validadores documentales verdes.

## Gate de cutover futuro

Requiere autorización separada para crear el proyecto nuevo, aplicar migraciones,
aprobar el hash, sincronizar, completar datos de targeting/knowledge, activar un
release, desplegar y ejecutar E2E. Borrar o modificar la instancia legacy no forma
parte de este PRD sin un nuevo checkpoint.
