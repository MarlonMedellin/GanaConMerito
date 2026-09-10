---
id: EXEC-QUESTION-BANK-V4-SUPABASE-001
name: question-bank-v4-supabase-execution-report
project: ganaconmerito
status: completed-through-pilot
artifact_type: execution-report
related:
  - docs/02-delivery/prd-execution-question-bank-v4-supabase.md
  - docs/database/prd-question-bank-v4-supabase.md
---

# Ejecucion — Question Bank V4 en Supabase

## Estado

Completado hasta activacion piloto V4. M-0022 queda pendiente por criterio de
corte posterior al piloto.

## Ejecutado

- Repo local revisado en `gcm-local`.
- `.env.local` y `supabase/.temp` verificados como ignorados por Git.
- `npm run typecheck`: PASS.
- `npm run content:validate:v4`: PASS.
- `npm run content:import:v4`: PASS en dry-run, con `DOC-000001` importable y sin rechazos.
- `npm run test`: PASS.
- `git diff --check`: PASS.
- Acceso SSH al VPS verificado sin imprimir secretos.
- Presencia de `/opt/gcm/env/gcm-app.env` verificada sin imprimir secretos.
- Presencia de `/home/ubuntu/.supabase/access-token` verificada sin imprimir secretos.
- Formato del token CLI del VPS verificado sin imprimir secretos: archivo crudo
  con prefijo `sbp_`.
- HEAD de `/opt/gcm/app` observado en `e43f612`, distinto del estado local actual.
- `npx supabase projects list` en VPS con el token existente: PASS tras nueva
  verificacion operacional.
- Se aparto a backup el duplicado local
  `supabase/migrations/0011_question_contract_compatibility.sql`, que no formaba
  parte del historial remoto y podia bloquear `db push`.
- `npx supabase db push`: PASS. Migraciones aplicadas:
  - `0019_question_bank_v4_contract.sql`
  - `0020_upsert_content_item_v4.sql`
  - `0021_question_bank_v4_read_views.sql`
- `npx supabase migration list --linked`: PASS, remoto alineado hasta `0021`.
- `npm run content:import:v4 -- --apply` desde script directo en VPS: PASS,
  `DOC-000001` importado.
- Activacion piloto de `doc-000001`: PASS.

## Verificacion remota no destructiva

Consulta Supabase con `service_role` desde el entorno local, sin imprimir secretos:

- `public.item_bank.bank_version`: no existe.
- `public.v_question_bank_v4_active`: no existe.
- `public.v_question_bank_v4_practice`: no existe.
- `public.v_question_bank_v4_answered`: no existe.

Despues de `db push`, la base remota tiene aplicado el contrato V4.

Verificacion posterior:

- `DOC-000001` importado como `doc-000001`.
- Estado inicial verificado tras importacion: `draft`, `is_published=false`,
  `is_active=false`, `approval_status=pending_approval`,
  `pilot_status=not_in_pilot`.
- Opciones verificadas: 4.
- Activacion piloto aplicada: `published`, `is_published=true`,
  `is_active=true`, `approval_status=approved`, `pilot_status=pilot_loaded`.
- `v_question_bank_v4_practice`: devuelve 1 item y no expone
  `correct_option`, `explanation`, `hint`, `learning_note` ni
  `option_explanations`.
- `v_question_bank_v4_answered`: devuelve 1 item con clave y feedback para
  `service_role`.

## Bloqueo

## Pendientes

El corte M-0022 no se ejecuto. Permanece pendiente hasta cumplir criterios de
piloto y runtime:

- pruebas runtime autenticadas de `session/start`, `session/item` y
  `session/advance` contra la politica V4;
- decision documentada de corte;
- migracion o cambio posterior para fuente predeterminada V4;
- commit/sincronizacion formal para que el deploy tree no dependa de archivos
  copiados manualmente.

## Reanudacion segura

1. Commit y push de los cambios versionados locales.
2. Sincronizar `/opt/gcm/app` desde Git para reemplazar los archivos copiados
   manualmente por estado versionado.
3. Ejecutar pruebas runtime autenticadas.
4. Si se aprueba el corte, preparar M-0022.

Rollback piloto disponible por `is_active=false` y `pilot_status=not_in_pilot`
para `bank_version='v4' and slug='doc-000001'`.
